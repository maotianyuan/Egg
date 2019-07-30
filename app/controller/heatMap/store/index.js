'use strict';
const Controller = require('egg').Controller;
const fs = require('fs').promises;
const path = require('path');
const xlsx = require('xlsx');
const compressing = require('compressing');
const { getView } = require('../../../view/heatMap/store/store');
const { getViewAmap } = require('../../../view/heatMap/store/store-amap');
class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const { type = '' } = this.ctx.query;
    this.mapType = type;
    const rows = await getFiles(path.join(__dirname, '../../../public/excel/store'));
    await setFileJS.call(this, rows);
    await setFileHTML.call(this, rows);
    console.log('---created--ok-----');
    const readFilePath = this.app.config.static.dir + '/heatMap/store';
    const fileName = '特约店';
    await compressing.zip.compressDir(path.join(readFilePath), path.join(readFilePath, '../', `${fileName}.zip`));
    const filePath = path.resolve(readFilePath, '../', `${fileName}.zip`);
    const content = await this.service.index.readFileDel({ ctx, fileName: `${fileName}.zip`, filePath });
    ctx.body = content;
    ctx.status = 200;
  }
  async downTemplateFile() {
    const { ctx } = this;
    const fileName = '多特约店多客户类型多Sheet.zip';
    const filePath = path.resolve(this.app.config.static.dir, 'template/heatMap/baidu/store', fileName);
    const content = await this.service.index.readFile({ ctx, fileName, filePath });
    ctx.body = content;
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
  const sheetsName = [];
  const sheets = workbook.SheetNames.map((name, index) => {
    sheetsName.push(name);
    console.log(`-----------reading-sheet-----------${name}${index}`);
    return workbook.Sheets[name];
  });
  return {
    sheets,
    sheetsName,
    fileName: files,
  };
}
function getData({ sheets, sheetsName, fileName }) {
  const DIANPU = '特约店简称';
  const LEVEL = '客户类型';
  const positions = sheets.map((sheet, index) => {
    if (sheet) {
      console.log(`-----------write sheet-----------${index}`);
      const sheetJson = xlsx.utils.sheet_to_json(sheet);
      const heatMap = {};
      sheetJson.forEach(({
        lon,
        lat,
        [LEVEL]: level,
        [DIANPU]: dianpu,
      }) => {
        const _arr = heatMap[dianpu] = heatMap[dianpu] || {};
        const arr = heatMap[dianpu][level] = heatMap[dianpu][level] || [];
        if (lon && lat) {
          arr.push([ lon, lat, 1 ]);
        }
      });
      return Object.assign({
        radius: 20,
        city: sheetsName[index],
        fileName,
        heatMap,
      });
    }
  });
  return positions;
}
async function setFileJS(data) {
  data.map(async (item, index) => {
    const fileNameExcel = item[0].fileName.split('.xlsx')[0];
    const dir = this.app.config.static.dir + '/heatMap/store';
    const fileNameJS = path.join(dir, fileNameExcel, `data/heatMapData_${index}.js`);
    const content = `var originObj = ${JSON.stringify(item)}`;
    await fs.mkdir(path.join(dir, fileNameExcel, 'data'), { recursive: true });
    await fs.writeFile(fileNameJS, content, res => {
      console.log(res, '------write---js---success----');
    });
  });
}
async function setFileHTML(data) {
  data.map(async (item, index) => {
    const dir = this.app.config.static.dir + '/heatMap/store';
    const fileNameExcel = item[0].fileName.split('.xlsx')[0];
    const fileNameHtml = path.join(dir, fileNameExcel, `${fileNameExcel}_${index}.html`);
    let content = '';
    if (this.mapType === 'amap') {
      content = getViewAmap(`heatMapData_${index}`);
    } else {
      content = getView(`heatMapData_${index}`);
    }
    await fs.mkdir(path.join(dir, fileNameExcel), { recursive: true });
    await fs.writeFile(fileNameHtml, content, res => {
      console.log(res, '------write---html---success----');
    });
  });
}
module.exports = HomeController;
