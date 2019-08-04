'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  // 热力图-特约店铺-生成网页json
  router.get('/heatMap/store/getJSON', controller.heatMap.store.index.getJSON);
  // 热力图-特约店铺--生成文件
  router.get('/heatMap/store/createPath', controller.heatMap.store.index.createPath);
  // 热力图-特约店铺--生成文件并且下载压缩文件
  router.get('/heatMap/store/createPathDown', controller.heatMap.store.index.createPathDown);
  // 热力图-特约店铺-单独压缩下载
  router.get('/heatMap/store/compress', controller.heatMap.store.index.compress);
  // 热力图-特约店铺-下载模版文件
  router.get('/heatMap/store/downTemplateFile', controller.heatMap.store.index.downTemplateFile);

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
