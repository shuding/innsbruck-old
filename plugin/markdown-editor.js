/**
 * Created by shuding on 5/22/16.
 * <ds303077135@gmail.com>
 */

module.exports = {
  init: _db => {
  },
  render: (template, options) => {
    let context = {};

    if (['post-new', 'post-edit', 'page-new', 'page-edit'].includes(template)) {
      context.head =
        `<link rel="stylesheet" href="//cdn.jsdelivr.net/editor/0.1.0/editor.css">
        <script src="//cdn.jsdelivr.net/editor/0.1.0/editor.js"></script>
        <script src="//cdn.jsdelivr.net/editor/0.1.0/marked.js"></script>`;
      context.editorBottom =
        `<script type="text/javascript">
        // lepture's markdown editor: https://github.com/lepture/editor
        // license: MIT. Copyright (c) 2013 - 2014 by Hsiaoming Yang
          var editor = new Editor();
          editor.render();
          window.onFileUploaded = function (value) {
            // add image insert hook
            editor.codemirror.setValue(editor.codemirror.getValue() + ' ' + value);
          };
         </script>`;
    }

    return context;
  }
};
