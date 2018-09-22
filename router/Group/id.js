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

module.exports = router;