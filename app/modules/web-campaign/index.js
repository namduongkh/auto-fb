'use strict';

const Controller = require('./controllers/campaign.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/quan-ly-campaign',
        config: Controller.campaignManager
    });

    next();
};

exports.register.attributes = {
    name: 'web-campaign'
};