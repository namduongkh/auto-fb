const _ = require('lodash');
const mongoose = require('mongoose');
// const Category = mongoose.model('Category');
const User = mongoose.model('User');
// const Setting = mongoose.model('Setting');
const async = require('async');
// const base64 = require('base-64');
// const utf8 = require('utf8');


exports.getAccessToken = function(request, reply) {

    let { invokeAccessToken } = request.query || request.payload;

    if (invokeAccessToken) {
        if (request.auth.credentials) {
            let { accessToken } = request.state;
            let { tokenExpire } = request.auth.credentials;
            if (!accessToken) {
                return reply({
                    noAccessToken: true,
                    rejectApi: true
                });
            }
            if (tokenExpire && new Date(tokenExpire) < new Date()) {
                return reply({
                    tokenHasExpired: true,
                    rejectApi: true
                });
            }
        }
    }

    return reply.continue();
};