'use strict';

exports.feedManager = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-feed/views/feed-manager', {
            meta: {
                title: "Quản lý trạng thái"
            },
            activeMenu: "feedManager"
        });
    },
};