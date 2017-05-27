'use strict';

exports.login = {
    handler: function(request, reply) {
        if (request.auth.isAuthenticated) {
            return reply.redirect('/');
        }
        return reply.view('web-user/views/login', {
            meta: {
                title: "Đăng nhập"
            }
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
                title: "Đăng ký"
            }
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

exports.groupManager = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-user/views/group-manager', {
            meta: {
                title: "Danh sách nhóm"
            },
            activeMenu: "groupManager"
        });
    },
};