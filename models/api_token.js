'use strict';
module.exports = (sequelize, DataTypes) => {
  const Api_Token = sequelize.define('api_token', {
    token: DataTypes.STRING,
    ip: DataTypes.STRING,
    expired_time: DataTypes.DATE
  }, {
    underscored: true
  });
  Api_Token.associate = function(models) {
    Api_Token.belongsTo(models.User)
  };
  return Api_Token;
};