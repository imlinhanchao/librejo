const req = require('../lib/req');
const App = require('./app');

const __encoding__ = 'utf-8';
const __domain__ = 'https://api.douban.com/v2/book';
const __apikey__ = '0df993c66c0c636e29ecbb5344252a4a';

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
            let rsp = await req.get(`${__domain__}/${id}?apikey=${__apikey__}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network);
        }
    }

    async isbn(isbn) {
        try {
            let rsp = await req.get(`${__domain__}/isbn/${isbn}?apikey=${__apikey__}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network);
        }
    }

    async query(data) {
        let query = '';
        if (typeof data == 'string') {
            query = `name=${data}`;
        } else {
            data = App.filter(data, ['query', 'field', 'count', 'index']);
            query = req.toFormData(data, __encoding__);
        }
        try {
            let rsp = await req.get(`${__domain__}/search?apikey=${__apikey__}&${query}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network);
        }
    }

    // 获取某个用户的所有图书收藏信息
    async collections(user) {
        try {
            let rsp = await req.get(`${__domain__}/user/${user}/collections?apikey=${__apikey__}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network);
        }
    }

    // 获取某个用户的所有笔记
    async annotations(user) {
        try {
            let rsp = await req.get(`${__domain__}/user/${user}/annotations?apikey=${__apikey__}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network);
        }
    }
}

module.exports = Module;


