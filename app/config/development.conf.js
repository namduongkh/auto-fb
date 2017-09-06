'use strict';
const assets = require('../views/assets.conf');

module.exports = {
    web: {
        db: {
            uri: 'mongodb://localhost/db_auto_fb',
            options: {
                user: '',
                pass: ''
            }
        },
        caches: [{
            name: 'mongoCache',
            engine: 'catbox-mongodb',
            host: '127.0.0.1',
            partition: 'db_auto_fb'
        }],
        context: {
            minCycle: 1,
            userSchedule: {
                stopMinutes: 0.25,
                debug: true
            },
            settings: {
                services: {
                    apiUrl: 'http://localhost:3000',
                    webUrl: 'http://localhost:3000',
                    adminUrl: 'http://localhost:3000/admin',
                },
            },
            assets: {
                web: {
                    js: [
                        ...assets.web.js.concat,
                        ...assets.web.js.noaction,
                        ...assets.web.js.build,
                        // '/assets/min/app.min.js',
                    ],
                    css: [
                        '/libs/bootstrap/dist/css/bootstrap.min.css',
                        '/libs/font-awesome/css/font-awesome.min.css',
                        ...assets.web.css,
                        // '/assets/min/app.min.css',
                    ]
                },
                admin: {
                    js: [
                        ...assets.admin.js.concat,
                        ...assets.admin.js.noaction,
                        ...assets.admin.js.build,
                        // '/assets/min/app.min.js',
                    ],
                    css: [
                        '/libs/AdminLTE/bootstrap/css/bootstrap.min.css',
                        '/libs/Ionicons/css/ionicons.min.css',
                        '/libs/font-awesome/css/font-awesome.min.css',
                        ...assets.admin.css,
                        // '/assets/min/app.min.css',
                    ]
                }
            }
        }
    }
};