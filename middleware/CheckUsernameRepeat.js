const DB = require('../libs/DB_Service');

module.exports = async function (ctx, next) {
  let res = await DB.GET('users','username', ctx.request.body.username);
  if (res.length !== 0) ctx.throw(422, {inputError: {email: ["email is repeated"]}});
  else return next();
};