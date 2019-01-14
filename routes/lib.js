var express = require('express');
var upload = require('multer')();
var router = express.Router();
const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
const App = modules.app;
const Lib = modules.lib;

router.post('/upload', upload.array('file'), function (req, res, next)  {
    (async () => {
        try {
            res.json(await (new Lib).upload(req));
        } catch (err) {
            return res.json(App.err(err));
        }
    })();
});

module.exports = router;