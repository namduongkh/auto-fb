'use strict';

let host = "root:phongnguyen.94@ds159033.mlab.com:59033";
let dbName = "db_auto_fb";

module.exports = {
    web: {
        db: {
            uri: `mongodb://${host}/${dbName}`,
            options: {
                useMongoClient: true
            }
        },
        caches: [{
            name: 'mongoCache',
            engine: 'catbox-mongodb',
            host: host,
            partition: dbName
        }],
        connections: [{
                port: process.env.PORT,
                labels: ['web', 'api', 'admin'],
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
            // {
            //     port: process.env.API_PORT || 3100,
            //     labels: 'api',
            //     routes: {
            //         cors: {
            //             origin: ['*'],
            //             credentials: true
            //         }
            //     }
            // },
            // {
            //     port: process.env.CMS_PORT || 3200,
            //     labels: 'admin',
            //     routes: {
            //         cors: {
            //             origin: ['*'],
            //             credentials: true
            //         }
            //     }
            // }
        ],
        upload: {
            path: BASE_PATH + '/public/files',
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
        error: {
            web: {
                login: "/dang-nhap"
            },
            admin: {
                login: "/admin/dang-nhap"
            },
        },
        context: {
            app: {
                title: "Dịch vụ Tự Động Xuất Bản bài đăng Facebook",
                description: "Dịch vụ tự động xuất bản bài đăng (trạng thái, album ảnh...) vào dòng thời gian Facebook nhóm, trang, cá nhân... Chức năng tự động xuất bản theo lịch trình. Giải pháp tối ưu hóa công việc, tiết kiệm thời gian."
            },
        }
    }
};