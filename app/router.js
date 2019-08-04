'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  // 特约店铺
  router.get('/renderHeatMap', controller.heatMap.store.index.index);
  router.get('/downloadFile', controller.heatMap.store.index.downTemplateFile);

  // 位置信息
  router.get('/renderHeatMapPositionExcel', controller.heatMap.position.index.index); // excel所有城市列
  router.get('/renderHeatMapPositionExcelSelf', controller.heatMap.position.index.indexSelfProvince); // excel本省份列
  router.get('/renderHeatMapPositionJSON', controller.heatMap.position.index.getJSON); // 值返回json数据

  // 路线派化-生成网页json
  router.get('/path/getJSON', controller.path.index.getJSON);
  // 路线派化-生成文件
  router.get('/path/createPath', controller.path.index.createPath);
  // 路线派化-生成文件并且下载压缩文件
  router.get('/path/createPathDown', controller.path.index.createPathDown);
  // 路线派化-下载模版文件
  router.get('/path/downTemplateFile', controller.path.index.downTemplateFile);

  // 居住常访
  router.get('/position/normal/renderHeatMapExcel', controller.heatMap.position.normal.index);

};
