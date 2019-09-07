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

    async id(id) {
        try {
            let rsp = await req.get(`${__domain__}/${id}?apikey=${__apikey__}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.server(err.message));
        }
    }

    async isbn(isbn) {
        try {
            let rsp = await req.get(`${__domain__}/isbn/${isbn}?apikey=${__apikey__}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.server(err.message));
        }
    }

    async query(data) {
        let query = '';
        if (typeof data == 'string') {
            query = `q=${data}`;
        } else {
            if (!App.haskeys(data, ['q'])) {
                throw (App.error.param);
            }

            data = App.filter(data, ['q', 'field', 'count', 'index']);
            query = req.toFormData(data, __encoding__);
        }
        try {
            let rsp = await req.get(`${__domain__}/search?apikey=${__apikey__}&${query}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.server(err.message));
        }
    }

    // 获取某个用户的所有图书收藏信息
    async collections(data) {
        let query = '', user = '';
        if (typeof data == 'string') {
            user = data;
        } else {
            if (!App.haskeys(data, ['user'])) {
                throw (App.error.param);
            }

            user = data.user;
            data = App.filter(data, ['field', 'count', 'index']);
            query = req.toFormData(data, __encoding__);
        }
        
        try {
            let rsp = await req.get(`${__domain__}/user/${user}/collections?apikey=${__apikey__}&${query}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.server(err.message));
        }
    }

    // 获取某个用户的所有笔记
    async annotations(data) {
        let query = '', user = '';
        if (typeof data == 'string') {
            user = data;
        } else {
            if (!App.haskeys(data, ['user'])) {
                throw (App.error.param);
            }

            user = data.user;
            data = App.filter(data, ['field', 'count', 'index']);
            query = req.toFormData(data, __encoding__);
        }

        try {
            let rsp = await req.get(`${__domain__}/user/${user}/annotations?apikey=${__apikey__}&${query}`, __encoding__);
            return this.okquery(JSON.parse(rsp.body));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.server(err.message));
        }
    }

    async img(data) {
        try {
            data = Object.keys(data)[0];
            let rsp = await req.get(`https://img1.doubanio.com/view/subject/${data}`);
            return rsp.body;
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.server(err.message));
        }
    }
}

module.exports = Module;


