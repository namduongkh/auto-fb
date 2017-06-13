'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CampaignSchema = new Schema({
    title: {
        type: String
    },
    description: {
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
    feedId: {
        type: Object,
        ref: 'Feed'
    },
    albumId: {
        type: Object,
        ref: 'Album'
    },
    timelineId: [{
        type: {
            type: String,
            enum: ['personal', 'group', 'page']
        },
        id: { type: String },
        name: { type: String }
    }],
    lastTimelineRun: {
        type: Number
    }
}, {
    collection: 'campaigns'
});

module.exports = mongoose.model('Campaign', CampaignSchema);