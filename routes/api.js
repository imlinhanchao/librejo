var express = require('express');
var bodyParser = require('body-parser');
var book = require('book');

var router = express.Router();

router.use('/book', book);

module.exports = router;
