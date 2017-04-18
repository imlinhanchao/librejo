var db = require('./db');
var util = require('util');
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

var book = {
    new: function(data) {
        db.connect();
        db.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
            if (err) throw err;
            console.log('The solution is: ', rows.insertId);
        });
        db.end();
    }
};