'use strict';

exports.index = {
    handler: function(request, reply) {
        // console.log("Auth", request.auth);
        return reply.view('web-home/views/index', {
            meta: {
                title: "Trang chủ"
            },
            activeMenu: 'index'
        });
    }
};