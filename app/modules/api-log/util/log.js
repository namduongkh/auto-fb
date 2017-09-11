'use strict';
const mongoose = require("mongoose");
const Log = mongoose.model("Log");
const Campaign = mongoose.model("Campaign");

module.exports = function(server) {
    return {
        saveLog: function(campaignId, status, result) {
            return Campaign.findOne({
                    _id: campaignId
                })
                .lean()
                .then(function(campaign) {
                    return new Log({
                            userId: campaign.created_by,
                            campaignId,
                            status,
                            result
                        })
                        .save();
                });
        }
    };
};