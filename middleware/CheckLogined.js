const DB = require('../models');
const moment = require('moment');

let getClientIp = function (req) {
  return req.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};

module.exports = async function (ctx, next) {
  let token = ctx.request.headers['api-token'] || ctx.request.headers['Api-Token'];
  let api_token = {};
  let res = await DB.Api_Token.findOne({where: {token: token}});
  if (!res) ctx.throw(401, '请先登录');
  else {
    api_token = res;
    old_token = api_token.token;
    if ((api_token.expired_time === null || moment(api_token.expired_time).isAfter(moment())) &&
      api_token.ip === getClientIp(ctx.request)) {
      let user = await DB.User.findOne({where: {id: res.user_id}});
      if (!user) ctx.throw(401, '请先登录');
      else {
        ctx.USER = user;
        return next();
      }
    } else {
      ctx.throw(401, '请先登录');
    }
  }
};