/* runs before i18n's sweep, so every node it writes carries text, not keys */
(function () {
  'use strict';

  var I18N = window.I18N || {};
  var tx = I18N.t || function (p) { return p && p.en != null ? p.en : p; };

  var id = document.body.getAttribute('data-page');
  var here = null;
  (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).forEach(function (p) {
    if (p.id === id) here = p;
  });
  if (!here) return;

  function fill(elId, text) {
    var n = document.getElementById(elId);
    if (n) n.textContent = text;
  }

  fill('p-name', here.name);
  fill('p-tag', tx(here.tagline));
  fill('p-body', tx(here.body));

  var mark = document.getElementById('p-mark');
  if (mark) {
    mark.src = '../assets/marks/' + here.id + '.svg';
    mark.alt = '';
  }

  document.title = here.name;
  var desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', tx(here.tagline));
})();
