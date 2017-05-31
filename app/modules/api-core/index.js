'use strict';
const CoreController = require('./controller/core.controller.js');


exports.register = function(server, options, next) {
    var configManager = server.configManager;

    server.ext('onPostHandler', CoreController.getAccessToken);

    next();
};

exports.register.attributes = {
    name: 'api-core'
};