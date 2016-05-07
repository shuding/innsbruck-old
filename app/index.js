/**
 * Created by shuding on 5/6/16.
 * <ds303077135@gmail.com>
 */

const path = require('path');

// lowdb
const low = require('lowdb');
const storage = require('lowdb/file-sync');
const db = low('db.json', { storage });

// markd
const marked = require('marked');

// koa
const koa = require('koa');

// middleware
const route = require('koa-route');
const render = require('koa-ejs');
const body = require('koa-body');
const send = require('koa-send');

let app = koa();

render(app, {
  root: path.join(__dirname, 'view'),
  layout: 'layout',
  viewExt: 'html',
  cache: false
});

app.use(body());

// view routes
app.use(route.get('/', function *() {
  yield this.render('posts', {posts: postAll(1), blog: blogInfo(), current: 1, total: postPageCnt()});
}));

app.use(route.get('/p/:cnt', function *(cnt) {
  if (cnt == '1')
    return this.redirect('/');
  yield this.render('posts', {posts: postAll(+cnt), blog: blogInfo(), current: +cnt, total: postPageCnt()});
}));

app.use(route.get('/settings', function *() {
  yield this.render('settings', {blog: blogInfo()});
}));

app.use(route.get('/post/new', function *() {
  yield this.render('post-new', {blog: blogInfo()});
}));

app.use(route.get('/post/:link', function *(link) {
  yield this.render('post', {post: post(link), marked: marked, blog: blogInfo()});
}));

app.use(route.post('/post/new', function *() {
  let title = this.request.body.title;
  let content = this.request.body.content;
  if (!title || !title.length) {
    this.status = 406;
    return this.body = 'Post title cannot be empty!';
  }

  let id = (+db.object.id || 0) + 1;
  db.object.id = id;
  db('posts').push({
    title,
    content,
    link: '' + id,
    time: (new Date()).getTime()
  });
  this.redirect('/');
}));

app.use(route.post('/post/:link/delete', function *(link) {
  db('posts').remove({link});
  this.redirect('/');
}));

app.use(route.post('/post/:link/edit', function *(link) {
  db('posts').remove({link});
  db('posts').push({
    title: this.request.body.title,
    content: this.request.body.content,
    link: link,
    time: (new Date()).getTime()
  });
  this.redirect('/post/' + link);
}));

app.use(route.post('/settings', function *() {
  let name = this.request.body.name;
  let pagination = this.request.body.pagination;
  let footer = this.request.body.footer;
  let googleAnalytics = this.request.body['google-analytics'];
  let disqus = this.request.body.disqus;

  if (!name || !name.length) {
    this.status = 406;
    return this.body = 'Blog name cannot be empty!';
  }

  if (!pagination || !pagination.length) {
    pagination = 10; // fallback
  }
  try {
    pagination = ~~Number(pagination); // to integer
    if (1 > pagination || pagination > 100) {
      throw new Error();
    }
  } catch (err) {
    console.log(err);
    pagination = 10; // fallback
  }

  db.object.blog = {
    name: name,
    footer: footer,
    pagination: pagination,
    'google-analytics': googleAnalytics || '',
    disqus: disqus || ''
  };

  this.redirect('back');
}));

app.use(route.get('/post/:link/edit', function *(link) {
  yield this.render('post-edit', {post: post(link), blog: blogInfo()});
}));

// static files
app.use(route.get('/style', function *() {
  yield send(this, path.join('app', 'style.css'));
}));

// api functions
function postAll(page) {
  let pagination = db('blog').value().pagination;
  page = page || 1;
  return db('posts').chain().orderBy('time', 'desc').take(page * pagination).takeRight(pagination).value();
}

function post(link) {
  return db('posts').find({link});
}

function postPageCnt() {
  let pagination = db('blog').value().pagination;
  return Math.ceil(db('posts').size() / pagination);
}

function blogInfo() {
  return db('blog').value();
}

// init db
if (typeof db.object.blog === 'undefined') {
  db.object.blog = {
    name: 'innsbruck',
    footer: 'copyright 2016 © innsbruck',
    pagination: 10,
    'google-analytics': '',
    disqus: ''
  };
}

// bind port
app.listen(3000);
console.log('Innsbruck running on port 3000');
