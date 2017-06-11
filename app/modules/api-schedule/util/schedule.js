'use strict';
const mongoose = require('mongoose');
const Schedule = mongoose.model('Schedule');
const Boom = require('boom');
const ErrorHandler = require("../../../utils/error.js");
const CampaignUtil = require('../../api-campaign/util/campaign.js');
const CronJob = require('cron').CronJob;

var runningJob = {};
var scanUserSchedule = {};

module.exports = function(server) {
    return {
        scanUserSchedule: function() {
            var second = new Date().getSeconds() + 5;
            if (second > 59) {
                second -= 60;
            }

            if (runningJob['SCAN_USER_RUNNING_SCHEDULE']) {
                runningJob['SCAN_USER_RUNNING_SCHEDULE'].stop();
            }
            runningJob['SCAN_USER_RUNNING_SCHEDULE'] = new CronJob({
                cronTime: `${second} * * * * *`,
                // cronTime: `*/3 * * * * *`,
                onTick: function() {
                    Schedule.find({
                            running: true
                        })
                        .select("created_by")
                        .lean()
                        .then(function(schedules) {
                            schedules.map(function(schedule) {
                                if (!scanUserSchedule[schedule.created_by]) {
                                    scanUserSchedule[schedule.created_by] = schedule.created_by;
                                    scanScheduleByUser(server, schedule.created_by);
                                }
                            });
                        });
                    Schedule.find({
                            running: { $ne: true }
                        })
                        .select("created_by")
                        .lean()
                        .then(function(schedules) {
                            schedules.map(function(schedule) {
                                if (scanUserSchedule[schedule.created_by]) {
                                    delete scanUserSchedule[schedule.created_by];
                                    runningJob["SCAN_RUNNING_SCHEDULE_" + schedule.created_by].stop();
                                }
                            });
                        });
                },
                start: false,
            });
            runningJob['SCAN_USER_RUNNING_SCHEDULE'].start();
        },
    };
};

function scanScheduleByUser(server, user_id) {
    let config = server.configManager;
    var second = new Date().getSeconds() + 5;
    if (second > 59) {
        second -= 60;
    }

    if (runningJob['SCAN_RUNNING_SCHEDULE_' + user_id]) {
        runningJob['SCAN_RUNNING_SCHEDULE_' + user_id].stop();
    }
    runningJob['SCAN_RUNNING_SCHEDULE_' + user_id] = new CronJob({
        cronTime: `${second} * * * * *`,
        // cronTime: `*/3 * * * * *`,
        onTick: function() {
            console.log("Quét các schedule của user", user_id);
            let banTime = 1000 * 60 * config.get("web.userSchedule.stopMinutes"); // 1 phút
            Schedule.find({
                    running: true,
                    created_by: user_id
                })
                .sort("-lastRun")
                .then(function(schedules) {
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
                                }
                            }
                            if (selectSchedule) {
                                console.log("Sẽ chạy schedule", selectSchedule.name);
                                CampaignUtil(server).runCampaign(selectSchedule.campaignId, {
                                    debug: config.get("web.userSchedule.debug")
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
                                    if ((schedule.scheduleType == 'count' && schedule.runTimes >= schedule.runCounts) ||
                                        (schedule.scheduleType == 'time' && new Date(schedule.endTime) <= new Date())) {

                                        schedule.running = false;
                                    }
                                    selectSchedule.save();
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