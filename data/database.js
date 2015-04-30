var NeDB = require('nedb');

var db = new NeDB({
  filename: './data/db',
  autoload: true
});

db.ensureIndex({
  fieldName: 'timestamp',
  sparse: true
});

db.globalCache = {};

db.utilities = {
  getOnGoingEvent: function(cb) {
    var cached = db.globalCache.on_going_event;
    if (cached)
      return cb(null, db.globalCache.on_going_event);
    db.findOne({label: 'on_going_event'}, function(err, doc) {
      if (err) return cb(err);

      var drink = new Promise(function(resolve, reject) {
        db.findOne({_id: doc.drinkVendor}, function(err, doc) {
          if (err) return reject(err);
          resolve(doc);
        });
      });
      var meal = new Promise(function(resolve, reject) {
        db.findOne({_id: doc.mealVendor}, function(err, doc) {
          if (err) return reject(err);
          resolve(doc);
        });
      });

      Promise.all([drink, meal]).then(function(result) {
        doc.drinkVendor = result[0];
        doc.mealVendor = result[1];
        db.globalCache.on_going_event = doc;
        cb(null, doc);
      }, function(err) { return cb(err); });
    });
  },
  addOrder: function(user, meal, drink, cb) {
    db.utilities.getOnGoingEvent(function (err, on_going_event) {
      if (err) return cb(err);
      db.update({
        $and: [
          {label: 'order'},
          {username: user},
          {timestamp: {$lt: on_going_event.orderBefore}},
          {timestamp: {$gt: on_going_event.orderStart}}
        ]
      }, {
        label: 'order',
        username: user,
        meal: meal,
        drink: drink,
        timestamp: Date.now()
      }, {upsert: true}, cb);
    });
  },
  getAllOrdersForOnGoingEvent: function(cb) {
    db.utilities.getOnGoingEvent(function (err, on_going_event) {
      if (err) return cb(err);
      db.find({
        $and: [
          {label: 'order'},
          {timestamp: {$lt: on_going_event.orderBefore}},
          {timestamp: {$gt: on_going_event.orderStart}}
        ]
      }, cb);
    });
  }
};

module.exports = db;