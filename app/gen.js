/**
 * Created by shuding on 5/7/16.
 * <ds303077135@gmail.com>
 */

const fs      = require('fs');
const path    = require('path');
const basedir = path.join(__dirname, '..');

const ejs = require('ejs');

module.exports.save = save;
module.exports.generate = generate;

function logStaticFile(file) {
  console.log(`Page ${file} generated successfully.`);
}

function save(file, content) {
  if (file === 'index') {
    fs.writeFile(path.join(basedir, 'index.html'), content);
    logStaticFile('index.html');
  } else if (file.startsWith('post/')) {
    if (!fs.existsSync(path.join(basedir, 'post'))) {
      fs.mkdirSync(path.join(basedir, 'post'));
    }

    fs.writeFile(path.join(basedir, 'post', path.parse(file).name + '.html'), content);
    logStaticFile(file + '.html');
  }
}

function generate(template, context) {
  let viewPath = path.join(__dirname, 'view', template + '.html');
  let tpl = fs.readFileSync(viewPath, 'utf8');
  let fn = ejs.compile(tpl, {
    filename: viewPath
  });

  context.body = fn(context);

  viewPath = path.join(__dirname, 'view', 'layout.html');
  tpl = fs.readFileSync(viewPath, 'utf8');
  fn = ejs.compile(tpl, {
    filename: viewPath
  });

  return fn(context);
}
