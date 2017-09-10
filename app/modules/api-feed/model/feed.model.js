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
        type: Schema.ObjectId,
        ref: 'User'
    }
}, {
    collection: 'feeds'
});

FeedSchema.pre('save', function(next) {
    if (!this.title) {
        this.title = "Status " + moment().format("DD/MM/YYYY HH:mm:ss")
    }
    next();
});

FeedSchema.post('remove', function(doc) {
    const Campaign = mongoose.model('Campaign');
    Campaign.find({
            feedId: doc._id
        })
        .then(function(campaigns) {
            campaigns.forEach(function(item) {
                item.remove();
            });
        });
});

module.exports = mongoose.model('Feed', FeedSchema);