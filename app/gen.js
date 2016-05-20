/**
 * Created by shuding on 5/7/16.
 * <ds303077135@gmail.com>
 */

const fs      = require('fs');
const path    = require('path');
const basedir = path.join(__dirname, '..');

const ejs = require('ejs');

module.exports.save     = save;
module.exports.generate = generate;
module.exports.renderWp = renderWp;

function logStaticFile(file) {
  console.log(`Page ${file} generated successfully.`);
}

function createDir(dir) {
  if (!fs.existsSync(path.join(basedir, dir))) {
    fs.mkdirSync(path.join(basedir, dir));
  }
}

function save(file, content) {
  if (file === 'index') {
    fs.writeFile(path.join(basedir, 'index.html'), content);
    logStaticFile('index.html');
  } else if (file.startsWith('post/')) {
    createDir('post');

    fs.writeFile(path.join(basedir, file + '.html'), content);
    logStaticFile(file + '.html');
  } else if (file.startsWith('p/')) {
    createDir('p');

    fs.writeFile(path.join(basedir, file + '.html'), content);
    logStaticFile(file + '.html');
  } else if (file.startsWith('page/')) {
    fs.writeFile(path.join(basedir, file.substr(5) + '.html'), content);
    logStaticFile(file.substr(5) + '.html');
  }
}

function generate(template, context) {
  let viewPath = path.join(__dirname, 'view', template + '.html');
  let tpl      = fs.readFileSync(viewPath, 'utf8');
  let fn       = ejs.compile(tpl, {
    filename: viewPath
  });

  context.body = fn(context);

  viewPath = path.join(__dirname, 'view', 'layout.html');
  tpl      = fs.readFileSync(viewPath, 'utf8');
  fn       = ejs.compile(tpl, {
    filename: viewPath
  });
  return fn(context);
}

/**
 * A koa render wrapper
 */
function renderWp(template, ...data) {
  return this.render(template, Object.assign(...data, {
    static: false
  }));
}