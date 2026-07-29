/* ---------------------------------------------------------------------------
   Field Extractor page. Hero loop, the pipeline stage, the composition
   resolver, the document set, the schema switcher and the catalogue workbench.
   Content comes from js/extract.data.js, which is illustrative throughout.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var I18N = window.I18N || {};
  /* never name a local helper `t`: it is the tween parameter in every paint
     callback below and a shadowed translator falls through to English */
  var tx = I18N.t || function (p) { return p && p.en != null ? p.en : p; };
  var str = I18N.s || function () { return ''; };
  var dec = I18N.num || function (v) { return String(v); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* Entrance stagger. --i drives the delay in CSS, so the order is data, not a
     chain of timers that can overlap when a switch is repeated quickly. */
  function stagger(nodes) {
    nodes.forEach(function (n, i) {
      n.classList.add('stag');
      n.style.setProperty('--i', i);
    });
    if (reduced) {
      nodes.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        nodes.forEach(function (n) { n.classList.add('in'); });
      });
    });
  }

  /* Fade the old contents out before rebuilding, so a switch reads as one
     movement instead of a flicker. */
  function swap(box, build) {
    if (reduced) { box.textContent = ''; build(); return; }
    box.classList.add('is-swapping');
    setTimeout(function () {
      box.textContent = '';
      box.classList.remove('is-swapping');
      build();
    }, 200);
  }

  /* --- wires ---------------------------------------------------------------- */

  /* An inline <mark> that wraps spans several rects; the last one is where the
     phrase ends, which is where a leader should leave from. */
  function anchor(node, side) {
    var rects = node.getClientRects();
    var r = rects.length ? rects[side === 'right' ? rects.length - 1 : 0]
                         : node.getBoundingClientRect();
    return { x: side === 'right' ? r.right : r.left, y: r.top + r.height / 2 };
  }

  function curve(from, to, box) {
    var x1 = from.x - box.left, y1 = from.y - box.top;
    var x2 = to.x - box.left,   y2 = to.y - box.top;
    var dx = Math.max(18, (x2 - x1) * 0.45);
    return 'M' + x1 + ' ' + y1 +
           ' C' + (x1 + dx) + ' ' + y1 + ' ' + (x2 - dx) + ' ' + y2 +
           ' ' + x2 + ' ' + y2;
  }

  function svgPath(parent) {
    return parent.appendChild(
      document.createElementNS('http://www.w3.org/2000/svg', 'path'));
  }

  /* --- hero ------------------------------------------------------------------ */

  function initHero() {
    var box = document.getElementById('hx');
    var out = document.getElementById('hx-out');
    var wires = document.getElementById('hx-wires');
    var band = document.getElementById('hero-side');
    if (!box || !out || !wires || typeof LANES === 'undefined') return;

    /* the sheet decides which lanes run here, so marking a different phrase in
       the markup is the whole edit */
    var lanes = [].map.call(box.querySelectorAll('.pp-hit[data-lane]'), function (m) {
      var id = m.getAttribute('data-lane'), found = null;
      LANES.forEach(function (lane) { if (lane.id === id) found = lane; });
      return found;
    }).filter(Boolean);
    if (!lanes.length) return;

    var items = [], paths = [];

    lanes.forEach(function (lane) {
      var li = el('li', 'hx-item');
      li.appendChild(el('span', 'hx-f', tx(lane.field)));
      var v = el('span', 'hx-v', dec(lane.value));
      v.appendChild(el('i', null, lane.unit));
      li.appendChild(v);
      out.appendChild(li);
      items.push(li);
      paths.push(svgPath(wires));
    });

    var hits = lanes.map(function (lane) {
      return box.querySelector('.pp-hit[data-lane="' + lane.id + '"]');
    });

    function layout() {
      var b = box.getBoundingClientRect();
      hits.forEach(function (hit, i) {
        if (!hit) return;
        paths[i].setAttribute(
          'd', curve(anchor(hit, 'right'), anchor(items[i], 'left'), b));
      });
    }

    function show(n) {
      items.forEach(function (li, i) { li.classList.toggle('is-on', i < n); });
      hits.forEach(function (hit, i) {
        if (hit) hit.classList.toggle('is-on', i < n);
      });
      paths.forEach(function (p, i) { p.classList.toggle('is-on', i < n); });
    }

    layout();
    window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    if (reduced) { show(lanes.length); return; }

    var step = 0, seen = true;
    /* setInterval only fires after a full period: the first beat is kicked */
    function tick() {
      if (!seen || document.hidden) return;
      step = (step + 1) % (lanes.length + 2);
      show(step > lanes.length ? 0 : step);
    }

    show(0);
    setTimeout(tick, 700);
    setInterval(tick, 1900);

    /* gate on the band the visitor can see, not on the list it drives */
    if (band && 'IntersectionObserver' in window) {
      seen = false;
      new IntersectionObserver(function (e) {
        seen = e[0].isIntersecting;
      }, { threshold: 0.15 }).observe(band);
    }
  }

  /* --- the pipeline ----------------------------------------------------------- */

  function initPipe() {
    var section = document.getElementById('pipe');
    var track = document.getElementById('pipe-track');
    var stage = document.getElementById('pipe-stage');
    var grid = document.getElementById('pipe-grid');
    var paper = document.getElementById('pipe-paper');
    var chipBox = document.getElementById('pipe-chips');
    var recBox = document.getElementById('pipe-rec');
    var wires = document.getElementById('pipe-wires');
    if (!section || !track || !stage || !grid || !paper || !chipBox ||
        !recBox || !wires || typeof LANES === 'undefined') return;

    /* the composition rides the same rails as the scalars, but resolves into a
       block of rows rather than one value */
    var lanes = LANES.concat([{
      id: 'comp',
      field: COMP.field,
      raw: COMP.raw,
      value: null,
      where: COMP.where
    }]);

    var chips = [], targets = [], inWires = [], outWires = [];

    var hits = lanes.map(function (lane) {
      return paper.querySelector('.pp-hit[data-lane="' + lane.id + '"]');
    });

    lanes.forEach(function (lane) {
      var li = el('li', 'chip-i');
      var inner = el('div', 'chip-in');

      inner.appendChild(el('p', 'chip-f', tx(lane.field)));
      inner.appendChild(el('p', 'chip-raw',
        lane.id === 'comp' ? str('pipe.comp.chip') : lane.raw));

      var res = el('div', 'chip-res');
      res.appendChild(el('span', 'chip-arrow', '→'));
      if (lane.id === 'comp') {
        res.appendChild(el('span', 'chip-v', dec(COMP.materials.length)));
        res.appendChild(el('span', 'chip-u', str('pipe.comp.unit')));
      } else {
        res.appendChild(el('span', 'chip-v', dec(lane.value)));
        res.appendChild(el('span', 'chip-u', lane.unit));
      }
      res.appendChild(el('span', 'chip-where', tx(lane.where)));
      inner.appendChild(res);

      li.appendChild(inner);
      chipBox.appendChild(li);
      chips.push(li);

      inWires.push(svgPath(wires));
      outWires.push(svgPath(wires));
    });

    var head = el('div', 'rec-head');
    head.appendChild(el('span', null, 'mineral-wool-140'));
    head.appendChild(el('span', 'rec-count', ''));
    recBox.appendChild(head);
    var count = head.lastChild;

    function scalarRow(key, value, unit, where, empty) {
      var row = el('div', 'rec-row' + (empty ? ' is-empty' : ''));
      row.appendChild(el('span', 'rec-k', key));
      var val = el('span', 'rec-val');
      val.appendChild(el('span', 'rec-v', value));
      if (unit) val.appendChild(el('span', 'rec-u', unit));
      row.appendChild(val);
      if (where) row.appendChild(el('span', 'rec-src', where));
      recBox.appendChild(row);
      return row;
    }

    LANES.forEach(function (lane) {
      targets.push(scalarRow(tx(lane.field), dec(lane.value), lane.unit,
                             tx(lane.where), false));
    });

    /* one field, many rows: the shape a flat record cannot hold */
    var group = el('div', 'rec-group');
    var gh = el('p', 'rec-group-head');
    gh.appendChild(el('span', null, tx(COMP.field)));
    gh.appendChild(el('span', 'rec-group-u', tx(COMP.basis)));
    group.appendChild(gh);
    COMP.materials.forEach(function (m) {
      var sub = el('div', 'rec-sub');
      sub.appendChild(el('span', 'rec-sub-k', tx(m.name)));
      sub.appendChild(el('span', 'rec-sub-v', dec(m.share.toFixed(1))));
      group.appendChild(sub);
    });
    group.appendChild(el('p', 'rec-group-src', tx(COMP.where)));
    recBox.appendChild(group);
    targets.push(group);

    var missing = scalarRow(tx(LANE_MISSING.field), '—', '',
                            tx(LANE_MISSING.note), true);

    function layout() {
      var b = grid.getBoundingClientRect();
      lanes.forEach(function (lane, i) {
        if (hits[i]) {
          inWires[i].setAttribute(
            'd', curve(anchor(hits[i], 'right'), anchor(chips[i], 'left'), b));
        }
        outWires[i].setAttribute(
          'd', curve(anchor(chips[i], 'right'), anchor(targets[i], 'left'), b));
      });
    }

    var HIT = 0.16, CHIP = 0.40, ROW = 0.62, GAP = 0.06;

    function paint(p) {
      var filled = 0;
      lanes.forEach(function (lane, i) {
        var onHit = p > HIT + i * GAP;
        var onChip = p > CHIP + i * GAP;
        var onRow = p > ROW + i * GAP;

        if (hits[i]) hits[i].classList.toggle('is-on', onHit);
        chips[i].classList.toggle('is-on', onChip);
        targets[i].classList.toggle('is-on', onRow);
        inWires[i].classList.toggle('is-on', onChip);
        outWires[i].classList.toggle('is-on', onRow);
        if (onRow) filled++;
      });

      var onLast = p > ROW + lanes.length * GAP;
      missing.classList.toggle('is-on', onLast);
      if (onLast) filled++;
      count.textContent = filled ? filled + '/' + (lanes.length + 1) : '';
    }

    var pinned = window.matchMedia('(min-width: 66rem) and (min-height: 42rem)');

    function onScroll() {
      var box = track.getBoundingClientRect();
      var run = box.height - stage.offsetHeight;
      if (run <= 0) { paint(1); return; }
      paint(clamp(-box.top / run));
    }

    var playing = false;
    function play() {
      if (playing) return;
      playing = true;
      var t0 = 0;
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = clamp((ts - t0) / 6400);
        paint(p);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function attach() {
      if (pinned.matches && !reduced) {
        section.classList.remove('pipe-flat');
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return;
      }
      window.removeEventListener('scroll', onScroll);
      section.classList.add('pipe-flat');

      if (reduced || !('IntersectionObserver' in window)) { paint(1); return; }
      paint(0);
      new IntersectionObserver(function (e, io) {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        play();
      }, { threshold: 0.1 }).observe(grid);
    }

    layout();
    attach();
    window.addEventListener('resize', function () { layout(); onScroll(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if (pinned.addEventListener) pinned.addEventListener('change', attach);
    else if (pinned.addListener) pinned.addListener(attach);
  }

  /* --- composition, four ways -------------------------------------------------- */

  function initComp() {
    var tabs = document.getElementById('src-tabs');
    var stage = document.getElementById('src-stage');
    var list = document.getElementById('comp-list');
    var basis = document.getElementById('comp-basis');
    if (!tabs || !stage || !list || typeof SOURCES === 'undefined') return;

    basis.textContent = tx(COMP.basis);

    var buttons = [];
    SOURCES.forEach(function (src, i) {
      var li = document.createElement('li');
      var b = el('button', 'src-tab');
      b.type = 'button';
      b.appendChild(el('span', 'src-n', dec(i + 1)));
      b.appendChild(el('span', 'src-l', tx(src.label)));
      b.addEventListener('click', function () { hold(i); });
      b.addEventListener('pointerenter', function () { hold(i); });
      b.addEventListener('focus', function () { hold(i); });
      li.appendChild(b);
      tabs.appendChild(li);
      buttons.push(b);
    });

    /* rows are built once; only the phrase each one was read from changes */
    var froms = [];
    COMP.materials.forEach(function (m) {
      var li = el('li', 'cm');

      var top = el('div', 'cm-top');
      top.appendChild(el('span', 'cm-name', tx(m.name)));
      var share = el('span', 'cm-share', dec(m.share.toFixed(1)));
      share.appendChild(el('i', null, '%'));
      top.appendChild(share);
      li.appendChild(top);

      var bar = el('div', 'cm-bar');
      var fill = document.createElement('span');
      /* true part of the whole: rescaling to the largest share would read as
         basalt being the entire product */
      fill.style.width = m.share.toFixed(1) + '%';
      bar.appendChild(fill);
      li.appendChild(bar);

      var from = el('p', 'cm-from');
      from.appendChild(el('span', 'cm-from-k', str('comp.from')));
      var q = el('span', 'cm-from-v');
      from.appendChild(q);
      li.appendChild(from);

      list.appendChild(li);
      froms.push(q);
    });

    function renderSource(i) {
      var src = SOURCES[i];

      buttons.forEach(function (b, n) {
        b.setAttribute('aria-pressed', n === i ? 'true' : 'false');
      });

      swap(stage, function () {
        var sheet = el('article', 'paper paper-frag');
        sheet.lang = src.lang;

        if (src.kind === 'table') {
          var table = el('table', 'pp-tbl');
          var thead = document.createElement('thead');
          var hr = document.createElement('tr');
          src.head.forEach(function (h, n) {
            var th = document.createElement('th');
            th.scope = 'col';
            th.textContent = h;
            if (n) th.className = 'num';
            hr.appendChild(th);
          });
          thead.appendChild(hr);
          table.appendChild(thead);

          var tbody = document.createElement('tbody');
          src.rows.forEach(function (r) {
            var tr = document.createElement('tr');
            tr.appendChild(el('td', null, r[0]));
            tr.appendChild(el('td', 'num', r[1]));
            tbody.appendChild(tr);
          });
          table.appendChild(tbody);
          sheet.appendChild(table);
          if (src.foot) sheet.appendChild(el('p', 'pp-note', src.foot));
        } else {
          sheet.appendChild(el('p', 'pp-p', src.text));
        }

        stage.appendChild(sheet);
        stage.appendChild(el('p', 'src-note', tx(src.note)));
        stagger([sheet, stage.lastChild]);
      });

      froms.forEach(function (q, n) {
        q.classList.remove('in');
      });
      setTimeout(function () {
        froms.forEach(function (q, n) {
          q.textContent = '“' + src.from[COMP.materials[n].id] + '”';
        });
        stagger(froms);
      }, reduced ? 0 : 180);
    }

    var at = -1, timer = null, held = false;

    function advance() { at = (at + 1) % SOURCES.length; renderSource(at); }

    /* every pause path schedules its own resume: one stray hover must not
       leave this dead */
    function resume() {
      if (timer) clearInterval(timer);
      if (reduced) return;
      timer = setInterval(function () { if (!held) advance(); }, 5200);
    }
    function hold(i) {
      held = true;
      if (i !== at) { at = i; renderSource(i); }
      resume();
      clearTimeout(hold.out);
      hold.out = setTimeout(function () { held = false; }, 6000);
    }

    tabs.addEventListener('pointerleave', function () { held = false; });

    at = 0;
    renderSource(0);
    if (reduced) return;
    resume();
  }

  /* --- one product, four documents ---------------------------------------------- */

  function initDocs() {
    var row = document.getElementById('doc-row');
    var merge = document.getElementById('doc-merge');
    if (!row || !merge || typeof DOCS === 'undefined') return;

    var cards = [], groups = [];

    DOCS.forEach(function (doc, i) {
      var li = document.createElement('li');
      var btn = el('button', 'doc');
      btn.type = 'button';

      var sheet = el('article', 'paper');
      sheet.lang = doc.lang;
      sheet.appendChild(el('p', 'pp-maker', str('pipe.doc.maker')));
      sheet.appendChild(el('p', 'doc-kind', tx(doc.kind)));
      sheet.appendChild(el('p', 'doc-ref', doc.ref));

      var ul = el('ul', 'doc-lines');
      doc.lines.forEach(function (line) {
        var r = document.createElement('li');
        if (line.hit) r.className = 'hit';
        r.appendChild(el('span', null, line.t));
        r.appendChild(el('b', null, line.v));
        ul.appendChild(r);
      });
      sheet.appendChild(ul);

      btn.appendChild(sheet);
      btn.appendChild(el('p', 'doc-gives', tx(doc.gives)));
      li.appendChild(btn);
      row.appendChild(li);
      cards.push(btn);

      btn.addEventListener('pointerenter', function () { hold(i); });
      btn.addEventListener('focus', function () { hold(i); });
      btn.addEventListener('click', function () { hold(i); });
    });

    var head = el('div', 'rec-head');
    head.appendChild(el('span', null, str('docs.merged')));
    head.appendChild(el('span', 'rec-count', ''));
    merge.appendChild(head);

    DOCS.forEach(function (doc) {
      var mine = [];
      doc.record.forEach(function (f) {
        var r = el('div', 'rec-row is-on');
        r.appendChild(el('span', 'rec-k', tx(f.k)));
        var val = el('span', 'rec-val');
        val.appendChild(el('span', 'rec-v', dec(f.v)));
        if (f.u) val.appendChild(el('span', 'rec-u', tx(f.u)));
        r.appendChild(val);
        r.appendChild(el('span', 'rec-src', tx(doc.kind)));
        merge.appendChild(r);
        mine.push(r);
      });
      groups.push(mine);
    });

    head.lastChild.textContent = merge.querySelectorAll('.rec-row').length;

    var at = -1, timer = null, held = false;

    function show(i) {
      at = i;
      cards.forEach(function (c, n) { c.classList.toggle('is-on', n === i); });
      groups.forEach(function (g, n) {
        g.forEach(function (r, k) {
          r.style.setProperty('--i', k);
          r.classList.toggle('is-lit', n === i);
        });
      });
    }

    function advance() { show((at + 1) % DOCS.length); }

    function resume() {
      if (timer) clearInterval(timer);
      if (reduced) return;
      timer = setInterval(function () { if (!held) advance(); }, 3600);
    }
    function hold(i) {
      held = true;
      show(i);
      resume();
      clearTimeout(hold.out);
      hold.out = setTimeout(function () { held = false; }, 4500);
    }

    row.addEventListener('pointerleave', function () { held = false; });

    show(0);
    if (reduced) return;
    setTimeout(advance, 1600);
    resume();
  }

  /* --- the schema ------------------------------------------------------------------ */

  function initSchema() {
    var tabs = document.getElementById('sch-tabs');
    var fields = document.getElementById('sch-fields');
    var out = document.getElementById('sch-rec');
    if (!tabs || !fields || !out || typeof SCHEMAS === 'undefined') return;

    var buttons = [];

    function render(i) {
      var schema = SCHEMAS[i];

      buttons.forEach(function (b, n) {
        b.setAttribute('aria-selected', n === i ? 'true' : 'false');
        b.tabIndex = n === i ? 0 : -1;
      });

      swap(fields, function () {
        var table = el('table', 'sch-tbl');
        var thead = document.createElement('thead');
        var hr = document.createElement('tr');
        ['schema.th.field', 'schema.th.type', 'schema.th.look'].forEach(function (k) {
          var th = document.createElement('th');
          th.scope = 'col';
          th.textContent = str(k);
          hr.appendChild(th);
        });
        thead.appendChild(hr);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        var rows = [];
        schema.fields.forEach(function (f) {
          var tr = document.createElement('tr');

          var name = document.createElement('td');
          name.appendChild(el('span', 'sch-n', tx(f.n)));
          if (f.u) name.appendChild(el('span', 'sch-u', f.u));
          tr.appendChild(name);

          var type = document.createElement('td');
          type.appendChild(el('span', 'sch-t', f.t));
          tr.appendChild(type);

          tr.appendChild(el('td', 'sch-d', tx(f.d)));
          tbody.appendChild(tr);
          rows.push(tr);
        });
        table.appendChild(tbody);
        fields.appendChild(table);
        stagger(rows);
      });

      swap(out, function () {
        var head = el('div', 'rec-head');
        head.appendChild(el('span', null, 'mineral-wool-140'));
        head.appendChild(el('span', 'rec-count', String(schema.fields.length)));
        out.appendChild(head);

        var rows = [];
        schema.fields.forEach(function (f) {
          var r = el('div', 'rec-row is-on');
          r.appendChild(el('span', 'rec-k', tx(f.n)));
          var val = el('span', 'rec-val');
          val.appendChild(el('span', 'rec-v', dec(f.v)));
          if (f.u) val.appendChild(el('span', 'rec-u', f.u));
          r.appendChild(val);
          out.appendChild(r);
          rows.push(r);
        });
        stagger(rows);
      });
    }

    SCHEMAS.forEach(function (schema, i) {
      var b = el('button', 'sch-tab', tx(schema.name));
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { render(i); });
      tabs.appendChild(b);
      buttons.push(b);
    });

    render(0);
  }

  /* --- the catalogue workbench --------------------------------------------------- */

  function initWork() {
    var box = document.getElementById('wb');
    var filterBox = document.getElementById('wb-filters');
    var countEl = document.getElementById('wb-count');
    var table = document.getElementById('wb-table');
    var empty = document.getElementById('wb-empty');
    var plot = document.getElementById('wb-plot');
    var svg = document.getElementById('wb-svg');
    if (!box || !filterBox || !table || !svg || typeof CATALOGUE === 'undefined') return;

    var NS = 'http://www.w3.org/2000/svg';
    var rows = CATALOGUE.rows;
    var active = {};
    var sort = { key: 'lam', dir: 1 };

    var COLS = [
      { key: 'ref',   label: 'work.col.ref',   num: false },
      { key: 'fam',   label: 'work.col.fam',   num: false },
      { key: 'lam',   label: 'work.col.lam',   num: true, dp: 3, raw: true },
      { key: 'rho',   label: 'work.col.rho',   num: true, dp: 0 },
      { key: 'gwp',   label: 'work.col.gwp',   num: true, dp: 2 },
      { key: 'fire',  label: 'work.col.fire',  num: false },
      { key: 'valid', label: 'work.col.valid', num: true, dp: 0 }
    ];

    function passes(r) {
      return CATALOGUE.filters.every(function (f) {
        return !active[f.id] || f.test(r);
      });
    }

    CATALOGUE.filters.forEach(function (f) {
      var b = el('button', 'wb-chip', tx(f.label));
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        active[f.id] = !active[f.id];
        b.setAttribute('aria-pressed', active[f.id] ? 'true' : 'false');
        b.classList.toggle('is-on', !!active[f.id]);
        paint();
      });
      filterBox.appendChild(b);
    });

    /* The table lays out as a grid, so column widths never depend on content.
       Roles are explicit because changing `display` on table elements drops the
       implicit ones. */
    table.setAttribute('role', 'table');

    var thead = document.createElement('thead');
    thead.setAttribute('role', 'rowgroup');
    var hr = el('tr', 'wb-row wb-head-row');
    hr.setAttribute('role', 'row');
    var heads = {};
    COLS.forEach(function (c) {
      var th = el('th', c.num ? 'num' : null);
      th.scope = 'col';
      th.setAttribute('role', 'columnheader');
      var b = el('button', 'wb-sort' + (c.raw ? ' wb-raw' : ''));
      b.type = 'button';
      b.appendChild(el('span', null, str(c.label)));
      b.appendChild(el('span', 'wb-caret', '▲'));
      b.addEventListener('click', function () {
        sort.dir = sort.key === c.key ? -sort.dir : 1;
        sort.key = c.key;
        paint();
      });
      th.appendChild(b);
      hr.appendChild(th);
      heads[c.key] = b;
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    tbody.setAttribute('role', 'rowgroup');
    table.appendChild(tbody);

    function fmt(r, c) {
      if (!c.num) return r[c.key];
      return dec(c.dp ? r[c.key].toFixed(c.dp) : String(r[c.key]));
    }

    /* Built once. A filter is a state change on these nodes, never a rebuild:
       re-creating the rows is what made the table flash and what pushed a
       scrollbar in and out while the new <tr>s were mid-transform. */
    var map = {}, dots = {};
    rows.forEach(function (r) {
      var tr = el('tr', 'wb-row wb-body-row');
      tr.setAttribute('role', 'row');
      var cells = {};
      COLS.forEach(function (c) {
        var td = el('td', 'wb-c' + (c.num ? ' num' : '') +
                          (c.key === 'ref' ? ' wb-ref' : ''), fmt(r, c));
        td.setAttribute('role', 'cell');
        tr.appendChild(td);
        cells[c.key] = td;
      });
      tbody.appendChild(tr);

      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'wb-dot');
      /* the attribute is the fallback; css/extractor.css sets `r` so it can be
         transitioned, and a CSS property beats a presentation attribute */
      dot.setAttribute('r', '5');
      svg.appendChild(dot);
      dots[r.ref] = dot;

      tr.addEventListener('pointerenter', function () { dot.classList.add('is-near'); });
      tr.addEventListener('pointerleave', function () { dot.classList.remove('is-near'); });

      map[r.ref] = { tr: tr, cells: cells, dot: dot };
    });

    /* First, Last, Invert, Play: the rows keep their identity across a sort and
       glide to their new places instead of being replaced. */
    function reorder(order) {
      var first = {};
      order.forEach(function (r) {
        first[r.ref] = map[r.ref].tr.getBoundingClientRect().top;
      });
      order.forEach(function (r) { tbody.appendChild(map[r.ref].tr); });

      if (reduced) return;
      var moved = [];
      order.forEach(function (r) {
        var tr = map[r.ref].tr;
        var d = first[r.ref] - tr.getBoundingClientRect().top;
        if (!d) return;
        tr.classList.add('is-flip');
        tr.style.transform = 'translateY(' + d + 'px)';
        moved.push(tr);
      });
      if (!moved.length) return;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          moved.forEach(function (tr) {
            tr.classList.remove('is-flip');
            tr.style.transform = '';
          });
        });
      });
    }

    countEl.appendChild(el('b', null, dec(rows.length)));
    countEl.appendChild(el('span', null,
      ' ' + str('work.of') + ' ' + dec(rows.length) + ' ' + str('work.showing')));

    var shown = rows.length, tween = 0, settle = 0;
    function tellCount(n) {
      var num = countEl.firstChild;
      if (!num) return;
      if (tween) cancelAnimationFrame(tween);
      clearTimeout(settle);
      tween = 0;

      if (reduced || n === shown) { num.textContent = dec(n); shown = n; return; }

      var from = shown, t0 = 0;
      shown = n;
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = clamp((ts - t0) / 420);
        num.textContent = dec(Math.round(from + (n - from) * p));
        tween = p < 1 ? requestAnimationFrame(frame) : 0;
      }
      tween = requestAnimationFrame(frame);
      /* rAF is parked in a background tab and the tween would never land, so
         the true value is written on a timer whatever happens */
      settle = setTimeout(function () { num.textContent = dec(n); }, 600);
    }

    function drawAxes(w, h, pad, px, py) {
      [0.020, 0.025, 0.030, 0.035, 0.040].forEach(function (v) {
        var y = py(v);
        var g = document.createElementNS(NS, 'line');
        g.setAttribute('x1', pad.l); g.setAttribute('x2', w - pad.r);
        g.setAttribute('y1', y); g.setAttribute('y2', y);
        g.setAttribute('class', 'wb-grid');
        svg.insertBefore(g, svg.firstChild);

        var lab = document.createElementNS(NS, 'text');
        lab.setAttribute('x', 0); lab.setAttribute('y', y);
        lab.setAttribute('dominant-baseline', 'central');
        lab.setAttribute('class', 'wb-tick');
        lab.textContent = dec(v.toFixed(3));
        svg.insertBefore(lab, svg.firstChild);
      });

      [20, 40, 60, 80].forEach(function (v) {
        var lab = document.createElementNS(NS, 'text');
        lab.setAttribute('x', px(v)); lab.setAttribute('y', h - 2);
        lab.setAttribute('text-anchor', 'middle');
        lab.setAttribute('class', 'wb-tick');
        lab.textContent = dec(v);
        svg.insertBefore(lab, svg.firstChild);
      });
    }

    function draw() {
      var w = plot.clientWidth;
      if (!w) return;
      var h = 330, pad = { l: 40, r: 10, t: 12, b: 20 };

      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('height', h);
      svg.querySelectorAll('.wb-grid, .wb-tick').forEach(function (n) { n.remove(); });

      var x0 = 12, x1 = 96, y0 = 0.018, y1 = 0.043;
      function px(v) { return pad.l + (v - x0) / (x1 - x0) * (w - pad.l - pad.r); }
      function py(v) { return pad.t + (1 - (v - y0) / (y1 - y0)) * (h - pad.t - pad.b); }

      drawAxes(w, h, pad, px, py);
      rows.forEach(function (r) {
        dots[r.ref].setAttribute('cx', px(r.rho).toFixed(1));
        dots[r.ref].setAttribute('cy', py(r.lam).toFixed(1));
      });
    }

    function paint() {
      var any = CATALOGUE.filters.some(function (f) { return active[f.id]; });
      var kept = rows.filter(passes);
      var order = rows.slice().sort(function (a, b) {
        var x = a[sort.key], y = b[sort.key];
        return (x > y ? 1 : x < y ? -1 : 0) * sort.dir;
      });

      COLS.forEach(function (c) {
        heads[c.key].classList.toggle('is-sorted', sort.key === c.key);
        heads[c.key].classList.toggle('is-desc', sort.key === c.key && sort.dir < 0);
      });

      reorder(order);

      /* --r is the row's place on screen, so the state change sweeps down the
         table instead of every row turning at once */
      order.forEach(function (r, i) {
        var m = map[r.ref], ok = passes(r);
        m.tr.style.setProperty('--r', i);
        m.tr.classList.toggle('is-out', any && !ok);
        m.tr.classList.toggle('is-hit', any && ok);

        COLS.forEach(function (c) { m.cells[c.key].classList.remove('is-fail'); });
        if (!ok) {
          CATALOGUE.filters.forEach(function (f) {
            if (active[f.id] && !f.test(r) && m.cells[f.col]) {
              m.cells[f.col].classList.add('is-fail');
            }
          });
        }

        m.dot.style.setProperty('--r', i);
        m.dot.classList.toggle('is-out', any && !ok);
      });

      tellCount(kept.length);
      if (empty) empty.hidden = kept.length > 0;
    }

    draw();
    paint();
    window.addEventListener('resize', draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  }

  /* --- it feeds the rest -------------------------------------------------------- */

  function initFeeds() {
    var list = document.getElementById('feed-list');
    if (!list || typeof PRODUCTS === 'undefined') return;

    PRODUCTS.forEach(function (p) {
      if (p.id === 'extractor') return;

      var li = document.createElement('li');
      var a = el('a', 'feed-link');
      a.href = '../' + p.slug + '/';
      a.setAttribute('data-tint', p.id);

      var art = el('span', 'feed-art');
      var img = document.createElement('img');
      img.src = '../assets/marks/' + p.id + '.svg';
      img.alt = '';
      img.width = 200;
      img.height = 150;
      art.appendChild(img);

      var text = document.createElement('span');
      text.appendChild(el('span', 'feed-name', p.name));
      text.appendChild(el('span', 'feed-tag', tx(p.tagline)));

      a.appendChild(art);
      a.appendChild(text);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function start() {
    initHero();
    initPipe();
    initComp();
    initDocs();
    initSchema();
    initWork();
    initFeeds();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
