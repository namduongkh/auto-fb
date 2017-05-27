'use strict';

exports.albumManager = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-album/views/album-manager', {
            meta: {
                title: "Quản lý album"
            },
            activeMenu: "albumManager"
        });
    },
};