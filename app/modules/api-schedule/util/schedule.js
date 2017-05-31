'use strict';
const mongoose = require('mongoose');
const Schedule = mongoose.model('Schedule');
const Boom = require('boom');
const ErrorHandler = require("../../../utils/error.js");
const CampaignUtil = require('../../api-campaign/util/campaign.js');
const CronJob = require('cron').CronJob;

var runningJob = {};

module.exports = function(server) {
    return {
        scanSchedule: function() {
            var second = new Date().getSeconds() + 5;
            if (second > 59) {
                second -= 60;
            }

            if (runningJob['SCAN_RUNNING_SCHEDULE']) {
                runningJob['SCAN_RUNNING_SCHEDULE'].stop();
            }
            runningJob['SCAN_RUNNING_SCHEDULE'] = new CronJob({
                // cronTime: `${second} * * * * *`,
                cronTime: `*/3 * * * * *`,
                onTick: function() {
                    Schedule.find({
                            running: true
                        })
                        // .lean()
                        .then(function(schedules) {
                            // console.log("All schedule", schedules);
                            schedules.map(function(schedule) {
                                // let cycleMinutes = schedule.cycleMinutes * 60 * 1000;
                                let cycleMinutes = 10000;
                                let diff = new Date().getTime() - new Date(schedule.lastRun).getTime();
                                // console.log("cycleMinutes", cycleMinutes);
                                // console.log("diff", diff);
                                // let cycleMinutes = 5000;
                                if (!schedule.lastRun ||
                                    (diff >= cycleMinutes)) {

                                    if ((schedule.scheduleType == 'count' && schedule.runTimes < schedule.runCounts) ||
                                        (schedule.scheduleType == 'time' && new Date(schedule.endTime) > new Date())) {

                                        // console.log("Run schedule", schedule);
                                        CampaignUtil(server).runCampaign(schedule.campaignId, {
                                            // debug: true
                                        }, function(err, resp) {
                                            // console.log("check running schedule");
                                            // console.log(err, resp);
                                            if (err) {
                                                schedule.running = false;
                                            } else {
                                                schedule.lastRun = new Date();
                                                if (schedule.scheduleType == 'count') {
                                                    if (!schedule.runTimes) {
                                                        schedule.runTimes = 0;
                                                    }
                                                    schedule.runTimes++;
                                                }
                                            }
                                            schedule.save();
                                        });
                                    } else {
                                        schedule.running = false;
                                        schedule.save();
                                    }
                                }
                            });
                        });
                },
                start: false,
            });
            runningJob['SCAN_RUNNING_SCHEDULE'].start();
        }
    };
};