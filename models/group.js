'use strict';
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('group', {
    type: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    underscored: true
  });
  Group.associate = function(models) {
    Group.belongsTo(models.User, {as: 'user', foreignKey: 'user_id'});
    Group.belongsToMany(models.User, {as: 'member', through: 'members_groups' ,foreignKey: 'group_id', otherKey: 'member_id'})
  };
  return Group;
};