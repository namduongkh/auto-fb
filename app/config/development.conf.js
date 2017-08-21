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
        context: {
            minCycle: 1,
            userSchedule: {
                stopMinutes: 0.25,
                debug: true
            },
            settings: {
                services: {
                    apiUrl: 'http://localhost:3100',
                    webUrl: 'http://localhost:3000',
                    adminUrl: 'http://localhost:3200',
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
                        ...assets.admin.css,
                        // '/assets/min/app.min.css',
                    ]
                }
            }
        }
    }
};