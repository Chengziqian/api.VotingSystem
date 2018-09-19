const Router = require('koa-router');
const validate = require('../../libs/validate');
const CheckLogined = require('../../middleware/CheckLogined');
const DB = require('../../libs/DB_Service');
let router = new Router();

let valid = {
  name: [{type:'required'},{type:'string'}],
  introduction: [{type: 'string'}],
  start_time: [{type: 'required'},{type: 'date'}],
  end_time: [{type: 'date'},{type: 'required'}],
  type: [{type: 'integer'},{type: 'required'}],
  count: [{type: 'integer'},{type: 'required'}],
  member: [{type: 'array'}]
};

router.post('/', CheckLogined, async (ctx, next) => {
  validate(ctx.request.body, valid, function (err) {
    if (err) ctx.throw(422, err);
  });
  return next();
}, async (ctx, next) => {
  let data = ctx.request.body;
  let res = await DB.INSERT('vote', {
    name: data.name,
    introduction: data.introduction || null,
    start_time: data.start_time,
    end_time: data.end_time,
    type: data.type,
    count: data.count,
    create_user_id: ctx.USER.id
  });
  if (data.hasOwnProperty('member')) {
    let member = JSON.parse(data.member);
    for (let i = 0; i < member.length; i++) {
      await DB.INSERT('users_vote', {user_id: member[i], vote_id: res.insertId});
    }
  }
  ctx.response.status = 200;
});

router.get('/', CheckLogined, async function (ctx, next) {
  ctx.response.body = await DB.GET_IN_CONDITIONS('vote', null, {create_user_id: ctx.USER.id, type: 0});
});

module.exports = router;