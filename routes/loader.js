var express = require('express');
var router = express.Router();
const App = modules.app;

function loader(Module) {
    router.post('/:fn', function (req, res, next) {
        (async () => {
            try {
                let module = new Module(req.session);
                let fn = req.params.fn;
                if (module[fn]) return res.json((await module[fn](req.body)));
                else if (Module[fn]) return res.json((await Module[fn](req.body)));
                else throw (module.error.param);
            } catch (err) {
                return res.json(err);
            }
        })();
    });
    router.get('/:fn', function (req, res, next) {
        (async () => {
            try {
                let module = new Module(req.session);
                let fn = req.params.fn;
                if (module[fn]) return res.json((await module[fn]()));
                else if (Module[fn]) return res.json((await Module[fn]()));
                else throw (module.error.param);
            } catch (err) {
                return res.json(err);
            }
        })();
    });
    router.get('/:fn/:param', function (req, res, next) {
        (async () => {
            try {
                let module = new Module(req.session);
                let fn = req.params.fn;
                let param = req.params.param;
                if (module[fn]) return res.json((await module[fn](param)));
                else if (Module[fn]) return res.json((await Module[fn](param)));
                else throw (module.error.param);
            } catch (err) {
                return res.json(err);
            }
        })();
    });
    return router;
}
module.exports = router;