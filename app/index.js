/**
 * Created by shuding on 5/6/16.
 * <ds303077135@gmail.com>
 */

const path = require('path');

// lowdb
const low     = require('lowdb');
const storage = require('lowdb/file-sync');
const db      = low('db.json', {storage});

// markd
const marked = require('marked');

// koa
const koa = require('koa');

// middleware
const route  = require('koa-route');
const render = require('koa-ejs');
const body   = require('koa-body');
const send   = require('koa-send');

// generate static site
//import { save, generate } from './gen';
// ^not supported yet :(
const { save, generate } = require('./gen');

let app = koa();

render(app, {
  root:    path.join(__dirname, 'view'),
  layout:  'layout',
  viewExt: 'html',
  cache:   false
});

app.use(body());

// static files
app.use(route.get('/style', function *() {
  yield send(this, path.join('static', 'style.css'));
}));

// view routes
app.use(route.get('/', function *() {
  yield this.render('posts', {
    static:  false,
    posts:   postAll(1),
    blog:    blogInfo(),
    pages:   pageAll(),
    current: 1,
    total:   postPageCnt()
  });
}));

app.use(route.get('/p/:cnt', function *(cnt) {
  if (cnt == '1') {
    return this.redirect('/');
  }
  yield this.render('posts', {
    static:  false,
    posts:   postAll(+cnt),
    blog:    blogInfo(),
    pages:   pageAll(),
    current: +cnt,
    total:   postPageCnt()
  });
}));

app.use(route.get('/settings', function *() {
  yield this.render('settings', {
    static: false,
    blog:   blogInfo()
  });
}));

app.use(route.get('/post/new', function *() {
  yield this.render('post-new', {
    static: false,
    blog:   blogInfo()
  });
}));

app.use(route.get('/post/:link', function *(link) {
  yield this.render('post', {
    static: false,
    post:   post(link),
    marked: marked,
    blog:   blogInfo()
  });
}));

app.use(route.get('/post/:link/edit', function *(link) {
  yield this.render('post-edit', {
    static: false,
    post:   post(link),
    blog:   blogInfo()
  });
}));

app.use(route.get('/page/new', function *() {
  yield this.render('page-new', {
    static: false,
    blog:   blogInfo()
  });
}));

app.use(route.get('/page/:link/edit', function *(link) {
  yield this.render('page-edit', {
    static: false,
    page:   page(link),
    marked: marked,
    blog:   blogInfo()
  });
}));

app.use(route.get('/:link', function *(link) {
  yield this.render('page', {
    static: false,
    page:   page(link),
    marked: marked,
    blog:   blogInfo()
  });
}));

/**
 * Create a post
 */
app.use(route.post('/post/new', function *() {
  let title   = this.request.body.title;
  let content = this.request.body.content;
  if (!title || !title.length) {
    this.status = 406;
    return this.body = 'Post title cannot be empty!';
  }

  let id       = (+db.object.id || 0) + 1;
  db.object.id = id;
  db('posts').push({
          title,
          content,
    link: '' + id,
    time: (new Date()).getTime()
  });
  this.redirect('/');

  saveIndex();
  savePost('' + id);
}));

/**
 * Delete a post
 */
app.use(route.post('/post/:link/delete', function *(link) {
  db('posts').remove({link});
  this.redirect('/');

  saveIndex();
}));

/**
 * Edit a post
 */
app.use(route.post('/post/:link/edit', function *(link) {
  db('posts').remove({link});
  db('posts').push({
    title:   this.request.body.title,
    content: this.request.body.content,
    link:    link,
    time:    (new Date()).getTime()
  });
  this.redirect('/post/' + link);

  // write index.html
  saveIndex();
  savePost(link);
}));

/**
 * Create a page
 */
app.use(route.post('/page/new', function *() {
  let title   = this.request.body.title;
  let content = this.request.body.content;
  let link    = this.request.body.link;
  let order   = this.request.body.order;
  if (!title || !title.length) {
    this.status = 406;
    return this.body = 'Page title cannot be empty!';
  }
  if (!link || !link.length) {
    this.status = 406;
    return this.body = 'Page link cannot be empty!';
  }
  if (db('pages').find({link})) {
    this.status = 406;
    return this.body = 'This link already exists!';
  }
  if (['post', 'p', 'style', 'static', 'index'].includes(link) || !/^[a-zA-Z0-9_]+$/.test(link)) {
    this.status = 406;
    return this.body = 'Illegal link!';
  }

  order = +order;

  db('pages').push({
    title,
    content,
    link,
    order: order || 0 // filter NaN
  });
  this.redirect('/');

  saveIndex();
  savePage(link);
}));

/**
 * Delete a page
 */
app.use(route.post('/page/:link/delete', function *(link) {
  db('pages').remove({link});
  this.redirect('/');

  saveIndex();
}));

/**
 * Edit a page
 */
app.use(route.post('/page/:link/edit', function *(link) {
  let title   = this.request.body.title;
  let content = this.request.body.content;
  let newLink = this.request.body.link;
  let order   = this.request.body.order;
  if (!title || !title.length) {
    this.status = 406;
    return this.body = 'Page title cannot be empty!';
  }
  if (!newLink || !newLink.length) {
    this.status = 406;
    return this.body = 'Page link cannot be empty!';
  }
  if (newLink != link && db('pages').find({newLink})) {
    this.status = 406;
    return this.body = 'This link already exists!';
  }
  if (['post', 'p', 'style', 'static', 'index'].includes(newLink) || !/^[a-zA-Z0-9_]+$/.test(newLink)) {
    this.status = 406;
    return this.body = 'Illegal link!';
  }

  order = +order;

  db('pages').remove({link});

  db('pages').push({
           title,
           content,
           link: newLink,
    order: order || 0 // filter NaN
  });
  this.redirect('/');

  saveIndex();
  savePage(newLink);
}));

/**
 * Edit settings
 */
app.use(route.post('/settings', function *() {
  let name            = this.request.body.name;
  let pagination      = this.request.body.pagination;
  let footer          = this.request.body.footer;
  let googleAnalytics = this.request.body['google-analytics'];
  let disqus          = this.request.body.disqus;
  let css             = this.request.body.css;

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
    name:               name,
    footer:             footer,
    pagination:         pagination,
    'google-analytics': googleAnalytics || '',
    disqus:             disqus || '',
    css:                css || ''
  };

  this.redirect('back');

  saveIndex();
  saveAllPosts();
}));

// api functions
function postAll(page) {
  let pagination = db('blog').value().pagination;

  let st = ((page || 1) - 1) * pagination;
  return db('posts').chain().orderBy('link', 'desc').slice(st, st + pagination).value();
}

function post(link) {
  return db('posts').find({link});
}

function postPageCnt() {
  let pagination = db('blog').value().pagination;
  return Math.ceil(db('posts').size() / pagination);
}

function pageAll() {
  return db('pages').chain().orderBy('order', 'asc').value();
}

function page(link) {
  return db('pages').find({link});
}

function blogInfo() {
  return db('blog').value();
}

function saveIndex() {
  // write index.html
  let b = blogInfo();
  let t = postPageCnt();

  save('index', generate.apply(this, ['posts', {
    static:  true,
    posts:   postAll(1),
    pages:   pageAll(),
    blog:    b,
    current: 1,
    total:   t
  }]));

  for (let i = 2; i <= t; ++i) {
    save('p/' + i, generate.apply(this, ['posts', {
      static:  true,
      posts:   postAll(i),
      pages:   pageAll(),
      blog:    b,
      current: i,
      total:   t
    }]));
  }
}

function savePost(link) {
  // write post/:id.html
  save('post/' + link, generate('post', {
    static: true,
    post:   post(link),
    marked: marked,
    blog:   blogInfo()
  }));
}

function saveAllPosts() {
  let posts = db('posts').value();

  let b = blogInfo();
  for (let p of posts) {
    save('post/' + p.link, generate('post', {
      static: true,
      post:   p,
      marked: marked,
      blog:   b
    }));
  }
}

function savePage(link) {
  // write :link.html
  save('page/' + link, generate('page', {
    static: true,
    page:   page(link),
    marked: marked,
    blog:   blogInfo()
  }));
}

// init db
if (typeof db.object.blog === 'undefined') {
  db.object.blog = {
    name:               'innsbruck',
    footer:             'copyright 2016 © innsbruck',
    pagination:         10,
    'google-analytics': '',
    disqus:             '',
    css:                ''
  };
}

// bind port
app.listen(3000);
console.log('Innsbruck running on port 3000');
