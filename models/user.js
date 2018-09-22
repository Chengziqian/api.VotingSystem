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
    User.belongsToMany(models.Group, {as: {singular: 'Group', plural: 'Groups'}, through: 'members_groups', foreignKey: 'member_id', otherKey: 'group_id'});
    User.belongsToMany(models.Vote, {as: {singular:'HasVote', plural: 'HasVotes'}, through: 'votedMembers_votes', foreignKey: 'votedMember_id', otherKey: 'vote_id'})
  };
  return User;
};