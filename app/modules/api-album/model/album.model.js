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
        type: Schema.ObjectId,
        ref: 'User'
    }
}, {
    collection: 'albums'
});

albumSchema.pre('save', function(next) {
    if (!this.name) {
        this.name = "Album " + moment().format("DD/MM/YYYY HH:mm:ss")
    }
    next();
});

albumSchema.post('remove', function(doc) {
    const Campaign = mongoose.model('Campaign');
    Campaign.find({
            albumId: doc._id
        })
        .then(function(campaigns) {
            // console.log("campaigns", campaigns);
            campaigns.forEach(function(item) {
                // console.log("item", item);
                item.remove();
            });
        });
});

module.exports = mongoose.model('Album', albumSchema);