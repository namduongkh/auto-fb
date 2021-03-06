'use strict';

const Path = require('path');
const Glob = require("glob");
const HapiSwagger = require('hapi-swagger');
const Pack = require(global.BASE_PATH + '/package');

module.exports = function(server) {
    server.register([{
        register: require('vision')
    }, {
        register: require('inert')
    }, {
        register: HapiSwagger,
        options: {
            info: {
                'title': 'Documentation',
                'version': Pack.version,
            }
        }
    }, {
        register: require('hapi-context-credentials')
    }, {
        // Kết nối mongodb
        register: require('./mongo.js')
    }, {
        // Plugin xử lý để load các file tĩnh
        register: require('./static.js')
    }, {
        // Plugin xử lý xác thực user
        register: require('./auth.js')
    }, ], (err) => {
        if (err) {
            server.log(['error', 'server'], err);
        }
        let config = server.configManager;

        // Cài đặt template engine: Đang sử dụng handlebars
        server.views({
            engines: {
                html: require('handlebars'),
            },
            helpersPath: global.BASE_PATH + '/app/views/helpers',
            relativeTo: global.BASE_PATH + '/app/modules',
            partialsPath: global.BASE_PATH + '/app/views/layouts',
            layoutPath: global.BASE_PATH + '/app/views/layouts',
            layout: function() {
                return 'web/layout';
            }(),
            context: config.get("web.context")
        });

        // Load các model trong các module
        let models = Glob.sync(BASE_PATH + "/app/modules/*/model/*.js", {});
        models.forEach((item) => {
            require(Path.resolve(item));
        });

        // Tùy theo từng connection của từng label mà load các route trong các module thuộc label đó vào
        server.connections.forEach(function(connectionSetting) {
            let labels = connectionSetting.settings.labels;
            labels.forEach(name => {
                let modules = [];
                let modulesName = Glob.sync(BASE_PATH + `/app/modules/${name}-*/index.js`, {});
                modulesName.forEach((item) => {
                    modules.push(require(Path.resolve(`${item}`)));
                });
                if (modules.length) {
                    server.register(modules, { select: [name] }, (err) => {
                        if (err) {
                            server.log(['error', 'server'], err);
                        }
                    });
                }
            });
        });

    });
};