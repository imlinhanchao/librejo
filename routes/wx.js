const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
const App = modules.app;
const Wx = modules.wx;

var express = require('express');
var router = express.Router();

router.post('/:fn', async function (req, res, next) {
    try {
        let fn = req.params.fn;
        let wx = new Wx(req.session);
        let resCallback = (ret) => {
            if (ret instanceof Buffer) {
                res.end(ret);
            } else {
                res.json(ret);
            }
        };
        let ret = null;
        if (Wx[fn]) ret = Wx[fn](Object.assign({}, req.body), resCallback);
        else if (wx[fn]) ret = wx[fn](Object.assign({}, req.body), resCallback);
        else throw (App.error.param);
        if (ret instanceof Promise) {
            ret = await ret;
            resCallback(ret);
        }
    } catch (err) {
        return res.json(App.err(err));
    }
});

router.get('/:fn/:param', async function (req, res, next) {
    try {
        let fn = req.params.fn;
        let wx = new Wx(req.session);        
        let resCallback = (ret) => {
            if (ret instanceof Buffer) {
                res.end(ret);
            } else {
                res.json(ret);
            }
        };
        let ret = null;
        if (Wx[fn]) ret = Wx[fn](req.params.param, resCallback);
        else if (wx[fn]) ret = wx[fn](req.params.param, resCallback);
        else throw (App.error.param);
        if (ret instanceof Promise) {
            ret = await ret;
            resCallback(ret);
        }
    } catch (err) {
        return res.json(App.err(err));
    }
});

router.all('/', function (req, res, next) {
    try {
        Wx.loader(req, res, next);
    } catch (err) {
        return res.json(App.err(err));
    }
});

module.exports = router;