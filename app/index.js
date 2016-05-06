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
  yield this.render('posts', {posts: postAll()});
}));

app.use(route.post('/post/new', function *() {
  let id = (+db.object.id || 0) + 1;
  db.object.id = id;
  db('posts').push({
    title: this.request.body.title,
    content: this.request.body.content,
    link: '' + id,
    time: (new Date()).getTime()
  });
  this.redirect('/');
}));

app.use(route.get('/post/new', function *() {
  yield this.render('post-new', {});
}));

app.use(route.get('/post/:link', function *(link) {
  yield this.render('post', {post: post(link), marked: marked});
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

app.use(route.get('/post/:link/edit', function *(link) {
  yield this.render('post-edit', {post: post(link)});
}));

// static files
app.use(route.get('/style', function *() {
  yield send(this, path.join('app', 'style.css'));
}));

// api functions
function postAll() {
  return db('posts').orderBy('time', 'desc');
}

function post(link) {
  return db('posts').find({link});
}

// bind port
app.listen(3000);
console.log('Innsbruck running on port 3000');
