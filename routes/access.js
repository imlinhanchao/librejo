var express = require('express');
var router = express.Router();
const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
const App = modules.app;

router.all('/:interface/:fn*', function (req, res, next) {
    const no_login_interface = {
        account: [ 'login' ],
        book: [ 'query' ],
    };

    if (no_login_interface[req.params.interface].indexOf(req.params.fn) < 0) {
        throw (App.error.onlogin);
    }

    next();
});

module.exports = router;