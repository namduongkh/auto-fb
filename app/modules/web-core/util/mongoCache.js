'use strict';
const mongoose = require('mongoose');
const _ = require('lodash');

const getData = function(data, next) {
    // console.log(`Get data once time ${generateKey(data.model, data.options)}`);
    if (data.model) {
        var Model = mongoose.model(data.model);
        if (data.options) {
            let promise = Model.findOne(data.options)
                .lean();
            if (data.select) {
                promise = promise.select(data.select);
            }
            promise
                .then(function(result) {
                    return next(null, result);
                })
                .catch(function(err) {
                    return next(err, null);
                });
        } else {
            return next(null, null);
        }
    } else {
        return next(null, null);
    }
};

module.exports = function(server, options) {
    var cache = server.cache({
        cache: 'mongoCache',
        expiresIn: 30 * 86400000,
        segment: 'cache',
        generateFunc: function(data, next) {
            getData(data, next);
        },
        generateTimeout: 100
    });
    return {
        get: function(model, options, selectOpts) {
            return new Promise(function(resolve, reject) {
                if (!model) {
                    reject('mongoCache cần tham số thứ nhất là tên model');
                }
                if (!options) {
                    reject('mongoCache cần tham số thứ hai là find options');
                }
                var id = generateKey(model, options)
                var getOpt = {
                    id: id,
                    model: model,
                    options: options,
                    select: selectOpts
                };
                cache.get(getOpt, function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            });
        },
        directDelete(id) {
            cache.drop(id, function(err) {});
        },
        indirectDelete(model, options) {
            cache.drop(generateKey(model, options), function(err) {});
        },
        cache: cache
    };
};

const generateKey = function(model, options) {
    return `${model}:${_.values(options).toString()}`;
}