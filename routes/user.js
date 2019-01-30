var express = require('express');
var router = express.Router();
var userController = require("../controllers/UserController.js");

// wx
router.post('/userpings', userController.userpings);

router.post('/userping', userController.userping);

router.post('/userfollowers', userController.userfollowers);

router.post('/userpacks', userController.userpacks);

router.post('/wxacode', userController.wxacode);

router.post('/getInfo', userController.getInfo);

router.post('/updateInfo', userController.updateInfo);

router.post('/getphone', userController.getphone);
// admin

module.exports = router;
