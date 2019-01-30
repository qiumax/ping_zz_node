var express = require('express');
var router = express.Router();
var pingController = require("../controllers/PingController.js");

// wx
router.post('/', pingController.ping);

router.post('/currentPing', pingController.currentPing);

// router.post('/createPing', pingController.createPing);

router.post('/joinPing', pingController.joinPing);


router.post('/joinPingOther', pingController.joinPingOther);

router.post('/avatars', pingController.avatars);

// 申请红包功能，每天支付
// router.post('/testPay', pingController.testPay);

// admin
router.post('/addPing', pingController.addPing);

module.exports = router;