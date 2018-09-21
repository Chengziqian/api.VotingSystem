const Router = require('koa-router');
const validate = require('../../libs/validate');
const CheckLogined = require('../../middleware/CheckLogined');
const DB = require('../../models');
let router = new Router();

let valid = {
  name: [{type:'required'},{type:'string'}],
  introduction: [{type: 'string'}],
  start_time: [{type: 'required'},{type: 'date'}],
  end_time: [{type: 'date'},{type: 'required'}],
  count: [{type: 'integer'},{type: 'required'}],
  options: [{type: 'array'}, {type: 'required'}]
};

router.post('/', CheckLogined, async (ctx, next) => {
  validate(ctx.request.body, valid, function (err) {
    if (err) ctx.throw(422, err);
  });
  return next();
}, async (ctx, next) => {
  let data = ctx.request.body;
  let voteData = {
    name: data.name,
    introduction: data.introduction || null,
    start_time: data.start_time,
    end_time: data.end_time,
    count: data.count
  };
  let options = data.options;
  await (async () => {
    let t;
    try {
      t = await DB.sequelize.transaction();
      let vote = await DB.Vote.create(voteData, {transaction: t});
      await ctx.USER.addVotes([vote], {transaction: t});
      for (let i = 0; i < options.length; i++) {
        let option = await DB.Option.create({name: options[i]}, {transaction: t});
        await vote.addOptions([option], {transaction: t})
      }
      await t.commit();
    } catch (e) {
      console.log(e)
      await t.rollback();
    }
  })();
  ctx.response.status = 200;
});

router.get('/', CheckLogined, async function (ctx, next) {
  ctx.response.body = await DB.Vote.findAll();
});

module.exports = router;