'use strict';
const mongoose = require('mongoose');
const Campaign = mongoose.model('Campaign');
const Boom = require('boom');
const ErrorHandler = require("../../../utils/error.js");
const graph = require('fbgraph');

module.exports = function(server) {
    return {
        runCampaign: function(campaignId, options, callback) {
            callback = callback ? callback : function() {};
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
                        } else if (!campaign.timelineId) {
                            callback({
                                msg: "Không có ID của dòng thời gian.",
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
                            if (campaign.postType == 'feed') {
                                graphApiUrl = "/" + campaign.timelineId + "/feed";
                                graphPayload = {
                                    message: campaign.feedId.message,
                                    link: campaign.feedId.link,
                                };
                            }
                            if (!options.debug) {
                                sendGraphApi(user.accessToken, "post", graphApiUrl, graphPayload, callback);
                            } else {
                                callback(null, true);
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
    function handleResponse(err, resp) {
        console.log("Graph resp", err, resp);
        if (err) {
            callback({ msg: "Chạy chiến dịch không thành công." });
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