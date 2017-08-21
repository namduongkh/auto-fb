const mongoose = require('mongoose');
const Page = mongoose.model('Page');

exports.getIndentity = {
    handler: function(request, reply) {
        let config = request.server.configManager;
        let notFoundUrl = config.get('web.error.notfound.url');
        let indentity = request.params.indentity;
        // var {
        //     mongoCache
        // } = request.server.plugins['web-core'];
        // mongoCache.get('Page', {
        //         'identity': indentity
        //     })
        Page.findOne({
                'identity': indentity
            })
            .lean()
            .then(function(page) {
                if (!page) {
                    return reply.redirect(notFoundUrl);
                }
                let meta = {
                    title: page.title,
                    description: page.intro
                };
                return reply.view('web-page/views/default', {
                    page: page,
                    meta: meta,
                    activeMenu: "help"
                });
            }).catch(function(err) {
                request.log(['error'], err);
                return reply.continue();
            });
    }
};

exports.help = {
    handler: function(request, reply) {
        Page.find()
            .lean()
            .then(function(pages) {
                return reply.view('web-page/views/help', {
                    pages: pages,
                    meta: {
                        title: "Trợ giúp"
                    },
                    activeMenu: "help"
                });
            });
    }
};