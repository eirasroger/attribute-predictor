/* ---------------------------------------------------------------------------
   LANGUAGE — every string the site can show, once, both languages adjacent:

       'hero.lede': { en: '…', ca: '…' }

   js/data.js uses the same shape for domain vocabulary. See docs/overview.md.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var LANGS = ['en', 'ca'];

  /* Chosen before first paint by the inline script in <head>, which is the only
     copy of the detection logic. */
  var lang = document.documentElement.lang;
  if (LANGS.indexOf(lang) < 0) lang = 'en';

  /* --- resolving ---------------------------------------------------------- */

  /* Falls back to English: a gap should leave the page
     readable and show up in audit(), not blank a heading. */
  function t(pair) {
    if (pair == null) return '';
    if (typeof pair === 'string') return pair;          /* not translated */
    return pair[lang] != null ? pair[lang] : pair.en;
  }

  /* Catalan writes 0,310. Applied to formatted output, so the exponent and
     range forms get it too. */
  function num(text) {
    return lang === 'ca' ? String(text).replace(/\./g, ',') : String(text);
  }

  /* Grouped by section, in document order. Keys carrying markup the design
     needs (a <br>, the accent span) are applied with data-i18n-html. */
  var COPY = {

    /* head ---------------------------------------------------------------- */
    'meta.title': {
      en: 'Attribute Predictor: early environmental estimates from material ' +
          'composition',
      ca: 'Attribute Predictor: estimacions ambientals inicials a partir de ' +
          'la composició de materials'
    },
    'meta.description': {
      en: 'Estimates how a construction product is likely to perform ' +
          'environmentally, from its material composition. Built for early ' +
          'design and for existing products with no declaration. Complements ' +
          'an EPD and a full LCA.',
      ca: 'Estima com de probable és que un producte de construcció es comporti a nivell ' +
          'ambiental, a partir de la seva composició de materials. Pensat per ' +
          'a les fases inicials de disseny i per a productes existents sense ' +
          'declaració ambiental de producte. Complementa una DAP i un ACV complet.'
    },

    /* topbar -------------------------------------------------------------- */
    'topbar.tag': {
      en: 'Desktop app',
      ca: 'Aplicació d\'escriptori'
    },
    'ui.language': { en: 'Language', ca: 'Idioma' },
    /* Endonyms: findable by someone who cannot read the current language. */
    'ui.english':  { en: 'English',  ca: 'English' },
    'ui.catalan':  { en: 'Català',   ca: 'Català'  },

    /* nav ----------------------------------------------------------------- */
    'nav.label':   { en: 'Main',       ca: 'Principal' },
    'nav.menu':    { en: 'Menu',       ca: 'Menú'      },
    'nav.about':   { en: 'About',      ca: 'Qui som'   },
    'nav.contact': { en: 'Contact',    ca: 'Contacte'  },

    /* hero ---------------------------------------------------------------- */
    'hero.head': {
      en: 'Replace the guess<br>with an <span class="accent">estimate</span>.',
      ca: 'Substitueix la suposició<br>per una ' +
          '<span class="accent">estimació</span>.'
    },
    'hero.lede': {
      en: 'Give it a material composition. It estimates how a construction ' +
          'product is likely to perform environmentally, so early design work ' +
          'and existing buildings have something to quantify.',
      ca: 'Dona-li una composició de materials. Estima com de probable és que un ' +
          'producte de construcció es comporti a nivell ambiental, perquè hi hagi quelcom a quantificar durant les etapes inicials de disseny.'
    },
    'hero.loop.caption': {
      en: 'Greenhouse gas emissions. Illustrative only.',
      ca: 'Emissions de gasos amb efecte d\'hivernacle. Només il·lustratiu.'
    },

    /* the gap ------------------------------------------------------------- */
    'gap.statement': {
      en: 'A declaration describes a product that exists.<br>' +
          '<span class="dim">Many of the decisions that shape it happen ' +
          'first.</span>',
      ca: 'Una declaració descriu un producte que ja existeix.<br>' +
          '<span class="dim">Moltes de les decisions que el configuren passen ' +
          'abans.</span>'
    },

    /* where it fits -------------------------------------------------------- */
    'fits.head': { en: 'Where it fits.', ca: 'On encaixa.' },
    'fits.lede': {
      en: 'Two moments in a project share the same problem: a decision worth ' +
          'quantifying, and nothing yet to quantify it with.',
      ca: 'Dos moments d\'un projecte comparteixen el mateix problema: una ' +
          'decisió que val la pena quantificar, i encara res amb què ' +
          'quantificar-la.'
    },
    'fits.early.head': { en: 'Early design', ca: 'Disseny inicial' },
    'fits.early.body': {
      en: 'Compare compositions in minutes, while everything is still open. ' +
          'Iterate on the option, not on the paperwork.',
      ca: 'Compara composicions en minuts, mentre tot encara està obert. ' +
          'Itera sobre l\'opció, no sobre la documentació.'
    },
    'fits.existing.head': {
      en: 'Renovation and existing stock',
      ca: 'Rehabilitació i parc existent'
    },
    'fits.existing.body': {
      en: 'The partition already in the building has no declaration and never ' +
          'will. That used to mean no number at all. Now you can estimate one, ' +
          'and see how far to trust it.',
      ca: 'La partició interior que ja hi ha a l\'edifici no té declaració i no ' +
          'en tindrà mai. Això volia dir no tenir cap xifra. Ara en pots ' +
          'estimar una, i saber fins on confiar-hi.'
    },
    'fits.callout': {
      en: 'A full LCA does the accounting once the design settles and ' +
          'verified data exists. Attribute Predictor covers the stretch ' +
          'before that, where the decisions are still being made.',
      ca: 'Un ACV complet fa el balanç quan el disseny s\'ha estabilitzat i hi ' +
          'ha dades verificades. Attribute Predictor cobreix el tram anterior, ' +
          'on encara s\'estan prenent les decisions.'
    },

    /* layer by layer -------------------------------------------------------- */
    'assembly.head': {
      en: 'Layer by layer.',
      ca: 'Capa a capa.'
    },
    'assembly.lede': {
      en: 'Nobody specifies a wall in one go. The cladding is chosen, then the ' +
          'insulation behind it, then the membrane, then the board that closes ' +
          'the room. Each of those is a product with a composition of its own, ' +
          'and any one of them can be estimated on its own.',
      ca: 'Ningú no especifica un mur d’una sola vegada. Primer el revestiment, ' +
          'després l’aïllament que hi ha al darrere, després la membrana, ' +
          'després la placa que tanca l’estància. Cadascun és un producte amb ' +
          'una composició pròpia, i qualsevol d’ells es pot estimar per separat.'
    },
    'assembly.composition': {
      en: 'Material composition',
      ca: 'Composició de materials'
    },
    'assembly.impact': {
      en: 'Environmental impact',
      ca: 'Impacte ambiental'
    },

    /* act one --------------------------------------------------------------- */
    'bigviz.head': {
      en: 'One partition.<br><span class="dim">Three ways to build it.</span>',
      ca: 'Una partició interior.<br><span class="dim">Tres maneres de construir-la.</span>'
    },
    'bigviz.sub': {
      en: 'Same category, same job, same functional unit. Change the ' +
          'composition and the estimate follows.',
      ca: 'Mateixa categoria, mateixa funció, mateixa unitat funcional. Canvia ' +
          'la composició i l\'estimació la segueix.'
    },
    'bigviz.eyebrow': {
      en: 'Estimated greenhouse gas, per kilogram',
      ca: 'Gasos amb efecte d\'hivernacle estimats, per quilogram'
    },
    'scale.low':    { en: '0.1× median', ca: '0,1× mediana' },
    'scale.median': { en: 'median',      ca: 'mediana'      },
    'scale.high':   { en: '10× median',         ca: '10× mediana'          },

    /* act two --------------------------------------------------------------- */
    'sim.claim': {
      en: 'Carbon is one of five.<br><span class="dim">A composition that ' +
          'wins on one can lose on another.</span>',
      ca: 'El carboni és un de cinc.<br><span class="dim">Una composició que ' +
          'guanya en un pot perdre en un altre.</span>'
    },
    'sim.head': {
      en: 'Every indicator,<br><span class="dim">every time you change a ' +
          'material.</span>',
      ca: 'Cada indicador,<br><span class="dim">cada cop que canvies un ' +
          'material.</span>'
    },
    'sim.sub': {
      en: 'The same three builds, read against the whole category.',
      ca: 'Les mateixes tres solucions, llegides contra tota la categoria.'
    },
    'sim.category':    { en: 'Category',    ca: 'Categoria'  },
    'sim.composition': { en: 'Composition', ca: 'Composició' },
    'sim.materials': {
      en: 'Material composition',
      ca: 'Composició de  materials'
    },
    'sim.readouts': {
      en: 'Estimated, per kilogram',
      ca: 'Estimat, per quilogram'
    },
    'radar.key.median': {
      en: 'Category median',
      ca: 'Mediana de la categoria'
    },
    'radar.key.value': {
      en: 'Product impact',
      ca: 'Impacte del producte'
    },

    /* context and confidence ------------------------------------------------ */
    'context.head': {
      en: 'Measured against its own kind.',
      ca: 'Mesurat contra els seus semblants.'
    },
    'context.body': {
      en: 'A raw value per kilogram tells you very little. Heavy materials ' +
          'score well simply by being heavy. So every result is placed ' +
          'against the real spread for that category: the median, and the ' +
          'band the middle half of products fall inside.',
      ca: 'Un valor per quilogram diu ben poca cosa. Els materials ' +
          'pesants puntuen bé simplement per ser pesants. Per això cada ' +
          'resultat se situa contra la dispersió real d\'aquella categoria: la ' +
          'mediana, i la franja on cau la meitat central dels productes.'
    },
    'range.head': {
      en: 'Every estimate carries a range.',
      ca: 'Cada estimació porta un interval.'
    },
    'range.body': {
      en: 'A verdict reads better, typical or worse than typical. When the ' +
          'range crosses the threshold the wording softens to <em>likely</em> ' +
          'and the colour eases off.',
      ca: 'Un veredicte es llegeix com a millor, típic o pitjor que el típic. ' +
          'Quan l\'interval creua el llindar, la redacció se suavitza a ' +
          '<em>probablement</em> i el color s\'atenua.'
    },

    /* Six strings, not three plus a "Likely " prefix — that rule is English. */
    'verdict.good':      { en: 'Better than typical',
                           ca: 'Millor que el típic' },
    'verdict.good.soft': { en: 'Likely better than typical',
                           ca: 'Probablement millor que el típic' },
    'verdict.mid':       { en: 'Typical for the category',
                           ca: 'Típic per a la categoria' },
    'verdict.mid.soft':  { en: 'Likely typical for the category',
                           ca: 'Probablement típic per a la categoria' },
    'verdict.bad':       { en: 'Worse than typical',
                           ca: 'Pitjor que el típic' },
    'verdict.bad.soft':  { en: 'Likely worse than typical',
                           ca: 'Probablement pitjor que el típic' },

    /* stage by stage -------------------------------------------------------- */
    'stages.head': { en: 'Then open one up.', ca: 'Després obre\'n un.' },
    'stages.lede': {
      en: 'A total tells you the size of the number. The stages tell you ' +
          'where it comes from. Every indicator is estimated stage by stage, ' +
          'and each stage carries its own certainty.',
      ca: 'Un total et diu la magnitud del número. Les etapes et diuen d\'on ' +
          've. Cada indicador s\'estima etapa per etapa, i cada etapa porta la ' +
          'seva pròpia certesa.'
    },
    'stages.chart.title': {
      en: 'Estimated greenhouse gas by life-cycle stage',
      ca: 'Gasos amb efecte d\'hivernacle estimats per etapa del cicle de vida'
    },
    'stages.chart.switch': {
      en: 'Choose a composition',
      ca: 'Tria una composició'
    },
    'stages.total': { en: 'Total', ca: 'Total' },
    'stages.table.caption': {
      en: 'Estimated greenhouse gas by life-cycle stage, kg CO₂-eq per kilogram',
      ca: 'Gasos amb efecte d\'hivernacle estimats per etapa del cicle de ' +
          'vida, kg CO₂-eq per quilogram'
    },
    'stages.table.stage':    { en: 'Stage',    ca: 'Etapa'     },
    'stages.table.estimate': { en: 'Estimate', ca: 'Estimació' },
    'stages.table.range':    { en: 'Range',    ca: 'Interval'  },
    'stages.body': {
      en: 'A1 to A3, C3, C4 and D follow from the materials themselves, so ' +
          'they can be estimated with an uncertainty the model knows and ' +
          'states. A4 to A5 and C1 to C2 are set by transport distance and ' +
          'site process, which belong to the project. Those stay outside the ' +
          'model, and outside the claim.',
      ca: 'A1 a A3, C3, C4 i D es deriven essencialment a partir de la composició de materials, de manera ' +
          'que es poden estimar amb una incertesa que el model coneix i ' +
          'declara. A4 a A5 i C1 a C2 els determinen la distància de ' +
          'transport i el procés d\'obra, entre d\'altres, que pertanyen al projecte. Aquests ' +
          'queden fora del model, i fora de l\'afirmació.'
    },

    /* accuracy and platform -------------------------------------------------- */
    'accuracy.head': {
      en: 'Accuracy, stated as a factor.',
      ca: 'Precisió, expressada com a factor.'
    },
    'accuracy.body': {
      en: 'These indicators span six orders of magnitude, so accuracy is ' +
          'reported as fold error: how close the estimate lands, as a multiple.',
      ca: 'Aquests indicadors abasten sis ordres de magnitud, així que la ' +
          'precisió es reporta com a error multiplicatiu: com de a prop cau ' +
          'l\'estimació, expressat com a múltiple.'
    },
    'accuracy.fold.value': { en: '1.07–1.39', ca: '1,07–1,39' },
    'accuracy.fold.cap': {
      en: 'Median fold error, across targets',
      ca: 'Error medià, entre objectius'
    },
    'accuracy.n.value': { en: '~8 500', ca: '~8 500' },
    'accuracy.n.cap': {
      en: 'Labelled products behind it',
      ca: 'Productes etiquetats al darrere'
    },
    'platform.head': {
      en: 'It runs on your machine.',
      ca: 'S\'executa a la teva màquina.'
    },
    'platform.body': {
      en: 'A desktop application. Change a material and all ' +
          'twenty-five estimates land instantly: fast enough to keep pace ' +
          'with the conversation you are having about the design.',
      ca: 'Una aplicació d\'escriptori. Canvia un material i les ' +
          'vint-i-cinc estimacions apareixen a l\'instant: prou ràpid per ' +
          'seguir el ritme de la conversa que estàs tenint sobre el disseny.'
    },

    /* close and footer ------------------------------------------------------- */
    'close.statement': {
      en: 'Predicts. Estimates.<br><span class="dim">And tells you how far ' +
          'to trust it.</span>',
      ca: 'Prediu. Estima.<br><span class="dim">I et diu fins on ' +
          'confiar-hi.</span>'
    },
    'footer.note': {
      en: 'Figures on this page are an illustrative interface demonstration, ' +
          'not model output. Attribute Predictor produces estimates for early ' +
          'decision support. It is not an Environmental Product Declaration ' +
          'and does not replace a verified LCA.',
      ca: 'Les xifres d\'aquesta pàgina són una demostració il·lustrativa de ' +
          'la interfície, no estimacions del model. Attribute Predictor produeix ' +
          'estimacions per donar suport a les decisions en etapes de disseny. No és una ' +
          'Declaració Ambiental de Producte i no substitueix un ACV verificat.'
    },
    'footer.legal': {
      en: '© 2026 Roger Vergés. All rights reserved.',
      ca: '© 2026 Roger Vergés. Tots els drets reservats.'
    }
  };

  var missing = [];

  function s(key) {
    var entry = COPY[key];
    if (!entry) { missing.push(key + ' (no such key)'); return ''; }
    return t(entry);
  }

  /* --- applying to the document -------------------------------------------- */

  /* data-i18n → textContent, data-i18n-html → innerHTML,
     data-i18n-attr → "aria-label:key, title:key" */
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
    document.title = s('meta.title');
  }

  /* Backstop: walks everything translatable here and in data.js and names what
     is missing. Console only — a half-translated page should still serve. */
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
    /* js/assembly.js publishes this before DOMContentLoaded, so it is here */
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

  /* Reload, not re-render: most of the page is JS-built and some of it is
     mid-animation at any moment. See docs/overview.md. */
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
    document.documentElement.classList.remove('i18n-pending');
  }

  window.I18N = { lang: lang, t: t, s: s, num: num, set: setLang };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
