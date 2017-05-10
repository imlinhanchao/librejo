var mysql  = require('mysql');

var connection = mysql.createConnection({     
  host     : '192.168.0.200',       
  user     : 'root',              
  password : 'abcd',       
  port: '3306',                   
  database: 'nodesample', 
}); 