'use strict';
const assets = require('../views/assets.conf');

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
                    apiUrl: 'http://localhost:3100',
                    webUrl: 'http://localhost:3000',
                    adminUrl: 'http://localhost:3200',
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
                        '/libs/bootstrap/dist/css/bootstrap.min.css',
                        '/libs/font-awesome/css/font-awesome.min.css',
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
                        '/libs/AdminLTE/bootstrap/css/bootstrap.min.css',
                        '/libs/Ionicons/css/ionicons.min.css',
                        '/libs/font-awesome/css/font-awesome.min.css',
                        '/assets/min/app-admin.min.css',
                    ],
                }
            }
        }
    }
};