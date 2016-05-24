/**
 * Created by shuding on 5/20/16.
 * <ds303077135@gmail.com>
 */
'use strict';

const assert = require('assert');

var db;
var plugins;

// using only ONE lowdb instance to make sure all data changes were synchronized on all pages
module.exports.init = (_db, _plugins) => {
  db      = _db;
  plugins = _plugins;
  return this;
};

/**
 * Returns all post
 */
module.exports.all = function () {
  return {
    posts: db('posts').orderBy('link', 'desc')
  };
};

/**
 * Returns all post data in page `p`
 */
module.exports.list = function (p) {
  var pageCnt = postPageCnt();
  p           = Number(p);
  assert(p >= 1 && p <= pageCnt);

  return {
    posts:   postAll(p),
    current: p,
    total:   postPageCnt()
  };
};

/**
 * Data by post link
 */
module.exports.show = function (link) {
  return {
    post: post(link)
  };
};

/**
 * Create a new post
 * @param data `= request.body`
 * @param _id optional
 * @returns id
 */
module.exports.new = function (data, _id) {
  postTest(data);

  let title   = data.title;
  let content = data.content;

  let id = _id || (+db.object.id || 0) + 1;

  db.object.id = id;
  db('posts').push({
            title,
            content,
    link:   '' + id,
    time:   (new Date()).getTime(),
    plugin: data.plugin || {}
  });

  plugins.forEach(plugin => plugin.hook && plugin.hook.onNewPost && plugin.hook.onNewPost());

  return id;
};

/**
 * Remove a post by link
 * @param link
 */
module.exports.remove = function (link) {
  postRemove(link);

  plugins.forEach(plugin => plugin.hook && plugin.hook.onRemovePost && plugin.hook.onRemovePost());
};

/**
 * Edit a post by link
 */
module.exports.edit = function (link, data) {
  postTest(data);
  postRemove(link);

  let title   = data.title;
  let content = data.content;

  db.object.id = link;
  db('posts').push({
            title,
            content,
    link:   '' + link,
    time:   (new Date()).getTime(),
    plugin: data.plugin || {}
  });

  plugins.forEach(plugin => plugin.hook && plugin.hook.onEditPost && plugin.hook.onEditPost());
};

/**
 * Test the legitimacy of data
 * @param data
 */
module.exports.test = function (data) {
  postTest(data);
};

function postTest(data) {
  let title = data.title;
  if (!title || !title.length) {
    throw new Error('Post title cannot be empty!');
  }
}

function postAll(page) {
  let pagination = db('blog').value().pagination;

  let st = ((page || 1) - 1) * pagination;
  return db('posts').chain().orderBy('link', 'desc').slice(st, st + pagination).value();
}

function post(link) {
  return db('posts').find({link});
}

function postRemove(link) {
  db('posts').remove({link});
}

function postPageCnt() {
  let pagination = db('blog').value().pagination;
  return Math.ceil(db('posts').size() / pagination) || 1;
}
