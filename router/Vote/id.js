const Router = require('koa-router');
const CheckLogined = require('../../middleware/CheckLogined');
const validate = require('../../libs/validate');
const DB = require('../../models');
const moment = require('moment');
let router = new Router();

router.get('/:id/result', CheckLogined, async (ctx, next) => {
  let vote = await DB.Vote.findById(ctx.params.id);
  if (await ctx.USER.hasHasVote(vote)) {
    ctx.response.body = await vote.getOptions({attributes: ['id', 'count', 'name']});
  } else {
    ctx.throw(402, '请先投票');
  }
});

router.get('/:id/isVoted', CheckLogined, async (ctx, next) => {
  let vote = await DB.Vote.findById(ctx.params.id);
  if (await ctx.USER.hasHasVote(vote)) ctx.response.body = {isVoted: true};
  else {
    ctx.response.body = {isVoted: false};
  }
});

router.get('/:id', CheckLogined, async (ctx, next) => {
  ctx.response.body = await DB.Vote.findById(ctx.params.id, {include: [{model: DB.Option, attributes:['id', 'name']}]})
});

router.del('/:id', CheckLogined, async (ctx, next) => {
  let vote = await DB.Vote.findById(ctx.params.id);
  if (await ctx.USER.hasVote(vote)) {
    await vote.destroy();
    ctx.response.status = 200;
  } else {
    ctx.throw(402, '您没有权限删除不属于您的投票')
  }
});

let valid = {
  options: [{type: 'array'}, {type: 'required'}]
};

router.post('/:id', CheckLogined, async (ctx, next) => {
  validate(ctx.request.body, valid, function (err) {
    if (err) ctx.throw(422, err)
  });
  return next()
}, async (ctx, next) => {
  let vote = await DB.Vote.findById(ctx.params.id);
  if (!vote) {
    ctx.throw(422, {inputError: {vote: ['比赛不存在']}});
  } else {
    if (!(moment().isBetween(moment(vote.start_time), moment(vote.end_time)))) {
      ctx.throw(400, '投票未开始或已过期');
    } else {
      if (ctx.request.body.options.length !== vote.count) {
        ctx.throw(422, {inputError: {options: ['输入不合法']}})
      } else {
        if (await ctx.USER.hasHasVote(vote)) ctx.throw(402, '您已投票');
        else {
          await (async () => {
            let t;
            try {
              t = await DB.sequelize.transaction();
              for (let i = 0; i < ctx.request.body.options.length; i++) {
                let o = await DB.Option.findById(+ctx.request.body.options[i], {transaction: t});
                await o.update({count: (+o.count) + 1}, {transaction: t});
              }
              await ctx.USER.addHasVotes([vote]);
              await t.commit();
              ctx.response.status = 200;
            } catch (e) {
              await t.rollback();
              ctx.throw(e);
            }
          })()
        }
      }
    }
  }
});

module.exports = router;