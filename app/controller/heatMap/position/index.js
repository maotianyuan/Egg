'use strict';
const Controller = require('egg').Controller;
const fs = require('fs').promises;
const path = require('path');
const xlsx = require('xlsx');
const compressing = require('compressing');
const { getView } = require('../../../view/heatMap/position/position-has-pointer');
const { getViewAmap3D } = require('../../../view/heatMap/position/position-has-pointer-amap-3d');
const { getViewAmap } = require('../../../view/heatMap/position/position-has-pointer-amap');
const { blue, pink } = require('./pointer/icon');
const PAGE_TAG = 'position';

class PositionController extends Controller {
  async index() {
    const { ctx } = this;
    const { type = '' } = this.ctx.query;
    this.mapType = type;
    const rows = await getFiles(path.join(__dirname, `../../../public/excel/${PAGE_TAG}`));
    await setFileJS.call(this, rows);
    await setFileHTML.call(this, rows);
    console.log('---created--ok-----');
    const readFilePath = this.app.config.static.dir + `/heatMap/${PAGE_TAG}`;
    const fileName = '位置信息';
    await compressing.zip.compressDir(path.join(readFilePath), path.join(readFilePath, '../', `${fileName}.zip`));
    const filePath = path.resolve(readFilePath, '../', `${fileName}.zip`);
    const content = await this.service.index.readFileDel({ ctx, fileName: `${fileName}.zip`, filePath });
    ctx.body = content;
    ctx.status = 200;
  }
  async indexSelfProvince() {
    const { ctx } = this;
    console.log(ctx);
    this.mapType = 'amap';
    const rows = await getFiles(path.join(__dirname, `../../../public/excel/${PAGE_TAG}`), true);
    await setFileJS.call(this, rows);
    await setFileHTML.call(this, rows);
    console.log('---created--ok-----');
    const readFilePath = this.app.config.static.dir + `/heatMap/${PAGE_TAG}`;
    const fileName = '位置信息-本省';
    await compressing.zip.compressDir(path.join(readFilePath), path.join(readFilePath, '../', `${fileName}.zip`));
    const filePath = path.resolve(readFilePath, '../', `${fileName}.zip`);
    const content = await this.service.index.readFileDel({ ctx, fileName: `${fileName}.zip`, filePath });
    ctx.body = content;
    ctx.status = 200;
  }
  async getJSON() {
    const { ctx } = this;
    const rows = await getFiles(path.join(__dirname, `../../../public/excel/${PAGE_TAG}`));
    ctx.body = {
      code: 200,
      rows,
      success: true,
    };
    ctx.status = 200;
  }
}
async function getFiles(filePath, self = false) {
  const files = await fs.readdir(filePath);
  const filesExcel = files.reduce((acc, crr) => {
    return crr.split('.').slice(-1).toString() === 'xlsx'
      ? acc.concat(getExcel(filePath, crr)) : acc;
  }, []);
  const positions = filesExcel.map(item => {
    return getData(item, self);
  });
  return positions;
}
function getExcel(filePath, files) {
  const fileDir = path.join(filePath, files);
  const workbook = xlsx.readFile(fileDir);
  const sheets = workbook.SheetNames.map((name, index) => {
    console.log(`-----------reading-sheet-----------${name}${index}`);
    return workbook.Sheets[name];
  });
  return {
    sheets,
    fileName: files,
  };
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
      lon,
      lat,
      [TYPE]: type,
      [RATE]: rate,
      [PROVINCE]: province,
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
    lon,
    lat,
    [NAME]: name,
  }) => {
    pointer.push([ lon, lat, name ]);
  });
  return Object.assign({
    pointer,
    icon,
  });
}
function getData({ sheets, fileName }, self) {
  const positions = sheets.map((sheet, index) => {
    if (sheet && index === 0) {
      return getPosition({ sheet, fileName }, self);
    } else if (sheet && index === 1) {
      return getPointer({ sheet, icon: blue });
    } else if (sheet && index === 2) {
      return getPointer({ sheet, icon: pink });
    }
  });
  return positions;
}
async function setFileJS(data) {
  console.log('----setFileJS------');
  data.map(async (item, index) => {
    const dir = this.app.config.static.dir + `/heatMap/${PAGE_TAG}`;
    const fileNameJS = path.join(dir, `data/heatMapData_${index}.js`);
    const content = `var originObj = ${JSON.stringify(item)}`;
    await fs.mkdir(path.join(dir, 'data'), { recursive: true });
    await fs.writeFile(fileNameJS, content, res => {
      console.log(res, '------write---js---success----');
    });
  });
}
async function setFileHTML(data) {
  console.log('----setFileHTML------');
  data.map(async (item, index) => {
    const dir = this.app.config.static.dir + `/heatMap/${PAGE_TAG}`;
    const fileNameExcel = item[0].fileName.split('.xlsx')[0];
    const fileNameHtml = path.join(dir, `${fileNameExcel}_${index}.html`);
    let content = '';
    if (this.mapType === 'amap') {
      content = getViewAmap(`heatMapData_${index}`);
    } else if (this.mapType === 'amap3D') {
      content = getViewAmap3D(`heatMapData_${index}`);
    } else {
      content = getView(`heatMapData_${index}`);
    }
    await fs.mkdir(path.join(dir), { recursive: true });
    await fs.writeFile(fileNameHtml, content, res => {
      console.log(res, '------write---html---success----');
    });
  });
}
module.exports = PositionController;
