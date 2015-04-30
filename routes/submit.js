var express = require('express');
var _ = require('lodash');
var router = express.Router();
var db = require('../data/database');

/* GET users listing. */
router.post('/', function(req, res, next) {
  var body = req.body;
  var username = body.username;
  if (!username) {
    return res.json({status:'failed', msg:'Empty Username'});
  }
  username = _.trim(username);
  delete body.username;
  var dishes = [];
  var drinks = [];
  for (var item in body) {
    if (body[item] == 'on') {
      if (_.startsWith(item, 'm-')) {
        dishes.push(item.slice(2));
      }
      else if (_.startsWith(item, 'd-')) drinks.push(item.slice(2));
    }
  }
  if (dishes.length < 1 && drinks.length < 1) return res.json({status:'failed', msg:'No order recorded'});
  db.utilities.addOrder(username, dishes, drinks, function(err, numRep, numIns) {
    if (err) return res.json({status:'failed', msg:'An error occurred. Try again later...'});
    if (numRep && !numIns) {
      return res.json({status:'succeed', msg:'Your order has been updated'});
    } else {
      res.json({status:'succeed', msg: username + ", you ordered: " + dishes.concat(drinks).join(',')});
    }
  });

});

module.exports = router;