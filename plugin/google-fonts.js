/**
 * Created by shuding on 5/22/16.
 * <ds303077135@gmail.com>
 */

module.exports = {
  db: null,
  init: _db => {
    this.db = _db;
  },
  render: (template, options) => {
    let font = options.blog.plugin ? options.blog.plugin['google-fonts'] : '';
    let context = {};

    if (template == 'settings') {
      // settings page
      context.settings =
        `<div class="input-group">
          <h5>Google Fonts</h5>
          <p><input type="text" name="plugin.google-fonts" placeholder="Architects Daughter" value="${font}"></p>
        </div>`;
    }

    if (font)
      context.head =
        `<link href='https://fonts.googleapis.com/css?family=${font}:normal,italic,semibold,semibolditalic,bold,bolditalic' rel='stylesheet' type='text/css'>
        <style>body { font-family: '${font}', sans-serif }</style>`;

    return context;
  }
};
