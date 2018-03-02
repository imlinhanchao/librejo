const db = require('../db');
const prefix = require('../config').db.prefix;
let orm = {
    id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '唯一id，自增长'
    },
    username: {
        type: db.STRING(20),
        comment: '用户名'
    },
    passwd: {
        type: db.STRING(64),
        comment: '密码'
    },
    nickname: {
        type: db.STRING(20),
        comment: '昵称'
    },
    email: {
        type: db.STRING(100),
        comment: '邮箱'
    },
    phone: {
        type: db.STRING(20),
        comment: '手机'
    },
    motto: {
        type: db.STRING(200),
        comment: '签名'
    },
};
let table_name = prefix + 'user_info';
module.exports = db.defineModel(table_name, orm, {
    comment: '用户表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};