'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Feed = mongoose.model('Feed');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const ErrorHandler = require("../../../utils/error.js");
const graph = require('fbgraph');

// Get list feed
exports.getFeeds = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { credentials } = request.auth;
        if (credentials && credentials.id) {
            let id = credentials.id;
            Feed.find({
                    created_by: id
                })
                .sort("-created")
                .lean()
                .then(function(feeds) {
                    return reply(feeds);
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

// Save feed
exports.saveFeed = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { _id, title, message, link } = request.payload;

        let id = request.auth.credentials.id;

        function save(feed) {
            feed.save()
                .then(function(feed) {
                    return reply(feed);
                })
                .catch(function(err) {
                    console.log("SAVE FEEDS", err);
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
        }

        if (_id) {
            Feed.findOne({
                    created_by: id,
                    _id: _id
                })
                .then(function(feed) {
                    if (feed) {
                        feed.title = title;
                        feed.message = message;
                        feed.link = link;
                        feed.modified = new Date()
                        save(feed);
                    } else {
                        return reply(false);
                    }
                });
        } else {
            let feed = new Feed({
                message,
                link,
                title,
                created_by: id
            });
            save(feed);
        }
    }
};

// Remove feed
exports.removeFeed = {
    auth: 'jwt',
    handler: function(request, reply) {
        let userId = request.auth.credentials.id;
        let feedId = request.payload.feedId;

        Feed.findOne({
                _id: feedId,
                created_by: userId
            })
            .then(function(feed) {
                if (feed) {
                    feed.remove()
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