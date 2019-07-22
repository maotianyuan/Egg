'use strict';
const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
// const CITY_DATA = require('./config/index.js');
// 多sheet 一级
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
            const sheetsName = [];
            // const sheets = [ workbook.Sheets['广州东圃'] ];
            const sheets = workbook.SheetNames.map((name, index) => {
              // if (name === nameSheet) {
              // sheetIndex = index;
              sheetsName.push(name);
              console.log(`-----------reading sheet-----------${name}${index}`);
              return workbook.Sheets[name];
              // }
            });
            // console.log(sheets);

            callback && callback(sheets, sheetsName);
          }
        });
      });
    });
  };

  fileRead(path.join(__dirname, 'source'), (sheets, sheetsName) => {
    const LEVEL = '客户等级';
    const positions = sheets.map((sheet, index) => {
      if (sheet) {
        console.log(`-----------write sheet-----------${index}`);
        const sheetJson = xlsx.utils.sheet_to_json(sheet);
        const heatMap = {};
        sheetJson.forEach(({
          lon,
          lat,
          [LEVEL]: level,
        }) => {
          const arr = heatMap[level] = heatMap[level] || [];
          arr.push([ lon, lat, 1 ]);
        });
        return Object.assign({
          radius: 20,
          name: sheetsName[index],
          heatMap,
        });
      }
    });
    const filePath = path.join(__dirname, 'html', 'data', 'allData.js');
    const content = `var originObj = ${JSON.stringify(positions)}`;
    fs.writeFile(filePath, content, () => {
      console.log('js-转换完成');
    });
  });
}

module.exports = HomeController;
