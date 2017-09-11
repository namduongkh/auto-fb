'use strict';

var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var LogSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    campaignId: {
        type: Schema.ObjectId,
        ref: 'Campaign'
    },
    created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean
    },
    result: {
        type: Object
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'logs'
});

LogSchema.pre('save', function(next) {
    if (!this.title) {
        this.title = "Campaign " + moment().format("DD/MM/YYYY HH:mm:ss")
    }
    next();
});

LogSchema.post('remove', function(doc) {
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

module.exports = mongoose.model('Log', LogSchema);