'use strict';

const Controller = require('./controllers/schedule.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/quan-ly-lich-trinh',
        config: Controller.scheduleManager
    });

    next();
};

exports.register.attributes = {
    name: 'web-schedule'
};