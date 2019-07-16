'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/all', controller.all.all.index);
  router.get('/juzhu', controller.juzhu.juzhu.index);
};
