const Router = require('koa-router');
const CheckLogined = require('../../middleware/CheckLogined');
const DB = require('../../models');
let router = new Router();

router.get('/:id', CheckLogined, async (ctx, next) => {
  let group = await DB.Group.findById(ctx.params.id);
  if (!group) ctx.throw(422, {inputError: {id: ['无此群租']}});
  else {
    switch (group.type) {
      case 'users':
        let users = await group.getMembers({attributes: ['id']});
        group.dataValues.content = users;
        break;
      case 'options':
        let options = await group.getOptions({attributes: ['id', 'name']});
        group.dataValues.content = options;
        break;
      default:
        group.dataValues.content = null;
        break;
    }
    ctx.response.body = group;
  }
});

router.put('/:id', CheckLogined, async (ctx, next) => {
  let group = await DB.Group.findById(ctx.params.id);
  if (await ctx.USER.hasGroup(group)) {
    let t;
    let options = ctx.request.body.content;
    await (async () => {
      try {
        t = await DB.sequelize.transaction();
        await group.update({name: ctx.request.body.name, type: ctx.request.body.type});
        switch (ctx.request.body.type) {
          case 'users':
            let index = options.map(o => ({id: o}));
            let users = await DB.User.findAll({where: {[DB.sequelize.Op.or]: index}, transaction: t});
            await group.setMembers(users, {transaction: t});
            break;
          case 'options':
            let arr = [];
            for (let i = 0; i < options.length; i++) {
              let option = await DB.Pre_Option.create({name: options[i]}, {transaction: t});
              arr.push(option);
            }
            await group.setOptions(arr, {transaction: t});
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
  } else {
    ctx.throw(402, '您没有权限修改不属于您的预设')
  }
});

router.del('/:id', CheckLogined, async (ctx, next) => {
  let group = await DB.Group.findById(ctx.params.id);
  if (await ctx.USER.hasGroup(group)) {
    await group.destroy();
    ctx.response.status = 200;
  } else {
    ctx.throw(402, '您没有权限删除不属于您的预设')
  }
});

module.exports = router;