'use strict';
const mongoose = require('mongoose');
const Campaign = mongoose.model('Campaign');
const Boom = require('boom');
const ErrorHandler = require("../../../utils/error.js");
const graph = require('fbgraph');
const _ = require('lodash');
const async = require('async');

module.exports = function(server) {
    return {
        changeLastTimelineRun: changeLastTimelineRun,
        runCampaign: function(campaignId, options, returnFunc) {
            returnFunc = returnFunc ? returnFunc : function() {};

            function callback(err, resp) {
                // console.log({ err, resp });
                let { saveLog } = server.plugins['api-log'];
                let status = true;
                let result = resp;
                let errResp;
                if (err) {
                    status = false;
                    result = err;
                    errResp = { msg: "Chạy chiến dịch không thành công." };
                }
                saveLog(campaignId, status, result);
                returnFunc(errResp, resp);
            };

            Campaign.findOne({
                    _id: campaignId
                })
                .populate("created_by", "accessToken tokenExpire banCampaign")
                .populate("feedId")
                .populate("albumId")
                .lean()
                .then(function(campaign) {
                    if (campaign) {
                        let user = campaign.created_by;
                        if (!user.accessToken) {
                            callback({
                                noAccessToken: true,
                                msg: "Không có mã truy cập."
                            });
                        } else if (!user.tokenExpire || new Date(user.tokenExpire) < new Date()) {
                            callback({
                                msg: "Mã truy cập đã hết hạn.",
                                tokenHasExpired: true
                            });
                        } else if (!campaign.timelineId || !campaign.timelineId.length) {
                            callback({
                                msg: "Không có ID của dòng thời gian.",
                            });
                        } else if (!campaign.feedId && !campaign.albumId) {
                            callback({
                                msg: "Không tồn tại nội dung bài đăng. Kiểm tra lại album, trạng thái...",
                            });
                        } else {
                            if (options.checkBan) {
                                let banCampaign = new Date(user.banCampaign).getTime();
                                let now = new Date().getTime();
                                if (banCampaign > now) {
                                    let time = Math.ceil((banCampaign - now) / 1000);
                                    let minutes = handleNumber(Math.floor(time / 60));
                                    let seconds = handleNumber(Math.floor(time % 60));
                                    callback({ msg: "Bạn có thể tiếp tục chạy chiến dịch sau " + minutes + " phút " + seconds + " giây." });
                                    return;
                                }
                            }
                            let graphApiUrl;
                            let graphPayload;
                            let realCallback;
                            if (!campaign.lastTimelineRun && campaign.lastTimelineRun != 0) {
                                campaign.lastTimelineRun = 0;
                            }
                            let campaignTimelineId = campaign.timelineId[campaign.lastTimelineRun].id;
                            if (campaign.postType == 'feed') {
                                graphApiUrl = "/" + campaignTimelineId + "/feed";
                                graphPayload = {
                                    message: campaign.feedId.message,
                                    link: campaign.feedId.link,
                                };
                                realCallback = callback;
                            }
                            if (campaign.postType == 'album') {
                                graphApiUrl = "/" + campaignTimelineId + "/albums";
                                graphPayload = {
                                    message: campaign.albumId.message,
                                    name: campaign.albumId.name,
                                };
                                realCallback = function(err, result) {
                                    if (err) {
                                        callback(err, result);
                                    } else {
                                        let albumId = result.id;
                                        let parallel = [];
                                        _.map(campaign.albumId.photos, function(photo) {
                                            parallel.push(function(cb) {
                                                // if (process.env.NODE_ENV == 'development') {
                                                //     var imageUrl = "https://image.ibb.co/fSEL0v/tao_dep.jpg";
                                                // } else {
                                                var imageUrl = server.configManager.get("web.context.settings.services.webUrl") + "/files/albums/" + campaign.albumId._id + "/" + photo;
                                                // }
                                                sendGraphApi(user.accessToken, 'post', `/${albumId}/photos`, {
                                                    url: imageUrl,
                                                }, function(err, result) {
                                                    cb(err, result);
                                                });
                                            });
                                        });
                                        async.parallel(parallel, function(err, photos) {
                                            if (err) {
                                                callback(err);
                                            } else {
                                                result.photos = photos;
                                                callback(null, result);
                                            }
                                        });
                                    }
                                };
                            }
                            if (!options.debug) {
                                sendGraphApi(user.accessToken, "post", graphApiUrl, graphPayload, function(err, resp) {
                                    changeLastTimelineRun(campaign._id, function() {
                                        realCallback(err, resp);
                                    });
                                });
                            } else {
                                changeLastTimelineRun(campaign._id, function() {
                                    callback(null, true);
                                });
                            }
                        }
                    } else {
                        callback({ msg: "Chiến dịch không tồn tại." });
                    }
                });
        }
    };
};

function sendGraphApi(accessToken, method, url, payload, callback) {
    console.log("payload", payload);

    function handleResponse(err, resp) {
        console.log("Graph resp", err, resp);
        if (err) {
            // callback({ msg: "Chạy chiến dịch không thành công." });
            callback(err);
        } else {
            callback(null, resp);
        }
    }
    callback = callback ? callback : function() {};
    graph.setAccessToken(accessToken);
    if (method == "post") {
        graph.post(url, payload, handleResponse);
    } else {
        graph.get(url, handleResponse);
    }
}

function handleNumber(number) {
    if (number < 10 && number >= 0) {
        number = "0" + number;
    }
    return number;
}

function changeLastTimelineRun(campaignId, callback) {
    callback = callback || function() {};
    Campaign.findOne({
            _id: campaignId
        })
        .select("lastTimelineRun timelineId")
        .then(function(campaign) {
            if (!campaign.lastTimelineRun && campaign.lastTimelineRun !== 0) {
                campaign.lastTimelineRun = 0;
            } else {
                campaign.lastTimelineRun++;
                if (campaign.lastTimelineRun >= campaign.timelineId.length) {
                    campaign.lastTimelineRun = 0;
                }
            }
            return campaign.save();
        })
        .then(function(campaign) {
            callback(null, campaign);
            return null;
        })
        .catch(function(err) {
            callback(err);
            return null;
        });
}