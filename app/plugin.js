/**
 * Created by shuding on 5/22/16.
 * <ds303077135@gmail.com>
 */

"use strict";

const fs   = require('fs');
const path = require('path');

module.exports = function (db) {
  // include all plugins
  const pluginDir = path.join(__dirname, '..', 'plugin');
  const plugins = fs.readdirSync(pluginDir).filter(filename => {
    "use strict";
    return filename.endsWith('.js');
  }).map(filename => {
    return require(path.join('..', 'plugin', filename));
  });

  // init all plugins
  plugins.forEach(plugin => {
    plugin.init && plugin.init(db);
  });

  return function (template, options) {
    "use strict";

    let pluginContext = {};
    plugins.forEach(plugin => {
      let context = plugin.render(template, options);
      for (let k in context)
        if (context.hasOwnProperty(k)) {
          pluginContext[k] = (pluginContext[k] || '') + context[k];
        }
    });

    pluginContext.enable = true;

    return Object.assign(options, {
      plugin: pluginContext
    });
  }

};
