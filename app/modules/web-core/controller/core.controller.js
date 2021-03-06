const _ = require('lodash');
const mongoose = require('mongoose');
// const Category = mongoose.model('Category');
const User = mongoose.model('User');
// const Setting = mongoose.model('Setting');
const async = require('async');
// const base64 = require('base-64');
// const utf8 = require('utf8');

exports.getCredentials = function(request, reply) {
    // Get the response object
    let response = request.response;
    // console.log(response);
    // Check to see if the response is a view
    if (response.variety === 'view') {
        let config = request.server.configManager;
        if (_.isEmpty(response.source.context)) {
            response.source.context = {};
        }
        if (_.isEmpty(response.source.context.credentials)) {
            response.source.context.credentials = {};
        }
        let credentials = request.auth.credentials;
        // check roles to post collection
        if (credentials) {
            response.source.context.credentials = credentials;
        }
    }

    reply.continue();

};

// exports.getSticker = function(request, reply) {
//     // Get the response object
//     let response = request.response;
//     // console.log(response);
//     // Check to see if the response is a view
//     if (response.variety === 'view') {
//         Sticker
//             .find()
//             .select("key file_name category")
//             .populate("category", "name")
//             .lean()
//             .then(function(result) {
//                 var key = [];
//                 var file_name = [];
//                 var category = [];
//                 var category_key = [];
//                 for (var i in result) {
//                     if (category.indexOf(result[i].category.name) == -1) {
//                         category.push(result[i].category.name);
//                     }
//                     key.push(result[i].key);
//                     file_name.push(result[i].file_name);
//                     category_key.push(result[i].category.name);
//                 }
//                 response.source.context.sticker = {
//                     key: key,
//                     category: category,
//                     category_key: category_key,
//                     file_name: file_name
//                 };
//                 reply.continue();
//             })
//     }

// };

// exports.getSocialInfo = function(request, reply) {
//     let response = request.response;
//     if (response.variety === 'view') {
//         let config = request.server.configManager;
//         let facebook = config.get('web.facebook');
//         let google = config.get('web.google');
//         response.source.context.social_info = {
//             facebook: {
//                 appId: facebook.appId,
//                 redirectUri: facebook.redirectUri
//             },
//             google: {
//                 apiKey: google.apiKey,
//                 clientId: google.clientId
//             },
//         }
//     }
//     reply.continue();
// };

// exports.getHostInfo = function(request, reply) {
//     let response = request.response;
//     if (response.variety === 'view') {
//         const hostInfo = request.info;
//         response.source.context.hostInfo = hostInfo;
//         var { allowCollection } = request.server.plugins['web-core'];
//         response.source.context.allowCollection = allowCollection(request.info.hostname);
//     }
//     reply.continue();
// };

// exports.getGACode = function(request, reply) {
//     let response = request.response;
//     if (response.variety === 'view') {
//         const hostname = request.info.hostname;
//         let config = request.server.configManager;
//         switch (hostname) {
//             case 'fig.bidy.vn':
//                 let gaCode = config.get('web.context.gaCodeFG');
//                 response.source.context.gaCode = gaCode;
//                 break;
//             default:
//                 break;
//         }
//     }
//     reply.continue();
// };


// exports.getPostCategories = function(request, reply) {
//     let promise = Category.find({
//         status: 1,
//         type: 'post'
//     });
//     promise.then(function(postCategories) {
//         let response = request.response;
//         // Check to see if the response is a view
//         if (response.variety === 'view') {
//             response.source.context.postCategories = postCategories;
//         }
//         reply.continue();
//     });
// };


// exports.getProductCategories = function(request, reply) {
//     let promise = Category.find({
//         status: 1,
//         type: 'product'
//     });
//     promise.then(function(productCategories) {
//         let response = request.response;
//         // Check to see if the response is a view
//         if (response.variety === 'view') {
//             response.source.context.productCategories = productCategories;
//         }
//         reply.continue();
//     });
// };

exports.getMeta = function(request, reply) {
    let response = request.response;
    if (response.variety === 'view') {
        let config = request.server.configManager;
        let app = config.get('web.context.app');
        if (response.source.context.meta) {
            if (response.source.context.meta.title) {
                response.source.context.meta.title = response.source.context.meta.title + ' - ' + app.title;
            }
            if (!response.source.context.meta.description) {
                response.source.context.meta.description = app.description;
            }
        } else {
            response.source.context.meta = app;
        }
    }
    reply.continue();
}


// exports.getMetaImage = function(request, reply) {
//     var {
//         getSetting
//     } = request.server.plugins['api-setting'];
//     let config = request.server.configManager;
//     let response = request.response;
//     if (response.variety === 'view') {
//         if (!response.source.context.meta.image) {

//             response.source.context.meta.image = config.get('web.context.settings.services.webUrl') + config.get('web.context.settings.shares.image');

//             async.parallel({
//                 share_image: function(callback) {
//                     getSetting('share_image').then(function(value) {
//                         callback(null, value);
//                     }).catch(function(err) {
//                         callback(err, null);
//                     });
//                 },
//                 share_image_fig: function(callback) {
//                     getSetting('share_image_fig').then(function(value) {
//                         callback(null, value);
//                     }).catch(function(err) {
//                         callback(err, null);
//                     });
//                 },
//             }, function(err, results) {
//                 var hostname = request.info.hostname;
//                 if (hostname == 'fig.bidy.vn') {
//                     if (results.share_image_fig) {
//                         response.source.context.meta.image = config.get('web.context.settings.services.webUrl') + '/files/settings/' + results.share_image_fig;
//                         // console.log(response.source.context.meta);
//                     }
//                 } else {
//                     if (results.share_image) {
//                         response.source.context.meta.image = config.get('web.context.settings.services.webUrl') + '/files/settings/' + results.share_image;
//                         // console.log(response.source.context.meta);
//                     }
//                 }

//                 return reply.continue();
//             });
//         } else {
//             return reply.continue();
//         }
//     } else {
//         return reply.continue();
//     }
// };


// var getStickerApi = [
//     '/suu-tap',
//     '/san-pham',
//     '/thong-tin-tai-khoan',
//     '/bo-suu-tap/'
// ];
// exports.getSticker = function(request, reply) {
//     var {
//         mongoCache
//     } = request.server.plugins['web-core'];
//     let config = request.server.configManager;
//     let response = request.response;
//     if (response.variety === 'view') {
//         var { href } = request.url;
//         var allowGetSticker = false;
//         for (var i in getStickerApi) {
//             if (href.search(getStickerApi[i]) > -1) {
//                 allowGetSticker = true;
//                 break;
//             }
//         }
//         if (!response.source.context.sticker && allowGetSticker) {
//             // console.log("Href", href);
//             mongoCache.getSticker().then(function(result) {
//                     response.source.context.sticker = result;
//                     return reply.continue();
//                 })
//                 .catch(function(err) {
//                     return reply.continue();
//                 });
//         } else {
//             return reply.continue();
//         }
//     } else {
//         return reply.continue();
//     }
// };


exports.handleError = (request, reply) => {

    const response = request.response;
    if (!response.isBoom) {
        return reply.continue();
    }
    let config = request.server.configManager;
    let loginUrl = config.get('web.error.web.login');
    // let notFoundUrl = config.get('web.error.notFound.url');

    const error = response;

    const statusCode = error.output.statusCode;

    if (statusCode === 404) {
        request.log(['error', 'notfound'], 'Resources is not be found');
        return reply("Không tìm thấy nội dung.");
        // return reply.redirect(notFoundUrl);
    } else if (statusCode === 403) {
        request.log(['error', 'permission'], 'You have not permission to access this page');
        return reply.redirect(loginUrl);
    } else if (statusCode === 401) {
        request.log(['error', 'permission'], 'Missing authentication');
        // console.log("web");
        return reply.redirect(loginUrl);
    } else if (statusCode === 400) {
        return reply.continue();
        // request.log(['error', 'badrequest'], 'Bad request');
        // return reply.redirect(notFoundUrl);
    } else {
        return reply.continue();
    }
};

exports.notFound = {
    handler: function(request, reply) {
        return reply("Không tìm thấy nội dung.");
    }
};

exports.getAppId = function(request, reply) {
    let response = request.response;
    if (response.variety === 'view') {
        let { appId } = request.state;
        if (appId) {
            let response = request.response;
            if (response.variety === 'view') {
                response.source.context.appId = appId;
            }
        }
    }
    return reply.continue();
};