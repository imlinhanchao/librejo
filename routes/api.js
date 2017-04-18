var express = require('express');
var bodyParser = require('body-parser');

var book = require('book');
var lend = require('lend');
var login = require('login');

var router = express.Router();

router.use('/book', book);
router.use('/lend', lend);
router.use('/login', login);

module.exports = router;
