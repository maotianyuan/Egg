'use strict';
const Controller = require('egg').Controller;
const xlsx = require('xlsx');
const { getView } = require('../../../view/heatMap/position/normal');
const PAGE_TAG = 'heatMap';
const TYPE = 'position/normal';
class PositionNormalController extends Controller {
  /**
   * 生成文件
   */
  async createPath() {
    const { ctx } = this;
    const data = await this.service.excel.getExcelsData({ folderName: PAGE_TAG, type: TYPE, handlerFormat: this.formatData }); // 获取PAGE_TAG文件夹下，所有Excel格式化后数据
    await this.service.fileAsync.writeFilesHTML({ data, folderName: PAGE_TAG, type: TYPE, templateView: getView }); // 生成对应html文件
    await this.service.fileAsync.writeFilesJS({ data, folderName: PAGE_TAG, type: TYPE }); // 生成js文件
    ctx.body = 'success';
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
  formatData({ sheets, fileName }) {
    const positions = sheets.map(sheet => {
      return getPosition({ sheet, fileName });
    });
    return positions;
  }
}

function getPosition({ sheet, fileName }, self) {
  const sheetJson = xlsx.utils.sheet_to_json(sheet);
  const heatMap = {};
  const rateObj = {};
  const TYPE = '结果类别';
  const RATE = '覆盖占比';
  const PERSION = '人群包名称';
  const PROVINCE = '省';
  const CITY = '市';
  const max = {};
  const selfProvince = sheetJson && sheetJson[0][PROVINCE];
  if (self) {
    console.log('------本省-----');
    sheetJson.forEach(({
      lon,
      lat,
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
      lon: lon,
      lat: lat,
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
    persion: sheetJson && sheetJson[0][PERSION],
    fileName,
    heatMap,
    max,
  });
}

module.exports = PositionNormalController;
