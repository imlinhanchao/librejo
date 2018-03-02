var express = require('express');
var router = express.Router();
const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
let loader = require('./loader');

router.use('/book', loader(modules.book));

router.get('/', function (req, res) {
    res.render('index', { title: '首页' });
});

module.exports = router;
