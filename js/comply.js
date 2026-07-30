(function () {
  'use strict';

  var I18N = window.I18N || {};
  /* never name a local helper `t`: it is the tween parameter in the paint
     callbacks below and a shadowed translator falls through to English */
  var tx = I18N.t || function (p) { return p && p.en != null ? p.en : p; };
  var str = I18N.s || function () { return ''; };
  var dec = I18N.num || function (v) { return String(v); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var OPS = { min: '≥', max: '≤', set: '' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* --- the requirement engine ------------------------------------------------ */

  function classOf(id) { return byId(EXPOSURE, id); }

  /* a set requirement holds an array once bound and a single designation while
     it is still one source's claim */
  function fmtVal(req, v) {
    if (req.dir === 'set') {
      if (!Array.isArray(v)) return v ? String(v) : '—';
      return v.length ? v.join(' + ') : '—';
    }
    return dec(req.dp ? Number(v).toFixed(req.dp) : String(v));
  }

  /* the whole product in one function: collect every claim, expand the class
     claims through EXPOSURE, then let the strictest one bind */
  function reconcile(on) {
    var classes = [];
    CLASS_CLAIMS.forEach(function (c) {
      classes.push({ cls: c.cls, origin: c.origin, via: c.via });
    });
    EXTRAS.forEach(function (e) {
      if (on[e.id] && e.cls) classes.push({ cls: e.cls, origin: 'op', via: e.via });
    });

    var claims = {};
    function put(req, origin, v, via, cls) {
      (claims[req] = claims[req] || []).push({
        origin: origin, v: v, via: via, cls: cls || null
      });
    }

    CLAIMS.forEach(function (c) { put(c.req, c.origin, c.v, c.via); });
    EXTRAS.forEach(function (e) {
      if (on[e.id] && e.req) put(e.req, 'op', e.v, e.via);
    });

    classes.forEach(function (c) {
      var x = classOf(c.cls);
      if (!x) return;
      put('fck',   'code', x.fck,  CODES.ce, c.cls);
      put('wc',    'code', x.wc,   CODES.ce, c.cls);
      put('cem',   'code', x.cem,  CODES.ce, c.cls);
      put('cover', 'code', x.cover + COVER_MARGIN, CODES.ce, c.cls);
      x.needs.forEach(function (n) {
        put('res', 'code', n, n === 'SR' ? CODES.sr : CODES.mr, c.cls);
      });
    });

    var bound = {};
    REQS.forEach(function (r) {
      var list = claims[r.id];
      if (!list || !list.length) return;

      /* one claim per source per requirement: three exposure classes produce
         three limits for the same value and only the strictest can be read */
      var keep = [];
      list.forEach(function (c) {
        var held = null;
        keep.forEach(function (k) {
          if (k.origin !== c.origin) return;
          if (r.dir === 'set' ? k.v === c.v : true) held = k;
        });
        if (!held) { keep.push(c); return; }
        if (r.dir === 'set') return;
        if (r.dir === 'min' ? c.v > held.v : c.v < held.v) {
          keep[keep.indexOf(held)] = c;
        }
      });
      list = keep;

      if (r.dir === 'set') {
        var set = [];
        list.forEach(function (c) { if (set.indexOf(c.v) < 0) set.push(c.v); });
        bound[r.id] = { v: set, claims: list };
        return;
      }

      var best = list[0].v, win = list[0];
      list.forEach(function (c) {
        if (r.dir === 'min' ? c.v > best : c.v < best) { best = c.v; win = c; }
      });
      bound[r.id] = { v: best, claims: list, via: win.via, cls: win.cls };
    });

    return { classes: classes, bound: bound };
  }

  function fails(mix, bound) {
    var out = [];
    REQS.forEach(function (r) {
      var b = bound[r.id];
      if (!b || r.design) return;
      if (r.id === 'res') {
        if (b.v.some(function (n) { return mix.res.indexOf(n) < 0; })) out.push(r.id);
        return;
      }
      var v = mix[r.id];
      if (v == null) return;
      if (r.dir === 'min' ? v < b.v : v > b.v) out.push(r.id);
    });
    return out;
  }

  /* --- the section ----------------------------------------------------------- */

  /* One element on a dark stage, not a landscape: a landscape needs four masses
     to separate tonally and they collapse into one grey field. Oblique
     projection, so every level stays a horizontal line and the tide can be a
     plane that travels. BANDS in comply.data.js shares these y values. */
  var G = {
    dx: 122, dy: -68,
    W: 1000, H: 620,
    x1: 296, x2: 648,
    yTop: 84, ySplash: 214, yGround: 392, yBase: 516,
    yTide: 302, yHigh: 232, yBot: 700
  };
  /* the tide is drawn at its middle and travels each way in css/compliance.css,
     so the still frame a reduced-motion visitor gets already has the element
     standing in water */

  function sv(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      n.setAttribute(k, attrs[k]);
    });
    if (parent) parent.appendChild(n);
    return n;
  }

  function poly(parent, pts, cls) {
    return sv('polygon', {
      points: pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '),
      'class': cls
    }, parent);
  }

  function defs(svg, uid) {
    var d = sv('defs', null, svg);

    function grad(id, y2, stops, x2) {
      var g = sv('linearGradient', {
        id: id, x1: 0, y1: 0, x2: x2 || 0, y2: y2 == null ? 1 : y2
      }, d);
      stops.forEach(function (s) {
        sv('stop', { offset: s[0], 'stop-color': s[1],
                     'stop-opacity': s[2] == null ? 1 : s[2] }, g);
      });
    }

    /* one bright material against one dark stage: the only two values that have
       to separate, and they separate by 8:1 */
    grad(uid + '-conc', 0, [[0, '#dfe3ea'], [0.3, '#c3c8d3'],
                            [0.72, '#a3a9b7'], [1, '#8a90a0']], 1);
    grad(uid + '-wet', 1, [[0, '#0a0d12', 0.62], [0.4, '#0a0d12', 0.5],
                           [1, '#0a0d12', 0.42]]);
    grad(uid + '-gnd', 1, [[0, '#403c35'], [0.45, '#2e2c26'], [1, '#20201c']]);

    var glow = sv('radialGradient', { id: uid + '-glow' }, d);
    sv('stop', { offset: 0, 'stop-color': '#a3aef0', 'stop-opacity': 0.2 }, glow);
    sv('stop', { offset: 0.6, 'stop-color': '#6b7ad8', 'stop-opacity': 0.07 }, glow);
    sv('stop', { offset: 1, 'stop-color': '#6b7ad8', 'stop-opacity': 0 }, glow);

    var sulf = sv('radialGradient', { id: uid + '-sulf' }, d);
    sv('stop', { offset: 0, 'stop-color': '#c8a44e', 'stop-opacity': 0.42 }, sulf);
    sv('stop', { offset: 1, 'stop-color': '#c8a44e', 'stop-opacity': 0 }, sulf);

    /* aggregate: the material reads as concrete rather than as grey fill */
    var pat = sv('pattern', { id: uid + '-agg', width: 30, height: 30,
                              patternUnits: 'userSpaceOnUse' }, d);
    [[5, 7, 2.4], [20, 4, 1.6], [13, 17, 3], [26, 21, 1.9], [7, 24, 1.4],
     [22, 28, 2.2], [1, 15, 1.2]].forEach(function (c) {
      sv('circle', { cx: c[0], cy: c[1], r: c[2], 'class': 'sc-agg' }, pat);
    });

    /* soil in front of the buried part, so it reads as covered rather than dim */
    var soil = sv('pattern', { id: uid + '-soil', width: 22, height: 22,
                               patternUnits: 'userSpaceOnUse' }, d);
    [[3, 5], [14, 2], [8, 13], [19, 16], [2, 19], [17, 9]].forEach(function (c) {
      sv('circle', { cx: c[0], cy: c[1], r: 1.5, 'class': 'sc-soil' }, soil);
    });

    /* every veil is clipped to the whole silhouette, so a horizontal plane wets
       the side face at the same screen level as the front */
    var cb = sv('clipPath', { id: uid + '-cb' }, d);
    sv('rect', { x: G.x1, y: G.yTop, width: G.x2 - G.x1,
                 height: G.yBase - G.yTop }, cb);
    sv('polygon', {
      points: [[G.x1, G.yTop], [G.x1 + G.dx, G.yTop + G.dy],
               [G.x2 + G.dx, G.yTop + G.dy], [G.x2, G.yTop]]
        .map(function (p) { return p.join(','); }).join(' ')
    }, cb);
    sv('polygon', {
      points: [[G.x2, G.yTop], [G.x2 + G.dx, G.yTop + G.dy],
               [G.x2 + G.dx, G.yBase + G.dy], [G.x2, G.yBase]]
        .map(function (p) { return p.join(','); }).join(' ')
    }, cb);

    var cf = sv('clipPath', { id: uid + '-cf' }, d);
    sv('rect', { x: G.x1, y: G.yTop, width: G.x2 - G.x1,
                 height: G.yBase - G.yTop }, cf);
    return uid;
  }

  var sceneSeq = 0;

  function buildScene(svg, opts) {
    var uid = 'sc' + (++sceneSeq);
    var crop = opts.crop;
    svg.setAttribute('viewBox', crop.join(' '));
    svg.innerHTML = '';
    defs(svg, uid);

    var u = function (n) { return 'url(#' + uid + '-' + n + ')'; };

    var L = crop[0], R = crop[0] + crop[2];

    sv('ellipse', { cx: (G.x1 + G.x2) / 2 + 40, cy: G.ySplash + 60,
                    rx: 470, ry: 300, fill: u('glow') }, svg);

    var bands = {};
    if (opts.bands) {
      BANDS.forEach(function (b) {
        var g = sv('g', { 'class': 'sc-band' }, svg);
        sv('rect', { x: L, y: b.y[0], width: crop[2],
                     height: b.y[1] - b.y[0], 'class': 'sc-band-f' }, g);
        sv('path', { d: 'M' + L + ' ' + b.y[0] + 'H' + R,
                     'class': 'sc-band-e' }, g);
        bands[b.cls] = g;
      });
    }

    /* the ground: one surface plane and one mass, so the element sits in
       something rather than floating */
    var gnd = sv('g', null, svg);
    poly(gnd, [[L, G.yGround], [L + G.dx, G.yGround + G.dy],
               [R + G.dx, G.yGround + G.dy], [R, G.yGround]], 'sc-gnd-t');
    sv('rect', { x: L, y: G.yGround, width: crop[2],
                 height: G.yBot - G.yGround, fill: u('gnd') }, gnd);
    [38, 92, 158].forEach(function (dd) {
      sv('path', { d: 'M' + L + ' ' + (G.yGround + dd) + 'H' + R,
                   'class': 'sc-strata' }, gnd);
    });

    var sulf = sv('ellipse', {
      cx: (G.x1 + G.x2) / 2 + 50, cy: G.yBase - 20, rx: 380, ry: 150,
      fill: u('sulf'), 'class': 'sc-sulf'
    }, svg);

    /* the water surface behind the element, so the plane passes round it */
    var back = sv('g', { 'class': 'sc-tide' }, svg);
    poly(back, [[L, G.yTide], [L + G.dx, G.yTide + G.dy],
                [R + G.dx, G.yTide + G.dy], [R, G.yTide]], 'sc-sea-t');
    sv('path', { d: 'M' + L + ' ' + G.yTide + 'H' + R, 'class': 'sc-surf' }, back);
    poly(back, [[L, G.yTide], [L + G.dx, G.yTide + G.dy],
                [L + G.dx + 210, G.yTide + G.dy], [L + 210, G.yTide]],
         'sc-sheen');

    /* the element: the brightest object anywhere on the page */
    var blk = sv('g', null, svg);
    poly(blk, [[G.x1, G.yTop], [G.x1 + G.dx, G.yTop + G.dy],
               [G.x2 + G.dx, G.yTop + G.dy], [G.x2, G.yTop]], 'sc-b-t');
    poly(blk, [[G.x2, G.yTop], [G.x2 + G.dx, G.yTop + G.dy],
               [G.x2 + G.dx, G.yBase + G.dy], [G.x2, G.yBase]], 'sc-b-s');
    sv('rect', { x: G.x1, y: G.yTop, width: G.x2 - G.x1,
                 height: G.yBase - G.yTop, fill: u('conc') }, blk);
    sv('rect', { x: G.x1, y: G.yTop, width: G.x2 - G.x1,
                 height: G.yBase - G.yTop, fill: u('agg') }, blk);
    /* a lift joint, formwork panel lines and tie holes: without them the block
       reads as a rendered cube rather than as something that was poured */
    sv('path', { d: 'M' + G.x1 + ' ' + (G.yTop + 152) + 'H' + G.x2 + 'l' +
                    G.dx + ' ' + G.dy, 'class': 'sc-joint' }, blk);
    [0.34, 0.67].forEach(function (f) {
      var x = G.x1 + (G.x2 - G.x1) * f;
      sv('path', { d: 'M' + x + ' ' + G.yTop + 'V' + G.yBase,
                   'class': 'sc-form' }, blk);
    });
    [0.17, 0.5, 0.83].forEach(function (f) {
      var x = G.x1 + (G.x2 - G.x1) * f;
      [G.yTop + 76, G.yTop + 228, G.yTop + 356].forEach(function (y) {
        sv('circle', { cx: x, cy: y, r: 2.6, 'class': 'sc-tie' }, blk);
      });
    });

    var reb = null;
    if (opts.rebar) reb = sv('g', { 'class': 'sc-reb', 'clip-path': u('cf') }, svg);

    /* the part below the surface is covered, not merely dim */
    var bur = sv('g', { 'clip-path': u('cb') }, svg);
    sv('rect', { x: G.x1 - 4, y: G.yGround, width: G.x2 - G.x1 + G.dx + 8,
                 height: G.yBase - G.yGround + 60, 'class': 'sc-bur' }, bur);
    sv('rect', { x: G.x1 - 4, y: G.yGround, width: G.x2 - G.x1 + G.dx + 8,
                 height: G.yBase - G.yGround + 60, fill: u('soil') }, bur);

    /* the ground edge in front, so the element is cut by it cleanly */
    var ge = sv('g', null, svg);
    sv('path', { d: 'M' + L + ' ' + G.yGround + 'H' + R, 'class': 'sc-gline' }, ge);
    for (var gx = L + 12; gx < R; gx += 30) {
      sv('path', { d: 'M' + gx + ' ' + G.yGround + 'l-9 13',
                   'class': 'sc-gtick' }, ge);
    }

    /* the permanent high-water mark stays put while the tide moves: the one
       thing here that says this happens twice a day, every day */
    sv('path', { d: 'M' + G.x1 + ' ' + G.yHigh + 'H' + G.x2 + 'l' + G.dx +
                    ' ' + G.dy, 'class': 'sc-mark' }, svg);

    /* everything the water has reached is darker, and the salt line rides on top
       of it. Clipped to the silhouette, a horizontal plane wets the side face at
       the same screen level as the front, which is what water does. */
    var wet = sv('g', { 'class': 'sc-tide', 'clip-path': u('cb') }, svg);
    sv('rect', { x: G.x1 - 4, y: G.yTide, width: G.x2 - G.x1 + G.dx + 8,
                 height: G.yBase - G.yTide + 120, fill: u('wet') }, wet);
    sv('path', { d: 'M' + G.x1 + ' ' + G.yTide + 'H' + (G.x2 + G.dx),
                 'class': 'sc-salt' }, wet);

    /* the near half of the same plane, drawn over the element: the water has to
       pass in front of it or it reads as a line painted on the face */
    var front = sv('g', { 'class': 'sc-tide' }, svg);
    poly(front, [[L, G.yTide], [R, G.yTide], [R, G.yTide + 26], [L, G.yTide + 26]],
         'sc-lap');
    sv('path', { d: 'M' + L + ' ' + G.yTide + 'H' + R, 'class': 'sc-surf-f' }, front);

    if (opts.spray) {
      var spray = sv('g', { 'class': 'sc-tide' }, svg);
      for (var i = 0; i < 16; i++) {
        var c = sv('circle', {
          cx: G.x1 + 4 + (i % 6) * 9 - (i % 2) * 22,
          cy: G.yTide - 2 - (i % 3) * 6,
          r: 1.6 + (i % 4) * 1.2, 'class': 'sc-spray'
        }, spray);
        c.style.setProperty('--i', i);
      }
    }

    function setBars(dense) {
      if (!reb) return;
      reb.innerHTML = '';
      var step = dense ? 38 : 70, inset = 44;
      for (var x = G.x1 + inset; x <= G.x2 - inset + 1; x += step) {
        sv('path', { d: 'M' + x + ' ' + (G.yTop + 30) + 'V' + (G.yBase - 26),
                     'class': 'sc-bar' }, reb);
      }
      for (var y = G.yTop + 64; y < G.yBase - 30; y += 92) {
        sv('path', { d: 'M' + (G.x1 + inset - 10) + ' ' + y +
                        'H' + (G.x2 - inset + 10), 'class': 'sc-link' }, reb);
      }
      /* the only dimension the drawing needs: cover, outer face to first bar */
      var yd = G.yTop + 106;
      sv('path', { d: 'M' + G.x1 + ' ' + yd + 'h' + inset, 'class': 'sc-dim' }, reb);
      sv('path', { d: 'M' + G.x1 + ' ' + (yd - 8) + 'v16M' + (G.x1 + inset) +
                      ' ' + (yd - 8) + 'v16', 'class': 'sc-dim' }, reb);
    }
    setBars(false);

    return {
      band: function (cls, on) {
        if (bands[cls]) bands[cls].classList.toggle('is-on', !!on);
      },
      sulfate: function (on) { sulf.classList.toggle('is-on', !!on); },
      bars: setBars
    };
  }

  /* --- the specimens -------------------------------------------------------- */

  /* a standard cylinder, drawn as a solid: the physical object the whole page is
     about, nine times over */
  function specimen(parent) {
    var uid = 'cy' + (++sceneSeq);
    var svg = sv('svg', { viewBox: '0 0 80 172', 'class': 'cy',
                          focusable: 'false', 'aria-hidden': 'true' }, parent);
    var d = sv('defs', null, svg);
    var g = sv('linearGradient', { id: uid, x1: 0, y1: 0, x2: 1, y2: 0 }, d);
    [[0, '#cdd2dc'], [0.34, '#b0b5c1'], [0.72, '#9399a8'], [1, '#787e8d']]
      .forEach(function (s) {
        sv('stop', { offset: s[0], 'stop-color': s[1] }, g);
      });
    var pat = sv('pattern', { id: uid + 'a', width: 15, height: 15,
                              patternUnits: 'userSpaceOnUse' }, d);
    [[3, 4, 1.5], [10, 2, 1], [7, 9, 1.8], [13, 11, 1.2]].forEach(function (c) {
      sv('circle', { cx: c[0], cy: c[1], r: c[2], 'class': 'cy-agg' }, pat);
    });
    var cp = sv('clipPath', { id: uid + 'c' }, d);
    sv('path', { d: 'M16 34V138a24 8 0 0 0 48 0V34Z' }, cp);

    sv('ellipse', { cx: 40, cy: 152, rx: 27, ry: 6.5, 'class': 'cy-sh' }, svg);
    sv('path', { d: 'M16 34V138a24 8 0 0 0 48 0V34Z',
                 fill: 'url(#' + uid + ')' }, svg);
    sv('rect', { x: 10, y: 20, width: 60, height: 130,
                 fill: 'url(#' + uid + 'a)',
                 'clip-path': 'url(#' + uid + 'c)' }, svg);
    sv('ellipse', { cx: 40, cy: 34, rx: 24, ry: 8, 'class': 'cy-top' }, svg);
    sv('path', { d: 'M21 40V134', 'class': 'cy-hi' }, svg);
    return svg;
  }

  /* --- the page ------------------------------------------------------------- */

  function initRig() {
    var svg = document.getElementById('sc-svg');
    var labels = document.getElementById('sc-labels');
    var swSet = document.getElementById('sw-set');
    var bindBox = document.getElementById('bind');
    var drawEl = document.getElementById('bind-draw');
    var countEl = document.getElementById('cat-count');
    var row = document.getElementById('cat-row');
    var cap = document.getElementById('cat-cap');
    if (!svg || !swSet || !bindBox || !row || typeof MIXES === 'undefined') return;

    /* a landscape crop shrunk into a phone column puts the whole element at
       220px tall; narrow screens get their own framing, not a smaller one */
    var WIDE = [128, -8, 762, 576], TALL = [176, -22, 620, 606];
    var narrow = window.matchMedia('(max-width: 63.99rem)');
    var crop = narrow.matches ? TALL : WIDE;
    var scene = buildScene(svg, { crop: crop, bands: true, rebar: true,
                                  spray: true });
    var on = {};

    var tags = {};
    BANDS.forEach(function (b) {
      var tag = el('span', 'sc-tag');
      tag.setAttribute('data-cls', b.cls);
      tag.appendChild(el('b', null, b.cls));
      tag.appendChild(el('span', null, str('band.' + b.cls)));
      labels.appendChild(tag);
      tags[b.cls] = tag;
    });

    function place() {
      BANDS.forEach(function (b) {
        tags[b.cls].style.top =
          ((b.y[0] + b.y[1]) / 2 - crop[1]) / crop[3] * 100 + '%';
      });
    }
    place();

    var capEl = document.getElementById('sc-cap');
    if (capEl && typeof PROJECT !== 'undefined') {
      capEl.textContent = PROJECT.ref + '  ·  ' + tx(PROJECT.name) + '  ·  ' +
                          tx(PROJECT.element);
    }

    EXTRAS.forEach(function (e) {
      var b = el('button', 'sw');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      var lv = el('span', 'sw-lv');
      lv.setAttribute('aria-hidden', 'true');
      b.appendChild(lv);
      var txt = el('span', 'sw-txt');
      txt.appendChild(el('span', 'sw-lab', tx(e.label)));
      txt.appendChild(el('span', 'sw-why', tx(e.why)));
      b.appendChild(txt);
      b.addEventListener('click', function () {
        on[e.id] = !on[e.id];
        b.setAttribute('aria-pressed', on[e.id] ? 'true' : 'false');
        b.classList.toggle('is-on', !!on[e.id]);
        paint();
      });
      swSet.appendChild(b);
    });

    var rows = {};
    REQS.forEach(function (r) {
      var line = el('div', 'bd-row' + (r.design ? ' is-design' : ''));
      line.appendChild(el('span', 'bd-k', tx(r.label)));
      var val = el('span', 'bd-val');
      val.appendChild(el('span', 'bd-op', OPS[r.dir]));
      val.appendChild(el('span', 'bd-v', '—'));
      val.appendChild(el('span', 'bd-u', r.unit));
      line.appendChild(val);
      line.appendChild(el('span', 'bd-src', ''));
      bindBox.appendChild(line);
      rows[r.id] = {
        line: line, v: val.children[1], src: line.lastChild, was: null
      };
    });

    var specs = MIXES.map(function (m, i) {
      var li = el('li', 'sp');
      li.tabIndex = 0;
      li.style.setProperty('--i', i);
      var art = el('span', 'sp-art');
      specimen(art);
      li.appendChild(art);
      li.appendChild(el('span', 'sp-bar'));
      li.appendChild(el('span', 'sp-ref', m.ref.replace(/^HA-/, '')));
      li.appendChild(el('span', 'sp-miss'));
      li.appendChild(el('span', 'sr-only'));
      row.appendChild(li);

      function tell() {
        var bad = li.getAttribute('data-bad');
        cap.textContent = m.ref + (bad ? '  ·  ' + bad : '');
        cap.classList.add('is-on');
      }
      li.addEventListener('pointerenter', tell);
      li.addEventListener('focus', tell);
      li.addEventListener('pointerleave', function () {
        cap.classList.remove('is-on');
      });
      li.addEventListener('blur', function () { cap.classList.remove('is-on'); });
      return li;
    });

    countEl.appendChild(el('b', null, dec(MIXES.length)));
    countEl.appendChild(el('span', 'cat-of',
      ' / ' + dec(MIXES.length) + '  ' + str('scene.clear')));
    var shown = MIXES.length, tween = 0, settle = 0;

    /* the true value is written first and the tween plays over it: a rAF parked
       by a background tab must never leave the wrong number on screen */
    function tellCount(n) {
      var b = countEl.firstChild;
      if (tween) cancelAnimationFrame(tween);
      clearTimeout(settle);
      tween = 0;
      var from = shown, t0 = 0;
      shown = n;
      b.textContent = dec(n);
      if (reduced || from === n) return;
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = clamp((ts - t0) / 420);
        b.textContent = dec(p < 1 ? Math.round(from + (n - from) * p) : n);
        tween = p < 1 ? requestAnimationFrame(frame) : 0;
      }
      tween = requestAnimationFrame(frame);
      settle = setTimeout(function () { b.textContent = dec(n); }, 600);
    }

    function paint() {
      var res = reconcile(on);

      BANDS.forEach(function (b) {
        var lit = b.always || (b.extra && on[b.extra]);
        scene.band(b.cls, lit);
        labels.querySelector('[data-cls="' + b.cls + '"]')
              .classList.toggle('is-on', !!lit);
      });
      scene.sulfate(!!on.sulfate);
      scene.bars(!!on.congested);

      REQS.forEach(function (r) {
        var slot = rows[r.id], b = res.bound[r.id];
        if (!b) {
          slot.line.classList.add('is-off');
          slot.v.textContent = '—';
          slot.src.textContent = '';
          slot.was = null;
          return;
        }
        slot.line.classList.remove('is-off');
        var next = fmtVal(r, b.v);
        if (slot.was != null && slot.was !== next) {
          slot.line.classList.remove('is-new');
          void slot.line.offsetWidth;
          slot.line.classList.add('is-new');
        }
        slot.was = next;
        slot.v.textContent = next;
        slot.src.textContent = tx(b.via || (b.claims[0] && b.claims[0].via)) +
          (b.cls ? ' · ' + b.cls : '');
      });

      var cover = res.bound.cover, drawn = null;
      if (cover) cover.claims.forEach(function (c) {
        if (c.origin === 'docs') drawn = c.v;
      });
      if (drawEl) {
        var short = cover && drawn != null && cover.v > drawn;
        drawEl.hidden = !short;
        if (short) {
          drawEl.textContent = str('scene.drawing') + '  ' + dec(drawn) +
                               ' → ' + dec(cover.v) + ' mm';
        }
      }

      var kept = 0;
      MIXES.forEach(function (m, i) {
        var bad = fails(m, res.bound), li = specs[i], ok = !bad.length;
        if (ok) kept++;
        li.classList.toggle('is-out', !ok);
        var names = bad.map(function (id) { return tx(byId(REQS, id).short); });
        li.setAttribute('data-bad', names.join(', '));
        li.children[3].textContent = names.length ? names[0] : '';
        li.children[4].textContent = ok ? str('v.ok') : str('v.out');
      });

      tellCount(kept);
      cap.classList.remove('is-on');
      if (!kept) { cap.textContent = str('scene.none'); cap.classList.add('is-on'); }
    }

    function reframe() {
      var next = narrow.matches ? TALL : WIDE;
      if (next === crop) return;
      crop = next;
      scene = buildScene(svg, { crop: crop, bands: true, rebar: true,
                                spray: true });
      place();
      paint();
    }

    paint();
    if (narrow.addEventListener) narrow.addEventListener('change', reframe);
    else if (narrow.addListener) narrow.addListener(reframe);
  }

  function initHeroArt() {
    var svg = document.getElementById('hero-svg');
    if (!svg) return;
    /* wide: framed low and right so the waterline never crosses the headline.
       Narrow: the art is a band under the text, so it is framed on its own. */
    var WIDE = [-250, -158, 1320, 706], TALL = [150, -34, 730, 640];
    var narrow = window.matchMedia('(max-width: 63.99rem)');
    var at = null;

    function draw() {
      var next = narrow.matches ? TALL : WIDE;
      if (next === at) return;
      at = next;
      buildScene(svg, { crop: at, spray: true });
    }
    draw();
    if (narrow.addEventListener) narrow.addEventListener('change', draw);
    else if (narrow.addListener) narrow.addListener(draw);
  }

  function start() {
    initHeroArt();
    initRig();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
