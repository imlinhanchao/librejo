var express = require('express');
var router = express.Router();
const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
let loader = require('./loader');


// add the router in here
router.use(require('./access'));
router.use('/lib', require('./lib'));
router.use('/book', loader(modules.book));
router.use('/read', loader(modules.read));
router.use('/note', loader(modules.note));
router.use('/lend', loader(modules.lend));
router.use('/account', loader(modules.account));
router.use('/douban', loader(modules.douban));

router.get('/', function (req, res) {
    res.render('index', { title: 'API' });
});

module.exports = router;
