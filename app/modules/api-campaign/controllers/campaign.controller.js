'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');
const Schedule = mongoose.model('Schedule');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const ErrorHandler = require("../../../utils/error.js");
const graph = require('fbgraph');
const _ = require('lodash');
const CronJob = require('cron').CronJob;

// Get list campaign
exports.getCampaigns = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { credentials } = request.auth;
        if (credentials && credentials.id) {
            let id = credentials.id;
            Campaign.find({
                    created_by: id
                })
                .sort("-modified")
                .lean()
                .then(function(campaigns) {
                    return reply(campaigns);
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

// Save campaign
exports.saveCampaign = {
    auth: 'jwt',
    handler: function(request, reply) {
        let {
            _id,
            title,
            timeline,
            postType,
            timelineId,
            feedId,
            albumId,
            description,
            cycleMinutes
        } = request.payload;

        let id = request.auth.credentials.id;

        function save(campaign) {
            campaign.save()
                .then(function(campaign) {
                    // if (!campaign.description) {
                    generateDescription(campaign._id, function(err, result) {
                        if (err) {
                            return reply(Boom.badRequest(err));
                        } else {
                            return reply(result);
                        }
                    });
                    return null;
                    // } else {
                    //     return reply(campaign);
                    // }
                })
                .catch(function(err) {
                    console.log("SAVE FEEDS", err);
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
        }

        if (_id) {
            Campaign.findOne({
                    created_by: id,
                    _id: _id
                })
                .then(function(campaign) {
                    if (campaign) {
                        campaign.title = title || campaign.title;
                        campaign.timeline = timeline || campaign.timeline;
                        campaign.postType = postType || campaign.postType;
                        campaign.timelineId = timelineId || campaign.timelineId;
                        campaign.feedId = feedId || campaign.feedId;
                        campaign.albumId = albumId || campaign.albumId;
                        campaign.lastTimelineRun = 0;
                        // campaign.description = description || campaign.description;
                        campaign.modified = new Date()
                        save(campaign);
                    } else {
                        return reply(false);
                    }
                });
        } else {
            let campaign = new Campaign({
                title,
                timeline,
                postType,
                timelineId,
                feedId,
                albumId,
                // description,
                created_by: id
            });
            save(campaign);
        }
    }
};

// Remove campaign
exports.removeCampaign = {
    auth: 'jwt',
    handler: function(request, reply) {
        let userId = request.auth.credentials.id;
        let campaignId = request.payload.campaignId;

        Campaign.findOne({
                _id: campaignId,
                created_by: userId
            })
            .then(function(campaign) {
                if (campaign) {
                    campaign.remove()
                        .then(function() {
                            Schedule.find({
                                    campaignId: campaignId
                                })
                                .then(function(schedules) {
                                    _.map(schedules, function(schedule) {
                                        schedule.campaignId = undefined;
                                        schedule.running = false;
                                        schedule.save();
                                    });
                                });
                            return reply(true);
                        });
                    return null;
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

var campaignRunning = {};

exports.runCampaign = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { campaignId } = request.payload;
        let id = request.auth.credentials.id;
        let { runCampaign } = request.server.plugins['api-campaign'];
        let stopMinutes = request.server.configManager.get("web.userSchedule.stopMinutes");
        runCampaign(campaignId, {
            checkBan: true,
            debug: request.server.configManager.get("web.userSchedule.debug")
        }, function(err, result) {
            if (err) {
                return reply(Boom.badRequest(err.msg));
            } else {
                User.findOne({
                        _id: id
                    })
                    .then(function(user) {
                        user.banCampaign = new Date(new Date().getTime() + (stopMinutes * 60 * 1000)) // Cấm chạy chiến dịch 10 phút
                        return user.save();
                    })
                    .then(function(user) {
                        // console.log("User", user);
                        return reply({ msg: "Đã chạy chiến dịch thành công. Để tránh bị Facebook khóa tài khoản, bạn nên ngừng việc chạy chiến dịch trong " + stopMinutes + " phút." });
                    });
            }
        });
    }
};

function generateDescription(campaignId, callback) {
    callback = callback || function() {};
    let timelineName;
    let campaign;
    let desc = {};
    let generate;
    Campaign.findOne({
            _id: campaignId
        })
        .populate("feedId", "title")
        .populate("albumId", "name")
        .then(function(result) {
            campaign = result;
            desc.postType = campaign.albumId ? 'album' : 'trạng thái';
            if (campaign.albumId) {
                desc.postName = campaign.albumId ? campaign.albumId.name : undefined;
            } else {
                desc.postName = campaign.feedId ? campaign.feedId.title : undefined;
            }
            let timelineName = _.map(campaign.timelineId, function(item) {
                let type = function() {
                    switch (item.type) {
                        case 'group':
                            return 'nhóm';
                        case 'page':
                            return 'trang';
                        default:
                            return '';
                    }
                }();
                return type + " " + item.name;
            }).join(", ");
            generate = `Xuất bản ${desc.postType} ${desc.postName} vào ${timelineName}`;
            campaign.description = generate;
            return campaign.save();
        })
        .then(function(result) {
            if (result.feedId) {
                result.feedId = result.feedId._id;
            }
            if (result.albumId) {
                result.albumId = result.albumId._id;
            }
            // console.log("result", result);
            callback(null, result);
        })
        .catch(function(err) {
            console.log("err", err);
            callback(ErrorHandler.getErrorMessage(err));
        });
}