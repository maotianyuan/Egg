'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // router.get('/all', controller.all.all.index);
  router.get('/allspread', controller.allspread.allspread.index);

  router.get('/renderHeatMap', controller.heatMap.store.index.index);
  router.get('/downloadFile', controller.heatMap.store.index.downTemplateFile);

  router.get('/renderHeatMapPosition', controller.heatMap.position.index.index);

  router.get('/juzhu', controller.juzhu.juzhu.index);
};
