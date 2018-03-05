'use strict';
const assets = require('./assets.config');

module.exports = {
    web: {
        db: {
            uri: 'mongodb://localhost/db_auto_fb',
            options: {
                useMongoClient: true
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
                // debug: true,
                debug: false,
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
                        ...assets.web.css.concat,
                        ...assets.web.css.build,
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
                        ...assets.admin.css.concat,
                        ...assets.admin.css.build,
                        // '/assets/min/app.min.css',
                    ]
                }
            }
        }
    }
};