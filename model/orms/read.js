const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    bookId: {
        type: db.ID,
        comment: '图书ID'
    },
    ISBN: {
        type: db.STRING(100),
        comment: 'ISBN码'
    },
    status: {
        type: db.INTEGER,
        comment: '读书状态'
    },
    page: {
        type: db.INTEGER,
        comment: '当前读到的页码'
    }
};
let table_name = prefix + 'read_record';
module.exports = db.defineModel(table_name, orm, {
    comment: '读书状态记录表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};