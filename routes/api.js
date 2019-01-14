var express = require('express');
var router = express.Router();
const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
let loader = require('./loader');

router.all('*', function (req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    }
    next();
});

// 在此加入
router.use(require('./access'));
router.use('/lib', require('./lib'));
router.use('/book', loader(modules.book));
router.use('/lend', loader(modules.lend));
router.use('/account', loader(modules.account));

router.get('/', function (req, res) {
    res.render('index', { title: 'API' });
});

module.exports = router;
