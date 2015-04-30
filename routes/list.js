var express = require('express');
var _ = require('lodash');
var moment = require('moment');
var router = express.Router();

var db = require('../data/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  var promiseOrders = new Promise(function(resolve, reject) {
    db.utilities.getAllOrdersForOnGoingEvent(function(err, list) {
      if (err) return reject(err);
      resolve(list);
    });
  });
  var promiseRestaurants = new Promise(function(resolve, reject) {
    db.find({label:'restaurant'}, function(err, docs) {
      if (err) return reject(err);
      resolve(docs);
    });
  });
  var promiseOnGoingEvent = new Promise(function(resolve, reject) {
    db.findOne({label: 'on_going_event'}, function(err, event) {
      if (err) return reject(err);
      resolve(event);
    });
  });
  Promise.all([promiseOrders, promiseRestaurants, promiseOnGoingEvent]).then(
    function(result) {
      res.render('list', {orders: result[0], restaurants: result[1], event: result[2]});
    },
    function(err) {
      return next(err);
    }
  );
});

router.post('/vendor', function(req, res, next) {
  var body = req.body;
  var queue = {};
  _.forEach(body, function(val, key) {
    var tmp = key.split(':');
    var type = tmp[0], id = tmp[1];
    tmp = queue[id];
    if (!tmp) { tmp = {}; }
    tmp[type] = type == 'name' ? val : val.split(',');
    queue[id] = tmp;
  });
  var promQ = [];
  _.forEach(queue, function(val, key) {
    promQ.push(new Promise(function(resolve, reject) {
      db.update({_id:key}, _.extend(val, {label:'restaurant'}), function(err) {
        if (err) return reject(err);
        resolve();
      });
    }));
  });
  Promise.all(promQ).then(function(){
    res.redirect('/list');
  }, function(err){next(err);});
});

router.post('/vendor/add', function(req, res, next) {
  db.insert({
    label: 'restaurant',
    name: 'undefined',
    menu: [],
    img: null
  }, function(err, doc) {
    if (err) return next(err);
    res.json(doc);
  });
});

router.post('/on_going_event', function(req, res, next) {
  var body = req.body;
  var result = {
    label: 'on_going_event',
    mealVendor: body.mealVendor,
    drinkVendor: body.drinkVendor,
    mealTime: moment(body.mealTime).valueOf(),
    orderBefore: moment(body.orderBefore).valueOf(),
    orderStart: moment(body.orderStart).valueOf()
  };
  db.update({label:'on_going_event'}, result, function(err) {
    if (err) return next(err);
    delete db.globalCache.on_going_event;
    res.redirect('/list');
  });
});
module.exports = router;
