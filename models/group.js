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
    Group.belongsToMany(models.User, {as: {singular: 'Member', plural: 'Members'}, through: 'members_groups' ,foreignKey: 'group_id', otherKey: 'member_id'});
    Group.hasMany(models.Pre_Option, {as: { singular: 'Option', plural: 'Options'}, foreignKey: 'group_id'})
  };
  return Group;
};