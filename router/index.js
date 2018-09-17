const Router = require('koa-router');
const Login = require('./Auth/login');
const Register = require('./Auth/register');
const Auth = require('./Auth/auth');
let router = new Router();
router.use('/auth', Login.routes(), Login.allowedMethods());
router.use('/auth', Register.routes(), Register.allowedMethods());
router.use('/auth', Auth.routes(), Auth.allowedMethods());
module.exports = router;