/**
 * Created by shuding on 5/6/16.
 * <ds303077135@gmail.com>
 */

const path = require('path');
const fs   = require('fs');

// lowdb
const low     = require('lowdb');
const storage = require('lowdb/file-sync');
const db      = low(path.join(__dirname, '..', 'db.json'), {storage});

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

const pluginData = require('./plugin')(db);
const plugin = pluginData.contextFn;
const { save, generateWp, renderWp } = require('./gen');

const renderDynamic = renderWp(plugin);
const renderStatic  = generateWp(plugin);

module.exports = function (_env) {
  "use strict";
  var env = {
    electron: false
  };

  if (_env) {
    for (let k in _env) {
      if (_env.hasOwnProperty(k)) {
        env[k] = _env[k];
      }
    }
  }

  var app = koa();

  let viewPath = env.electron ? path.join(__dirname, '..', 'desktop', 'view') : path.join(__dirname, 'view');

  render(app, {
    root:    viewPath,
    layout:  'layout',
    viewExt: 'ejs',
    cache:   false
  });

  app.use(body());

// static files
  app.use(function *(next) {
    if (this.method != 'GET' || !this.path.match(/^\/static\//g)) {
      return yield next;
    }
    if (env.electron) {
      yield send(this, path.join(__dirname, '..', this.path));
    } else {
      yield send(this, this.path);
    }
  });

// preview
  app.use(function *(next) {
    if (this.method != 'GET' || (!this.path.match(/\.html$/g) && !this.path.match(/\.xml$/g))) {
      return yield next;
    }
    if (env.electron) {
      yield send(this, path.join(__dirname, '..', this.path));
    } else {
      yield send(this, this.path);
    }
  });

// routes
  var blog = require('./blog').init(db, pluginData.plugins);
  var post = require('./post').init(db, pluginData.plugins);
  var page = require('./page').init(db, pluginData.plugins);

// error handling
  app.use(function *(next) {
    try {
      yield next;
    } catch (error) {
      console.error('Error!', error.message);
      this.status = 500;
      yield renderDynamic.call(this, 'error', blog.info(), {
        error,
        env
      });
    }
  });

  app.use(route.get('/', function *() {
    if (env.electron) {
      yield renderDynamic.call(this, 'posts', post.all(), page.all(), blog.info(), {env});
    } else {
      yield renderDynamic.call(this, 'posts', post.list(1), page.all(), blog.info(), {env});
    }
  }));

  app.use(route.get('/p/:cnt', function *(cnt) {
    if (cnt == '1') {
      return this.redirect('/');
    }
    yield renderDynamic.call(this, 'posts', post.list(cnt), page.all(), blog.info(), {env});
  }));

  app.use(route.get('/settings', function *() {
    yield renderDynamic.call(this, 'settings', blog.info(), {env});
  }));

  app.use(route.get('/post/new', function *() {
    yield renderDynamic.call(this, 'post-new', blog.info(), {env});
  }));

  app.use(route.get('/post/:link', function *(link) {
    yield renderDynamic.call(this, 'post', post.show(link), blog.info(), {
      marked,
      env
    });
  }));

  app.use(route.get('/post/:link/edit', function *(link) {
    yield renderDynamic.call(this, 'post-edit', post.show(link), blog.info(), {env});
  }));

  app.use(route.get('/page/new', function *() {
    yield renderDynamic.call(this, 'page-new', blog.info(), {env});
  }));

  app.use(route.get('/page/:link/edit', function *(link) {
    yield renderDynamic.call(this, 'page-edit', blog.info(), page.show(link), {
      marked,
      env
    });
  }));

  app.use(route.get('/refresh-main', function *(next) {
    if (env.electron) {
      yield renderDynamic.call(this, 'refresh-main', blog.info(), {
        env
      });
    } else {
      yield next;
    }
  }));

  app.use(route.get('/:link', function *(link) {
    if (db('pages').find({link})) {
      yield renderDynamic.call(this, 'page', blog.info(), page.show(link), {
        marked,
        env
      });
    }
  }));

  /**
   * Create a post
   */
  app.use(route.post('/post/new', function *() {
    let link = post.new(this.request.body);
    if (env.electron) {
      this.redirect('/');
    } else {
      this.redirect('/post/' + link);
    }

    saveIndex();
    savePost(link);
  }));

  /**
   * Delete a post
   */
  app.use(route.post('/post/:link/delete', function *(link) {
    db('posts').remove({link});
    post.remove(link);
    if (env.electron) {
      this.redirect('/refresh-main');
    } else {
      this.redirect('/');
    }

    saveIndex();
  }));

  /**
   * Edit a post
   */
  app.use(route.post('/post/:link/edit', function *(link) {
    post.edit(link, this.request.body);

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

    if (env.electron) {
      this.redirect('/');
    } else {
      this.redirect('/' + link);
    }

    saveIndex();
    savePage(link);
  }));

  /**
   * Delete a page
   */
  app.use(route.post('/page/:link/delete', function *(link) {
    page.remove(link);
    if (env.electron) {
      this.redirect('/refresh-main');
    } else {
      this.redirect('/');
    }

    saveIndex();
  }));

  /**
   * Edit a page
   */
  app.use(route.post('/page/:link/edit', function *(link) {
    page.test(this.request.body);
    page.remove(link);
    let newLink = page.new(this.request.body);

    this.redirect('/' + link);

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

    save('index', renderStatic.call(this, 'posts', Object.assign(post.list(1), p, b)));

    for (let i = 2; i <= t; ++i) {
      save('p/' + i, renderStatic.call(this, 'posts', Object.assign(post.list(i), p, b)));
    }
  }

  function savePost(link) {
    // write post/:id.html
    link = String(link);
    save('post/' + link, renderStatic('post', Object.assign(post.show(link), blog.info(), {
      marked
    })));
  }

  function saveAllPosts() {
    let posts = db('posts').value();

    let b = blog.info();
    for (let p of posts) {
      save('post/' + p.link, renderStatic('post', Object.assign(b, {
        post: p,
              marked
      })));
    }
  }

  function savePage(link) {
    // write :link.html
    save('page/' + link, renderStatic('page', Object.assign(blog.info(), page.show(link), {
      marked
    })));
  }

// init db
  if (typeof db.object.blog === 'undefined') {
    db.object.blog = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog.default.json')));
  }

  return app;
};
