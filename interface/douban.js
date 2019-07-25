const req = require('../lib/req');
const App = require('./app');

const __encoding__ = 'utf-8';
const __domain__ = 'https://api.douban.com/v2/book';

let __error__ = Object.assign({}, App.error);
__error__.query = App.error.reg('查询失败');

const QUERY = '查询';

class Module extends App {
    constructor() {
        super();
        this.okquery = function (data) {
            return App.ok(QUERY, data);
        };
    }

    get error() {
        return __error__;
    }

    static get cache() {
        return {
        };
    }

    async id(id) {
        try {
            let rsp = await req.get(`${__domain__}/${id}?apikey=0df993c66c0c636e29ecbb5344252a4a`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network);
        }
    }

    async isbn(isbn) {
        try {
            let rsp = await req.get(`${__domain__}/isbn/${isbn}?apikey=0df993c66c0c636e29ecbb5344252a4a`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network);
        }
    }

    async query(name) {
        try {
            let rsp = await req.get(`${__domain__}/search?q=${name}?apikey=0df993c66c0c636e29ecbb5344252a4a`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network);
        }
    }
}

module.exports = Module;


