/**
 * Created by shuding on 5/6/16.
 * <ds303077135@gmail.com>
 */

const path = require('path');
const fs   = require('fs');

// lowdb
const low     = require('lowdb');
const storage = require('lowdb/file-sync');
const db      = low('db.json', {storage});
const opener  = require('opener');

// markd
const marked = require('marked');

// koa
const koa = require('koa');

// middleware
const route  = require('koa-route');
const render = require('koa-ejs');
const body   = require('koa-body');
const send   = require('koa-send');
const parse  = require('co-busboy');

// generate static site
//import { save, generate } from './gen';
// ^not supported yet :(
const { save, generate, renderWp } = require('./gen');

var app = koa();

render(app, {
  root:    path.join(__dirname, 'view'),
  layout:  'layout',
  viewExt: 'html',
  cache:   false
});

app.use(body());

// static files
app.use(function *(next) {
  if (this.method != 'GET' || !this.path.match(/^\/static\//g)) {
    return yield next;
  }
  yield send(this, this.path);
});

// preview
app.use(function *(next) {
  if (this.method != 'GET' || !this.path.match(/\.html$/g)) {
    return yield next;
  }
  yield send(this, this.path);
});

// routes
var blog = require('./blog').init(db);
var post = require('./post').init(db);
var page = require('./page').init(db);

// error handling
app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    yield renderWp.call(this, 'error', blog.info(), {
      error: err
    });
  }
});

app.use(route.get('/', function *() {
  yield renderWp.call(this, 'posts', post.list(1), page.all(), blog.info());
}));

app.use(route.get('/p/:cnt', function *(cnt) {
  if (cnt == '1') {
    return this.redirect('/');
  }
  yield renderWp.call(this, 'posts', post.list(cnt), page.all(), blog.info());
}));

app.use(route.get('/settings', function *() {
  yield renderWp.call(this, 'settings', blog.info());
}));

app.use(route.get('/post/new', function *() {
  yield renderWp.call(this, 'post-new', blog.info());
}));

app.use(route.get('/post/:link', function *(link) {
  yield renderWp.call(this, 'post', post.show(link), blog.info(), {marked});
}));

app.use(route.get('/post/:link/edit', function *(link) {
  yield renderWp.call(this, 'post-edit', post.show(link), blog.info());
}));

app.use(route.get('/page/new', function *() {
  yield renderWp.call(this, 'page-new', blog.info());
}));

app.use(route.get('/page/:link/edit', function *(link) {
  yield renderWp.call(this, 'page-edit', blog.info(), page.show(link), {marked});
}));

app.use(route.get('/:link', function *(link) {
  if (db('pages').find({link})) {
    yield renderWp.call(this, 'page', blog.info(), page.show(link), {marked});
  }
}));

/**
 * Create a post
 */
app.use(route.post('/post/new', function *() {
  let link = post.new(this.request.body);
  this.redirect('/post/' + link);

  saveIndex();
  savePost(link);
}));

/**
 * Delete a post
 */
app.use(route.post('/post/:link/delete', function *(link) {
  db('posts').remove({link});
  post.remove(link);
  this.redirect('/');

  saveIndex();
}));

/**
 * Edit a post
 */
app.use(route.post('/post/:link/edit', function *(link) {
  post.test(this.request.body);
  post.remove(link);
  post.new(this.request.body, link);

  this.redirect('/post/' + link);

  // write index.html
  saveIndex();
  savePost(link);
}));

/**
 * Create a page
 */
app.use(route.post('/page/new', function *() {
  let link = page.new(this.request.body);

  this.redirect('/');

  saveIndex();
  savePage(link);
}));

/**
 * Delete a page
 */
app.use(route.post('/page/:link/delete', function *(link) {
  page.remove(link);
  this.redirect('/');

  saveIndex();
}));

/**
 * Edit a page
 */
app.use(route.post('/page/:link/edit', function *(link) {
  page.test(this.request.body);
  page.remove(link);
  let newLink = page.new(this.request.body);

  this.redirect('/');

  saveIndex();
  savePage(newLink);
}));

/**
 * Upload an image
 */
app.use(route.post('/upload', function *() {
  let parts = parse(this);
  let part;
  while (part = yield parts) {
    var stream = fs.createWriteStream(path.join(__dirname, '..', 'static', part.filename));
    part.pipe(stream);
  }

  this.body = 'OK';
}));

/**
 * Edit settings
 */
app.use(route.post('/settings', function *() {
  blog.set(this.request.body);

  this.redirect('/');

  saveIndex();
  saveAllPosts();
}));

// api functions

function postPageCnt() {
  let pagination = db('blog').value().pagination;
  return Math.ceil(db('posts').size() / pagination);
}

function saveIndex() {
  // write index.html
  let b = blog.info();
  let p = page.all();
  let t = postPageCnt();

  save('index', generate.apply(this, ['posts', Object.assign(post.list(1), p, b, {
    static: true
  })]));

  for (let i = 2; i <= t; ++i) {
    save('p/' + i, generate.apply(this, ['posts', Object.assign(post.list(i), p, b, {
      static: true
    })]));
  }
}

function savePost(link) {
  // write post/:id.html
  link = String(link);
  save('post/' + link, generate('post', Object.assign(post.show(link), blog.info(), {
    static: true,
    marked
  })));
}

function saveAllPosts() {
  let posts = db('posts').value();

  let b = blog.info();
  for (let p of posts) {
    save('post/' + p.link, generate('post', Object.assign(b, {
      static: true,
      post:   p,
      marked
    })));
  }
}

function savePage(link) {
  // write :link.html
  save('page/' + link, generate('page', Object.assign(blog.info(), page.show(link), {
    static: true,
            marked
  })));
}

// init db
if (typeof db.object.blog === 'undefined') {
  db.object.blog = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog.default.json')));
}

// bind port
app.listen(3000, err => {
  console.log('Innsbruck running on port 3000');
  opener('http://localhost:3000');
});
