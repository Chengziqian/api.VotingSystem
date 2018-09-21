const Router = require('koa-router');
const CheckLogined = require('../../middleware/CheckLogined');
let router = new Router();

router.get('/', CheckLogined, async function (ctx, next) {
  let data = ctx.USER;
  delete data.dataValues['password'];
  ctx.response.status = 200;
  ctx.response.body = data;
});

module.exports = router;