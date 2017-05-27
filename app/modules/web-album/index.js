'use strict';

const Controller = require('./controllers/album.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/quan-ly-album',
        config: Controller.albumManager
    });

    next();
};

exports.register.attributes = {
    name: 'web-album'
};