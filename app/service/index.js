'use strict';
const Service = require('egg').Service;
const fs = require('fs');
class CommonService extends Service {
  async readFile({ ctx, fileName, filePath }) {
    ctx.attachment(fileName);
    ctx.set('Content-Type', 'application/octet-stream');
    return await fs.createReadStream(filePath);
  }
  async readFileDel({ ctx, fileName, filePath }) {
    ctx.attachment(fileName);
    ctx.set('Content-Type', 'application/octet-stream');
    return await fs.createReadStream(filePath).on('close', () => {
      fs.unlink(filePath, err => {
        if (err) throw err;
        console.log('文件删除成功');
      });
    });
  }
}

module.exports = CommonService;
