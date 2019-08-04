const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    userId: {
        type: db.ID,
        comment: '用户ID'
    },
    dbId: {
        type: db.STRING(20),
        comment: '豆瓣ID'
    },
    img: {
        type: db.STRING(400),
        comment: '封面图'
    },
    name: {
        type: db.STRING(200),
        comment: '书名'
    },
    author: {
        type: db.STRING(100),
        comment: '作者'
    },
    publisher: {
        type: db.STRING(100),
        comment: '出版社'
    },
    page: {
        type: db.INTEGER,
        comment: '页数'
    },
    ISBN: {
        type: db.STRING(100),
        comment: 'ISBN码'
    },
    pubDate: {
        type: db.STRING(20),
        comment: '出版日期',
        field: 'pub_date'
    },
    status: {
        type: db.INTEGER,
        comment: '图书状态',
        defaultValue: 0
    }
};
let table_name = prefix + 'book_info';
module.exports = db.defineModel(table_name, orm, {
    comment: '图书表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};