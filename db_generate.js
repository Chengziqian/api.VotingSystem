const color = require('colors');
const mysql = require('mysql');
const readline = require('readline');
const env = process.env.NODE_ENV || 'development';
let config;
try {
  config = require(__dirname + '/./config/config.json')[env]
} catch (e) {
  throw "NOT FOND config.json"
}
let read = readline.createInterface({
  input:process.stdin,
  output:process.stdout
});
let connection = mysql.createConnection({
  host: config.host,
  user: config.username,
  password: config.password,
  multipleStatements: true
});
function generateDB(data) {
  read.question(("Continuing execution will drop the database named").red + (" [" + data.database +
    "] ").magenta + ("and create new database named").red + (" [" + data.database + "] ").magenta +
    ("which is empty.\n").red +
    ("ARE YOU SURE?[y/Y]").blue + "\n"
    ,function(answer) {
      if (answer === 'Y' || answer === 'y') {
        let sql_drop = "DROP DATABASE IF EXISTS `" + data.database + "`;";
        let sql_create = " CREATE DATABASE `" + data.database + "`" + "DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci";
        connection.query(sql_drop + sql_create, function (err, rows, fields) {
          if (err) {
            throw err;
          }
          console.log(("Create new database named ").green + (data.database).magenta + (" successfully!").green);
          process.exit(0)
        });
      } else {
        console.log("process stop".green)
        read.close();
        process.exit(0)
      }
    }
  );
}
generateDB(config);
