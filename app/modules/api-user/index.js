'use strict';

const Controller = require('./controllers/user.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/',
        config: Controller.index
    });

    server.route({
        method: 'POST',
        path: '/api/user/login',
        config: Controller.login
    });

    server.route({
        method: 'GET',
        path: '/api/user/logout',
        config: Controller.logout
    });

    server.route({
        method: 'POST',
        path: '/api/user/register',
        config: Controller.register
    });

    server.route({
        method: 'POST',
        path: '/api/user/update',
        config: Controller.update
    });

    server.route({
        method: 'GET',
        path: '/api/user/account',
        config: Controller.account
    });

    server.route({
        method: 'GET',
        path: '/api/user/generateAdmin',
        config: Controller.generateAdmin
    });

    server.route({
        method: 'POST',
        path: '/api/user/extendAccessToken',
        config: Controller.extendAccessToken
    });

    server.route({
        method: 'POST',
        path: '/api/user/graphApi',
        config: Controller.graphApi
    });

    server.route({
        method: 'GET',
        path: '/api/user/resetBanCampaign',
        config: Controller.resetBanCampaign
    });

    next();
};

exports.register.attributes = {
    name: 'api-user'
};