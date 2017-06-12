'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Album = mongoose.model('Album');
const Campaign = mongoose.model('Campaign');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const ErrorHandler = require("../../../utils/error.js");
const graph = require('fbgraph');
const _ = require('lodash');

// Get list album
exports.getAlbums = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { credentials } = request.auth;
        if (credentials && credentials.id) {
            let id = credentials.id;
            Album.find({
                    created_by: id
                })
                .sort("-modified")
                .lean()
                .then(function(albums) {
                    return reply(albums);
                })
                .catch(function(err) {
                    console.log("GET ALBUMS", err);
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
        } else {
            return reply.redirect("/dang-nhap");
        }
    }
};

// Save album
exports.saveAlbum = {
    auth: 'jwt',
    handler: function(request, reply) {
        let { _id, name, message, photos } = request.payload;

        let id = request.auth.credentials.id;

        function save(album) {
            album.save()
                .then(function(album) {
                    return reply(album);
                })
                .catch(function(err) {
                    console.log("SAVE ALBUMS", err);
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
        }

        if (_id) {
            Album.findOne({
                    created_by: id,
                    _id: _id
                })
                .then(function(album) {
                    if (album) {
                        album.name = name;
                        album.message = message;
                        album.photos = photos;
                        album.modified = new Date()
                        save(album);
                    } else {
                        return reply(false);
                    }
                });
        } else {
            let album = new Album({
                name,
                message,
                photos,
                created_by: id
            });
            save(album);
        }
    }
};

// Remove album
exports.removeAlbum = {
    auth: 'jwt',
    handler: function(request, reply) {
        let userId = request.auth.credentials.id;
        let albumId = request.payload.albumId;

        Album.findOne({
                _id: albumId,
                created_by: userId
            })
            .then(function(album) {
                if (album) {
                    album.remove()
                        .then(function() {
                            Campaign.find({
                                    albumId: albumId
                                })
                                .then(function(campaigns) {
                                    _.map(campaigns, function(campaign) {
                                        campaign.feedId = undefined;
                                        campaign.save();
                                    });
                                    return null;
                                });
                            return reply(true);
                        });
                    return null;
                } else {
                    return reply(false);
                }
            })
            .catch(function(err) {
                console.log("REMOVE ALBUMS", err);
                return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            });
    }
};