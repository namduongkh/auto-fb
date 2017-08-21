'use strict';

const Hapi = require('hapi');
const Path = require('path');

global.BASE_PATH = __dirname;
let argv = process.argv;
if (argv.includes("--production")) {
    process.env.NODE_ENV = 'production';
}
// process.env.NODE_ENV = 'production-test';
// Tạo server hapi
const server = new Hapi.Server();

// Module hapi-kea-config: 
// Cần tồn tại 3 file trong thư mục /app/config 
// main.conf.js, development.conf.js, production.conf.js
server.register({
    register: require('hapi-kea-config'),
    options: {
        confPath: BASE_PATH + '/app/config',
        decorateServer: true
    }
});

const config = server.plugins['hapi-kea-config'];

let caches = config.get('web.caches');
caches.forEach(function(cache) {
    cache.engine = require(cache.engine);
    server.cache.provision(cache, function(err) {
        // console.log("err", err);
    });
});

var connections = config.get("web.connections")

// Thiết lập connection, chia port...
connections.forEach(function(config) {
    server.connection(config);
}, this);

// Đăng ký các plugin khác
require("./app/libs/bootstrap.js")(server);

// Chạy server
server.start((err) => {
    if (err) {
        throw err;
    }
    server.connections.forEach(function(connectionSetting) {
        console.log("Server running:", connectionSetting.info.port);
    });
});

module.exports = server;