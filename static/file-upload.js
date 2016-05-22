/**
 * Created by shuding on 5/21/16.
 * <ds303077135@gmail.com>
 */
(function (window, document, undefined) {
  var uploadEls = document.querySelectorAll('.file-upload');
  var uploads = [];
  [].forEach.call(uploadEls, function (el) {
    uploads.push(el);
  });

  var pause = function (el) {
    el.style.opacity = '0.2';
    el.style.pointerEvents = 'none';
  };

  var resume = function (el) {
    el.style.opacity = '1';
    el.style.pointerEvents = 'inherit';

    // resets
    el.value = '';
    el.type  = 'text';
    el.type  = 'file';
  };

  var finish = function (filename) {
    var editor = document.querySelector('textarea[name=content]');
    editor.value += '![' + filename + '](/static/' + filename + ')';
    window.onFileUploaded && window.onFileUploaded('![' + filename + '](/static/' + filename + ')');
  };

  var init = function (el) {
    el.style.display = 'initial';
    el.addEventListener('change', function () {
      uploads.forEach(pause);
      var formData = new FormData();
      var request = new XMLHttpRequest();

      formData.append('file', el.files[0]);
      request.open('POST', '/upload');
      request.send(formData);
      request.onload = function () {
        if (el.className.indexOf('upload-finish') != -1) {
          finish(el.files[0].name);
        }
        uploads.forEach(resume);
      };
    });
  };

  uploads.forEach(init);
})(window, document);