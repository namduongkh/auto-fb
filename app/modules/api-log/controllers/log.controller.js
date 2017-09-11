'use strict';

const mongoose = require("mongoose");
const Log = mongoose.model("Log");
const Boom = require("boom");
const Joi = require("joi");

exports.getCampaignLogs = {
    handler: function(request, reply) {
        let userId = request.auth.credentials ? request.auth.credentials.id : request.payload.userId;
        let page = request.payload.page || 1;
        let itemsPerPage = 10;
        if (userId) {
            Log.find({
                    userId: userId,
                })
                .sort("-created")
                .populate("campaignId", "title")
                .lean()
                .paginate(page, itemsPerPage, function(err, items, total) {
                    return reply({
                        status: true,
                        items,
                        total
                    });
                });
        } else {
            return reply(Boom.badRequest("Không tồn tại user id"));
        }
    },
    tags: ['api'],
    validate: {
        payload: {
            userId: Joi.any(),
            page: Joi.any(),
        }
    }
};

exports.seenAll = {
    handler: function(request, reply) {
        let userId = request.auth.credentials ? request.auth.credentials.id : request.payload.userId;
        if (userId) {
            Log.find({
                    userId: userId,
                    seen: { $ne: true }
                })
                .then(function(logs) {
                    if (logs && logs.length) {
                        logs.forEach(function(log) {
                            log.seen = true;
                            log.save();
                        });

                        return reply({ status: true });
                    } else {
                        return reply(Boom.badRequest("Không tồn tại logs"));
                    }
                });
        } else {
            return reply(Boom.badRequest("Không tồn tại user id"));
        }
    },
    tags: ['api'],
    // validate: {
    //     payload: {
    //         logId: Joi.any(),
    //     }
    // }
};

exports.seenOne = {
    handler: function(request, reply) {
        let userId = request.auth.credentials ? request.auth.credentials.id : request.payload.userId;
        let logId = request.payload.logId;
        if (userId) {
            Log.findOne({
                    userId: userId,
                    _id: logId,
                    seen: { $ne: true }
                })
                .then(function(log) {
                    if (log) {
                        log.seen = true;
                        log.save();
                        return reply({ status: true });
                    } else {
                        return reply(Boom.badRequest("Không tồn tại log id"));
                    }
                });
        } else {
            return reply(Boom.badRequest("Không tồn tại user id"));
        }
    },
    tags: ['api'],
    validate: {
        payload: {
            logId: Joi.any(),
        }
    }
};