/**
 * Created by shuding on 5/24/16.
 * <ds303077135@gmail.com>
 */
(function (window, document, undefined) {
  // Set desktop (electron) scripts
  window.addEventListener('load', function () {
    "use strict";
    var pane = document.getElementById('pane-view');

    var formControls = document.querySelectorAll('input[type=text]');
    [].forEach.call(formControls, function (el) {
      el.className += ' form-control';
    });

    var buttonLinks = document.querySelectorAll('button.btn-link');
    [].forEach.call(buttonLinks, function (el) {
      el.onclick = function () {
        window.location.href = this.dataset['link'];
      };
    });

    var postSelects = document.querySelectorAll('.post-select');
    [].forEach.call(postSelects, function (el) {
      el.onclick = function () {
        pane && (pane.src = this.dataset['link']);
      };
    });

    window.onmessage = function(e){
      pane && (pane.contentWindow.postMessage(eval(e.data).toString(), '*'));
    };
  }, false);
})(window, window.document);
