//const req = require('../lib/req');
const model = require('../model');
const App = require('./app');
const Account = model.account;

const __salt = '00b6652f-0520-4941-94b0-b51d30f97df8';

let __error__ = Object.assign({}, App.error);
__error__.verify = App.error.reg('帐号或密码错误！');
__error__.existed = App.error.existed('帐号');
__error__.notexisted = App.error.existed('帐号', false);

class Module extends App {
    constructor(session) {
        super([
            { fun: App.ok, name: 'oklogin', msg: '登录成功' },
            { fun: App.ok, name: 'oklogout', msg: '登出成功' },
        ]);
        this.session = session;
        this.name = '用户';
    }

    get error() {
        return __error__;
    }

    async login(data) {
        const keys = ['user', 'passwd'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, keys);

        try {
            let account = await Account.findOne({
                where: {
                    username: data.user
                }
            });

            if (!account) {
                throw (this.error.verify);
            }

            let sha256 = crypto.createHash('sha256');
            let passwd = sha256.update(data.passwd + __salt).digest('hex');

            if (account.passwd != passwd) {
                throw (this.error.verify);
            }

            account.passwd = undefined;
            this.session.account_login = App.filter(account, Account.keys());
            return this.oklogin(this.session.account_login);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async logout() {
        if (!this.session || !this.session.account_login) {
            throw (this.error.nologin);
        }
        this.session.account_login = undefined;
        return this.oklogout();
    }

    async info() {
        if (!this.session || !this.session.account_login) {
            throw (this.error.nologin);
        }
        return this.okread(App.filter(this.session.account_login, Account.keys()));
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