'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Schedule = mongoose.model('Schedule');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const ErrorHandler = require("../../../utils/error.js");
const graph = require('fbgraph');

// Get list schedule
exports.getSchedules = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { credentials } = request.auth;
        if (credentials && credentials.id) {
            let id = credentials.id;
            Schedule.find({
                    created_by: id
                })
                .sort("-modified")
                .lean()
                .then(function(schedules) {
                    return reply(schedules);
                })
                .catch(function(err) {
                    console.log("GET FEEDS", err);
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
        } else {
            return reply.redirect("/dang-nhap");
        }
    }
};

// Save schedule
exports.saveSchedule = {
    auth: 'jwt',
    handler: function(request, reply) {
        let {
            _id,
            name,
            campaignId,
            cycleMinutes,
            runCounts,
            endTime,
            scheduleType,
            description,
        } = request.payload;

        let id = request.auth.credentials.id;

        function save(schedule) {
            schedule.save()
                .then(function(schedule) {
                    generateScheduleDescription(schedule._id, function(err, schedule) {
                        if (err) {
                            return reply(Boom.badRequest(err));
                        } else {
                            return reply(schedule);
                        }
                    });
                    return null;
                })
                .catch(function(err) {
                    console.log("SAVE FEEDS", err);
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
        }

        if (_id) {
            Schedule.findOne({
                    created_by: id,
                    _id: _id
                })
                .then(function(schedule) {
                    if (schedule) {
                        schedule.name = name || schedule.name;
                        schedule.campaignId = campaignId || schedule.campaignId;
                        schedule.cycleMinutes = cycleMinutes || schedule.cycleMinutes;
                        schedule.runCounts = runCounts || schedule.runCounts;
                        schedule.runTimes = 0;
                        schedule.endTime = endTime || schedule.endTime;
                        schedule.scheduleType = scheduleType || schedule.scheduleType;
                        // schedule.description = description || schedule.description;
                        schedule.modified = new Date();
                        save(schedule);
                    } else {
                        return reply(false);
                    }
                });
        } else {
            let schedule = new Schedule({
                name,
                campaignId,
                cycleMinutes,
                runCounts,
                endTime,
                scheduleType,
                // description,
                created_by: id
            });
            save(schedule);
        }
    }
};

// Remove schedule
exports.removeSchedule = {
    auth: 'jwt',
    handler: function(request, reply) {
        let userId = request.auth.credentials.id;
        let scheduleId = request.payload.scheduleId;

        Schedule.findOne({
                _id: scheduleId,
                created_by: userId
            })
            .then(function(schedule) {
                if (schedule) {
                    schedule.remove()
                        .then(function() {
                            return reply(true);
                        })
                } else {
                    return reply(false);
                }
            })
            .catch(function(err) {
                console.log("REMOVE FEEDS", err);
                return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            });
    }
};

exports.runSchedule = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { scheduleId } = request.payload;
        let id = request.auth.credentials.id;
        Schedule.findOne({
                _id: scheduleId,
                created_by: id
            })
            .populate({
                path: "campaignId",
                select: "albumId feedId",
                populate: [{
                    path: "albumId",
                    select: "_id"
                }, {
                    path: "feedId",
                    select: "_id"
                }]
            })
            .then(function(schedule) {
                if (schedule) {
                    if (!schedule.campaignId ||
                        (!schedule.campaignId.albumId && !schedule.campaignId.feedId)) {
                        return reply(Boom.badRequest("Không tồn tại nội dung bài đăng. Kiểm tra lại album, trạng thái..."));
                    }
                    schedule.running = true;
                    schedule.runTimes = 0;
                    schedule
                        .save()
                        .then(function(schedule) {
                            return reply({
                                status: true,
                                msg: "Đã khởi động lịch trình thành công",
                                data: schedule
                            });
                        });
                    return null;
                } else {
                    return reply(Boom.badRequest("Không tìm thấy lịch trình."));
                }
            })
            .catch(function(err) {
                return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            });
    }
};

exports.stopSchedule = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { scheduleId } = request.payload;
        let id = request.auth.credentials.id;
        Schedule.findOne({
                _id: scheduleId,
                created_by: id
            })
            .then(function(schedule) {
                if (schedule) {
                    schedule.running = false;
                    return schedule.save();
                } else {
                    return reply(Boom.badRequest("Không tìm thấy lịch trình."));
                }
            })
            .then(function(schedule) {
                return reply({
                    status: true,
                    msg: "Đã dừng lịch trình thành công",
                    data: schedule
                });
            })
            .catch(function(err) {
                return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            });
    }
};

function generateScheduleDescription(scheduleId, callback) {
    callback = callback || function() {};
    Schedule.findOne({
            _id: scheduleId
        })
        .populate("campaignId")
        .then(function(schedule) {
            let description = "Lịch trình \"" + (schedule.campaignId.description || schedule.campaignId.title) + "\" với chu kỳ mỗi " + schedule.cycleMinutes + " phút";
            schedule.description = description;
            return schedule.save();
        })
        .then(function(schedule) {
            callback(null, schedule);
        })
        .catch(function(err) {
            callback(ErrorHandler.getErrorMessage(err));
        });
}