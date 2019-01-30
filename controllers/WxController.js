var mongoose = require("mongoose");
var passport = require("passport");
var request = require('request');
var moment = require('moment');

var Weixin = require("../models/Weixin");
var User = require("../models/User");
var Ping = require("../models/Ping");
var UserPing = require("../models/UserPing");
var Redpack = require("../models/Redpack");

var wxController = {};

wxController.getWxUserInfo = function(req, res) {

    console.log(req.body);

    var code = req.body.code;

    //TODO: 绑定分销信息

    Weixin.getWxUserInfo(code, function (err, resp, data) {
        console.log("data: " + JSON.stringify(data));

        var openid = data.openid;
        var body = req.body;
        var refer_id = req.body.refer_id;
        var session_key = data.session_key;
        req.body.username = openid;
        req.body.password = "pwd";

        if(data.openid) {
            User.getReferids(refer_id, function (refer1_id, refer2_id) {

                User.findOne({'openid':openid}, function (err, user) {

                    // 存在
                    if(user) {
                        console.log("registered");

                        if(!user.refer1_id) {
                            user.refer1_id = refer1_id;
                            user.refer2_id = refer2_id;
                            user.save();

                            if(refer1_id) {
                                User.findByIdAndUpdate(
                                    refer1_id,
                                    {
                                        followers: {$push: user._id}
                                    }
                                )
                            }
                        }

                        passport.authenticate('local')(req, res, function () {
                            console.log({user_id: user._id, s_id: 'sess:' + req.session.id,session_key:session_key});
                            req.session.uid = user._id;
                            res.json({user_id: user._id, s_id: 'sess:' + req.session.id,session_key:session_key});
                        });
                    }
                    // 不存在
                    else {
                        console.log("begin register");

                        User.register(
                            new User({
                                username: openid,
                                openid : openid,
                                refer1_id: refer1_id,
                                refer2_id: refer2_id,
                                name: req.body.nickname,
                                avatar: req.body.avatar,
                                gender: req.body.gender,
                                city: req.body.city,
                                province: req.body.province,
                                country: req.body.country,
	                            join_num:0,
                            }),
                            req.body.password,
                            function(err, user) {
                                console.log(user);
                                console.log(err);
                                if (err) {
                                    res.send('fail');
                                }

                                if(refer1_id) {
                                    console.log('here');
                                    console.log(refer1_id);
                                    User.findByIdAndUpdate(
                                        refer1_id,
                                        {
                                            $push: {followers: user._id}
                                        },
                                        {new: true},
                                        function (err, refer) {
                                            console.log('err');
                                            console.log(err);
                                            console.log('refer');
                                            console.log(refer);
                                        }
                                    )
                                }

                                passport.authenticate('local')(req, res, function () {
                                    console.log({user_id: user._id, s_id: 'sess:' + req.session.id,session_key:session_key});
                                    req.session.uid = user._id;
                                    res.json({user_id: user._id, s_id: 'sess:' + req.session.id,session_key:session_key});
                                });
                            }
                        );
                    }
                })
            })
        }
    });
};

wxController.payNotify = function(req, res) {
    console.log("weixin pay notify");

    var xml = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        xml += chunk;
        console.log( chunk );
    });
    req.on('end', function(chunk) {
        console.log( xml );
        Weixin.verifyNotify( xml, function(out_trade_no, openid){
            console.log('out_trade_no:' +out_trade_no);
            if ( out_trade_no && openid ) {
                User.findOneAndUpdate({
                    	openid: openid
		    },
		    {
			$inc: {join_num: 1}
		    }
                ).then(user => {
                    UserPing.findById(out_trade_no).then(aUserPing => {
                        console.log("aUserPing");
                        console.log(aUserPing);

                        aUserPing.pay_state = 1;
                        aUserPing.save().then( up => {
                            Ping.findById(aUserPing.ping_id).then(ping => {
                                if(user._id == aUserPing.sponsor) {
                                    ping.state = 1;
                                }
                                ping.finish_num++;

                                ping.save().then( p => {
                                    // 模板消息
                                    var data = {
                                        touser: user.openid,
                                        template_id: "kBJkVpJbiL9vgKeplaSJS3MyXKANPCqcUunceMSoRSM",
                                        form_id: aUserPing.form_id,
                                        page: 'pages/mypings/index?user_ping_id='+aUserPing._id,
                                        data: {
                                            keyword1: {value: "三一挖掘机预付款"},
                                            keyword2: {value: aUserPing.sub_fee/100 + "元"},
                                            keyword3: {value: aUserPing._id},
                                            keyword4: {value: moment().format('YYYY-MM-DD HH:mm:ss')},
                                            keyword5: {value: "4008123311"}
                                        }
                                    }
                                    Weixin.sendTemplateMsg(data);

                                    User.getReferids(user.refer1_id, function (refer1_id, refer2_id) {
                                        if(refer1_id !='0') {
                                            console.log("sendpack refer1");
                                            console.log(aUserPing._id);
                                            sendRedpack(aUserPing.name,aUserPing._id, refer1_id, 1, 10000);
                                        }

                                        if(refer2_id !='0') {
                                            console.log("sendpack refer2");
                                            sendRedpack(aUserPing.name,aUserPing._id, refer2_id, 2, 5000);
                                        }
                                    })

                                    res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
                                });
                            });
                        });
                    });
                });
            }
        });
    });
};
genRedpackId = function () {
    var redpack_id ='';
    var mchid = '1518016601';
    var timestamp = new Date().getTime().toString().substr(5);
    var rand = Math.round(Math.random() * 99);
    redpack_id = mchid + moment().format("YYYYMMDD") + timestamp + rand.toString();
    return redpack_id;
}

sendRedpack = function(username,user_ping_id, refer_id, level, amount) {
    User.findById(refer_id).then(refer1=>{
	    if(refer1.extra_reward1>0 &&  level ==1)
	    {
		    amount = refer1.extra_reward1
	    }
	    if(refer1.extra_reward2>0 &&  level ==2)
	    {
		    amount = refer1.extra_reward2
	    }
        var redpack = new Redpack({
            level: level,
	        username:username,
            user_ping_id: user_ping_id,
            to_user_id: refer1._id,
            to_openid: refer1.openid,
            amount: amount,
            redpack_id: genRedpackId(),
            redpack_sent: 0,
        })

        redpack.save().then(aRedpack=>{
            /*
            Weixin.sendRedpack(aRedpack.to_openid, aRedpack.amount, aRedpack._id)
            .then(function (body) {
                console.log(body);
                parser(body, function (err, result) {
                    if (result.xml.result_code[0] == 'SUCCESS') {
                        var r_id = result.xml.mch_billno[0];
                        var o_id = result.xml.re_openid[0];

                        Redpack.findOneAndUpdate(
                            {
                                redpack_id: r_id,
                                to_openid: o_id
                            },
                            {
                                redpack_sent: 1
                            }
                        )
                    }
                })
            })
            */
        })
    })
}

module.exports = wxController;
