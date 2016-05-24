/**
 * Created by shuding on 5/24/16.
 * <ds303077135@gmail.com>
 */

const fs   = require('fs');
const path = require('path');

module.exports = {
  db:     null,
  init:   _db => {
    this.db = _db;
  },
  render: (template, options) => {
    let cname   = options.blog.plugin ? options.blog.plugin['cname'] || '' : '';
    let context = {};

    if (template == 'settings') {
      // settings page
      context.settings = `<div class="input-group">
          <h5>CNAME</h5>
          <p><input type="text" name="plugin.cname" placeholder="" value="${cname}"></p>
        </div>`;
      // All <input name='plugin.xxx'> will write the data into DB automatically
    }

    return context;
  },
  hook:   {
    onSetting: () => {
      // called after
      let cname = this.db.object.blog.plugin ? this.db.object.blog.plugin['cname'] || '' : '';
      let cnamePath = path.join(__dirname, '..', 'CNAME');
      if (!cname) {
        // empty, remove the CNAME file
        if (fs.existsSync(cnamePath)) {
          fs.unlinkSync(cnamePath);
        }
      } else {
        // write to ../CNAME
        fs.writeFileSync(cnamePath, cname);
      }
    }
  }
};
