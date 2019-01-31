var mongoose = require("mongoose");
var Activity = require("../models/Activity");
var Product = require("../models/Product");
var Ping = require("../models/Ping");
var PingShedule = require("../models/PingShedule");
var CurrentPing = require('../models/CurrentPing');
var User = require("../models/User");
var UserPing = require("../models/UserPing");
var UserPingOther = require("../models/UserPingOther");
var Manager = require("../models/Manager");
var Weixin = require("../models/Weixin");
var moment = require('moment');
var config = require('../config/Config');

var pingController = {};

// wx
pingController.ping = function(req, res) {
    console.log(req.body.id);

    Ping.find({'_id':req.body.id}, function (err, ping) {
        res.send(ping);
    })
};

pingController.currentPing = function (req, res) {
    //console.log(req.body);
	var product_id = req.body.product_id
	console.log(req.body)
    CurrentPing.findOne({product_id:product_id}).populate('ping').then(currentPing =>{
        if(currentPing){
            var ping = currentPing.ping;
            var ts = new Date().getTime()/1000;
            res.send({ping: ping, server_ts:ts});
        }
        else {
	        res.send({ok:0})
            console.log("暂无拼团信息");

        }
    })
}

/*
// 发起拼团
pingController.createPing = function(req, res) {
    console.log(req.body);

    var product_id = req.body.product_id;
    var user_id = req.body.user_id;
    var total = req.body.total;

    Product.findById(product_id).then( product => {
        console.log("product: ");
        console.log(product);
        // res.send(product);

        User.findById(user_id)
        .then( user => {
            console.log("user: ");
            console.log(user);

            var ts = new Date().getTime()/1000;
            var expire = ts + product.expire * 86400;

            var ping = new Ping({
                product_id: product_id,
                product_name: product.name,
                price_origin: product.price_origin,
                price_bottom: product.price_bottom,
                sponsor_bonus: product.sponsor_bonus,
                less_minus: product.less_minus,
                rules: product.rules,
                total: total,
                finish_num: 0,
                expire: expire,
                sub_fee: product.sub_fee,
                sponsor: user_id,
                sponsor_name: req.body.name,
                sponsor_phone: req.body.phone,
                sponsor_avatar: user.avatar,
                state: 0
            });

            ping.save().then(aPing => {
                console.log(aPing);

                // Manager.find().sort({'appoint_num':1}).limit(1)
                // .then(managers=> {
                //     var manager = managers[0];
                //     console.log(manager);
                //
                //     manager.appoint_num++;
                //     manager.save();

                    var userPing = new UserPing({
                        user_id: user_id,
                        ping_id: aPing.id,
                        sponsor: user_id,
                        name: req.body.name,
                        phone: req.body.phone,
                        form_id: req.body.form_id,
                        sub_fee: product.sub_fee,
                        pay_state: 0,
                        ping_finish: 0,
                        use_state: 0
                        // m_name: manager.name,
                        // m_phone: manager.phone,
                        // m_wx: manager.wx,
                        // m_email: manager.email,
                        // m_avatar: manager.avatar
                    });

                    userPing.save().then(aUserPing => {
                        console.log(aUserPing);
                        // res.send(aUserPing);

                        Weixin.jsapipay({
                            user_ping_id: aUserPing.id,
                            attach: req.body.attach,
                            nonce_str: req.body.nonce_str,
                            sub_fee: aUserPing.sub_fee,
                            openid: user.openid,
                            description: "三一重卡订金",
                            timestamp: req.body.timestamp
                        }, function (pay_data) {
                            var prepay_id = pay_data.prepay_id;
                            userPing.pay_form_id = prepay_id;
                            userPing.save();

                            res.send(pay_data);
                        })
                    })
                })
            })
        })
    // })
}
*/

// 参与拼团
pingController.joinPing = function(req, res) {
    console.log(req.body);

    var ping_id = req.body.ping_id;
    var user_id = req.body.user_id;

    Activity.findOne().then(activity=>{
        var now = new Date().getTime()/1000;
        console.log("now: " + now);
        console.log("距离活动开始还有: " + (now-activity.starttime));

        if(now < activity.starttime) {
            res.send({err: "活动暂未开始，请耐心等待"});
            return;
        }
        else if (now > activity.endtime) {
            res.send({err: "活动已结束，请参与下一次拼团活动"});
            return;
        }

        Ping.findById(ping_id).then( ping => {
            console.log("ping: ");
            console.log(ping);

            if(ping.state==2){
                res.send({err: "该团已结束，请返回拼团页面, 下拉刷新"});
                return;
            }

            Product.findById(ping.product_id).then( product => {
                console.log("product: ");
                console.log(product);

                User.findById(user_id).then( user => {
                    console.log("user: ");
                    console.log(user);

                    // if(user.join_num>=3) {
                    //     res.send({err: "您拼团次数已达3次"});
                    //     return;
                    // }

                    // Manager.find().sort({'appoint_num':1}).limit(1)
                    // .then(managers=> {
                    //     var manager = managers[0];
                    //     console.log(manager);
                    //
                    //     manager.appoint_num++;
                    //     manager.save();
                    console.log(req.body.setup)
                    var userPing = new UserPing({
                        user_id: user_id,
                        ping_id: ping.id,
                        sponsor: user_id,
                        name: req.body.name,
                        product:req.body.product_id,
	                    location: req.body.location,
                        shigong:req.body.shigong,
	                    remark: req.body.remark,
                        phone: req.body.phone,
                        setupdetail:JSON.parse(req.body.setup),
                        price:req.body.price,
                        form_id: req.body.form_id,
                        sub_fee: product.sub_fee,
                        pay_state: 0,
                        ping_finish: 0,
                        use_state: 0
                        // m_name: manager.name,
                        // m_phone: manager.phone,
                        // m_wx: manager.wx,
                        // m_email: manager.email,
                        // m_avatar: manager.avatar
                    })

                    userPing.save().then(aUserPing => {
                        console.log('aUserPing');
                        console.log(aUserPing);

                        if(!user.phone || user.phone.length==0) {
                            user.phone = req.body.phone
                        }

                        user.save();

                        Weixin.jsapipay({
                            user_ping_id: aUserPing.id,
                            attach: req.body.attach,
                            nonce_str: req.body.nonce_str,
                            sub_fee: aUserPing.sub_fee,
                            openid: user.openid,
                            description: "三一挖掘机订金",
                            timestamp: req.body.timestamp
                        }, function (pay_data) {
                            var prepay_id = pay_data.prepay_id;
                            userPing.pay_form_id = prepay_id;
                            userPing.save();

                            res.send(pay_data);
                        })
                    })
                    // })
                })
            })
        })
    })
}



// 参与拼团--地址信息不匹配失败
pingController.joinPingOther = function(req, res) {
    console.log(req.body);

    var ping_id = req.body.ping_id;
    var user_id = req.body.user_id;
    User.findById(user_id).then( user => {
        console.log("user: ");
        console.log(user);
        var userPingOther = new UserPingOther({
            user_id: user_id,
            name: req.body.name,
            product:req.body.product_id,
            location: req.body.location,
            shigong:req.body.shigong,
            remark: req.body.remark,
            phone: req.body.phone,
            setupdetail:JSON.parse(req.body.setup),
            price:req.body.price,
        })

        userPingOther.save().then(aUserPingOther => {
        console.log('aUserPingOther');
        console.log(aUserPingOther);
        if(!user.phone || user.phone.length==0) {
            user.phone = req.body.phone
        }
        user.save();
        res.send({ok:1});

})

})



}

pingController.avatars = function(req, res) {
    console.log(req.body);

    var ping_id = req.body.ping_id;
    UserPing.find({
        ping_id: ping_id,
        pay_state: 1
    }).select('user_id').limit(5).populate({path:'user_id', select: 'avatar'}).then(ups=>{
        console.log(ups);
	
	var avatars = [];
	
        var avatars2 = [

	];
	
        ups.forEach(up => {
            avatars.push(up.user_id.avatar);
        })
	
	avatars = avatars.concat(avatars2).slice(0,5);
	
        res.send(avatars)
    })
};

// 开始活动
pingController.startActivity = function () {
    console.log('check startActivity');

	CurrentPing.count({},function (err,count) {
		console.log(count)
		if(count<2)
		{
			console.log("不存在");
			createFirstPing();
		}

	})

}

// 更新当前的Ping
pingController.updateCurrentPing = function () {
    console.log('updateCurrentPing');

    CurrentPing.find({}).populate('ping')
        .then(currentPings=>{
            console.log("CurrentPing: ");
            console.log(currentPings);

            for(var i=0;i<currentPings.length;i++){
            	var currentPing = currentPings[i]
	            // 不存在
	            if(!currentPing) {
		            console.log("不存在");
		            // createPing();
	            }
	            else {
		            var ping = currentPing.ping;

		            if(ping.state==2) return;

		            var now_date = new Date();
		            var now_ts = new Date().getTime()/1000;

		            // 已满
		            // if(ping.finish_num>=200 && ping.updated_at<(now_date-1*60*1000)) {
		            // if(ping.finish_num>=200) {
			         //    console.log("已满");
			         //    createPing();
			         //    updatePing(ping);
		            // }
		            // 已过期
		            // else if(ping.expire<(now_ts-1*60)) {
		            if(ping.expire<now_ts) {
			            console.log("已过期");
			            createPing(ping.product_id);
			            updatePing(ping);
		            }
	            }
            }

        })
}

pingController.handlePingSchedule = function () {
    console.log('handlePingSchedule');
    
    var now = new Date().getTime()/1000;
    PingShedule.find({
        run_time: {$lte: now}
    }).populate('ping').then(ping_schedules=> {
        ping_schedules.forEach(ping_schedule=>{
            var ping = ping_schedule.ping
            if(ping.state==2) {
    
                // 更新user_ping
                UserPing.find({
                    ping_id: ping._id,
                    pay_state: 1
                }).then(userpings => {
                    for(var i=0; i<userpings.length; i++) {
                        var userping = userpings[i];
                        userping.ping_finish = 1;
                        userping.ping_finish_time = ping.finish_time;
                        userping.finish_num = ping.finish_num;
                        userping.need_process = 1;
                        userping.processed = 0;
                        userping.bonus = getBonus(ping.rules, ping.finish_num);
                        userping.save(function (err, aUserPing) {
                            User.findById(aUserPing.user_id).then(user=> {
                                // 模板消息
                                var data = {
                                    touser: user.openid,
                                    template_id: config.wx.ping_success_tmp_id,
                                    form_id: aUserPing.pay_form_id,
                                    page: 'pages/mypings/index?user_ping_id='+aUserPing._id,
                                    data: {
                                        keyword1: {value: aUserPing._id},
                                        keyword2: {value: "三一挖掘机"},
                                        keyword3: {value: aUserPing.finish_num + "人"},
                                        keyword4: {value: moment().format('YYYY-MM-DD HH:mm:ss')},
                                        keyword5: {value: aUserPing.sub_fee / 100 + '元'},
                                        keyword6: {value: aUserPing.bonus + '元'},
                                        keyword7: {value: (ping.price_origin - aUserPing.bonus) + '元'},
                                        keyword8: {value: "如有任何疑问，请致电: 4008123311"}
                                    }
                                }
                                Weixin.sendTemplateMsg(data);
                            })
                        })
                    }
                    ping_schedule.remove(function (err) {
                        if(err) throw err
                    })
                })
            }
        })
    })
}

createFirstPing = function() {
    console.log("Creating First Ping");

    //var product_id = config.ping.product_id;

    Activity.findOne().then(activity=> {
        var now = new Date().getTime() / 1000;
        console.log("now: " + now);
        console.log("距离活动开始还有: " + (now - activity.starttime));

        // if(now >= activity.starttime && now <= (activity.starttime+30)) {
        if(now >= activity.starttime && now <= (activity.endtime)) {
	        console.log("开始第一个Ping");
	        CurrentPing.find({}).then(curr_pings=>{
		        var product_arr = new Array()
		        if(curr_pings)
		        {
			        curr_pings.forEach(ping=>{
				        product_arr.push(ping.product_id)
			        })
		        }
		        console.log(product_arr)
		        Product.find({_id:{$nin:product_arr}}).then(products => {
			        console.log("product: ");
			        console.log(products);

			        //循环产生ping
			        for(var i=0;i<products.length;i++){
				        var product = products[i]
				        var ts = new Date().getTime() / 1000;
				        var expire = ts + product.expire * 86400;

				        var ping = new Ping({
					        product_id: product._id,
					        product_name: product.name,
					        price_origin: product.price_origin,
					        price_bottom: product.price_bottom,
					        sponsor_bonus: product.sponsor_bonus,
					        less_minus: product.less_minus,
					        rules: product.rules,
					        finish_num: 0,
					        expire: expire,
					        sub_fee: product.sub_fee,
					        state: 1
				        });

				        ping.save().then(aPing => {

					        console.log("New Current Ping");
					        console.log(aPing);

					        var currentPing = new CurrentPing({
						        ping: aPing._id,
						        product_id:aPing.product_id
					        })

					        CurrentPing.remove({product_id:aPing.product_id}, function (err) {
						        if (err) console.log(err);
						        currentPing.save().then(aCurrentPing => {
							        console.log("Current Ping saved: ");
							        console.log(aCurrentPing)
						        })
					        })
				        })
			        }
		        })

	        })
        }
    })
}

createPing = function(product_id) {
    console.log("Creating Ping");

    // var product_id = config.ping.product_id;

    Activity.findOne().then(activity=> {
        var now = new Date().getTime() / 1000;
        console.log("now: " + now);
        console.log("距离活动开始还有: " + (now - activity.starttime));

        if(now < activity.starttime) {
            console.log("活动暂未开始");
            return;
        }
        else if (now > activity.endtime) {
            console.log("活动已结束");
            return;
        }

        Product.findById(product_id).then( product => {
            console.log("product: ");
            console.log(product);

            var ts = new Date().getTime()/1000;
            var expire = ts + product.expire * 86400;

            var ping = new Ping({
                product_id: product_id,
                product_name: product.name,
                price_origin: product.price_origin,
                price_bottom: product.price_bottom,
                sponsor_bonus: product.sponsor_bonus,
                less_minus: product.less_minus,
                rules: product.rules,
                finish_num: 0,
                expire: expire,
                sub_fee: product.sub_fee,
                state: 1
            });

            ping.save().then(aPing => {

                console.log("New Current Ping");
                console.log(aPing);

                var currentPing = new CurrentPing({
                    ping: aPing._id,
	                product_id:aPing.product_id
                })

                CurrentPing.remove({product_id:aPing.product_id},function (err) {
                    if (err) console.log(err);
                    currentPing.save().then(aCurrentPing => {
                        console.log("Current Ping saved: ");
                        console.log(aCurrentPing)
                    })
                })
            })
        })
    })
}

updatePing = function (ping) {
    // 更新ping
    ping.finish_time = new Date().getTime()/1000;
    ping.need_process = 1;
    ping.processed = 0;
    ping.state = 2;

    ping.save(function (err, aPing) {
        console.log('ping state set to 2');
        console.log(aPing);
    
        var pingSchedule = new PingShedule({
            ping: ping._id,
            run_time: new Date().getTime()/1000 + config.ping_schedule_time_interval
        })
        
        pingSchedule.save(function (err) {
            if(err) throw err
        })
    })
}

getBonus = function (rules, finish_num) {
    for(var i=rules.length-1; i>=0; i--) {
        if(finish_num >= rules[i].num) {
            return rules[i].bonus;
        }
    }
    return 0;
}

// 开通红包功能，每天支付
/*
pingController.testPay = function (req,res) {
	console.log(req.body);
	var user_id = req.body.user_id;
	User.findById(user_id).then( user =>{
		Weixin.jsapipay({
			user_ping_id:req.body.nonce_str,
			attach: req.body.attach,
			nonce_str: req.body.nonce_str,
			sub_fee: 1000,
			openid: user.openid,
			description: "三一重卡订金",
			timestamp: req.body.timestamp
		}, function (pay_data) {
			res.send(pay_data);
		})
	})
}
*/


// admin
pingController.addPing = function(req, res) {
    console.log(req.body);
    // res.send("get ping of id: " + req.params.ping);

    var ping = new Ping({
        product: req.body.product,
        total: req.body.total,
        finish_num: req.body.finish_num
    });

    ping.save(function (err, aPing) {
        res.send(aPing);
    })
};

module.exports = pingController;
