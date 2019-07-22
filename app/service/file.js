'use strict';
const Service = require('egg').Service;
const fs = require('fs');
class FileService extends Service {
  async writeFile({ _path, content, type }) {
    await fs.createWriteStream(_path, content, 'utf8');
    console.log(`------write---${type}---success----`);
  }
}

module.exports = FileService;
