const db = require('../db');
const prefix = require('../config').db.prefix;
let orm = {
    bookId: {
        type: db.ID,
        comment: '图书ID'
    },
    page: {
        type: db.INTEGER,
        comment: '当前读到的页码'
    },
    ISBN: {
        type: db.STRING(100),
        comment: 'ISBN码'
    },
    content: {
        type: db.TEXT,
        comment: '笔记'
    },
    favcount: {
        type: db.INTEGER,
        comment: '收藏数',
        defaultValue: 0
    }
};
let table_name = prefix + 'book_note';
module.exports = db.defineModel(table_name, orm, {
    comment: '读书笔记表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};