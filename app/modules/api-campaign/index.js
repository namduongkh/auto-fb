'use strict';

const Controller = require('./controllers/campaign.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/api/campaign/getCampaigns',
        config: Controller.getCampaigns
    });

    server.route({
        method: 'POST',
        path: '/api/campaign/saveCampaign',
        config: Controller.saveCampaign
    });

    server.route({
        method: 'POST',
        path: '/api/campaign/removeCampaign',
        config: Controller.removeCampaign
    });

    server.route({
        method: 'POST',
        path: '/api/campaign/runCampaign',
        config: Controller.runCampaign
    });

    let helper = require('./util/campaign')(server, options);
    server.expose('runCampaign', helper.runCampaign);
    server.expose('changeLastTimelineRun', helper.changeLastTimelineRun);

    next();
};

exports.register.attributes = {
    name: 'api-campaign'
};