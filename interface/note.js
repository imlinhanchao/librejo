const model = require('../model');
const App = require('./app');
const Note = model.note;
const Book = require('./book');

let __error__ = Object.assign({}, App.error);
__error__.nobook = App.error.existed('图书', false);
__error__.nonote = App.error.existed('笔记', false);

class Module extends App {
    constructor(session) {
        super([]);
        this.name = '笔记';
        this.session = session;
        this.saftKey = Note.keys().concat(['id']);
        this.book = new Book(session);
    }

    get error() {
        return __error__;
    }

    async new(data) {
        try {
            if (!App.haskeys(data, ['bookId'])) {
                throw (App.error.param);
            }

            let book = await this.book.get(data.bookId, true);

            if (book.userId != this.book.account.userId) {
                throw this.error.unauthorized;
            }

            return this.okcreate(
                App.filter(await super.new(data, Note), this.saftKey)
            );
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async set(data) {
        try {
            data.ISBN = undefined; // 已创建笔记不允许修改ISBN
            data.bookId = undefined; // 已创建笔记不允许修改图书ID
            return this.okupdate(
                App.filter(await super.set(data, Note, async (note) => {
                    let book = await this.book.get(note.bookId, true);

                    if (book.userId != this.book.account.userId) {
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
            let note = await super.del(data, Note, async (note) => {
                let book = await this.book.get(note.bookId, true);
    
                if (book.userId != this.book.account.userId) {
                    throw this.error.unauthorized;
                }
    
                return true;
            });
            return this.okdelete(note.id);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async get(id, onlyData = false) {
        let book = await Note.findAll({
            where: { id }
        });

        if (!book) {
            throw this.error.notexisted;
        }

        if (onlyData) return App.filter(book, this.saftKey);

        return this.okquery(App.filter(book, this.saftKey));
    }
    
    async query(data, onlyData = false) {
        // $ = like
        let ops = {
            content: App.ops.like,
            ISBN: App.ops.equal,
            bookId: App.ops.equal,
            create_time: App.ops.less
        };

        try {
            let queryData = await super.query(
                data, Note, ops
            );

            var bookIds = queryData.data.map(b => b.id);
            let reads = await this.read.lasts(bookIds, true);
            queryData.data.forEach(d => d.read =
                reads.find(r => r.bookId == d.id) || this.read.default(d.id));

            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
}

module.exports = Module;