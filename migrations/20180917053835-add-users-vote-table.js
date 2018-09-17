'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('users_vote', {
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    user_id: {type: 'int', notNull: true},
    vote_id: {type: 'int', notNull: true},
    create_time: {type: 'timestamp', notNull: true, defaultValue: 'CURRENT_TIMESTAMP'}
  });
};

exports.down = function(db) {
  return db.dropTable('users_races').then(function (res) {
  }, function (err) {
    throw err
  });
};

exports._meta = {
  "version": 1
};
