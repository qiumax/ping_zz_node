var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: String,
    openid: String,
    refer1_id: String,
    refer2_id: String,
    name: String,
    avatar: String,
    phone: String,
    gender: String,
    city: String,
    province: String,
    country: String,
    password: String,
    followers: [String],
    join_num: Number,
	extra_reward1:Number,
	extra_reward2:Number
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

UserSchema.plugin(passportLocalMongoose);

UserSchema.statics.getReferids = function (refer1_id, cb) {
    if(refer1_id) {
        this.findById(refer1_id).then(refer1 => {
            if(refer1.refer1_id) {
                refer2_id = refer1.refer1_id;
                cb(refer1_id, refer2_id);
            }
            else {
                cb(refer1_id, "0");
            }
        })
    }
    else {
        cb("0", "0");
    }
}

module.exports = mongoose.model('User', UserSchema, 'users');