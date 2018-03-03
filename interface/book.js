//const req = require('../lib/req');
const model = require('../model');
const App = require('./app');
const Book = model.book;

let __error__ = Object.assign({}, App.error);
__error__.existed = App.error.existed('图书');
__error__.notexisted = App.error.existed('图书', false);

class Module extends App {
    constructor() {
        super();

        const rsps = [
            { fun: App.ok, name: 'okquery', msg: '查询成功' }, 
            { fun: App.ok, name: 'okcreate', msg: '创建成功' }, 
            { fun: App.ok, name: 'okupdate', msg: '更新成功' }, 
            { fun: App.ok, name: 'okdelete', msg: '删除成功' }, 
        ];

        for (let i in rsps) {
            let rsp = rsps[i];
            this[rsp.name] = function (data=undefined) {
                return rsp.fun(rsp.msg, data, true);
            };
        }
    }

    get error() {
        return __error__;
    }

    async 'new'(data) {
        let keys = Book.keys();
        
        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, keys);

        try {
            let book = await Book.findOne({
                where: {
                    ISBN: data.ISBN
                }
            });

            if (book) {
                throw (this.error.existed);
            }

            book = await Book.create(data);

            keys = keys.concat(['id']);
            return this.okcreate(App.filter(book, keys));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async set(data) {
        let keys = Book.keys();
        keys = keys.concat(['id']);

        if (!App.haskeys(data, ['id'])) {
            throw (this.error.param);
        }
        
        data = App.filter(data, keys);

        try {
            let book = await Book.findOne({
                where: {
                    id: data.id
                }
            });

            if (!book) {
                throw (this.error.notexisted);
            }

            book = App.update(book, data, keys);
            await book.save();

            return this.okupdate(App.filter(book, keys));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async 'del'(data) {
        let keys = ['id'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }
        
        data = App.filter(data, keys);

        try {
            let book = await Book.findOne({
                where: {
                    id: data.id
                }
            });

            if (!book) {
                throw (this.error.notexisted);
            }

            await book.destroy();
            return this.okdelete(book.id);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
    
    async query(data) {
        // $ = like
        let ops = {
            name: App.ops.like,
            author: App.ops.like,
            publisher: App.ops.like,
        };

        try {
            let queryData = await App.query(
                data, Book, ops
            );
            return this.okquery(queryData);
        } catch (err) {
            throw (err);
        }
    }
    
}

module.exports = Module;