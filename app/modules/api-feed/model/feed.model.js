'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeedSchema = new Schema({
    title: {
        type: String
    },
    message: {
        type: String
    },
    link: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: Object,
        ref: 'User'
    }
}, {
    collection: 'feeds'
});

module.exports = mongoose.model('Feed', FeedSchema);