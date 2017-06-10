'use strict';

module.exports = {
    web: {
        app: {
            title: "Tự Động Xuất Bản"
        },
        upload: {
            path: BASE_PATH + '/public/files',
        },
        db: {
            uri: 'mongodb://localhost/db_auto_fb',
            options: {
                user: '',
                pass: ''
            }
        },
        paging: {
            defaultPageSize: 25,
            numberVisiblePages: 10,
            itemsPerPage: 20
        },
        cookieOptions: {
            ttl: 365 * 24 * 60 * 60 * 1000, // expires a year from today
            encoding: 'none', // we already used JWT to encode
            path: '/',
            isSecure: false, // warm & fuzzy feelings
            isHttpOnly: true, // prevent client alteration
            clearInvalid: true, // remove invalid cookies
            strictHeader: true // don't allow violations of RFC 6265
        },
        jwt: {
            secret: 'L7FWdNnQU7cfmQ87WuucQFK3YZvNBuvc'
        },
        connections: [{
                port: process.env.WEB_PORT || 3000,
                labels: 'web',
                routes: {
                    cors: {
                        origin: ['*'],
                        credentials: true
                    }
                },
                router: {
                    stripTrailingSlash: false
                }
            },
            {
                port: process.env.API_PORT || 3100,
                labels: 'api',
                routes: {
                    cors: {
                        origin: ['*'],
                        credentials: true
                    }
                }
            },
            {
                port: process.env.CMS_PORT || 3200,
                labels: 'admin',
                routes: {
                    cors: {
                        origin: ['*'],
                        credentials: true
                    }
                }
            }
        ],
        error: {
            web: {
                login: "/dang-nhap"
            },
            admin: {
                login: "/admin/dang-nhap"
            },
        }
    }
};