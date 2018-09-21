const Router = require('koa-router');
// const CheckUseranemRepeat = require('../../middleware/CheckUsernameRepeat');
const crypto = require('crypto');
const validate = require('../../libs/validate');
const DB = require('../../models');
let router = new Router();

let register_valid = {
  username: [{type:'required'},{type:'string'}],
  password: [{type:'required'},{type: 'string'}]
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
    password: pwd
  };
  try {
    await DB.User.create(data);
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError" && e.errors[0].path === "username") {
      ctx.throw(422, {inputError: {username: ['用户名重复']}})
    } else {
      ctx.throw(e)
    }
  }
  ctx.response.status = 200;
});

module.exports = router;