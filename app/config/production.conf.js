'use strict';

module.exports = {
    web: {
        context: {
            minCycle: 15,
            userSchedule: {
                stopMinutes: 3,
                debug: false
            },
            settings: {
                services: {
                    apiUrl: 'https://auto-publish.herokuapp.com',
                    webUrl: 'https://auto-publish.herokuapp.com',
                    adminUrl: 'https://auto-publish.herokuapp.com/admin',
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