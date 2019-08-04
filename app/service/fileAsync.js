'use strict';
const Service = require('egg').Service;
const fs = require('fs').promises;
const path = require('path');
const EXPORT_FOLDER = 'export'; // 导出js html文件名
const EXPORT_JS_VARIABLE = 'EXTRA_DATA'; // 导出js文件的变量名

class FileAsyncService extends Service {
  /**
   * 生成js文件
   * @param {*} data 每一行Excel中的json数据
   */
  async writeFilesJS({ data, folderName, type }) {
    await data.map(async (item, index) => {
      const publicDir = this.app.config.static.dir;
      const fileNameJS = path.join(publicDir, folderName, EXPORT_FOLDER, type, 'data', `data_${index}.js`);
      const content = `var ${EXPORT_JS_VARIABLE} = ${JSON.stringify(item)}`;
      await fs.mkdir(path.join(publicDir, folderName, EXPORT_FOLDER, type, 'data'), { recursive: true });
      await fs.writeFile(fileNameJS, content);
    });
    console.log('---------success---write---js-----------');
  }
  /**
   * 生成html文件
   * @param {*} data 每一行Excel生成一个html
   */
  async writeFilesHTML({ data, folderName, type, templateView }) {
    await data.map(async (item, index) => {
      const publicDir = this.app.config.static.dir;
      const fileNameExcel = item[0].fileName.split('.xlsx')[0];
      const fileNameHtml = path.join(publicDir, folderName, EXPORT_FOLDER, type, `${fileNameExcel}_${index}.html`);
      const content = templateView(`data_${index}`);
      await fs.mkdir(path.join(publicDir, folderName, EXPORT_FOLDER, type), { recursive: true });
      await fs.writeFile(fileNameHtml, content);
    });
    console.log('---------success---write---html---------');
  }
}

module.exports = FileAsyncService;
