/**
 * Created by shuding on 5/24/16.
 * <ds303077135@gmail.com>
 */

const fs   = require('fs');
const path = require('path');

const marked = require('marked');

const FEED_CNT = 10;

function gen() {
  let data = this.db.object;

  if (!data.blog.plugin.rss) {
    return;
  }

  let feed_url = data.blog.plugin.rss;
  let xml_name = feed_url.split('/').reverse()[0];
  let site_url = feed_url.split('/').reverse().filter((it, i) => i).reverse().join('/') + '/';

  let feed = new this.rss({
    title: data.blog.name,
           feed_url,
           site_url
  });

  let posts = this.db('posts').chain().orderBy('link', 'desc').slice(0, FEED_CNT).value();
  posts && posts.forEach(post => {
    feed.item({
      title:       post.title,
      description: marked(post.content),
      url:         site_url + 'post/' + post.link,
      guid:        post.link,
      date:        post.time
    });
  });

  fs.writeFileSync(path.join(this.root, xml_name), feed.xml({indent: true}));
}

module.exports = {
  db:     null,
  rss:    null,
  root:   null,
  init:   (_db, _rootDir) => {
    this.db   = _db;
    this.root = _rootDir;
    this.rss  = require('rss');
  },
  render: (template, options) => {
    let context = {};
    let rss     = options.blog.plugin ? options.blog.plugin['rss'] || '' : '';

    if (template == 'settings') {
      // settings page
      context.settings = `<div class="input-group">
          <h5>RSS URL</h5>
          <p><input type="text" name="plugin.rss" placeholder="http(s)://your.blog/rss.xml" value="${rss}"></p>
        </div>`;
      // All <input name='plugin.xxx'> will write the data into DB automatically
    }

    return context;
  },
  hook:   {
    onNewPost:    () => {
      gen.call(this);
    },
    onEditPost:   () => {
      gen.call(this);
    },
    onRemovePost: () => {
      gen.call(this);
    },
    onSetting:    () => {
      gen.call(this);
    }
  }
};
