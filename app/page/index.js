/**
 * Created by shuding on 5/20/16.
 * <ds303077135@gmail.com>
 */
'use strict';

var db;
var plugins;

module.exports.init = (_db, _plugins) => {
  db      = _db;
  plugins = _plugins;
  return this;
};

module.exports.all = function () {
  return {
    pages: pageAll()
  };
};

module.exports.show = function (link) {
  return {
    page: page(link)
  };
};

module.exports.new = function (data) {
  pageTest(data);

  let title   = data.title;
  let content = data.content;
  let link    = data.link;
  let order   = data.order;

  if (db('pages').find({link})) {
    throw new Error('This link already exists!');
  }

  order = +order;

  db('pages').push({
           title,
           content,
           link,
    order: order || 0 // filter NaN
  });

  return link;
};

module.exports.remove = function (link) {
  pageRemove(link);
};

module.exports.test = function (data) {
  pageTest(data);
};

function pageTest(data) {
  let title = data.title;
  let link  = data.link;

  if (!title || !title.length) {
    throw new Error('Page title cannot be empty!');
  }
  if (!link || !link.length) {
    throw new Error('Page link cannot be empty!');
  }
  if (['post', 'p', 'style', 'static', 'index', 'preview'].includes(link) || !/^[a-zA-Z0-9_]+$/.test(link)) {
    throw new Error('Illegal link!');
  }
}

function pageAll() {
  return db('pages').chain().orderBy('order', 'asc').value();
}

function page(link) {
  return db('pages').find({link});
}

function pageRemove(link) {
  db('pages').remove({link});
}