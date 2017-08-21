'use strict';
const CoreController = require('./controller/core.controller.js');


exports.register = function(server, options, next) {
    var configManager = server.configManager;

    server.ext('onPostHandler', CoreController.getCredentials);
    // server.ext('onPostHandler', CoreController.getSocialInfo);
    // server.ext('onPostHandler', CoreController.getHostInfo);
    // server.ext('onPostHandler', CoreController.getGACode);
    // server.ext('onPostHandler', CoreController.getPostCategories);
    // server.ext('onPostHandler', CoreController.getProductCategories);
    server.ext('onPostHandler', CoreController.getMeta);
    // server.ext('onPostHandler', CoreController.getMetaImage);
    // server.ext('onPostHandler', CoreController.getSticker);
    server.ext('onPreResponse', CoreController.getAppId);
    server.ext('onPreResponse', CoreController.handleError);
    // server.ext('onPreHandler', CoreController.getPushToken);

    // let mongoCache = require('./util/mongoCache')(server, options);
    // server.expose('mongoCache', mongoCache);

    server.route({
        method: 'GET',
        path: '/khong-tim-thay-noi-dung',
        config: CoreController.notFound
    });

    next();
};

exports.register.attributes = {
    name: 'web-core'
};