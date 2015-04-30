var express = require('express');
var router = express.Router();

var db = require('../data/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  db.utilities.getOnGoingEvent(function(err, event) {
    if (err) return next(err);
    res.render('index', event);
  });
});

module.exports = router;
