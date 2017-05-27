'use strict';

const Controller = require('./controllers/feed.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/quan-ly-feed',
        config: Controller.feedManager
    });

    next();
};

exports.register.attributes = {
    name: 'web-feed'
};