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

CampaignSchema.pre('save', function(next) {
    const Feed = mongoose.model('Feed');
    const Album = mongoose.model('Album');
    let that = this;
    if (!that.title) {
        if (that.feedId) {
            Feed.findOne({
                    _id: that.feedId
                })
                .lean()
                .then(function(feed) {
                    that.title = "Xuất bản trạng thái " + feed.title;
                    next();
                });
        } else {
            Album.findOne({
                    _id: that.albumId
                })
                .lean()
                .then(function(album) {
                    that.title = "Xuất bản album " + album.name;
                    next();
                });
        }
    } else {
        next();
    }
});

CampaignSchema.pre('remove', function(next) {
    const Schedule = mongoose.model('Schedule');
    Schedule.find({
            campaignId: this._id
        })
        .then(function(schedules) {
            schedules.forEach(function(item) {
                item.remove();
            });
        });
    next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);