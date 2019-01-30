var mongoose = require("mongoose");
var Ping = require("../models/Ping");
var User = require("../models/User");
var RedPack = require("../models/Redpack");
var UserPing = require("../models/UserPing");
var Weixin = require("../models/Weixin");
var WXBizDataCrypt = require("../models/WXBizDataCrypt");
var fs = require('fs');
var path = require('path');

var config = require("../config/Config");
const _appid = config.wx.appid;

var request = require('request');
var gm = require("gm").subClass({ imageMagick: true });

var userController = {};

// wx
userController.userpings = function(req, res) {
    // console.log(req.body);
    var user_id = req.body.user_id;
    UserPing.find({
        user_id: user_id,
        pay_state: 1
    }).populate('ping_id').then(ups=>{
        console.log(ups)
        res.send(ups)
    })
};

userController.userping = function(req, res) {
    // console.log(req.body);
    var user_ping_id = req.body.user_ping_id;
    UserPing.findById(user_ping_id).populate('ping_id').then(up=>{
        console.log(up)
        res.send(up)
    })
};

//followers
userController.userfollowers = function (req, res) {
    // console.log(req.body);
    var fields;
    var user_id = req.body.user_id;
    var next = req.body.next;

    var followers = [];

    if(next == 0)
        fields = ['name','avatar','followers'];
    else
        fields = ['user_id', 'name', 'avatar', 'followers'];
    if(user_id){
        User.findById(user_id, function (err, user){
            if(user && user.followers && user.followers.length>0)
            {
                var project;
                if(next == 0){
                    project ={
                        _id:0,
                        name:1,
                        avatar:1,
                        follower_num:{$size:"$followers"}
                    }
                }
                else{
                    project ={
                        _id:0,
                        user_id:"$_id",
                        name:1,
                        avatar:1,
                        follower_num:{$size:"$followers"}
                    }
                }
                var arr =new Array();
                user.followers.forEach(function(item,index){
                    arr.push(mongoose.Types.ObjectId(item));
                })
                console.log(arr);
                User.aggregate(
                    [
                        {
                            $match:{_id:{$in:arr}}
                        },
                        {
                            $project:project
                        }
                    ]
                ).then(function(followers){
                    user.user_id = user._id;
                    user.follower_num = user.followers.length;
                    delete user.followers;
                    delete user._id;
                    RedPack.aggregate(
                        [{
                            $match: {
                                to: user_id,
                                redpack_sent: 1
                            }
                        },
                            {
                            $group:{
                                _id:user_id,
                                total:{$sum:"$amount"}
                            }
                        }
                        ]
                    ).then(function (rp){
                        console.log("rp----");
                        console.log(rp);
                        if(rp && rp[0]){
                            user.redpack_total = rp[0].total;
                        }
                        else
                        {
                            user.redpack_total = 0;
                        }

			followers.forEach(function(item){
                            item.name = item.name.substring(0,6);
                        })

                        console.log(user);
                        console.log(followers);
                        res.send({user:user,followers:followers})
                    });
                })
            }
            else{
                console.log('user');
                console.log(user);
                user.follower_num = 0;
                delete user.followers;
                res.send({user:user,followers:followers});
            }
        })

    }

}


userController.userpacks = function (req, res) {
    var user_id = req.body.user_id;
    console.log('userid---');
    console.log(user_id);
    var user=[];
    var redpacks=[];
    if (user_id) {
	    User.findById(user_id, function (err, user){
		    RedPack.find({to_user_id: user_id}).populate("to_user_id", "name")
		    .then(function (redpacks) {
			    console.log(redpacks);
			    res.send({user:user,redpacks: redpacks});
		    });
	    });
    }
    else
    {
	    res.send({user:user,redpacks: redpacks});
    }
}

userController.wxacode = function (req, res) {
    console.log(req.body);
    var user_id = req.body.user_id;
    var type = req.body.type;
    var product_id = req.body.product_id;
    var base_path = path.join(__dirname, '../public/img_tmp');
    var file_path = base_path + '/final_' + user_id + '.png';
    var final_link = '/img_tmp' + '/final_' + user_id + '_' + type + '.jpg';

    console.log(file_path);

    // if(fs.existsSync(file_path)) {
    //     res.send({image: final_link});
    // }
    // else {
        Weixin.getWXACode(user_id + "_"+ product_id, function () {
            console.log("here")
            
            var code_path = base_path + '/code_' + user_id +'.png';
            var avatar_path = base_path + '/avatar_' + user_id + '.jpg';
            var avatar_round_path = base_path + '/avatar_round_' + user_id + '.png';
            var share_bg_path = base_path + '/share_bg_'+type+'.jpg';
            var final_path = base_path + '/final_' + user_id + '_' + type + '.jpg';

            User.findById(user_id).then(user => {
                console.log(user.avatar);
                gm(code_path).resize(324, 324).write(code_path, function (err) {
                    gm(request(user.avatar)).resize(292, 292).write(avatar_path, function (err) {
                        console.log(avatar_path);
                        if (!err) {
                            gm(292, 292, "none").fill(avatar_path).drawCircle(140, 140, 140, 0).write(avatar_round_path, function (err) {
                                if (!err) {
                                    gm().in('-page', '+0+0').in(share_bg_path).in('-page', '+544+154').in(avatar_round_path).in('-page', '+528+1967').in(code_path).mosaic().write(final_path, function (err) {
                                        if (!err) {
                                            res.send({image: final_link});
                                        }
                                    })
                                }else {
                                    console.log(err);
                                }
                            })
                        }
                        else {
                            console.log(err);
                        }
                    })
                })
            })
        })
    // }
}


userController.getInfo = function (req, res) {
    // console.log(req.body);
    var user_id = req.body.user_id;

    User.findById(user_id, ["name","phone"]).then(user=>{
        res.send(user)
    })
}

userController.updateInfo = function (req, res) {
    // console.log(req.body);
    var user_id = req.body.user_id;
    var name = req.body.name;
    var phone = req.body.phone;
    if(name.length>0 && phone.length>0) {
        User.findByIdAndUpdate(user_id,
            {
                name: name,
                phone: phone
            },
            {new: true},
            function (err, user) {
                // console.log('user');
                // console.log(user);
                res.send({ok:1})
            }
        )
    }
}


userController.getphone = function (req,res) {
    var appId = _appid;
    var sessionKey = req.body.session_key;
    var encryptedData =req.body.encryptedData;
    var iv = req.body.iv;

    var pc = new WXBizDataCrypt(appId, sessionKey)

    var data = pc.decryptData(encryptedData , iv)
    // console.log(data)
    res.send(data);
}

// admin

module.exports = userController;
