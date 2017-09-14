'use strict';
const mongoose = require('mongoose');
const Schedule = mongoose.model('Schedule');
const Boom = require('boom');
const async = require('async');
const moment = require('moment');
const ErrorHandler = require("../../../utils/error.js");
const CampaignUtil = require('../../api-campaign/util/campaign.js');
const CronJob = require('cron').CronJob;
const Wreck = require('wreck');

var runningJob = {};
var scanUserSchedule = {};

function removeUserSchedule(userId) {
    Schedule.find({
            running: true,
            created_by: userId
        })
        .count()
        .then(function(count) {
            if (!count) {
                if (scanUserSchedule[userId]) {
                    delete scanUserSchedule[userId];
                    runningJob["SCAN_RUNNING_SCHEDULE_" + userId].stop();
                }
            }
        });
}

module.exports = function(server) {
    return {
        scanUserSchedule: function() {
            var second = moment().add(5, 's').second();

            if (runningJob['SCAN_USER_RUNNING_SCHEDULE']) {
                runningJob['SCAN_USER_RUNNING_SCHEDULE'].stop();
            }
            runningJob['SCAN_USER_RUNNING_SCHEDULE'] = new CronJob({
                cronTime: `${second} * * * * *`,
                // cronTime: `*/3 * * * * *`,
                onTick: function() {
                    console.log("-- Scan user running schedule");
                    let userRunning = [];
                    Schedule.find({
                            running: true
                        })
                        .select("created_by")
                        .lean()
                        .then(function(schedules) {
                            schedules.map(function(schedule) {
                                if (!scanUserSchedule[schedule.created_by]) {
                                    scanUserSchedule[schedule.created_by] = schedule.created_by;
                                    userRunning.push(mongoose.Types.ObjectId(schedule.created_by));
                                    scanScheduleByUser(server, schedule.created_by);
                                }
                            });
                            // return Schedule.find({
                            //         running: { $ne: true },
                            //         created_by: { $in: userRunning }
                            //     })
                            //     .select("created_by")
                            //     .lean();
                        });
                    // .then(function(schedules) {
                    //     console.log("Stopped schedules", schedules);
                    //     schedules.map(function(schedule) {
                    //         if (scanUserSchedule[schedule.created_by]) {
                    //             delete scanUserSchedule[schedule.created_by];
                    //             runningJob["SCAN_RUNNING_SCHEDULE_" + schedule.created_by].stop();
                    //         }
                    //     });
                    // });
                },
                start: false,
            });
            runningJob['SCAN_USER_RUNNING_SCHEDULE'].start();
        },
        holdOnRunning: function() {
            let config = server.configManager;
            let webUrl = config.get("web.context.settings.services.webUrl");

            if (runningJob['HOLD_ON_WEBSITE_RUNNING']) {
                runningJob['HOLD_ON_WEBSITE_RUNNING'].stop();
            }
            runningJob['HOLD_ON_WEBSITE_RUNNING'] = new CronJob({
                // cronTime: `* */15 * * * *`,
                cronTime: `*/3 * * * * *`,
                onTick: function() {
                    console.log("webUrl", webUrl);
                    Wreck.get(webUrl, {}, function(err, resp) {
                        if (err) {
                            console.log("Hold on failure");
                        } else {
                            console.log("Hold on successful");
                        }
                    });
                },
                start: false,
            });
            runningJob['HOLD_ON_WEBSITE_RUNNING'].start();
        }
    };
};

function scanScheduleByUser(server, user_id) {
    let config = server.configManager;
    var second = moment().add(5, 's').second();

    if (runningJob['SCAN_RUNNING_SCHEDULE_' + user_id]) {
        runningJob['SCAN_RUNNING_SCHEDULE_' + user_id].stop();
    }
    runningJob['SCAN_RUNNING_SCHEDULE_' + user_id] = new CronJob({
        cronTime: `${second} * * * * *`,
        // cronTime: `*/3 * * * * *`,
        onTick: function() {
            console.log("-- Quét các schedule của user", user_id);
            let banTime = 1000 * 60 * config.get("web.context.userSchedule.stopMinutes"); // 1 phút
            Schedule.find({
                    running: true,
                    created_by: user_id
                })
                .sort("-lastRun")
                .then(function(schedules) {
                    // console.log("Running schedules", schedules);
                    if (schedules && schedules.length) {
                        let selectSchedule;
                        let lastScheduleRun = new Date(schedules[0].lastRun);
                        let diff = new Date().getTime() - lastScheduleRun.getTime();
                        if (diff >= banTime) {
                            for (var i = schedules.length - 1; i >= 0; i--) {
                                let schedule = schedules[i];
                                let cycleMinutes = schedule.cycleMinutes * 60 * 1000;
                                let diff = new Date().getTime() - new Date(schedule.lastRun).getTime();
                                if (!schedule.lastRun ||
                                    (diff >= cycleMinutes)) {

                                    if ((schedule.scheduleType == 'count' && schedule.runTimes < schedule.runCounts) ||
                                        (schedule.scheduleType == 'time' && new Date(schedule.endTime) > new Date())) {

                                        selectSchedule = schedule;
                                        break;
                                    } else {
                                        schedule.running = false;
                                        schedule.save();
                                    }
                                } else {
                                    console.log("Không chạy schedule " + schedule.name + " vì: ", {
                                        lastRun: schedule.lastRun,
                                        diff,
                                        cycleMinutes
                                    });
                                }
                            }
                            if (selectSchedule) {
                                console.log("Sẽ chạy schedule", selectSchedule.name);
                                CampaignUtil(server).runCampaign(selectSchedule.campaignId, {
                                    debug: config.get("web.context.userSchedule.debug")
                                }, function(err, resp) {
                                    // console.log("check running selectSchedule");
                                    // console.log(err, resp);
                                    if (err) {
                                        console.log("err", err);
                                        selectSchedule.running = false;
                                    } else {
                                        selectSchedule.lastRun = new Date();
                                        if (!selectSchedule.runTimes) {
                                            selectSchedule.runTimes = 0;
                                        }
                                        selectSchedule.runTimes++;
                                    }
                                    if ((selectSchedule.scheduleType == 'count' && selectSchedule.runTimes >= selectSchedule.runCounts) ||
                                        (selectSchedule.scheduleType == 'time' && new Date(selectSchedule.endTime) <= new Date())) {

                                        selectSchedule.running = false;
                                    }
                                    selectSchedule.save().then(function() {
                                        removeUserSchedule(user_id);
                                    });
                                });
                            }
                        } else {
                            console.log("Tạm hoãn thực hiện schedule vì mới chạy", schedules[0].name);
                        }
                    }
                });
        },
        start: false,
    });
    runningJob['SCAN_RUNNING_SCHEDULE_' + user_id].start();
}