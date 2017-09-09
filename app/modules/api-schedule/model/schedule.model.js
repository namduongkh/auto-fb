'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ScheduleSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    scheduleType: {
        type: String,
        enum: ['count', 'time']
    },
    campaignId: {
        type: Object,
        ref: 'Campaign'
    },
    running: {
        type: Boolean,
        default: false
    },
    cycleMinutes: {
        type: Number,
        default: 30
    },
    lastRun: {
        type: Date,
        default: Date.now
    },
    runCounts: {
        type: Number,
        default: 0
    },
    runTimes: {
        type: Number,
        default: 0
    },
    endTime: {
        type: Date,
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
    collection: 'schedules'
});

ScheduleSchema.pre('save', function(next) {
    const Campaign = mongoose.model('Campaign');
    let that = this;
    if (!that.name) {
        Campaign.findOne({
                _id: that.campaignId
            })
            .lean()
            .then(function(campaign) {
                that.name = "Lịch trình chiến dịch " + campaign.title;
                next();
            });
    } else {
        next();
    }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);