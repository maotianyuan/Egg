'use strict';
const Controller = require('egg').Controller;
const xlsx = require('xlsx');
const { getView } = require('../../../view/heatMap/position/position-has-pointer');
const { getViewAmap3D } = require('../../../view/heatMap/position/position-has-pointer-amap-3d');
const { getViewAmap } = require('../../../view/heatMap/position/position-has-pointer-amap');
const { HEAMP_MARKER_ICON } = require('../../../lib/utils');
const PAGE_TAG = 'heatMap';
const TYPE = 'position';
const isSelfProvince = false; // 是否只获取本省内Excel数据，默认全部

class PositionController extends Controller {
  /**
   * 生成文件
   */
  async createPath() {
    const { ctx } = this;
    const { type = '' } = this.ctx.query;
    let handlerFormatFun = getView;
    if (type === 'amap') {
      handlerFormatFun = getViewAmap();
    } else if (this.mapType === 'amap3D') {
      handlerFormatFun = getViewAmap3D();
    }
    const data = await this.service.excel.getExcelsData({ folderName: PAGE_TAG, type: TYPE, handlerFormat: this.formatData }); // 获取PAGE_TAG文件夹下，所有Excel格式化后数据
    await this.service.fileAsync.writeFilesHTML({ data, folderName: PAGE_TAG, type: TYPE, templateView: handlerFormatFun }); // 生成对应html文件
    await this.service.fileAsync.writeFilesJS({ data, folderName: PAGE_TAG, type: TYPE }); // 生成js文件
    ctx.body = 'success';
    ctx.status = 200;
  }
  /**
   * 生成文件并且下载压缩文件 @TODO 出错
   */
  async createPathDown() {
    const { ctx } = this;
    const { type = '' } = this.ctx.query;
    let handlerFormatFun = getView;
    if (type === 'amap') {
      handlerFormatFun = getViewAmap();
    } else if (this.mapType === 'amap3D') {
      handlerFormatFun = getViewAmap3D();
    }
    const data = await this.service.excel.getExcelsData({ folderName: PAGE_TAG, type: TYPE, handlerFormat: this.formatData }); // 获取PAGE_TAG文件夹下，所有Excel格式化后数据
    console.log('--------write---html----begin-----');
    await this.service.fileAsync.writeFilesHTML({ data, folderName: PAGE_TAG, type: TYPE, templateView: handlerFormatFun }); // 生成对应html文件
    console.log('--------write---js----begin-----');
    await this.service.fileAsync.writeFilesJS({ data, folderName: PAGE_TAG, type: TYPE }); // 生成js文件
    ctx.body = 'test';
    ctx.status = 200;
  }
  /**
   * 压缩文件
   */
  async compress() {
    const { ctx } = this;
    const content = await this.service.file.compressDir({ ctx, folderName: PAGE_TAG, type: TYPE, isDel: true }); // 压缩文件后将文件返回给服务器,并删除目标文件和压缩文件
    ctx.body = content;
    ctx.status = 200;
  }
  /**
   * 生成网页json
   */
  async getJSON() {
    const { ctx } = this;
    const data = await this.service.excel.getExcelsData({ folderName: PAGE_TAG, type: TYPE, handlerFormat: this.formatData }); // 获取PAGE_TAG文件夹下，所有Excel格式化后数据const rows = await this.service.excel.getExcelsData({ folderName: PAGE_TAG, handlerFormat: this.formatData });
    ctx.body = {
      code: 200,
      data,
      success: true,
    };
    ctx.status = 200;
  }
  /**
   * 下载示例模版文件
   */
  async downTemplateFile() {
    const { ctx } = this;
    const fileName = '居住常访地-带点.zip';
    const content = await this.service.file.readTemplateFile({ ctx, folderName: PAGE_TAG, fileName });
    ctx.body = content;
    ctx.status = 200;
  }
  formatData({ sheets, fileName }) {
    const positions = sheets.map((sheet, index) => {
      if (sheet && index === 0) {
        return getPosition({ sheet, fileName }, isSelfProvince);
      } else if (sheet && index === 1) {
        return getPointer({ sheet, icon: HEAMP_MARKER_ICON.blue });
      } else if (sheet && index === 2) {
        return getPointer({ sheet, icon: HEAMP_MARKER_ICON.pink });
      }
    });
    return positions;
  }
}
function getPosition({ sheet, fileName }, self) {
  const sheetJson = xlsx.utils.sheet_to_json(sheet);
  const heatMap = {};
  const rateObj = {};
  const TYPE = '位置信息';
  const RATE = '覆盖占比';
  const PROVINCE = '省';
  const CITY = '市';
  const max = {};
  const selfProvince = sheetJson && sheetJson[0][PROVINCE];
  if (self) {
    console.log('------本省-----');
    sheetJson.forEach(({
      gdlon: lon,
      gdlat: lat,
      [TYPE]: type,
      [RATE]: rate,
      [PROVINCE]: province,
    }) => {
      if (selfProvince === province) {
        const tempHeatMapArr = heatMap[type] = heatMap[type] || [];
        const tempHeatRateArr = rateObj[type] = rateObj[type] || [];
        tempHeatRateArr.push(rate);
        tempHeatMapArr.push([ lon, lat, rate ]);
      }
    });
  } else {
    console.log('------所有-----');
    sheetJson.forEach(({
      gdlon: lon,
      gdlat: lat,
      [TYPE]: type,
      [RATE]: rate,
    }) => {
      const tempHeatMapArr = heatMap[type] = heatMap[type] || [];
      const tempHeatRateArr = rateObj[type] = rateObj[type] || [];
      tempHeatRateArr.push(rate);
      tempHeatMapArr.push([ lon, lat, rate ]);
    });
  }

  Object.keys(rateObj).forEach(key => {
    const newArray = Array.from(new Set(rateObj[key]));
    max[`${key}`] = Math.max(...newArray);
  });
  return Object.assign({
    radius: 20,
    province: selfProvince,
    city: sheetJson && sheetJson[0][CITY],
    fileName,
    heatMap,
    max,
  });
}
function getPointer({ sheet, icon }) {
  const sheetJson = xlsx.utils.sheet_to_json(sheet);
  const pointer = [];
  const NAME = '店名';
  sheetJson.forEach(({
    gdlon: lon,
    gdlat: lat,
    [NAME]: name,
  }) => {
    pointer.push([ lon, lat, name ]);
  });
  return Object.assign({
    pointer,
    icon,
  });
}
module.exports = PositionController;
