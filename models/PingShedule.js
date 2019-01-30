var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PingScheduleSchema = new Schema({
    ping: {
        type: Schema.ObjectId,
        ref: 'Ping'
    },
    run_time: Number
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

module.exports = mongoose.model('PingSchedule', PingScheduleSchema, 'ping_schedules');