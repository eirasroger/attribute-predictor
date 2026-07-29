/* ---------------------------------------------------------------------------
   The shell every page shares: top bar, footer, and the behaviour attached to
   them. Built synchronously so i18n.js still finds the nodes on DOMContentLoaded.

   Read off <body>: data-base ('' or '../'), data-page, data-mark, data-tag,
   data-note, data-topbar-hold.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var body = document.body;
  var base = body.getAttribute('data-base') || '';
  var page = body.getAttribute('data-page') || '';
  var mark = body.getAttribute('data-mark');
  var tag = body.getAttribute('data-tag');
  var note = body.getAttribute('data-note');
  var hold = body.getAttribute('data-topbar-hold');

  var BRAND = 'Company';
  var MAIL = 'roger.verges.eiras@gmail.com';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tx = (window.I18N && window.I18N.t) ||
           function (p) { return p && p.en != null ? p.en : p; };

  var list = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
  var here = null;
  list.forEach(function (p) { if (p.id === page) here = p; });

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/"/g, '&quot;');
  }

  function mailto() {
    var subject = here ? here.name : BRAND;
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject);
  }

  /* --- top bar ------------------------------------------------------------ */

  function idBlock() {
    if (!here) return '<span class="wordmark">' + BRAND + '</span>';

    var out = '<a class="topbar-home" href="' + base + '">' + BRAND + '</a>' +
              '<span class="topbar-sep" aria-hidden="true">/</span>';
    if (mark) {
      out += '<img class="topbar-mark" src="' + esc(base + mark) +
             '" alt="" width="22" height="22">';
    }
    out += '<span class="wordmark">' + esc(here.name) + '</span>';
    if (tag) out += '<span class="topbar-tag" data-i18n="' + esc(tag) + '"></span>';
    return out;
  }

  /* ids avoid "products": the hub section already owns it, and #products is
     the anchor the "All products" row points at */
  function productMenu() {
    var rows = list.map(function (p) {
      var current = p.id === page ? ' aria-current="page"' : '';
      return '<li><a class="drop-item" data-tint="' + p.id + '" ' +
                    'href="' + base + p.slug + '/"' + current + '>' +
               '<span class="drop-art">' +
                 '<img src="' + base + 'assets/marks/' + p.id + '.svg" ' +
                      'alt="" width="200" height="150">' +
               '</span>' +
               '<span class="drop-text">' +
                 '<span class="drop-name">' + esc(p.name) + '</span>' +
                 '<span class="drop-tag">' + esc(tx(p.tagline)) + '</span>' +
               '</span>' +
             '</a></li>';
    }).join('');

    return '<div class="drop" id="prod-menu">' +
      '<button type="button" class="drop-btn" id="prod-btn" ' +
              'aria-expanded="false" aria-controls="prod-list">' +
        '<span data-i18n="nav.products">Products</span>' +
        '<svg class="caret" viewBox="0 0 10 6" fill="none" stroke="currentColor" ' +
             'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ' +
             'aria-hidden="true" focusable="false"><path d="M1 1.4 5 5 9 1.4"/></svg>' +
      '</button>' +
      '<div class="drop-panel" id="prod-list">' +
        '<ul>' + rows + '</ul>' +
        '<a class="drop-all" href="' + base + '#products">' +
          '<span data-i18n="nav.allproducts">All products</span>' +
          '<svg viewBox="0 0 12 10" fill="none" stroke="currentColor" ' +
               'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
               'aria-hidden="true" focusable="false">' +
            '<path d="M1 5h9M6.8 1.2 10.6 5l-3.8 3.8"/></svg>' +
        '</a>' +
      '</div>' +
    '</div>';
  }

  function buildTopbar() {
    var bar = document.getElementById('topbar');
    if (!bar) return;

    bar.className = 'topbar';
    bar.innerHTML =
      '<div class="topbar-id">' + idBlock() + '</div>' +

      '<nav class="nav" data-i18n-attr="aria-label:nav.label" aria-label="Main">' +
        '<button type="button" class="nav-toggle" id="nav-toggle" ' +
                'aria-expanded="false" aria-controls="nav-items" ' +
                'data-i18n-attr="aria-label:nav.menu" aria-label="Menu">' +
          '<span class="nav-bars" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '</button>' +

        '<div class="nav-items" id="nav-items">' +
          '<a class="nav-link" href="' + (base || './') + '"' +
             (page === 'hub' ? ' aria-current="page"' : '') +
             ' data-i18n="nav.home">Home</a>' +
          productMenu() +
          '<a class="nav-link" href="' + mailto() + '" ' +
             'data-i18n="nav.contact">Contact</a>' +

          '<div class="lang" id="lang">' +
            '<button type="button" class="lang-btn" id="lang-btn" ' +
                    'aria-expanded="false" aria-controls="lang-list" ' +
                    'data-i18n-attr="aria-label:ui.language" aria-label="Language">' +
              '<svg class="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                   'stroke-width="1.4" stroke-linecap="round" aria-hidden="true" ' +
                   'focusable="false">' +
                '<circle cx="12" cy="12" r="9.25"/>' +
                '<path d="M12 2.75v18.5M2.75 12h18.5"/>' +
                '<path d="M4.4 6.6c2.2.9 4.8 1.4 7.6 1.4s5.4-.5 7.6-1.4"/>' +
                '<path d="M4.4 17.4c2.2-.9 4.8-1.4 7.6-1.4s5.4.5 7.6 1.4"/>' +
                '<ellipse cx="12" cy="12" rx="4.4" ry="9.25"/>' +
              '</svg>' +
              '<span class="lang-code" id="lang-code">EN</span>' +
              '<svg class="caret" viewBox="0 0 10 6" fill="none" stroke="currentColor" ' +
                   'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ' +
                   'aria-hidden="true" focusable="false"><path d="M1 1.4 5 5 9 1.4"/></svg>' +
            '</button>' +

            '<ul class="lang-list" id="lang-list">' +
              '<li><button type="button" class="lang-opt" data-lang="en" lang="en">' +
                '<img src="' + base + 'assets/british-language.webp" alt="" ' +
                     'width="20" height="20">' +
                '<span data-i18n="ui.english">English</span></button></li>' +
              '<li><button type="button" class="lang-opt" data-lang="ca" lang="ca">' +
                '<img src="' + base + 'assets/catalan-language.webp" alt="" ' +
                     'width="20" height="20">' +
                '<span data-i18n="ui.catalan">Català</span></button></li>' +
              '<li><button type="button" class="lang-opt" data-lang="es" lang="es">' +
                '<img src="' + base + 'assets/spanish-language.webp" alt="" ' +
                     'width="20" height="20">' +
                '<span data-i18n="ui.spanish">Español</span></button></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</nav>';
  }

  /* --- footer ------------------------------------------------------------- */

  function buildFooter() {
    var foot = document.getElementById('sitefooter');
    if (!foot) return;

    var links = list.map(function (p) {
      var current = p.id === page ? ' aria-current="page"' : '';
      return '<li><a href="' + base + p.slug + '/"' + current + '>' +
             esc(p.name) + '</a></li>';
    }).join('');

    foot.className = 'footer';
    foot.innerHTML =
      '<div class="footer-inner">' +
        '<div class="footer-cols">' +
          '<div class="footer-brand">' +
            '<a class="footer-home" href="' + base + '">' + BRAND + '</a>' +
            '<p class="footer-contact">Roger Vergés<br>' +
              '<a href="mailto:' + MAIL + '">' + MAIL + '</a></p>' +
          '</div>' +
          '<nav class="footer-col" data-i18n-attr="aria-label:footer.products">' +
            '<h2 class="footer-col-head" data-i18n="footer.products">Products</h2>' +
            '<ul>' + links + '</ul>' +
          '</nav>' +
        '</div>' +
        (note ? '<p class="footer-note" data-i18n="' + esc(note) + '"></p>' : '') +
        '<p class="footer-legal" data-i18n="footer.legal"></p>' +
      '</div>';
  }

  /* --- behaviour ---------------------------------------------------------- */

  function initTopbar() {
    var bar = document.getElementById('topbar');
    if (!bar) return;
    if (hold !== 'hero') { bar.classList.add('visible'); return; }

    function check() {
      bar.classList.toggle('visible', window.scrollY > window.innerHeight * 0.45);
    }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* state lives on aria-expanded; the CSS reads it, so there is no second copy */
  function initNav() {
    var groups = [
      { btn: document.getElementById('nav-toggle'), box: document.querySelector('.nav') },
      { btn: document.getElementById('prod-btn'),   box: document.getElementById('prod-menu') },
      { btn: document.getElementById('lang-btn'),   box: document.getElementById('lang') }
    ].filter(function (g) { return g.btn && g.box; });

    if (!groups.length) return;

    var bar = document.getElementById('topbar');

    function setOpen(g, open) {
      g.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      g.box.setAttribute('data-open', open ? 'true' : 'false');
      if (bar && g.box.classList.contains('nav')) {
        bar.classList.toggle('nav-open', open);
      }
    }
    function closeAll(except) {
      groups.forEach(function (g) { if (g !== except) setOpen(g, false); });
    }

    groups.forEach(function (g) {
      setOpen(g, false);
      g.btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = g.btn.getAttribute('aria-expanded') !== 'true';
        closeAll(g);
        setOpen(g, open);
      });
      /* a click inside must not count as a click outside */
      g.box.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.addEventListener('click', function () { closeAll(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      groups.forEach(function (g) {
        if (g.btn.getAttribute('aria-expanded') === 'true') {
          setOpen(g, false);
          g.btn.focus();
        }
      });
    });

    /* the panel and the drop are different things either side of 44rem */
    var narrow = window.matchMedia('(max-width: 44rem)');
    var onChange = function () { closeAll(); };
    if (narrow.addEventListener) narrow.addEventListener('change', onChange);
    else if (narrow.addListener) narrow.addListener(onChange);
  }

  function initReveals() {
    var native = window.CSS && CSS.supports &&
                 CSS.supports('animation-timeline', 'view()');
    if (native || reduced || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });

    document.querySelectorAll('.reveal').forEach(function (n) { io.observe(n); });
  }

  buildTopbar();
  buildFooter();
  initTopbar();
  initNav();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveals);
  } else {
    initReveals();
  }
})();
