const Router = require('koa-router');
const uuid = require('uuid/v1');
const crypto = require('crypto');
const validate = require('../../libs/validate');
const DB = require('../../models');
const moment = require('moment');
let router = new Router();

let register_valid = {
  username: [{type:'required'},{type:'string'}],
  password: [{type:'required'},{type: 'string'}]
};

let getClientIp = function (req) {
  let ip = req.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
  if (proxyType === 'nginx') {
    ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || ip;
  }
  return ip;
};

router.post('/register', async (ctx, next) => {
  validate(ctx.request.body, register_valid, function (err) {
    if (err) ctx.throw(422, err);
  });
  return next();
}, async (ctx, next) => {
  let pwd = crypto.createHash('sha256').update(ctx.request.body.password).digest('hex');
  let data = {
    username: ctx.request.body.username,
    password: pwd,
    access: 0
  };
  let t = await DB.sequelize.transaction();
  await (async () => {
    try {
      let user = await DB.User.create(data, {transaction: t});
      let tokenData = {
        token: uuid(),
        ip: getClientIp(ctx.request),
        expired_time: moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss')
      };
      let token = await DB.Api_Token.create(tokenData, {transaction: t});
      await token.setUser(user, {transaction: t});
      await t.commit();
      ctx.response.body = {api_token: token.token, user: {
          id: user.id,
          username: user.username,
          access: user.access
        }};
    } catch (e) {
      await t.rollback();
      if (e.name === "SequelizeUniqueConstraintError" && e.errors[0].path === "username") {
        ctx.throw(422, {inputError: {username: ['用户名重复']}})
      } else {
        ctx.throw(e)
      }
    }
  })()
});

module.exports = router;