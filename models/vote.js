'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('vote', {
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    name: DataTypes.STRING,
    introduction: DataTypes.TEXT,
    count: DataTypes.INTEGER
  }, {
    underscored: true
  });
  Vote.associate = function(models) {
    Vote.belongsTo(models.User);
    Vote.hasMany(models.Option)
  };
  return Vote;
};