const color = require('colors');
const env = process.env.NODE_ENV || 'development';
let cc = {};
try {
  cc = require(__dirname + '/./config/config.json')[env];
} catch (e) {
  cc.app_port = 4000;
  console.warn(('[WRONING]: File config.josn Not Found in ./config, DatabaseService will be offline').red);
}
const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Router = require('./router/index');
const AddTokenTime = require('./middleware/AddTokenTime');

const handler = async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    console.log(e);
    ctx.response.status = e.statusCode || e.status || 500;
    if (ctx.response.status === 422) ctx.response.body = e.inputError;
    else if (ctx.response.status !== 500) ctx.response.body = e;
    else ctx.response.body = e
  }
};

const app = new Koa();
app.use(logger());
app.use(bodyParser());
app.use(handler);
app.use(AddTokenTime);
app.use(Router.routes());
app.use(Router.allowedMethods());


app.listen(cc.app_port || process.env.PORT);
console.log('app started at port '+ cc.app_port || process.env.PORT +'...');