'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var albumSchema = new Schema({
    name: {
        type: String
    },
    message: {
        type: String
    },
    photos: [{
        type: String
    }],
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
    collection: 'albums'
});

module.exports = mongoose.model('Album', albumSchema);