'use strict';
const assets = require('./assets.config');

module.exports = {
    web: {
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
                        '/assets/min/app.concat.min.js',
                        ...assets.web.js.noaction,
                        '/assets/min/app.min.js',
                    ],
                    css: [
                        '/assets/min/app.concat.min.css',
                        '/assets/min/app.min.css',
                    ]
                },
                admin: {
                    js: [
                        '/assets/min/app-admin.concat.min.js',
                        ...assets.admin.js.noaction,
                        '/assets/min/app-admin.min.js',
                    ],
                    css: [
                        '/assets/min/app-admin.concat.min.css',
                        '/assets/min/app-admin.min.css',
                    ],
                }
            }
        }
    }
};