'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Campaign = mongoose.model('Campaign');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const ErrorHandler = require("../../../utils/error.js");
const graph = require('fbgraph');
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
            cycleMinutes
        } = request.payload;

        let id = request.auth.credentials.id;

        function save(campaign) {
            campaign.save()
                .then(function(campaign) {
                    return reply(campaign);
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

var campaignRunning = {};

exports.runCampaign = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { campaignId } = request.payload;
        let id = request.auth.credentials.id;
        let { runCampaign } = request.server.plugins['api-campaign'];
        runCampaign(campaignId, {
            checkBan: true,
            // debug: true
        }, function(err, result) {
            if (err) {
                return reply(Boom.badRequest(err.msg));
            } else {
                User.findOne({
                        _id: id
                    })
                    .then(function(user) {
                        user.banCampaign = new Date(new Date().getTime() + (10 * 60 * 1000)) // Cấm chạy chiến dịch 10 phút
                        return user.save();
                    })
                    .then(function(user) {
                        // console.log("User", user);
                        return reply({ msg: "Đã chạy chiến dịch thành công. Để tránh bị Facebook khóa tài khoản, bạn nên ngừng việc chạy chiến dịch trong 10 phút." });
                    });
            }
        });
    }
};