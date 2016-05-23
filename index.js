/**
 * Created by shuding on 5/6/16.
 * <ds303077135@gmail.com>
 */
"use strict";

// entry point here
const opener = require('opener');
const app    = require('./app')();

var PORT   = 3000;
var SILENT = false;

process.argv.forEach(val => {
  var [k, v] = val.split('=');
  if (k == '--port') {
    PORT = Number(v);
  }
  if (k == '-s') {
    SILENT = true;
  }
});

// bind port
app.listen(PORT, err => {
  console.log('Innsbruck running on port ' + PORT);
  if (!SILENT) {
    opener('http://localhost' + (PORT == 80 ? '' : ':' + PORT));
  }
});
