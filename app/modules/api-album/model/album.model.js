'use strict';

var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var albumSchema = new Schema({
    name: {
        type: String,
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

albumSchema.pre('save', function(next) {
    if (!this.name) {
        this.name = "Album " + moment().format("HH:mm:ss DD/MM/YYYY")
    }
    next();
});

albumSchema.pre('remove', function(next) {
    const Campaign = mongoose.model('Campaign');
    Campaign.find({
            albumId: this._id
        })
        .then(function(campaigns) {
            campaigns.forEach(function(item) {
                item.remove();
            });
        });
    next();
});

module.exports = mongoose.model('Album', albumSchema);