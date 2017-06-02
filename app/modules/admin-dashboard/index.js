'use strict';

const DashboardController = require('./controller/dashboard.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/',
        config: {
            handler: function(request, reply) {
                return reply.redirect('/admin');
            }
        },
    });

    server.route({
        method: 'GET',
        path: '/admin',
        config: DashboardController.index,
    });
    next();
};

exports.register.attributes = {
    name: 'admin-dashboard'
};