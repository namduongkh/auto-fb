'use strict';

const DashboardController = require('./controller/dashboard.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];
    server.route({
        method: 'GET',
        path: '/{view?}',
        config: {
            handler: function(request, reply) {
                let view = request.params.view;
                // console.log("view", view);
                if (view) {
                    return reply.redirect("/admin/" + request.params.view);
                } else {
                    return reply.redirect("/admin");
                }
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