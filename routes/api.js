var express = require('express');
var bodyParser = require('body-parser');

var book = require('./book');
var lend = require('./lend');

var router = express.Router();

router.use('/book', book);
router.use('/lend', lend);

module.exports = router;
