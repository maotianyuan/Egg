'use strict';
const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const cityData = require('./config/index.js');
const { getView } = require('./config/view.js');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    createFile();
    ctx.body = 'i, egg';
  }
}
function createFile() {
  const fileRead = (filePath, callback) => {
    fs.readdir(filePath, (err, files) => {
      if (err) throw err;
      files.forEach(filename => {
        const fileDir = path.join(filePath, filename);
        fs.stat(fileDir, (err, stats) => {
          if (err) throw err;
          const isFile = stats.isFile();
          if (isFile) {
            const workbook = xlsx.readFile(fileDir);
            let sheetIndex = 0;
            const sheets = workbook.SheetNames.map((name, index) => {
              if (name === '位置信息') {
                sheetIndex = index;
                return workbook.Sheets[name];
              }
            });
            callback && callback(sheets, filename, sheetIndex, workbook);
          }
        });
      });
    });
  };

  fileRead(path.join(__dirname, 'source'), (sheets, _filename, sheetIndex) => {
    const RATE = '覆盖占比';
    const TAG = '结果类别';
    const EXCEL_CITY = '省';
    const CITY = cityData[_filename].CITY;
    console.log('--------runing------', _filename);
    const positions = sheets.map(sheet => {
      if (sheet) {
        const sheetJson = xlsx.utils.sheet_to_json(sheet);
        const result = {};
        const rateObj = {};
        const originObj4s = {};
        const max = {};
        sheetJson.forEach(({
          lon,
          lat,
          [RATE]: rate,
          [TAG]: tag,
          [EXCEL_CITY]: city,
        }) => {

          if (rate && city === CITY) {
            const _tag = tag === '常访地' ? 'changfang' : 'juzhu';
            switch (tag) {
              case '常访地':
              case '居住地':
                const arr = result[_tag + 'Data'] = result[_tag + 'Data'] || [];
                const _arr = rateObj[_tag] = rateObj[_tag] || [];
                _arr.push(rate);
                arr.push([ lon, lat, rate ]);
                break;
              default:
                break;
            }
          }
        });
        Object.keys(rateObj).forEach(key => {
          const newArray = Array.from(new Set(rateObj[key]));
          max[`${key}maxValue`] = Math.max(...newArray);
        });
        return Object.assign(result, max, originObj4s, {
          radius: 20,
          pointer: cityData[_filename],
        });
      }
    });

    const filePath = path.join(__dirname, 'html', 'data', cityData[_filename].filename + '.js');
    const filePathHtml = path.join(__dirname, 'html', cityData[_filename].name + '.html');

    const content = `var originObj = ${JSON.stringify(positions[sheetIndex])}`;

    const contentHtml = getView(cityData[_filename].filename + '.js');

    fs.writeFile(filePath, content, () => {
      console.log('js-转换完成');
    });

    fs.writeFile(filePathHtml, contentHtml, () => {
      console.log('html-转换完成');
    });

  });
}


module.exports = HomeController;
