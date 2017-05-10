var db = require('./db');
var util = require('util');
var prefix = require("./config").prefix;
var errhelper = require('./error');

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
    new: function (data, callback) {
        var keys = [ "dbid", "img", "name", "author", "page", "pub", "ISBN", "pubdate" ];
        var id = -1;

        if (!db.haskeys(data, keys)) {
            callback(data, errhelper.param);            
            return false;
        }

        db.connect();
        db.insert(prefix + "book_data", db.filiter(data, keys), function (err, rows, fields) {
            id = rows.insertId;
            callback(data, err ? errhelper.db(err) : errhelper.ok('新增', id));
        });
        db.end();
        return true;
    },
    update: function (data, where, callback) {
        var keys = [ "dbid", "img", "name", "author", "page", "pub", "ISBN", "pubdate", "isRead", "valid" ];
        var whkeys = [ "id", "dbid", "name", "author", "pub", "ISBN", "isRead", "valid" ];
        var mats = [ '=', '=', 'like', 'like', 'like', 'like', '=', '=', '=' ];
        var id = -1;

        if (where.length == 0 || data.length == 0) {
            callback(id, errhelper.param);            
            return false;
        }

        var whlist = db.filiter(where, whkeys);
        for (var k in whlist) {
            var mat = mats[whkeys.indexOf(k)]
            var val = whlist[k];
            if (mat == 'like') val = '%' + val + '%';
            where[k] = { val: val, mat: mat };
        }

        db.update(prefix + "book_data", db.filiter(data, keys), where, function (err, rows, fields) {
            callback(data, err ? errhelper.db(err) : errhelper.ok('更新', rows.affectedRows));
        });
    },
    query: function (query, callback) {
        var whkeys = [ "id", "dbid", "name", "author", "pub", "ISBN", "isRead" ];
        var mats = [ '=', '=', 'like', 'like', 'like', 'like', '=', '=' ];
        var id = -1;

        var page = this.page(query.index, query.count);

        var whlist = db.filiter(query, whkeys);
        query = [];
        for (var k in whlist) {
            var mat = mats[whkeys.indexOf(k)]
            var val = whlist[k];
            if (mat == 'like') val = '%' + val + '%';
            query[k] = { val: val, mat: mat };
        }

        if (query['valid'] == undefined) 
            query['valid'] = { mat: '=', val: '1' }; // 如果未指定，则强制返回有效图书

        var tblend = prefix + 'book_lend';
        var tbdata = prefix + 'book_data';
        var sql = 'SELECT *, \
        IFNULL((SELECT ld.`valid` FROM `' + tblend + '` AS ld WHERE ld.`book` = bk.`id` AND ld.`valid` != -2 ORDER BY `lenddate` DESC limit 1 ), 0) isLend, \
        IFNULL((SELECT ld.`id` FROM `' + tblend + '` AS ld WHERE ld.`book` = bk.`id` AND ld.`valid` != -2 ORDER BY `lenddate` DESC limit 1 ), 0) Lend_Id \
        FROM `' + tbdata + '` AS bk ';
        db.select(sql, query, page, function (err, rows, fields) {
            callback(query, err ? errhelper.db(err) : errhelper.ok('查询', book.row2data(rows)));
        });
    }, 

    delete: function (id, callback) {
        this.update({valid: 0}, {id: id}, callback);
    },

    page: function(index, count) {
        var sql = "";
        index = index || 0;
        if(index != 0 && count > 0) sql = " limit " + parseInt(index) + "," + paseInt(count);
        else if(count > 0) sql = " limit " + parseInt(count);
        return sql;
    },

    row2data: function (rows) {
        var data = [];
        var teams = {};
        var keys = [ "id", "dbid", "img", "name", "author", "pages", "publisher", "ISBN", "pubdate", "isRead", "isLend", "Lend_Id", "valid" ];

        for (var i = 0; i < rows.length; i++) {
            data[i] = db.filiter(rows[i], keys);
        }
        return data;
    },


};

module.exports = book;