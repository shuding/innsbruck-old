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
  const plugins   = fs
    .readdirSync(pluginDir)
    .filter(filename => filename.endsWith('.js'))
    .map(filename => require(path.join('..', 'plugin', filename)));

  // init all plugins
  plugins.forEach(plugin => (plugin.init && plugin.init(db)));

  return {
    plugins:   plugins,
    contextFn: function (template, options) {
      "use strict";

      let pluginContext = {};
      let plugin        = {};
      plugins.forEach(plugin => {
        let context = plugin.render(template, options);
        for (let k in context) {
          if (context.hasOwnProperty(k)) {
            if (pluginContext[k]) {
              pluginContext[k].push(context[k]);
            } else {
              pluginContext[k] = [context[k]];
            }
          }
        }
      });

      for (let k in pluginContext) {
        if (pluginContext.hasOwnProperty(k)) {
          plugin[k] = function (...args) {
            let ret = '';
            for (let v of pluginContext[k]) {
              if (typeof v === 'string') {
                ret += v;
              } else {
                ret += v(...args);
              }
            }
            return ret;
          };
        }
      }

      plugin.enable = true;

      return Object.assign(options, {plugin});
    }
  };

};
