var express = require('express');
var bodyParser = require('body-parser');
var ctrl = require('../../lib/book');
var router = express.Router();

router.use(bodyParser.json({limit: '1mb'}));
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

router.post('/new', function (req, res) {
  var data = req.body;
  ctrl.new(data, function(data, back) {
    res.json(back);    
    res.end();
  });
})

router.post('/update', function (req, res) {
  var data = req.body;
  ctrl.update(data, function(data, back) {
    res.json(back);    
    res.end();
  });
})

router.post('/query', function (req, res) {
  var data = req.body;
  data = Object.assign(data, {
      order: {
        id: "desc"
      }
  });
  ctrl.query(data, function(data, back) {
    res.json(back);    
    res.end();
  });
})

module.exports = router;