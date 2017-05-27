'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ScheduleSchema = new Schema({
    title: {
        type: String
    },
    message: {
        type: String
    },
    url: {
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
    collection: 'schedules'
});

module.exports = mongoose.model('Schedule', ScheduleSchema);