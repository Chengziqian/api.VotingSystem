const mysql = require('mysql');
let config;
try {
  config = require('../database.json')
} catch (e) {
  config = require('../database.json.example')
}

function createConnection(config) {
  let pool = mysql.createPool({
    host: config.local.host,
    user: config.local.user,
    password: config.local.password,
    database: config.local.database,
    multipleStatements: config.local.multipleStatements,
    dateStrings: true
  });
  return {
    POOL: pool,
    INSERT: function (tableName, data) {
      return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          connection.query('INSERT INTO ?? SET ?', [tableName, data], function (err, res, field) {
            connection.release();
            if (err) reject(err);
            else resolve(res);
          });
        });
      })
    },
    DELETE: function (tableName, findFieldName, findValue) {
      return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          connection.query('DELETE FROM ?? WHERE ?? = ?', [tableName, findFieldName, findValue],
            function (err, res, field) {
              connection.release();
              if (err) reject(err);
              else resolve(res);
            });
        });

      });
    },
    SAVE: function (tableName, findFieldName, findValue, changeData) {
      return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          connection.query('UPDATE ?? SET ? WHERE ?? = ?',[tableName, changeData, findFieldName, findValue],
            function (err, res, field) {
              connection.release();
              if (err) reject(err);
              else resolve(res);
            });
        });
      });
    },
    SAVE_IN_CONDITIONS: function (tableName, conditionsObj, changeData) {
      let sql = '';
      for (let key in conditionsObj) {
        let s = " ?? = ? AND";
        if (conditionsObj.hasOwnProperty(key))
          s = mysql.format(s, [key, conditionsObj[key]])
        sql += s;
      }
      sql = sql.slice(0, sql.length - 3);
      let table_sql = 'UPDATE ?? SET ? WHERE';
      table_sql = mysql.format(table_sql, [tableName, changeData]);
      console.log(table_sql + sql);
      return new Promise ((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          connection.query(table_sql + sql, (err, res, field) => {
            connection.release();
            if (err) reject(err);
            else resolve(res);
          })
        });
      })
    },
    JOIN_GET: function(relatedTableName, getTableName, foreignKey, findField ,findValue) {
      return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          let sql = "SELECT DISTINCT b.* FROM ?? a JOIN ?? b ON a.?? = b.`id` WHERE ?? = ?";
          let inserts = [relatedTableName, getTableName, foreignKey, findField, findValue];
          sql = mysql.format(sql, inserts);
          connection.query(sql, function (err, res, field) {
            connection.release();
            if (err) reject(err);
            else resolve(res);
          })
        });
      })
    },
    GET: function (tableName, findFieldName, findValue, options) {
      return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          let sql;
          if (options && options === 'first'){
            sql = 'SELECT * FROM ?? WHERE ?? = ? ORDER BY `create_time` DESC LIMIT 1';
          } else {
            sql = 'SELECT * FROM ?? WHERE ?? = ?';
          }
          connection.query(sql, [tableName, findFieldName, findValue],
            (err, res, field) => {
              connection.release();
              if (err) reject(err);
              else resolve(res);
            });
        });
      });
    },
    GET_IN_CONDITIONS: function (tableName, conditionsObj_IN_AND, conditionsObj_IN_OR) {
      let sql_and = '';
      let sql_or = '';
      if (conditionsObj_IN_AND) {
        for (let key in conditionsObj_IN_AND) {
          let s = " ?? = ? AND";
          if (conditionsObj_IN_AND.hasOwnProperty(key))
            s = mysql.format(s, [key, conditionsObj_IN_AND[key]])
          sql_and += s;
        }
        sql_and = sql_and.slice(0, sql_and.length - 3);
      }
      if (conditionsObj_IN_OR) {
        for (let key in conditionsObj_IN_OR) {
          let s = " ?? = ? OR";
          if (conditionsObj_IN_OR.hasOwnProperty(key))
            s = mysql.format(s, [key, conditionsObj_IN_OR[key]])
          sql_or += s;
        }
        sql_or = sql_or.slice(0, sql_or.length - 3);
      }
      let sql_end;
      if (sql_and && sql_or) {
        sql_end = sql_and + " OR " + sql_or;
      } else if (sql_and) sql_end = sql_and;
      else sql_end = sql_or;
      let table_sql = 'SELECT * FROM ?? WHERE';
      table_sql = mysql.format(table_sql, [tableName]);
      return new Promise ((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          connection.query(table_sql + sql_end, (err, res, field) => {
            connection.release();
            if (err) reject(err);
            else resolve(res);
          })
        });
      })
    },
    GET_ALL: function (tableName) {
      return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          connection.query('SELECT * FROM ??', [tableName],
            (err, res, field) => {
              connection.release();
              if (err) reject(err);
              else resolve(res);
            });
        });
      });
    },
    DELETE_EXPIRED: function (tableName) {
      return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          connection.query('DELETE FROM ?? WHERE UNIX_TIMESTAMP(`expired_time`) < UNIX_TIMESTAMP()',[tableName],
            function (err, res, field) {
              connection.release();
              if (err) reject(err);
              else resolve(res);
            });
        });
      });
    },
    SERACH: function (tableName, SEARCH_CONDITIONS, filed) {
      return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
          if (err) reject(err);
          let conditions = 'WHERE ?? ' + SEARCH_CONDITIONS;
          let sql = mysql.format(conditions, [filed]);
          let pre_sql = "SELECT * FROM ?? ";
          pre_sql = mysql.format(pre_sql, tableName);
          connection.query(pre_sql + sql, (err, res, field) => {
            connection.release();
            if (err) reject(err);
            else resolve(res);
          })
        })
      })
    }
  };
}

let DB = createConnection(config);
module.exports = DB;


