var config = {

    project_name: 'ping-zzxy',
     
    mongodb: {
        url: 'mongodb://sa_ping_zzxy:wending0304@172.17.16.2:27017/ping_zzxy'
    },
    
    redis: {
        host: '172.17.16.8',
        port: 6379,
        pwd: 'Wd03041985!',
        ttl: 3600
    },
    
    wx: {
        appid: 'wxd3a5798fb99c36e3',
        secret: 'b10d6e82e64e9d803392d521ad6415f0',
        key: '6ImoCgd85MU0XMZWJQvMwPRQJlYHyAfS',
        mchid: '1524576641',
        notify_url: 'https://ping-zzxy.quxunbao.cn/wx/payNotify',
        ping_success_tmp_id: 'TDtA4R6JnuCj0Q9Mu9kYdQ3yogu5g0rDNW9cPbtJ8-A'
    },
 
    ping: {
        product_id: '5bda65617c65fac03d619993'
    },
 
    ping_schedule_time_interval: 2*60,
    ip: '94.191.48.58',
    
    
    // ping-test
    /*
    project_name: 'ping-test',
    
    mongodb: {
        url: 'mongodb://sa_ping:wending0304@localhost:27017/ping'
    },
    
    redis: {
        host: 'localhost',
        port: 6379,
        pwd: 'wending0304',
        ttl: 3600
    },
    
    wx: {
        appid: 'wx26b5571fa5d85590',
        secret: '6d7b0e92d2b8de2a61139cdd9eb605b9',
        key: 'pYwUbTaaWnTLOpInl2HtnJA7x1v9UVWC',
        mchid: '1518016601',
        notify_url: 'https://ping-test.quxunbao.cn/wx/payNotify',
        
        ping_success_tmp_id: '0Ismn4fy3jEsr_fR79DT6hErBvYD-wL0Pl_o_1NjO6w'
    },
    
    ping: {
        product_id: '5bda65617c65fac03d619993'
    },
    
    ping_schedule_time_interval: 2*60,
    
    ip: '94.191.48.58',
    */
}

module.exports = config
