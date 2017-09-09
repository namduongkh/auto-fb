'use strict';

var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var FeedSchema = new Schema({
    title: {
        type: String,
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

FeedSchema.pre('save', function(next) {
    if (!this.title) {
        this.title = "Trạng thái " + moment().format("HH:mm:ss DD/MM/YYYY")
    }
    next();
});

FeedSchema.pre('remove', function(next) {
    const Campaign = mongoose.model('Campaign');
    Campaign.find({
            feedId: this._id
        })
        .then(function(campaigns) {
            campaigns.forEach(function(item) {
                item.remove();
            });
        });
    next();
});

module.exports = mongoose.model('Feed', FeedSchema);