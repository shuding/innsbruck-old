/**
 * Created by shuding on 5/7/16.
 * <ds303077135@gmail.com>
 */

const fs = require('fs');
const path = require('path');
const basedir = path.join(__dirname, '..');

module.exports = function (file, content) {
  if (file === 'index') {
    fs.writeFile(path.join(basedir, 'index.html'), content);
  } else if (file.startsWith('static/')) {
    fs.writeFile(path.join(basedir, 'static', path.parse(file).name + '.html'), content);
  }
};