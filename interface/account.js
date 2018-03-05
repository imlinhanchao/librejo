//const req = require('../lib/req');
const model = require('../model');
const App = require('./app');
const Account = model.account;

let __error__ = Object.assign({}, App.error);
const __salt = '00b6652f-0520-4941-94b0-b51d30f97df8';

class Module extends App {
    constructor() {
        super([]);
        this.name = '用户';
    }

    get error() {
        return __error__;
    }

    async new(data) {
        try {
            let sha256 = crypto.createHash('sha256');
            data.passwd = sha256.update(data.passwd + __salt).digest('hex');

            return this.okcreate(await super.new(data, Account, 'username'));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async set(data) {
        try {
            // 用户名不可更改
            data.username = undefined;
            return this.okupdate(await super.set(data, Account));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
    
    async query(data, onlyData = false) {
        // $ = like
        let ops = {
            nickname: App.ops.like,
        };

        try {
            let queryData = await super.query(
                data, Account, ops
            );
            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            throw (err);
        }
    }
    
}

module.exports = Module;