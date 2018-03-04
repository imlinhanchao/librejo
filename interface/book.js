//const req = require('../lib/req');
const model = require('../model');
const App = require('./app');
const Book = model.book;

let __error__ = Object.assign({}, App.error);

class Module extends App {
    constructor() {
        super([]);
        this.name = '图书';
    }

    get error() {
        return __error__;
    }

    async new(data) {
        try {
            return this.okcreate(await super.new(data, Book, 'ISBN'));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async set(data) {
        try {
            data.ISBN = undefined; // 已创建图书不允许修改ISBN
            return this.okupdate(await super.set(data, Book));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async del(data) {
        try {
            let book = await super.del(data, Book);
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
            let queryData = await super.query(
                data, Book, ops
            );
            return this.okquery(queryData);
        } catch (err) {
            throw (err);
        }
    }
    
}

module.exports = Module;