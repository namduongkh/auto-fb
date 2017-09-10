'use strict';

var mongoose = require('mongoose'),
    moment = require('moment'),
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
        type: Schema.ObjectId,
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
        type: Schema.ObjectId,
        ref: 'Feed'
    },
    albumId: {
        type: Schema.ObjectId,
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

CampaignSchema.pre('save', function(next) {
    if (!this.title) {
        this.title = "Campaign " + moment().format("DD/MM/YYYY HH:mm:ss")
    }
    next();
});

CampaignSchema.post('remove', function(doc) {
    const Schedule = mongoose.model('Schedule');
    Schedule.find({
            campaignId: doc._id
        })
        .then(function(schedules) {
            schedules.forEach(function(item) {
                item.remove();
            });
        });
});

module.exports = mongoose.model('Campaign', CampaignSchema);