var mysql = require('mysql');
var conn = require("./config").db;
module.exports = mysql.createConnection(conn);
module.exports.insert = function(table, data, callback) {
    var queryHead = "INSERT INTO " + table + " (";
    var queryValue = " VALUES (";
    for (var key in data) {
        queryHead += "`" + key + "`,";
        if(data[key] != "now()")
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
        if(data[key] != "now()")
            query += "'" + data[key] + "',";
        else
            query += data[key] + ",";
    }
    query = query.replace(/^,|,$/g, '') + " WHERE 1=1 ";
    for (var key in where) {
        $query += "AND `" + key + "` = ";
        if(where[key] != "now()")
            query += "'" + where[key] + "'";
        else
            query += where[key];
    }
    //console.log(query);
    return this.query(query, callback);
}

module.exports.tran = function(tran, errCall) {
    this.beginTransaction(function(err){
        if(err) {
            errCall(err);
        } else {
            tran(function(rollbackCall) {
                this.rollback(function() {//如果失败回滚
                    rollbackCall(err, rows, fields);
                });
            }, function(releaseCall) {
                this.commit(function(err) {
                    if (err) {
                        conn.rollback(function() {
                            return errCall(err);
                        });
                    }
                });
                this.release();
                releaseCall();
            });
        }
    });
}

module.exports.filiter = function(data, keys) {
    var d = {};
    for (var i = 0; i < keys.length; i++) {
        d[keys[i]] = mysql.escape(data[keys[i]]);
    }
    return d;
}