'use strict';

const Controller = require('./controllers/schedule.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    // server.route({
    //     method: 'GET',
    //     path: '/api/feed/getFeeds',
    //     config: Controller.getFeeds
    // });

    next();
};

exports.register.attributes = {
    name: 'api-schedule'
};