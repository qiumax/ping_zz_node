var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CurrentPingSchema = new Schema({
	product_id: String,
    ping: {
        type: mongoose.Schema.ObjectId,
        ref: 'Ping'
    }
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

module.exports = mongoose.model('CurrentPing', CurrentPingSchema, 'current_ping');