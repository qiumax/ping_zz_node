var express = require('express');
var router = express.Router();
var wxController = require("../controllers/WxController.js");

router.post('/getWxUserInfo', wxController.getWxUserInfo);

router.post('/payNotify', wxController.payNotify);

// router.post('/testTemp', wxController.testTemp);

router.get('/test', function (req, res) {
    console.log("server 1");
    res.send("server 1")
});

module.exports = router;