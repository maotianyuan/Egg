'use strict';
const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');
const compressing = require('compressing');
const EXPORT_FOLDER = 'export'; // 导出js html文件名
const DOWN_TEMPLATE_FOLER = 'template'; // 导出js html文件名

class FileService extends Service {
  async writeFile({ _path, content, type }) {
    await fs.createWriteStream(_path, content, 'utf8');
    console.log(`------write---${type}---success----`);
  }
  /**
   * 读取模版文件
   * @param {folderName fileName} 目录 文件
   */
  async readTemplateFile({ ctx, folderName, fileName }) {
    ctx.attachment(fileName);
    const filePath = path.resolve(this.app.config.static.dir, folderName, DOWN_TEMPLATE_FOLER, fileName); // 示例 path： path/template/index.zip
    ctx.set('Content-Type', 'application/octet-stream');
    return await fs.createReadStream(filePath);
  }
  /**
   * 读取压缩包
   * @param {filePath isDel}  文件路径 读完是否删除
   */
  async _readZipDel({ ctx, targetZipFile, isDel = false, sourceFolder }) {
    ctx.set('Content-Type', 'application/octet-stream');
    return await fs.createReadStream(targetZipFile).on('close', () => {
      isDel && fs.unlink(targetZipFile, err => {
        if (err) throw err;
        console.log('---------success---delete------zip------');
        this.delFolder(sourceFolder); // 删除源文件
      });
    });
  }
  /**
   * 生成压缩包
   * @param {ctx folderName, type} 上下文 目录 类型
   */
  async compressDir({ ctx, folderName, type, isDel }) {
    const sourceFolder = path.resolve(this.app.config.static.dir, folderName, EXPORT_FOLDER, type); // 源文件需要压缩的文件
    const fileName = `${type}.zip`;
    const targetZipFile = path.resolve(this.app.config.static.dir, folderName, EXPORT_FOLDER, fileName); // 压缩后文件放置文件目录
    await setTimeout(() => {}, 200);
    await compressing.zip.compressDir(sourceFolder, targetZipFile);
    ctx.attachment(fileName);
    console.log('--------compress---ok---------');
    return await this._readZipDel({ ctx, targetZipFile, isDel, sourceFolder });
  }
  async delFolder(path) {
    let files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach(file => {
        const curPath = path + '/' + file;
        if (fs.statSync(curPath).isDirectory()) {
          this.delFolder(curPath); // 递归删除文件夹
        } else {
          fs.unlinkSync(curPath); // 删除文件
        }
      });
      fs.rmdirSync(path); // 删除目录
    }
  }
}

module.exports = FileService;
