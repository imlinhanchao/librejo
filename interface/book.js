//const req = require('../lib/req');
const model = require('../model');
const App = require('./app');
const Book = model.book;
const Account = require('./account');
const fs = require('../lib/files');
const path = require('path');

let __error__ = Object.assign({}, App.error);

class Module extends App {
    constructor(session) {
        super([]);
        this.name = '图书';
        this.session = session;
        this.saftKey = Book.keys();
        this.account = new Account(session);
    }

    get error() {
        return __error__;
    }

    async new(data) {
        try {
            data.userId = this.account.userId;
            if (data.img.indexOf('http') == 0) {
                data.img = await this.__downloadImg(data.img);
            }
            return this.okcreate(
                App.filter(await super.new(data, Book, ['userId', 'ISBN']), this.saftKey)
            );
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async set(data) {
        try {
            data.userId = undefined;
            data.ISBN = undefined; // 已创建图书不允许修改ISBN
            return this.okupdate(
                App.filter(await super.set(data, Book, (book) => {
                    if (book.userId != this.account.userId) {
                        throw this.error.unauthorized;
                    }
                    return true;
                }), this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async del(data) {
        try {
            let book = await super.del(data, Book, (book) => {
                if (book.userId != this.account.userId) {
                    throw this.error.unauthorized;
                }
                return true;
            });
            return this.okdelete(book.id);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
    
    async query(data, onlyData = false) {
        // $ = like
        let ops = {
            name: App.ops.like,
            author: App.ops.like,
            publisher: App.ops.like,
            userId: App.ops.equal
        };

        try {
            let queryData = await super.query(
                data, Book, ops
            );
            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            throw (err);
        }
    }
    
    async __downloadImg(src) {
        let ext = path.extname(new URL(src).pathname);
        let filename = `${new Date().valueOf()}.${parseInt(Math.random() * 100000)}${ext}`;
        let file = await fs.download(src, filename);
        let newfile = `${file.hash}${ext}`;
        let newpath = path.join(path.dirname(file.path), newfile);
        fs.rename(file.path, newpath);
        return file.url.replace(filename, newfile);
    }
}

module.exports = Module;