/**
 * Created by shuding on 5/20/16.
 * <ds303077135@gmail.com>
 */
'use strict';

const assert = require('assert');
var db;
var plugins;

module.exports.init = (_db, _plugins) => {
  db = _db;
  plugins = _plugins;
  return this;
};

module.exports.info = function () {
  return {
    blog: blogInfo()
  };
};

module.exports.set = function (data) {
  blogTest(data);

  let name            = data.name;
  let pagination      = data.pagination;
  let description     = typeof data.description !== 'undefined';
  let footer          = data.footer;
  let googleAnalytics = data['google-analytics'];
  let css             = data.css;

  if (!pagination || !pagination.length) {
    pagination = 10; // fallback
  }

  pagination = ~~Number(pagination); // to integer

  db.object.blog = {
                        name,
                        footer,
                        pagination,
                        description,
    'google-analytics': googleAnalytics || '',
    css:                css || '',
    plugin:             Object.assign(db.object.blog.plugin || {}, data.plugin || {})
  };

  plugins.forEach(plugin => {
    if (plugin.hook && plugin.hook.onSetting) {
      plugin.hook.onSetting();
    }
  });
};

function blogTest(data) {
  let name       = data.name;
  let pagination = data.pagination;

  if (!name || !name.length) {
    throw new Error('Blog name cannot be empty!');
  }

  pagination = ~~Number(pagination); // to integer
  if (1 > pagination || pagination > 100) {
    throw new Error('Wrong range of value `pagination`');
  }
}

function blogInfo() {
  return db('blog').value();
}
