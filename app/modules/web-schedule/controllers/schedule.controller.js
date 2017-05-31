'use strict';

exports.scheduleManager = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-schedule/views/schedule-manager', {
            meta: {
                title: "Quản lý lịch trình"
            },
            activeMenu: "scheduleManager"
        });
    },
};