'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    access: DataTypes.INTEGER
  }, {
    underscored: true
  });
  User.associate = function(models) {
    User.hasMany(models.Vote);
    User.hasOne(models.Api_Token);
    User.hasMany(models.Group);
    User.belongsToMany(models.Group, {as: 'group', through: 'members_groups', foreignKey: 'member_id', otherKey: 'group_id'})
  };
  return User;
};