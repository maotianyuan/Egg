'use strict';
const Controller = require('egg').Controller;
const fs = require('fs').promises;
const path = require('path');
const xlsx = require('xlsx');
const PAGE_TAG = 'path';
class PathController extends Controller {
  async getJSON() {
    const { ctx } = this;
    const rows = await getFiles(path.join(__dirname, `../../public/excel/${PAGE_TAG}`));
    ctx.body = {
      code: 200,
      rows,
      success: true,
    };
    ctx.status = 200;
  }
}
async function getFiles(filePath) {
  const files = await fs.readdir(filePath);
  const filesExcel = files.reduce((acc, crr) => {
    return crr.split('.').slice(-1).toString() === 'xlsx'
      ? acc.concat(getExcel(filePath, crr)) : acc;
  }, []);
  const positions = filesExcel.map(item => {
    return getData(item);
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
function getData({ sheets, fileName }) {
  const PERSION = '人员';
  const CITY = '城市';
  const TIME = '时间';
  const POSITION = '详细地址';
  const positions = sheets.map((sheet, index) => {
    if (sheet) {
      console.log(`-----------write sheet-----------${index}`);
      const sheetJson = xlsx.utils.sheet_to_json(sheet);
      const pathMap = {};
      sheetJson.forEach(({
        lon,
        lat,
        [POSITION]: position,
        [CITY]: city,
        [TIME]: time,
        [PERSION]: persion,
      }) => {
        const _arr = pathMap[persion] = pathMap[persion] || [];
        // if (lon && lat) {
        _arr.push([ lon, lat, city, time, position ]);
        // }
      });
      return Object.assign({
        fileName,
        pathMap,
      });
    }
  });
  return positions;
}
module.exports = PathController;
