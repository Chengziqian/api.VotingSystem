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
  let api_token;
  let old_token;
  let res = await DB.Api_Token.findOne({where: {token: token}});
  if (!res) return next();
  else {
    api_token = res;
    old_token = api_token.token;
    let user = await DB.User.findOne({where: {id: res.user_id}});
    if (!user) return next();
    else {
      if (user.id === api_token.user_id &&
        (api_token.expired_time === null || moment(api_token.expired_time).isAfter(moment())) &&
        api_token.ip === getClientIp(ctx.request)){
        api_token.expired_time =
          api_token.expired_time === null ? null : moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss');
        await DB.Api_Token.update({expired_time: api_token.expired_time}, {where: {token: old_token}});
        return next();
      } else {
        return next();
      }
    }
  }
};