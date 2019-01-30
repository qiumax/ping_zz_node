var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActivitySchema = new Schema({
    starttime: Number,
    endtime: Number,
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});
module.exports = mongoose.model('Activity', ActivitySchema, 'activity');