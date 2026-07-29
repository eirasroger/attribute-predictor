(function () {
  'use strict';

  var SPEED = 26;      /* px per second */
  var RESUME = 2200;   /* ms of quiet after a manual scroll */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var I18N = window.I18N || {};
  var tx = I18N.t || function (p) { return p && p.en != null ? p.en : p; };

  /* markup ships English; js/products.js is the source of truth */
  function fillCards() {
    var byId = {};
    (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).forEach(function (p) {
      byId[p.id] = p;
    });

    document.querySelectorAll('.card').forEach(function (card) {
      var p = byId[card.getAttribute('data-tint')];
      if (!p) return;
      var name = card.querySelector('.card-name');
      var tag = card.querySelector('.card-tag');
      if (name) name.textContent = p.name;
      if (tag) tag.textContent = tx(p.tagline);
    });
  }

  function initRail() {
    var rail = document.getElementById('rail');
    var prev = document.getElementById('rail-prev');
    var next = document.getElementById('rail-next');
    if (!rail || !prev || !next) return;

    var frame = rail.parentNode;
    var cards = [].slice.call(rail.children);
    if (!cards.length) return;

    var hold = function () {};

    function step() {
      return cards.length > 1
        ? cards[1].offsetLeft - cards[0].offsetLeft
        : rail.clientWidth;
    }
    function fits() { return rail.scrollWidth - rail.clientWidth < 4; }

    prev.addEventListener('click', function () {
      rail.scrollBy({ left: -step(), behavior: 'smooth' });
      hold(RESUME);
    });
    next.addEventListener('click', function () {
      rail.scrollBy({ left: step(), behavior: 'smooth' });
      hold(RESUME);
    });

    frame.classList.toggle('rail-fits', fits());
    if (reduced || fits()) {
      window.addEventListener('resize', function () {
        frame.classList.toggle('rail-fits', fits());
      });
      return;
    }

    cards.forEach(function (c) {
      var copy = c.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('tabindex', '-1');
      rail.appendChild(copy);
    });

    var loop = rail.children[cards.length].offsetLeft - cards[0].offsetLeft;
    var pos = rail.scrollLeft;
    var hovered = false, focused = false, quiet = null, last = 0, seen = true;

    hold = function (ms) {
      if (quiet) clearTimeout(quiet);
      quiet = setTimeout(function () {
        quiet = null;
        pos = rail.scrollLeft;
        if (pos >= loop) { pos -= loop; rail.scrollLeft = pos; }
      }, ms);
    };

    function running() {
      return !hovered && !focused && !quiet && seen && !document.hidden;
    }

    function tick(ts) {
      if (!running()) {
        last = 0;
      } else {
        if (last) {
          pos += SPEED * (ts - last) / 1000;
          if (pos >= loop) pos -= loop;
          rail.scrollLeft = pos;
        }
        last = ts;
      }
      requestAnimationFrame(tick);
    }

    rail.addEventListener('scroll', function () {
      if (Math.abs(rail.scrollLeft - pos) < 1.5) return;
      hold(RESUME);
    }, { passive: true });

    rail.addEventListener('pointerenter', function () { hovered = true; });
    rail.addEventListener('pointerleave', function () { hovered = false; });
    rail.addEventListener('focusin', function () { focused = true; });
    rail.addEventListener('focusout', function () { focused = false; });

    window.addEventListener('resize', function () {
      loop = rail.children[cards.length].offsetLeft - cards[0].offsetLeft;
    });

    if ('IntersectionObserver' in window) {
      seen = false;
      new IntersectionObserver(function (e) {
        seen = e[0].isIntersecting;
      }, { threshold: 0.2 }).observe(rail);
    }

    requestAnimationFrame(tick);
  }

  fillCards();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRail);
  } else {
    initRail();
  }
})();
