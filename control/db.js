var mysql = require('mysql');
module.exports = mysql.createConnection(require("./config"));
module.exports.insert = function(table, data) {
    $queryHead = "INSERT INTO " + $table + " (";
    $queryValue = " VALUES (";
    for (key in data) {
        $queryHead += "`" + key + "`,";
        if(data[key] == "now()")
            $queryValue += "'" + data[key] + "',";
        else
            $queryValue += data[key] + ",";
    }
    return query( trim($queryHead, ",") + ")" + trim($queryValue, ",") + ")" );
}