(function () {
  'use strict';

  var LANGS = ['en', 'ca', 'es'];

  /* set by js/boot.js in <head> */
  var lang = document.documentElement.lang;
  if (LANGS.indexOf(lang) < 0) lang = 'en';

  /* --- resolving ---------------------------------------------------------- */

  /* falls back to English: a gap must surface in audit(), not as a blank */
  function t(pair) {
    if (pair == null) return '';
    if (typeof pair === 'string') return pair;
    return pair[lang] != null ? pair[lang] : pair.en;
  }

  /* only English writes 0.310 */
  function num(text) {
    return lang === 'en' ? String(text) : String(text).replace(/\./g, ',');
  }

  var COPY = {

    /* chrome -------------------------------------------------------------- */
    'ui.language': { en: 'Language', ca: 'Idioma',  es: 'Idioma'  },
    'ui.english':  { en: 'English',  ca: 'English', es: 'English' },
    'ui.catalan':  { en: 'Català',   ca: 'Català',  es: 'Català'  },
    'ui.spanish':  { en: 'Español',  ca: 'Español', es: 'Español' },

    'nav.label':    { en: 'Main',     ca: 'Principal', es: 'Principal' },
    'nav.menu':     { en: 'Menu',     ca: 'Menú',      es: 'Menú'      },
    'nav.home':     { en: 'Home',     ca: 'Inici',     es: 'Inicio'    },
    'nav.contact':  { en: 'Contact',  ca: 'Contacte',  es: 'Contacto'  },
    'nav.products': { en: 'Our products', ca: 'Els nostres productes',
                      es: 'Nuestros productos' },
    'nav.allproducts': { en: 'All products', ca: 'Tots els productes',
                         es: 'Todos los productos' },

    'status.soon':    { en: 'In development', ca: 'En desenvolupament',
                        es: 'En desarrollo' },
    'status.explore': { en: 'Explore', ca: 'Descobreix', es: 'Descúbrelo' },
    'status.note': {
      en: 'This one is being built. There is nothing to download yet.',
      ca: 'Aquest s\'està construint. Encara no hi ha res per descarregar.',
      es: 'Este se está construyendo. Todavía no hay nada que descargar.'
    },
    'status.ask': { en: 'Ask about it', ca: 'Pregunta\'ns', es: 'Pregúntanos' },

    'footer.products': { en: 'Products', ca: 'Productes', es: 'Productos' },
    'footer.legal': {
      en: '© 2026 Roger Vergés. All rights reserved.',
      ca: '© 2026 Roger Vergés. Tots els drets reservats.',
      es: '© 2026 Roger Vergés. Todos los derechos reservados.'
    }
  };

  var missing = [];

  function add(dict) {
    Object.keys(dict).forEach(function (key) { COPY[key] = dict[key]; });
  }

  function s(key) {
    var entry = COPY[key];
    if (!entry) { missing.push(key + ' (no such key)'); return ''; }
    return t(entry);
  }

  /* --- applying to the document -------------------------------------------- */

  function apply(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (n) {
      n.textContent = s(n.getAttribute('data-i18n'));
    });
    (root || document).querySelectorAll('[data-i18n-html]').forEach(function (n) {
      n.innerHTML = s(n.getAttribute('data-i18n-html'));
    });
    (root || document).querySelectorAll('[data-i18n-attr]').forEach(function (n) {
      n.getAttribute('data-i18n-attr').split(',').forEach(function (bit) {
        var half = bit.split(':');
        if (half.length === 2) {
          n.setAttribute(half[0].trim(), s(half[1].trim()));
        }
      });
    });
    if (COPY['meta.title']) document.title = s('meta.title');
  }

  /* console only: a half-translated page must still serve */
  function audit() {
    Object.keys(COPY).forEach(function (key) {
      LANGS.forEach(function (l) {
        if (COPY[key][l] == null) missing.push(key + ' [' + l + ']');
      });
    });

    function check(pair, where) {
      if (pair == null) return;
      if (typeof pair === 'string') { missing.push(where + ' (not translated)'); return; }
      LANGS.forEach(function (l) {
        if (pair[l] == null) missing.push(where + ' [' + l + ']');
      });
    }

    if (typeof PRODUCTS !== 'undefined') {
      PRODUCTS.forEach(function (p) {
        check(p.tagline, 'PRODUCTS.' + p.id + '.tagline');
        check(p.body,    'PRODUCTS.' + p.id + '.body');
      });
    }
    if (typeof INDICATORS !== 'undefined') {
      INDICATORS.forEach(function (i) {
        check(i.short, 'INDICATORS.' + i.key + '.short');
        check(i.axis,  'INDICATORS.' + i.key + '.axis');
      });
    }
    if (typeof CATEGORY !== 'undefined') check(CATEGORY.name, 'CATEGORY.name');
    if (typeof VARIANTS !== 'undefined') {
      VARIANTS.forEach(function (v) {
        check(v.name, 'VARIANTS.' + v.id + '.name');
        check(v.note, 'VARIANTS.' + v.id + '.note');
        v.materials.forEach(function (m, i) {
          check(m.name, 'VARIANTS.' + v.id + '.materials[' + i + ']');
        });
      });
    }
    if (typeof STAGES !== 'undefined') {
      STAGES.forEach(function (st) { check(st.desc, 'STAGES.' + st.key + '.desc'); });
    }
    if (typeof LANES !== 'undefined') {
      LANES.forEach(function (l) {
        check(l.field, 'LANES.' + l.id + '.field');
        check(l.where, 'LANES.' + l.id + '.where');
      });
    }
    if (typeof LANE_MISSING !== 'undefined') {
      check(LANE_MISSING.field, 'LANE_MISSING.field');
      check(LANE_MISSING.note,  'LANE_MISSING.note');
    }
    if (typeof COMP !== 'undefined') {
      check(COMP.basis, 'COMP.basis');
      check(COMP.field, 'COMP.field');
      check(COMP.where, 'COMP.where');
      COMP.materials.forEach(function (m) {
        check(m.name, 'COMP.' + m.id + '.name');
      });
    }
    if (typeof SOURCES !== 'undefined') {
      SOURCES.forEach(function (s2) {
        check(s2.label, 'SOURCES.' + s2.id + '.label');
        check(s2.note,  'SOURCES.' + s2.id + '.note');
      });
    }
    if (typeof CATALOGUE !== 'undefined') {
      CATALOGUE.filters.forEach(function (f) {
        check(f.label, 'CATALOGUE.filters.' + f.id);
      });
    }
    /* the acronyms in FAMILIES are plain strings on purpose */
    if (typeof FAMILIES !== 'undefined') {
      check(FAMILIES.mw, 'FAMILIES.mw');
      check(FAMILIES.gw, 'FAMILIES.gw');
    }
    if (typeof DOCS !== 'undefined') {
      DOCS.forEach(function (d) {
        check(d.kind,  'DOCS.' + d.id + '.kind');
        check(d.gives, 'DOCS.' + d.id + '.gives');
        d.record.forEach(function (f, i) {
          check(f.k, 'DOCS.' + d.id + '.record[' + i + ']');
        });
      });
    }
    if (typeof SCHEMAS !== 'undefined') {
      SCHEMAS.forEach(function (s2) {
        check(s2.name, 'SCHEMAS.' + s2.id + '.name');
        s2.fields.forEach(function (f, i) {
          check(f.n, 'SCHEMAS.' + s2.id + '.fields[' + i + '].n');
          check(f.d, 'SCHEMAS.' + s2.id + '.fields[' + i + '].d');
        });
      });
    }

    if (window.ASSEMBLY) {
      check(window.ASSEMBLY.name, 'ASSEMBLY.name');
      window.ASSEMBLY.layers.forEach(function (l) {
        check(l.name, 'ASSEMBLY.' + l.id + '.name');
        l.materials.forEach(function (m, i) {
          check(m.name, 'ASSEMBLY.' + l.id + '.materials[' + i + ']');
        });
      });
    }

    if (missing.length) {
      console.warn('[i18n] ' + missing.length + ' missing translation(s):\n  ' +
                   missing.join('\n  '));
    }
  }

  /* reload, not re-render: half the page is JS-built and some of it is
     mid-animation at any moment */
  function setLang(next) {
    if (LANGS.indexOf(next) < 0 || next === lang) return;
    try { localStorage.setItem('ap-lang', next); } catch (e) {}
    var url = new URL(location.href);
    url.searchParams.set('lang', next);
    location.href = url.toString();
  }

  function initToggle() {
    var code = document.getElementById('lang-code');
    if (code) code.textContent = lang.toUpperCase();

    Array.prototype.forEach.call(
      document.querySelectorAll('.lang-opt'),
      function (b) {
        var pick = b.getAttribute('data-lang');
        /* aria-current, not aria-pressed: destinations, not toggles */
        b.setAttribute('aria-current', pick === lang ? 'true' : 'false');
        b.addEventListener('click', function () { setLang(pick); });
      }
    );
  }

  function start() {
    apply();
    initToggle();
    audit();
    document.documentElement.classList.remove('i18n-pending');
  }

  window.I18N = { lang: lang, t: t, s: s, num: num, set: setLang, add: add };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
