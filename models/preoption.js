'use strict';
module.exports = (sequelize, DataTypes) => {
  const PreOption = sequelize.define('pre_option', {
    name: DataTypes.STRING
  }, {
    underscored: true
  });
  PreOption.associate = function(models) {
    PreOption.belongsTo(models.Group)
  };
  return PreOption;
};