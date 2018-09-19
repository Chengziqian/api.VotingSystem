const Router = require('koa-router');
const CheckLogined = require('../../middleware/CheckLogined');
const crypto = require('crypto');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');

let router = new Router();

let valid = {
  password_old: [{type:'required'},{type:'string'}],
  password_new: [{type:'required'},{type: 'string'}]
};

router.put('/changePwd', CheckLogined, async function (ctx, next) {
  validate(ctx.request.body, valid, function (err) {
    if (err) ctx.throw(422, err);
  });
  return next();
}, async function (ctx, next) {
  let old_pwd = crypto.createHash('sha256').update(ctx.request.body.password_old).digest('hex');
  if (old_pwd === ctx.USER.password) {
    let pwd = crypto.createHash('sha256').update(ctx.request.body.password_new).digest('hex');
    await DB.SAVE('users', 'id', ctx.USER.id, {password: pwd});
    ctx.response.status = 200;
  } else {
    ctx.throw(422, {inputError: {password_old: ["旧密码不正确"]}})
  }
});

module.exports = router;