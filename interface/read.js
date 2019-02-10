const model = require('../model');
const App = require('./app');
const Read = model.read;

let __error__ = Object.assign({}, App.error);

class Module extends App {
    constructor(session) {
        super([]);
        this.name = '阅读记录';
        this.session = session;
        this.saftKey = Read.keys().concat(['id']);
    }

    get error() {
        return __error__;
    }

    static get status() {
        let index = 1;
        return {
            reading: index++, 
            haveRead: index++,
            _max: index
        };
    }

    async new(data) {
        try {
            if (data.status < 0 || data.status >= this.status._max)
                throw this.error.param;
            return this.okcreate(await super.new(data, Read));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
    
    async get(bookId, onlyData = false) {
        let book = await Read.findAll({
            where: { bookId }
        });

        if (!book) {
            book = [];
        }

        if (onlyData) return App.filter(book, this.saftKey);

        return this.okquery(App.filter(book, this.saftKey));
    }
    
    async last(bookId, onlyData = false) {
        let book = await Read.findOne({
            where: { bookId },
            order: [['create_time', 'DESC']]
        });

        if (!book) {
            book = { bookId, status: 0 };
        }

        if (onlyData) return App.filter(book, this.saftKey);

        return this.okquery(App.filter(book, this.saftKey));
    }
}

module.exports = Module;