var mysql = require('mysql');
var conn = require("./config").db;

module.exports.mysql = mysql;
module.exports = mysql.createConnection(conn);
module.exports.insert = function(table, data, callback) {
    var queryHead = "INSERT INTO " + table + " (";
    var queryValue = " VALUES (";
    for (var key in data) {
        queryHead += "`" + key + "`,";
        if (data[key] != "now()")
            queryValue += "'" + data[key] + "',";
        else
            queryValue += data[key] + ",";
    }
    console.log(queryHead.replace(/^,|,$/g, '') + ")" + queryValue.replace(/^,|,$/g, '') + ")");
    return this.query( queryHead.replace(/^,|,$/g, '') + ")" + queryValue.replace(/^,|,$/g, '') + ")", callback );
}

module.exports.update = function (table, data, where, callback)
{
    var query = "UPDATE " + table + " SET ";
    for (var key in data) {
        query += "`" + key + "` = ";
        if (data[key] != "now()")
            query += "'" + data[key] + "',";
        else
            query += data[key] + ",";
    }
    query = query.replace(/^,|,$/g, '') + " WHERE 1=1 ";
    for (var key in where) {
        $query += "AND `" + key + "` = ";
        if (where[key] != "now()")
            query += "'" + where[key] + "'";
        else
            query += where[key];
    }
    //console.log(query);
    return this.query(query, callback);
}

module.exports.tran = function(tran, errCall) {
    var sql = this;
    sql.beginTransaction(function(err){
        if (err) {
            if(errCall) errCall(err);
        } else {
            tran(function(rollbackCall) {
                sql.rollback(function() {//如果失败回滚
                    if (rollbackCall) rollbackCall(err, rows, fields);
                });
            }, function(releaseCall) {
                sql.commit(function(err) {
                    if (err) {
                        conn.rollback(function() {
                            return errCall ? errCall(err) : false;
                        });
                    }
                });
                sql.release();
                if (releaseCall) releaseCall();
            });
        }
    });
}

module.exports.filiter = function(data, keys) {
    var d = {};
    if (!data) return d;
    for (var i = 0; i < keys.length; i++) {
        if (!data[keys[i]]) continue;
        d[keys[i]] = this.escape(data[keys[i]]);
    }
    return d;
}

module.exports.haskeys = function(data, keys) {
    if (!data) return false;    
    for (var i = 0; i < keys.length; i++) {
        if(undefined == data[keys[i]]) return false;
    }
    return true;
}

module.exports.onlykeys = function(data, keys) {
    if (!data) return false;    
    for (var key in data) {
        if(keys.indexOf(key) < 0) return false;
    }
    return true;
}

module.exports.rows2array = function(rows, keys) {
    var data = [];
    for (var i = 0; i < rows.length; i++) {
        data[i] = keys ? this.filiter(rows[i], keys) : rows[i];
    }
    return data;
}

module.exports.escape = function(val) {
    return mysql.escape(val).replace(/^'|'$/g, '')
}

