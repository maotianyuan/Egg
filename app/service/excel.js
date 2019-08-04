'use strict';
const Service = require('egg').Service;
const fs = require('fs').promises;
const path = require('path');
const xlsx = require('xlsx');
const EXCEL_FOLER = 'excel'; // 存放Excel文件名
const isAllowFileSuffix = [ 'xlsx' ]; // Excel后缀名，目前仅支持xlsx

class ExcelService extends Service {
  /**
   * 获取文件夹下所有Excel数据
   * @param {*} handlerFormat 格式化Excel数据
   */
  async getExcelsData({ folderName, type, handlerFormat }) {
    const publicDir = this.app.config.static.dir;
    const filePath = path.join(publicDir, folderName, EXCEL_FOLER, type); // public/path/excel/index
    const filesExcel = await this.service.excel._getExcels({ filePath });
    const positions = filesExcel.map(item => {
      return handlerFormat(item);
    });
    return positions;
  }

  async _getExcels({ filePath }) {
    const files = await fs.readdir(filePath);
    const filesExcel = files.reduce((acc, crr) => {
      return isAllowFileSuffix.includes(crr.split('.').slice(-1).toString())
        ? acc.concat(this._getExcelSheets({ filePath, file: crr })) : acc;
    }, []);
    return filesExcel;
  }

  _getExcelSheets({ filePath, file }) {
    const fileDir = path.join(filePath, file);
    const workbook = xlsx.readFile(fileDir);
    const sheetsName = [];
    const sheets = workbook.SheetNames.map(name => {
      sheetsName.push(name);
      return workbook.Sheets[name];
    });
    return {
      sheets,
      sheetsName,
      fileName: file,
    };
  }

}

module.exports = ExcelService;
