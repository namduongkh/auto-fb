'use strict';

exports.postGroup = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-graph/views/post-group', {
            meta: {
                title: "Đăng lên dòng thời gian của nhóm"
            },
            activeMenu: "postGroup"
        });
    },
};