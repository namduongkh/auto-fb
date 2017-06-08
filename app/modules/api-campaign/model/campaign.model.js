'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CampaignSchema = new Schema({
    title: {
        type: String
    },
    modified: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: Object,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    postType: {
        type: String,
        enum: ['feed', 'album']
    },
    timeline: {
        type: String,
        enum: ['group', 'page', 'personal']
    },
    feedId: {
        type: Object,
        ref: 'Feed'
    },
    albumId: {
        type: Object,
        ref: 'Album'
    },
    timelineId: {
        type: String,
    },
}, {
    collection: 'campaigns'
});

module.exports = mongoose.model('Campaign', CampaignSchema);