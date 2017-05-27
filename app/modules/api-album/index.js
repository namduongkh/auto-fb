'use strict';

const Controller = require('./controllers/album.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/api/album/getAlbums',
        config: Controller.getAlbums
    });

    server.route({
        method: 'POST',
        path: '/api/album/saveAlbum',
        config: Controller.saveAlbum
    });

    server.route({
        method: 'POST',
        path: '/api/album/removeAlbum',
        config: Controller.removeAlbum
    });

    next();
};

exports.register.attributes = {
    name: 'api-album'
};