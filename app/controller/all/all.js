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
              if (name === 'Sheet1') {
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
    const TYPE = '店名称';
    const LEVEL = '客户等级';
    console.log('--------runing------', _filename);
    const positions = sheets.map(sheet => {
      if (sheet) {
        const sheetJson = xlsx.utils.sheet_to_json(sheet);
        const result = {};
        const originObj4s = {};
        sheetJson.forEach(({
          lon,
          lat,
          [TYPE]: type,
          [LEVEL]: level,
        }) => {
          const _tag = type === '广州汇骏' ? 'huijun' : 'fanyu';
          switch (type) {
            case '广州汇骏':
            case '广州番禺':
              const arr = result[_tag + 'Data'] = result[_tag + 'Data'] || [];
              const arrType = result[_tag + `Data${level}`] = result[_tag + `Data${level}`] || [];
              arr.push([ lon, lat, 1 ]);
              arrType.push([ lon, lat, 1 ]);
              break;
            default:
              break;
          }
        });
        return Object.assign(result, {
          fanyumaxValue: 10,
          huijunmaxValue: 10,
        }, originObj4s, {
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
