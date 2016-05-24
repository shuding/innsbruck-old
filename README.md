# innsbruck

[![https://img.shields.io/travis/quietshu/innsbruck.svg](https://img.shields.io/travis/quietshu/innsbruck.svg)](https://travis-ci.org/quietshu/innsbruck)
[![https://img.shields.io/npm/v/innsbruck-blog.svg](https://img.shields.io/npm/v/innsbruck-blog.svg)](https://www.npmjs.com/package/innsbruck-blog)
[![https://img.shields.io/npm/l/innsbruck-blog.svg](https://img.shields.io/npm/l/innsbruck-blog.svg)](https://www.npmjs.com/package/innsbruck-blog)

A minimal, static, content focused and super light weighted blogging tool. For humans.

## usage (for developers)

0. Make sure you have:
    1. Node.js >= 5.0.0 (use `$ node -v` to print the version (you can use the library `n` to switch Node.js version))
    2. NPM
1. Clone this repo into your `username.github.io` repo (GitHub Pages)
2. Cd into the repo path: `$ cd username.github.io`
3. Install dependencies: `$ npm install`
4. Start: `$ npm start` and you will see the server running on port 3000
5. ~~Open http://localhost:3000 in your browser~~
6. Manage your site / write posts, any change will trigger the static site building automatically (yeah, in this root directory)
7. Git push

Terminal arguments:
- Custom port number: `$ node index.js --port=2000`
- Do not open in the browser automatically when starting up: `$ node index.js -s`

### build with electron (not ready!)

Develop build:

1. Install the latest version of __electron-prebuilt__, which supports ES6: `$ electron -v` >= 1.1.1.
2. `$ npm run prebuild-desktop`
3. `$ npm run electron`

Production build: 

1. Install __electron-packager__ globally: `$ npm i electron-packager -g`
2. `$ electron-packager . innsbruck --out=build --platform=darwin --arch=x64 --version=1.1.1 --overwrite`
3. Built app will be in the `build` folder

## usage (binary application)

TODO.

## changelog

TODO.

## demo

http://quietshu.github.io/

[![screen shot](./screenshot.png)](http://quietshu.github.io/)

## plugins

See /plugin/google-fonts.js.

## other

- Accessibility
- Custom CSS
- Google Analytics
- Disqus
- ~~Supports `<noscript>` tag~~
- Plugin System

## acknowledgements

- by Shu Ding
- koa, ejs, lowdb, marked
- MIT licensed

<3, bye!
