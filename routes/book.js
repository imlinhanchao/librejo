var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();

router.use(bodyParser.json({limit: '1mb'}));
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(multer()); // for parsing multipart/form-data

router.post('/book', function (req, res) {
  console.log(req.body);
  res.json(req.body);
})

module.exports = router;