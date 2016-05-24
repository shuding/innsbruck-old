/**
 * Created by shuding on 5/21/16.
 * <ds303077135@gmail.com>
 */
'use strict';

const assert = require('chai').assert;
const fs     = require('fs');
const path   = require('path');

const TITLE   = 'Sample Title';
const CONTENT = 'Your time is limited, so don’t waste it living someone else’s life.';

describe('innsbruck', () => {
  var app, request;
  var dbPath = path.join(__dirname, '..', 'db.json');

  before(() => {
    // backup any `db.json` file, if there exists
    if (fs.existsSync(dbPath)) {
      let newPath = path.join(__dirname, '..', `db.${(new Date()).getTime()}.json`);
      fs.renameSync(dbPath, newPath);
      dbPath = newPath;
    } else {
      dbPath = null;
    }

    app     = require('../app')();
    request = require('supertest').agent(app.listen(3000));
  });

  describe('startup', () => {
    it('should bind on port 3000', done => {
      request
        .get('/')
        .expect(200, done);
    });
    it('should host static files', done => {
	  request
        .get('/static/style.css')
        .expect(200, done);
    });
  });

  describe('post', () => {
    it('should display new post page', done => {
      request
        .get('/post/new')
        .expect(200, done);
    });
    it('should create a new post and redirect', done => {
      request
        .post('/post/new')
        .type('form')
        .send({
          title:   TITLE,
          content: CONTENT
        })
        .expect(302, done);
    });
    it('should have created a new html file', () => {
      let filePath = path.join(__dirname, '..', 'post', '1.html');
      assert(fs.existsSync(filePath));
      assert(fs.readFileSync(filePath).toString().includes(CONTENT));
    });
    it('should display post on website', done => {
      request
        .get('/')
        .expect(res => {
          assert(res.text.includes(TITLE));
        })
        .expect(200, () => {
          request
            .get('/post/1')
            .expect(res => {
              assert(res.text.includes(CONTENT));
            })
            .expect(200, done);
        });
    });
    it('should handle illegal post', done => {
      request
        .post('/post/new')
        .expect(500, done);
    });
  });

  after(() => {
    if (dbPath) {
      fs.renameSync(dbPath, path.join(__dirname, '..', 'db.json'));
    } else {
      fs.unlinkSync(path.join(__dirname, '..', 'db.json'));
    }
  });
});
