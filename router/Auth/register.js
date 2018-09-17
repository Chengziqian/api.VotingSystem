const Router = require('koa-router');
const CheckUseranemRepeat = require('../../middleware/CheckUsernameRepeat');
const crypto = require('crypto');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');
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
}, CheckUseranemRepeat, async (ctx, next) => {
  let pwd = crypto.createHash('sha256').update(ctx.request.body.password).digest('hex');
  let data = {
    username: ctx.request.body.username,
    password: pwd
  };
  await DB.INSERT('users', data);
  ctx.response.status = 200;
});

module.exports = router;