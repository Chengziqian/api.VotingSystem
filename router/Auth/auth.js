const Router = require('koa-router');
const DB = require('../../libs/DB_Service');
const CheckLogined = require('../../middleware/CheckLogined');
let router = new Router();

router.get('/', CheckLogined, async function (ctx, next) {
  let data = ctx.request.USER;
  delete data['password'];
  ctx.response.status = 200;
  ctx.response.body = data;
});

module.exports = router