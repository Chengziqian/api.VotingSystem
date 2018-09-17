const Router = require('koa-router');
const Auth = require('./Auth/login');
let router = new Router();
router.use('/auth', Auth.routes(), Auth.allowedMethods());

module.exports = router;