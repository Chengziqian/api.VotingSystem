const DB = require('../libs/DB_Service');
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
  let res = await DB.GET('api_token', 'token', token, 'first');
  if (res.length === 0) ctx.throw(401, '请先登录');
  else {
    api_token = res[0];
    old_token = api_token.token;
    if ((api_token.expired_time === null || moment(api_token.expired_time).isAfter(moment())) &&
      api_token.ip === getClientIp(ctx.request)) {
      let user = await DB.GET('users', 'id', res[0].user_id);
      if (user.length === 0) ctx.throw(401, '请先登录');
      else {
        ctx.USER = user[0];
        return next();
      }
    } else {
      ctx.throw(401, '请先登录');
    }
  }
};