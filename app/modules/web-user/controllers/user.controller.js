'use strict';

exports.login = {
    handler: function(request, reply) {
        if (request.auth.isAuthenticated) {
            return reply.redirect('/');
        }
        return reply.view('web-user/views/login', {
            meta: {
                title: "Đăng nhập",
            },
            activeMenu: "login"
        });
    },
};

exports.register = {
    handler: function(request, reply) {
        if (request.auth.isAuthenticated) {
            return reply.redirect('/');
        }
        return reply.view('web-user/views/register', {
            meta: {
                title: "Đăng ký",
            },
            activeMenu: "register"
        });
    },
};

exports.profile = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-user/views/info', {
            meta: {
                title: "Trang cá nhân"
            },
        });
    },
};

exports.timelineManager = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-user/views/timeline-manager', {
            meta: {
                title: "Danh sách dòng thời gian"
            },
            activeMenu: "timelineManager"
        });
    },
};

exports.campaignLog = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-user/views/campaign-log', {
            meta: {
                title: "Lịch sử xuất bản"
            },
            // activeMenu: "timelineManager"
        });
    },
};