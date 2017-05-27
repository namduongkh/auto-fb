'use strict';

const Controller = require('./controllers/graph.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/dang-len-nhom',
        config: Controller.postGroup
    });

    next();
};

exports.register.attributes = {
    name: 'web-graph'
};