'use strict';

const Hoek = require('hoek');
const Statehood = require('statehood');
const Uuid = require('node-uuid');


// Declare internals

const internals = {};


// Defaults

internals.defaults = {
    name: 'sflash',                            // Cookie name
    maxCookieSize: 1024,                        // Maximum size allowed in a cookie
    storeBlank: true,                           // Initially _isModified
    errorOnCacheNotReady: true,
    cache: {
        expiresIn: 24 * 60 * 60 * 1000          // One day session
    },
    cookieOptions: {                            // hapi server.state() options, except 'encoding' which is always 'iron'. 'password' is required.
        path: '/',
        password: '{u$MQW#F7-@KiHwLiHwLh4tWj*L:CN!j~tr',
        isSecure: false,
        ignoreErrors: true,
        clearInvalid: true
    }
};


exports.register = (server, options, next) => {

    // Validate options and apply defaults

    const settings = Hoek.applyToDefaults(internals.defaults, options);
    Hoek.assert(!settings.cookieOptions.encoding, 'Cannot override cookie encoding');
    const rawCookieOptions = Hoek.clone(settings.cookieOptions);
    settings.cookieOptions.encoding = 'iron';
    rawCookieOptions.encoding = 'none';

    // Configure cookie

    server.state(settings.name, settings.cookieOptions);

    // Decorate the server with cflash object.

    const getState = () => {

        return {};
    };
    server.decorate('request', 'cflash', getState, {
        apply: true
    });

    // Setup session store

    const cache = server.cache(settings.cache);

    // Pre auth

    server.ext('onPreAuth', (request, reply) => {

        // If this route configuration indicates to skip, do nothing.
        if (Hoek.reach(request, 'route.settings.plugins.cflash.skip')) {
            return reply.continue();
        }

        // Load session data from cookie

        const load = () => {

            request.cflash = Object.assign(request.cflash, request.state[settings.name]);
            if (request.cflash.id) {

                request.cflash._isModified = false;
                if (!settings.errorOnCacheNotReady && !cache.isReady() && !request.cflash._store) {
                    request.log('Cache is not ready: not loading sessions from cache');
                    request.cflash._store = {};
                }
                if (request.cflash._store) {
                    return decorate();
                }

                request.cflash._store = {};
                return cache.get(request.cflash.id, (err, value, cached) => {

                    if (err) {
                        return decorate(err);
                    }

                    if (cached && cached.item) {
                        request.cflash._store = cached.item;
                    }

                    return decorate();
                });
            }

            request.cflash.id = Uuid.v4();
            request.cflash._store = {};
            request.cflash._isModified = settings.storeBlank;

            decorate();
        };

        const decorate = (err) => {

            if (request.cflash._store._lazyKeys) {
                request.cflash._isLazy = true;                 // Default to lazy mode if previously set
                request.cflash._store._lazyKeys.forEach((key) => {

                    request.cflash[key] = request.cflash._store[key];
                    delete request.cflash._store[key];
                });
            }

            request.cflash.reset = () => {

                cache.drop(request.cflash.id, () => {});
                request.cflash.id = Uuid.v4();
                request.cflash._store = {};
                request.cflash._isModified = true;
            };

            request.cflash.get = (key, clear) => {

                const value = request.cflash._store[key];
                if (clear) {
                    request.cflash.clear(key);
                }

                return value;
            };

            request.cflash.set = (key, value) => {

                Hoek.assert(key, 'Missing key');
                Hoek.assert(typeof key === 'string' || (typeof key === 'object' && value === undefined), 'Invalid cflash.set() arguments');

                request.cflash._isModified = true;

                if (typeof key === 'string') {
                    // convert key of type string into an object, for consistency.
                    const holder = {};
                    holder[key] = value;
                    key = holder;
                }

                Object.keys(key).forEach((name) => {

                    request.cflash._store[name] = key[name];
                });

                return value !== undefined ? value : key;
            };

            request.cflash.clear = (key) => {

                request.cflash._isModified = true;
                delete request.cflash._store[key];
            };

            request.cflash.touch = () => {

                request.cflash._isModified = true;
            };

            request.cflash.flash = (type, message, notOverride) => {

                let messages;
                request.cflash._isModified = true;
                request.cflash._store._flash = request.cflash._store._flash || {};

                if (!type && !message) {
                    messages = request.cflash._store._flash;
                    request.cflash._store._flash = {};
                    return messages;
                }

                if (!message) {
                    messages = request.cflash._store._flash[type];
                    delete request.cflash._store._flash[type];
                    return messages || [];
                }

                request.cflash._store._flash[type] = (notOverride ? (request.cflash._store._flash[type] || []).concat(message) : message);
                return request.cflash._store._flash[type];
            };

            request.cflash.lazy = (enabled) => {

                request.cflash._isLazy = enabled;
            };

            if (err) {
                return reply(err);
            }

            return reply.continue();
        };

        load();
    });

    // Post handler

    server.ext('onPreResponse', (request, reply) => {


        if (!request.cflash._isModified && !request.cflash._isLazy) {

            return reply.continue();
        }

        const prepare = () => {

            if (request.cflash._isLazy) {
                const lazyKeys = [];
                const keys = Object.keys(request.cflash);
                for (let i = 0; i < keys.length; ++i) {
                    const key = keys[i];
                    if (['id', '_store', '_isModified', '_isLazy', 'reset', 'get', 'set', 'clear', 'touch', 'flash', 'lazy'].indexOf(key) === -1 &&
                        key[0] !== '_' &&
                        typeof request.cflash.key !== 'function') {

                        lazyKeys.push(key);
                        request.cflash._store[key] = request.cflash[key];
                    }
                }

                if (lazyKeys.length) {
                    request.cflash._store._lazyKeys = lazyKeys;
                }
            }

            if (settings.maxCookieSize) {
                return cookie();
            }

            return storage();
        };

        const cookie = function () {

            const content = {
                id: request.cflash.id,
                _store: request.cflash._store
            };

            Statehood.prepareValue(settings.name, content, settings.cookieOptions, (err, value) => {

                if (err) {
                    return reply(err);
                }

                if (value.length > settings.maxCookieSize) {
                    return storage();
                }

                reply.state(settings.name, value, rawCookieOptions);
                return reply.continue();
            });
        };

        const storage = () => {

            if (!settings.errorOnCacheNotReady && !cache.isReady()) {
                request.log('Cache is not ready: not storing sessions to cache');
                return reply.continue();
            }

            reply.state(settings.name, { id: request.cflash.id });
            cache.set(request.cflash.id, request.cflash._store, 0, (err) => {

                if (err) {
                    return reply(err);
                }

                return reply.continue();
            });
        };

        prepare();
    });

    return next();
};


exports.register.attributes = {
     name: 'custom-flash'
};
