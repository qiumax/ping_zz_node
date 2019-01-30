var mongoose = require("mongoose");
var Activity = require("../models/Activity");

var activityController = {};

activityController.getactivity = function(req, res) {

    Activity.findOne().sort().then(activity =>{
        console.log(activity)
        res.send(activity)
    })
};

module.exports = activityController;