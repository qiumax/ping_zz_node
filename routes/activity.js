var express = require('express');
var router = express.Router();
var activityController = require("../controllers/ActivityController.js");

router.post('/getactivity', activityController.getactivity);


module.exports = router;