'use strict';

const Controller = require('./controllers/feed.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/api/feed/getFeeds',
        config: Controller.getFeeds
    });

    server.route({
        method: 'POST',
        path: '/api/feed/saveFeed',
        config: Controller.saveFeed
    });

    server.route({
        method: 'POST',
        path: '/api/feed/removeFeed',
        config: Controller.removeFeed
    });

    next();
};

exports.register.attributes = {
    name: 'api-feed'
};