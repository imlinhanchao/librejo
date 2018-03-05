//const req = require('../lib/req');
const model = require('../model');
const App = require('./app');
const Lend = model.lend;

let __error__ = Object.assign({}, App.error);

class Module extends App {
    constructor() {
        super([]);
        this.name = '借书记录';
    }

    get error() {
        return __error__;
    }

    get status() {
        return {
            application: 1, // 申请
            lent: 2,        // 借出
            reject: 3,      // 驳回
            remand: 4,      // 归还
        };
    }

    async new(data) {
        try {
            return this.okcreate(await super.new(data, Lend));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async set(data) {
        try {
            // 借阅记录仅允许修改借阅状态与备注
            data = App.filter(data, ['status', 'remark', 'id']);
            return this.okupdate(await super.set(data, Lend));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async del(data) {
        try {
            let book = await super.del(data, Lend);
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
        };

        try {
            let queryData = await super.query(
                data, Lend, ops
            );
            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            throw (err);
        }
    }
    
}

module.exports = Module;