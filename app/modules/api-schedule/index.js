'use strict';

const Controller = require('./controllers/schedule.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/api/schedule/getSchedules',
        config: Controller.getSchedules
    });

    server.route({
        method: 'POST',
        path: '/api/schedule/saveSchedule',
        config: Controller.saveSchedule
    });

    server.route({
        method: 'POST',
        path: '/api/schedule/removeSchedule',
        config: Controller.removeSchedule
    });

    server.route({
        method: 'POST',
        path: '/api/schedule/runSchedule',
        config: Controller.runSchedule
    });

    server.route({
        method: 'POST',
        path: '/api/schedule/stopSchedule',
        config: Controller.stopSchedule
    });

    let helper = require('./util/schedule')(server, options);

    helper.scanUserSchedule();
    helper.holdOnRunning();

    next();
};

exports.register.attributes = {
    name: 'api-schedule'
};