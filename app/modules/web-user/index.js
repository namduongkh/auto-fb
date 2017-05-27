'use strict';

const Controller = require('./controllers/user.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];

    server.route({
        method: 'GET',
        path: '/dang-nhap',
        config: Controller.login
    });

    server.route({
        method: 'GET',
        path: '/dang-ky',
        config: Controller.register
    });

    server.route({
        method: 'GET',
        path: '/trang-ca-nhan',
        config: Controller.profile
    });

    server.route({
        method: 'GET',
        path: '/quan-ly-nhom',
        config: Controller.groupManager
    });

    next();
};

exports.register.attributes = {
    name: 'web-user'
};