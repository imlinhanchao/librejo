//const req = require('../lib/req');
const model = require('../model');
const App = require('./app');
const Book = model.book;

let __error__ = Object.assign({}, App.error);
__error__.existed = App.error.existed('图书');

class Module extends App {
    constructor() {
        super();

        const rsps = [
            { fun: App.ok, name: 'okget', msg: '获取成功' }, 
            { fun: App.ok, name: 'okcreate', msg: '创建成功' }, 
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
            return this.okcreate(book.id);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
}

module.exports = Module;