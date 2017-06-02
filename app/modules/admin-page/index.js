'use strict';

const PageController = require('./controller/page.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];
    server.route({
        method: 'GET',
        path: '/admin/page',
        config: PageController.getAll,
    });
    server.route({
        method: ['GET'],
        path: '/admin/page/{id}',
        config: PageController.edit,

    });
    server.route({
        method: ['DELETE'],
        path: '/admin/page/{id}',
        config: PageController.delete

    });
    server.route({
        method: 'POST',
        path: '/admin/page',
        config: PageController.save,

    });
    server.route({
        method: ['PUT', 'POST'],
        path: '/admin/page/{id}',
        config: PageController.update,

    });
    next();
};

exports.register.attributes = {
    name: 'admin-page'
};