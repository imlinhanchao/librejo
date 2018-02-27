var express = require('express');
var router = express.Router();
var subffix = require(process.cwd() + '/config').base.suffix;
const modules = require(require('path').resolve(process.cwd(), 'modules.js'));

router.get('/', function (req, res, next) {
    res.render('index', { title: '首页' });
});

module.exports = router;
