var db = require('./db');
var util = require('util');
var prefix = require("./config").prefix;

/*
{
    "dbid": "25927585",
    "img": "https://img3.doubanio.com/lpic/s27445100.jpg",
    "name": "代码之髓",
    "author": "[日] 西尾泰和",
    "page": "236",
    "pub": "人民邮电出版社",
    "ISBN": "9787115361530",
    "pubdate": "2014-8"
}*/

module.exports = {
    new: function(data, callback) {
        var keys = [ "dbid", "img", "name", "author", "page", "pub", "ISBN", "pubdate" ];
        var id = -1;

        db.connect();
        db.insert(prefix + "book_data", db.filiter(data, keys), function(err, rows, fields) {
            id = rows.insertId;
            callback(id, err);
        });
        db.end();
    }
};