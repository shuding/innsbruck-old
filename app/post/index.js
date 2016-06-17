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



let generate_post = function (data) {
  postTest(data);

  let title = data.title;
  let link = data.link;
  let content = data.content;

  // to keep postTest compatible , have to test in module.exports.new
  if (!link || !link.length) {
    throw new Error('Post link cannot be empty!');
  }

  if (['post', 'p', 'style', 'static', 'index', 'preview'].includes(link) || !/^[a-zA-Z0-9_]+$/.test(link)) {
    throw new Error('Illegal link!');
  }

  return {
    title:  title,
    content:content,
    link:   link,
    plugin: data.plugin || {}
  };

};


/**
 * Create a new post
 * @param data `= request.body`
 * @param _id optional
 * @returns id
 */
module.exports.new = function (data) {
  let raw_post = generate_post(data);
  let title   = raw_post.title;
  let link = raw_post.link;
  let content = raw_post.content;
  let plugin = raw_post.plugin;

  if (db('posts').find({link})) {
    throw new Error('This link already exists!');
  }

  db('posts').push({
            title,
            content,
    link:   link,
    time:   (new Date()).getTime(),
    plugin: plugin
  });

  plugins.forEach(plugin => plugin.hook && plugin.hook.onNewPost && plugin.hook.onNewPost());

  return link;
};


module.exports.edit = function (link, data) {
  let time = post(link).time;
  let raw_post = generate_post(data);
  remove(link);



  let title = raw_post.title;
  let newLink  = raw_post.link;
  let content = raw_post.content;
  let plugin = raw_post.plugin;

  db('posts').push({
            title,
            content,
    link:   newLink,
    time:   time,
    plugin: plugin

  });

  plugins.forEach(plugin => plugin.hook && plugin.hook.onEditPost && plugin.hook.onEditPost());

  return newLink;
};

/**
 * Remove a post by link
 * @param link
 */


function remove(link) {
  postRemove(link);

  plugins.forEach(plugin => plugin.hook && plugin.hook.onRemovePost && plugin.hook.onRemovePost());
}

module.exports.remove = remove;

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
