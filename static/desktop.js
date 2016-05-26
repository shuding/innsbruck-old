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

    var buttonIframeLinks = document.querySelectorAll('button.btn-iframe');
    var iframe            = document.getElementById('frame');
    var currentFrame      = null;
    if (iframe) {
      [].forEach.call(buttonIframeLinks, function (el) {
        el.onclick = function () {
          if (currentFrame == el) {
            return;
          }
          if (currentFrame) {
            currentFrame.className = 'btn btn-default btn-iframe';
          }
          el.className = 'btn btn-default btn-iframe active';
          currentFrame = el;
          iframe.src   = this.dataset['iframe'];
        };
      });
    }

    var postSelects = document.querySelectorAll('.post-select');
    var current     = null;
    [].forEach.call(postSelects, function (el) {
      el.onclick = function () {
        if (current == el) {
          return;
        }
        if (current) {
          current.className = 'nav-group-item post-select';
        }
        el.className = 'nav-group-item post-select active';
        current      = el;
        pane && (pane.src = this.dataset['link']);
      };
    });

    window.iconfirm = function (text, ok, cancel) {
      var el = document.createElement('div');
      var btn1 = document.createElement('button');
      var btn2 = document.createElement('button');
      var btnContainer = document.createElement('div');
      el.id = 'i-confirm';
      btn1.className = 'btn btn-primary pull-right';
      btn2.className = 'btn btn-default pull-right';
      btnContainer.className = 'toolbar-actions';
      btn1.innerText = 'OK';
      btn2.innerText = 'Cancel';
      btnContainer.appendChild(btn1);
      btnContainer.appendChild(btn2);
      el.innerHTML = '<header class="toolbar">' +
                     '<h1 class="title">' + text + '</h1>' +
                     '</header>';
      el.childNodes[0].appendChild(btnContainer);
      document.body.appendChild(el);

      btn1.onclick = function (ev) {
        ok && ok(ev);
        document.body.removeChild(el);
      };
      btn2.onclick = function (ev) {
        cancel && cancel(ev);
        document.body.removeChild(el);
      };
    };
  }, false);
})(window, window.document);
