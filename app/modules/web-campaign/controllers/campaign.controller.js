'use strict';

exports.campaignManager = {
    auth: 'jwt',
    handler: function(request, reply) {
        return reply.view('web-campaign/views/campaign-manager', {
            meta: {
                title: "Quản lý chiến dịch"
            },
            activeMenu: "campaignManager"
        });
    },
};