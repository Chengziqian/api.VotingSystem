const Router = require('koa-router');
const CheckLogined = require('../../middleware/CheckLogined');
const validate = require('../../libs/validate');
const DB = require('../../models');
let router = new Router();

let valid = {
  name: [{type:'required'},{type:'string'}],
  type: [{type: 'string'},{type: 'required'},{type: 'available', available: ['users', 'options']}],
  content: [{type: 'array'}, {type: 'required'}]
};

router.post('/', CheckLogined, async (ctx, next) => {
  validate(ctx.request.body, valid, function (err) {
    if (err) ctx.throw(422, err);
  });
  return next();
}, async (ctx, next) => {
  let t;
  let options = ctx.request.body.content;
  await (async () => {
    try {
      t = await DB.sequelize.transaction();
      let group = await DB.Group.create({name: ctx.request.body.name, type: ctx.request.body.type}, {transaction: t});
      await group.setUser(ctx.USER, {transaction: t});
      switch (ctx.request.body.type) {
        case 'users':
          let index = options.map(o => ({id: o}));
          console.log(index);
          let users = await DB.User.findAll({where: {[DB.sequelize.Op.or]: index}, transaction: t});
          await group.addMembers(users, {transaction: t});
          break;
        case 'options':
          for (let i = 0; i < options.length; i++) {
            let option = await DB.Pre_Option.create({name: options[i]}, {transaction: t});
            await group.addOptions([option], {transaction: t})
          }
          break;
        default:
          break;
      }
      await t.commit();
      ctx.response.status = 200;
    } catch (e) {
      await t.rollback();
      ctx.throw(e)
    }
  })()
});

router.get('/', CheckLogined, async (ctx, next) => {
  let groups = await ctx.USER.getGroups();
  groups = groups.map(o => {
    delete o.dataValues['user_id'];
    return o
  });
  ctx.response.body = groups;
});

module.exports = router;