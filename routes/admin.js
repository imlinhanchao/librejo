var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/new', function(req, res, next) {
  res.render('admin/new', { title: '列表', layout: "admin" });
});

module.exports = router;
