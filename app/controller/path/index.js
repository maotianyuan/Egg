'use strict';
const Controller = require('egg').Controller;
const xlsx = require('xlsx');
const { getView } = require('../../view/path/index');
const { handlerExceelTime } = require('../../lib/utils');
const PAGE_TAG = 'path';
const TYPE = 'index';
class PathController extends Controller {
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
   * 生成文件并且下载压缩文件
   */
  async createPathDown() {
    const { ctx } = this;
    const data = await this.service.excel.getExcelsData({ folderName: PAGE_TAG, type: TYPE, handlerFormat: this.formatData }); // 获取PAGE_TAG文件夹下，所有Excel格式化后数据
    console.log('--------write---html----begin-----');
    await this.service.fileAsync.writeFilesHTML({ data, folderName: PAGE_TAG, type: TYPE, templateView: getView }); // 生成对应html文件
    console.log('--------write---js----begin-----');
    await this.service.fileAsync.writeFilesJS({ data, folderName: PAGE_TAG, type: TYPE }); // 生成js文件
    console.log('--------begin---compress-----');
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
    const fileName = 'index.zip';
    const content = await this.service.file.readTemplateFile({ ctx, folderName: PAGE_TAG, fileName });
    ctx.body = content;
    ctx.status = 200;
  }
  formatData({ sheets, fileName }) {
    const [ PERSION, CITY, TIME, POSITION ] = [ '人员', '城市', '时间', '详细地址' ];
    const positions = sheets.map(sheet => {
      if (sheet) {
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
          const targetTime = handlerExceelTime(time);
          if (lon && lat) {
            _arr.push([ lon, lat, city, targetTime, position ]);
          }
        });
        return Object.assign({
          fileName,
          pathMap,
        });
      }
    });
    return positions;
  }
}
module.exports = PathController;
