var express = require('express');
var router = express.Router();
const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
let loader = require('./loader');

router.use(require('./access'));
router.use('/book', loader(modules.book));
router.use('/lend', loader(modules.lend));
router.use('/account', loader(modules.account));

router.get('/', function (req, res) {
    res.render('index', { title: 'API' });
});

module.exports = router;
