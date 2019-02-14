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

    get status() {
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
        try {
            let book = await Read.findAll({
                where: { bookId }
            });

            if (!book) {
                book = [];
            }

            if (onlyData) return App.filter(book, this.saftKey);

            return this.okquery(App.filter(book, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
    
    async last(bookId, onlyData = false) {
        try {
            let book = await Read.findOne({
                where: { bookId },
                order: [['create_time', 'DESC']]
            });

            if (!book) {
                book = this.default(bookId);
            }

            if (onlyData) return App.filter(book, this.saftKey);

            return this.okquery(App.filter(book, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }  
    
    async lasts(bookIds, onlyData = false) {
        try {
            let book = await Read.findAll({
                where: {
                    bookId: {
                        $in: bookIds
                    }
                },
                order: [['create_time', 'DESC']]
            });

            if (!book) {
                book = [];
            }

            let data = [];
            book = book.filter(b => !data.find(d => d == b.id) && data.push(b.id));

            if (onlyData) return book.map(b => App.filter(b, this.saftKey));

            return this.okquery(book.map(b => App.filter(b, this.saftKey)));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    default(bookId) {
        return { bookId, status: 0, page: 0 };
    }
}

module.exports = Module;