'use strict';
module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define('option', {
    count: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    underscored: true
  });
  Option.associate = function(models) {
    Option.belongsTo(models.Vote)
  };
  return Option;
};