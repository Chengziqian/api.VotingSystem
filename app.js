const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Router = require('./router/index');
let cc;
try {
  cc = require('./.config')
} catch (e) {
  cc = require('./.config.example')
}
const handler = async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.response.status = e.statusCode || e.status || 500;
    ctx.response.body = e;
  }
};

const app = new Koa();
app.use(logger());
app.use(bodyParser());
app.use(handler);
app.use(Router.routes());
app.use(Router.allowedMethods());


app.listen(cc.port || process.env.PORT);
console.log('app started at port '+ cc.port || process.env.PORT +'...');