'use strict';

var mongoose = require('mongoose'),
    moment = require('moment'),
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
        type: Schema.ObjectId,
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
        type: Schema.ObjectId,
        ref: 'User'
    }
}, {
    collection: 'schedules'
});

ScheduleSchema.pre('save', function(next) {
    if (!this.name) {
        this.name = "Schedule " + moment().format("DD/MM/YYYY HH:mm:ss")
    }
    next();
});

module.exports = mongoose.model('Schedule', ScheduleSchema);