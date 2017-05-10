var express = require('express');
var bodyParser = require('body-parser');

var book = require('./book');
var lend = require('./lend');
var login = require('./login');

var router = express.Router();

router.use(bodyParser.json({limit: '1mb'}));
router.use(bodyParser.urlencoded({ extended: true }));

router.all('*',function (req, res, next) {
    res.header('Content-Type', 'text/html;charset=utf-8');
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    if (req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

router.use('/book', book);
router.use('/lend', lend);
router.use('/login', login);

module.exports = router;
