'use strict';

const Controller = require('./controllers/log.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: "post",
        path: "/api/log/getCampaignLogs",
        config: Controller.getCampaignLogs
    });

    server.route({
        method: "post",
        path: "/api/log/seenOne",
        config: Controller.seenOne
    });

    server.route({
        method: "post",
        path: "/api/log/seelAll",
        config: Controller.seenAll
    });

    let helper = require('./util/log')(server, options);
    server.expose("saveLog", helper.saveLog);

    next();
};

exports.register.attributes = {
    name: 'api-log'
};