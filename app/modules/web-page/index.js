'use strict';

const PageController = require('./controller/page.controller.js');

exports.register = function(server, options, next) {
    let config = server.configManager;

    server.route({
        method: 'GET',
        path: '/trang/{indentity}',
        config: PageController.getIndentity
    });

    server.route({
        method: 'GET',
        path: '/tro-giup',
        config: PageController.help
    });

    // server.route({
    //     method: 'GET',
    //     path: config.get('web.error.notfound.url'),
    //     config: PageController.error404
    // });

    next();
};

exports.register.attributes = {
    name: 'web-page'
};