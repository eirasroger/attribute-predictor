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

  /* --- the hero figure ------------------------------------------------------- */

  /* HOLES is the only place the argument is written: every candidate's fate and
     every verdict derive from it. Never hardcode a count against it. */
  var HOLES = [
    [0, 1, 3, 4, 6, 7],
    [0, 2, 3, 4, 7],
    [0, 4, 5, 7]
  ];

  var S = {
    W: 800, H: 640,
    dx: 88, dy: -50,
    x1: 268, x2: 684,
    lane0: 308, pitch: 42, lanes: 9,
    plateY: [206, 330, 454], th: 12,
    shelfY: 566,
    hole: 17, spawnY: -54,
    speed: 112, settle: 0.16, hold: 2.9, fade: 1
  };
  /* with S.hold, this sets how often the instrument is empty of verdicts.
     Measured at 3% of the time with docs/hero-test.html; shorten either and the
     figure reads as a screensaver. */
  var WAIT = { min: 0.4, jitter: 1.4 };

  /* a hole has to swallow a candidate: 2 * S.hole must clear TOK.k + TOK.sx,
     and 2 * S.hole + a gap must clear S.pitch */
  var TOK = { k: 15, sx: 8, sy: -4.5 };

  function laneX(i) { return S.lane0 + i * S.pitch; }
  function midY(y) { return y + S.dy / 2; }
  function restY(f) {
    return midY(f < HOLES.length ? S.plateY[f] : S.shelfY) - TOK.k;
  }

  function fateOf(i) {
    for (var p = 0; p < HOLES.length; p++) {
      if (HOLES[p].indexOf(i) < 0) return p;
    }
    return HOLES.length;
  }

  function holeAt(i, y) {
    return { cx: laneX(i) + S.dx / 2, cy: midY(y), rx: S.hole,
             ry: S.hole * 0.4 };
  }

  /* The holes are punched out of the plate with a mask, never painted over it as
     a dark ellipse: a painted ellipse has to be drawn after the candidates to
     cover the plate, and then it occludes the candidate that is inside it. A
     mask leaves a real opening, so a candidate is seen through the hole and is
     hidden only by the solid plate around and in front of it. */
  function holeMask(defs, uid, y, list) {
    var id = uid + '-m' + y;
    var m = sv('mask', {
      id: id, maskUnits: 'userSpaceOnUse',
      x: S.x1 - 8, y: y + S.dy - 8,
      width: S.x2 - S.x1 + S.dx + 16, height: -S.dy + S.th + 16
    }, defs);
    sv('rect', { x: S.x1 - 8, y: y + S.dy - 8,
                 width: S.x2 - S.x1 + S.dx + 16, height: -S.dy + S.th + 16,
                 fill: '#fff' }, m);
    list.forEach(function (i) {
      var h = holeAt(i, y);
      sv('ellipse', { cx: h.cx, cy: h.cy, rx: h.rx, ry: h.ry, fill: '#000' }, m);
    });
    return 'url(#' + id + ')';
  }

  /* Every plate is drawn in two passes, split along its own mid-depth line,
     with the candidates in between. Candidates travel at mid-depth, so this is
     what makes one sink through a hole and be cut by the plate instead of
     sliding over its face. Draw every void, then every back, then the
     candidates, then every front. */
  function voids(parent, y, list) {
    list.forEach(function (i) {
      var h = holeAt(i, y);
      sv('ellipse', { cx: h.cx, cy: h.cy, rx: h.rx, ry: h.ry,
                      'class': 'hs-hole' }, parent);
    });
  }

  function slabBack(parent, y, u, ok, mask) {
    var g = sv('g', null, parent), h = S.dx / 2, v = S.dy / 2;
    var f = poly(g, [[S.x1 + S.dx, y + S.dy], [S.x2 + S.dx, y + S.dy],
                     [S.x2 + h, y + v], [S.x1 + h, y + v]], 'hs-p-t');
    f.setAttribute('fill', u(ok ? 'sf' : 'pf'));
    f.setAttribute('mask', mask);
    return g;
  }

  function slabFront(parent, y, list, u, ok, mask) {
    var g = sv('g', null, parent), h = S.dx / 2, v = S.dy / 2;
    var f = poly(g, [[S.x1 + h, y + v], [S.x2 + h, y + v], [S.x2, y], [S.x1, y]],
                 'hs-p-t');
    f.setAttribute('fill', u(ok ? 'sf' : 'pf'));
    f.setAttribute('mask', mask);

    poly(g, [[S.x2, y], [S.x2 + S.dx, y + S.dy],
             [S.x2 + S.dx, y + S.dy + S.th], [S.x2, y + S.th]], 'hs-p-s');
    sv('rect', { x: S.x1, y: y, width: S.x2 - S.x1, height: S.th,
                 'class': 'hs-p-f' }, g);
    sv('path', { d: 'M' + S.x1 + ' ' + y + 'H' + S.x2,
                 'class': ok ? 'hs-s-e' : 'hs-p-e' }, g);

    /* the near rim, after the candidates: a candidate in the hole passes behind
       the lip closest to the viewer */
    list.forEach(function (i) {
      var o = holeAt(i, y);
      sv('path', { d: 'M' + (o.cx - o.rx) + ' ' + o.cy + 'a' + o.rx + ' ' +
                      o.ry + ' 0 0 0 ' + (o.rx * 2) + ' 0',
                   'class': 'hs-hole-l' }, g);
    });
    return g;
  }

  function cube(parent) {
    var g = sv('g', { 'class': 'hs-tok' }, parent);
    var k = TOK.k, sx = TOK.sx, sy = TOK.sy;
    sv('ellipse', { cx: (k + sx) / 2, cy: k + sy / 2, rx: k * 0.66,
                    ry: k * 0.21, 'class': 'tk-sh' }, g);
    poly(g, [[0, 0], [sx, sy], [k + sx, sy], [k, 0]], 'tk-t');
    poly(g, [[k, 0], [k + sx, sy], [k + sx, k + sy], [k, k]], 'tk-s');
    sv('rect', { x: 0, y: 0, width: k, height: k, 'class': 'tk-f' }, g);
    sv('path', { d: 'M0 0H' + k, 'class': 'tk-e' }, g);
    return g;
  }

  function heroDefs(svg, uid) {
    var d = sv('defs', null, svg);

    function grad(id, stops) {
      var g = sv('linearGradient', { id: uid + '-' + id, x1: 0, y1: 0,
                                     x2: 1, y2: 0 }, d);
      stops.forEach(function (s) {
        sv('stop', { offset: s[0], 'stop-color': s[1] }, g);
      });
    }
    /* two steps above --ground, same hue: the plates have to read as part of the
       page, not as a panel dropped on it */
    grad('pf', [[0, '#414855'], [0.5, '#3a4150'], [1, '#333a47']]);
    grad('sf', [[0, '#474e5c'], [0.5, '#404757'], [1, '#39404e']]);

    /* both of these must reach offset 1 inside the viewBox. A radius that runs
       past it gets cut by the SVG edge while still opaque, and the straight edge
       that leaves is exactly what makes a figure look pasted on. */
    var glow = sv('radialGradient', { id: uid + '-g' }, d);
    sv('stop', { offset: 0, 'stop-color': '#a3aef0', 'stop-opacity': 0.09 }, glow);
    sv('stop', { offset: 0.55, 'stop-color': '#6b7ad8', 'stop-opacity': 0.03 }, glow);
    sv('stop', { offset: 1, 'stop-color': '#6b7ad8', 'stop-opacity': 0 }, glow);

    var seat = sv('radialGradient', { id: uid + '-seat' }, d);
    sv('stop', { offset: 0, 'stop-color': '#0d0f13', 'stop-opacity': 0.5 }, seat);
    sv('stop', { offset: 0.6, 'stop-color': '#0d0f13', 'stop-opacity': 0.2 }, seat);
    sv('stop', { offset: 1, 'stop-color': '#0d0f13', 'stop-opacity': 0 }, seat);
    return { u: function (n) { return 'url(#' + uid + '-' + n + ')'; }, d: d };
  }

  function buildSieve(svg) {
    var uid = 'hs' + (++sceneSeq);
    svg.setAttribute('viewBox', '0 0 ' + S.W + ' ' + S.H);
    svg.innerHTML = '';
    var def = heroDefs(svg, uid), u = def.u;
    var levels = S.plateY.concat([S.shelfY]);
    var masks = levels.map(function (y, i) {
      return holeMask(def.d, uid, y, HOLES[i] || []);
    });

    var cx = (S.x1 + S.x2) / 2 + S.dx / 2;
    sv('ellipse', { cx: cx, cy: 366, rx: 272, ry: 262, fill: u('g') }, svg);
    sv('ellipse', { cx: cx, cy: S.shelfY + 30, rx: 250, ry: 40,
                    fill: u('seat') }, svg);

    /* co-prime multipliers, or the modulus collapses the scatter into rows */
    for (var m = 0; m < 30; m++) {
      var mote = sv('circle', {
        cx: S.x1 + 12 + (m * 149) % (S.x2 - S.x1 + S.dx - 24),
        cy: 12 + (m * 71) % 123,
        r: 1.4 + (m % 3) * 0.7, 'class': 'hs-mote'
      }, svg);
      mote.style.setProperty('--i', m);
    }

    levels.forEach(function (y, i) { voids(svg, y, HOLES[i] || []); });
    levels.forEach(function (y, i) {
      slabBack(svg, y, u, i === HOLES.length, masks[i]);
    });

    var stage = sv('g', null, svg);

    levels.forEach(function (y, i) {
      slabFront(svg, y, HOLES[i] || [], u, i === HOLES.length, masks[i]);
    });

    levels.forEach(function (y) {
      sv('path', { d: 'M254 ' + midY(y) + 'H306', 'class': 'hs-lead' }, svg);
    });

    return stage;
  }

  /* nothing is drawn at a destination before a candidate has travelled there:
     the verdict is the arrival, so no resting state may be built up front */
  function initHero() {
    var svg = document.getElementById('hs-svg');
    var labs = document.getElementById('hs-labs');
    if (!svg || !labs) return;

    var stage = buildSieve(svg);

    ['hero.lab.reg', 'hero.lab.proj', 'hero.lab.op', 'hero.lab.ok']
      .forEach(function (key, i) {
        var y = i < 3 ? S.plateY[i] : S.shelfY;
        var p = el('p', 'hs-lab' + (i === 3 ? ' is-ok' : ''), str(key));
        p.style.top = (y + S.dy / 2) / S.H * 100 + '%';
        labs.appendChild(p);
      });

    var N = 9, deck = [], live = [];

    function draw() {
      if (!deck.length) {
        for (var i = 0; i < S.lanes; i++) deck.push(i);
        for (var j = deck.length - 1; j > 0; j--) {
          var r = Math.floor(Math.random() * (j + 1)), sw = deck[j];
          deck[j] = deck[r]; deck[r] = sw;
        }
      }
      /* never two candidates in one lane: they would land on top of each other */
      for (var k = 0; k < deck.length; k++) {
        var taken = false;
        live.forEach(function (c) { if (c.lane === deck[k]) taken = true; });
        if (!taken) return deck.splice(k, 1)[0];
      }
      return deck.pop();
    }

    /* the drawn solid is k + sx wide, so centring the rect alone leaves it
       sitting sx/2 right of its own hole */
    function place(c) {
      c.g.setAttribute('transform', 'translate(' +
        (laneX(c.lane) + S.dx / 2 - (TOK.k + TOK.sx) / 2) + ' ' +
        c.y.toFixed(1) + ')');
    }

    function reset(c, wait) {
      c.lane = draw();
      c.fate = fateOf(c.lane);
      c.rest = restY(c.fate);
      c.y = S.spawnY;
      c.phase = 'wait';
      c.t = wait;
      c.g.setAttribute('class', 'hs-tok');
      c.g.style.opacity = 0;
      place(c);
    }

    /* seeded mid-fall, never at rest: a staggered wait leaves the figure empty
       for six seconds on arrival, and pre-placing a landing would give the
       verdict away before anything had travelled */
    for (var n = 0; n < N; n++) {
      live.push({ g: cube(stage) });
      reset(live[n], 0);
      live[n].phase = 'fall';
      live[n].y = 150 - n * 74;
    }

    function verdict(c) {
      c.g.setAttribute('class', 'hs-tok ' +
        (c.fate < HOLES.length ? 'is-fail' : 'is-pass'));
    }

    function step(c, dt) {
      if (c.phase === 'wait') {
        c.t -= dt;
        if (c.t <= 0) { c.phase = 'fall'; c.t = 0; }
        return;
      }
      if (c.phase === 'fall') {
        c.y += S.speed * dt;
        c.g.style.opacity = Math.min(1, (c.y - S.spawnY) / 54);
        if (c.y >= c.rest) {
          c.y = c.rest;
          c.phase = 'settle';
          c.t = 0;
          verdict(c);
        }
        place(c);
        return;
      }
      if (c.phase === 'settle') {
        c.t += dt;
        var p = clamp(c.t / S.settle);
        c.y = c.rest + Math.sin(p * Math.PI) * 2.4;
        place(c);
        if (p >= 1) { c.phase = 'hold'; c.t = 0; c.y = c.rest; place(c); }
        return;
      }
      if (c.phase === 'hold') {
        c.t += dt;
        if (c.t >= S.hold) { c.phase = 'fade'; c.t = 0; }
        return;
      }
      c.t += dt;
      var q = clamp(c.t / S.fade);
      c.g.style.opacity = 1 - q;
      c.y = c.rest - q * 9;
      place(c);
      if (q >= 1) reset(c, WAIT.min + Math.random() * WAIT.jitter);
    }

    /* the still frame is one instant of the same figure, verdicts already made */
    if (reduced) {
      [2, 5, 1, 3, 0, 4, 7].forEach(function (lane, i) {
        var c = live[i];
        c.lane = lane;
        c.fate = fateOf(lane);
        c.rest = restY(c.fate);
        c.y = c.rest;
        c.g.style.opacity = 1;
        verdict(c);
        place(c);
      });
      [[6, 58], [8, 262]].forEach(function (spec, i) {
        var c = live[7 + i];
        c.lane = spec[0];
        c.y = spec[1];
        c.g.style.opacity = 0.95;
        place(c);
      });
      return;
    }

    var last = 0, raf = 0;

    function frame(ts) {
      /* clamp: a tab that parked rAF must not teleport every candidate to its
         destination on the first frame back */
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
      last = ts;
      live.forEach(function (c) { step(c, dt); });
      raf = requestAnimationFrame(frame);
    }

    function run(on) {
      if (on && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    /* run first, observe second: an IntersectionObserver that never delivers a
       first callback would otherwise leave the figure blank forever. The
       observer only ever parks a loop that is already alive. Gate on the band
       the visitor can see, never on the drawing alone. */
    run(true);
    var band = svg.parentNode && svg.parentNode.parentNode;
    if (window.IntersectionObserver && band) {
      new IntersectionObserver(function (es) {
        run(es[0].isIntersecting);
      }, { threshold: 0 }).observe(band);
    }
  }

  function start() {
    initHero();
    initRig();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
