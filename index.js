/**
 * Created by shuding on 5/6/16.
 * <ds303077135@gmail.com>
 */

// entry point here
const opener = require('opener');
const app    = require('./app');

// bind port
app.listen(3000, err => {
  console.log('Innsbruck running on port 3000');
  opener('http://localhost:3000');
});
