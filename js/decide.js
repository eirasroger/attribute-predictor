(function () {
  'use strict';

  var I18N = window.I18N || {};
  var str = I18N.s || function () { return ''; };
  var CTX = window.DECIDE_CTX || [];

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function sv(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag), k;
    if (attrs) for (k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
  function easeSoft(t) { return 1 - Math.pow(1 - t, 3); }

  function pts(a) {
    var out = [], i;
    for (i = 0; i < a.length; i += 2) out.push(a[i] + ',' + a[i + 1]);
    return out.join(' ');
  }

  function argmax(a, skip) {
    var b = -1, i;
    for (i = 0; i < a.length; i++) {
      if (i !== skip && (b < 0 || a[i] > a[b])) b = i;
    }
    return b;
  }

  var WIDE = { W: 560, H: 430, ry0: 44, rp: 38, x0: 80, x1: 470,
               axisY: 386, lineL: 16, lineR: 544, rise: 62,
               h: 22, dx: 13, dy: -11 };
  var TALL = { W: 460, H: 400, ry0: 38, rp: 35, x0: 76, x1: 376,
               axisY: 356, lineL: 44, lineR: 420, rise: 52,
               h: 18, dx: 10, dy: -8 };

  var BW = [20, 17, 23, 18, 21, 17, 20, 23, 18];
  var N = BW.length;

  var STAG = 0.05;
  var MAXD = (N - 1) * STAG;

  var PH = [
    ['hold',    2.4],
    ['lift',    1.1],
    ['adjust',  1.6],
    ['hold',    2.4],
    ['restore', 1.5],
    ['hold',    1.6],
    ['shift',   1.9]
  ];

  function block(parent, i, L) {
    var w = BW[i], h = L.h, dx = L.dx, dy = L.dy;
    var side = pts([w, -h, w + dx, -h + dy, w + dx, dy, w, 0]);
    var top = pts([-w, -h, w, -h, w + dx, -h + dy, -w + dx, -h + dy]);

    var g = sv('g', { 'class': 'dc-blk' }, parent);
    sv('polygon', { 'class': 'bs', points: side }, g);
    sv('polygon', { points: side, fill: 'url(#dc-gs)' }, g);
    sv('polygon', { 'class': 'bt', points: top }, g);
    sv('polygon', { points: top, fill: 'url(#dc-gt)' }, g);
    sv('rect', { 'class': 'bf', x: -w, y: -h, width: w * 2, height: h }, g);
    sv('rect', { x: -w, y: -h, width: w * 2, height: h, fill: 'url(#dc-gf)' }, g);
    sv('path', { 'class': 'be', d: 'M' + (-w) + ' ' + (-h) + 'H' + w }, g);
    return g;
  }

  function build(svg, L) {
    svg.setAttribute('viewBox', '0 0 ' + L.W + ' ' + L.H);
    svg.innerHTML = '';
    var defs = sv('defs', null, svg);

    function lin(id, box, cls) {
      var g = sv('linearGradient', {
        id: id, x1: box[0], y1: box[1], x2: box[2], y2: box[3]
      }, defs);
      cls.forEach(function (s) {
        sv('stop', { 'class': s[0], offset: s[1] }, g);
      });
    }

    lin('dc-gf', [0, 0, 0, 1],
        [['dc-lite', 0], ['dc-none', 0.42], ['dc-dark', 1]]);
    lin('dc-gt', [0, 0, 0, 1], [['dc-lite', 0], ['dc-none', 1]]);
    lin('dc-gs', [0, 0, 0, 1], [['dc-none', 0], ['dc-dark', 1]]);

    var sh = sv('radialGradient', { id: 'dc-sh' }, defs);
    sv('stop', { 'class': 'dc-sh-in', offset: 0 }, sh);
    sv('stop', { 'class': 'dc-sh-mid', offset: 0.42 }, sh);
    sv('stop', { 'class': 'dc-sh-out', offset: 1 }, sh);

    var ax = sv('linearGradient', { id: 'dc-ax', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    sv('stop', { 'class': 'dc-ax-lo', offset: 0 }, ax);
    sv('stop', { 'class': 'dc-ax-lo', offset: 0.58 }, ax);
    sv('stop', { 'class': 'dc-ax-hi', offset: 1 }, ax);

    var rl = sv('linearGradient', {
      id: 'dc-rl', gradientUnits: 'userSpaceOnUse',
      x1: L.lineL, y1: 0, x2: L.lineR, y2: 0
    }, defs);
    [[0, 'dc-rl-out'], [0.06, 'dc-rl-in'], [0.94, 'dc-rl-in'], [1, 'dc-rl-out']]
      .forEach(function (s) {
        sv('stop', { 'class': s[1], offset: s[0] }, rl);
      });

    var lines = sv('g', null, svg);
    var rows = [], i, y;
    for (i = 0; i < N; i++) {
      y = L.ry0 + i * L.rp;
      rows.push(sv('path', { 'class': 'dc-row', stroke: 'url(#dc-rl)',
        d: 'M' + L.lineL + ' ' + y + 'H' + L.lineR }, lines));
    }

    sv('path', { 'class': 'dc-axis', stroke: 'url(#dc-ax)',
      d: 'M' + L.lineL + ' ' + L.axisY + 'H' + L.lineR }, svg);
    sv('path', { 'class': 'dc-tick',
      d: 'M' + L.x0 + ' ' + (L.axisY - 7) + 'v14' }, svg);
    sv('path', { 'class': 'dc-tick is-hi',
      d: 'M' + L.x1 + ' ' + (L.axisY - 7) + 'v14' }, svg);

    return { rows: rows, shadows: sv('g', null, svg), stage: sv('g', null, svg) };
  }

  function initFigure() {
    var svg = document.getElementById('dc-svg');
    var labs = document.getElementById('dc-labs');
    if (!svg || !labs || CTX.length < 2) return;

    var wide = window.matchMedia('(min-width: 64rem)');
    var L, R, blocks;
    var ci = 0, phase = 0, pt = 0;

    function pos(v) { return L.x0 + v * (L.x1 - L.x0); }

    function write(b) {
      var y = b.ry - b.l * L.rise;
      b.g.setAttribute('transform',
        'translate(' + b.x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      b.sh.setAttribute('transform',
        'translate(' + b.x.toFixed(1) + ' ' + b.ry + ')');
      b.sh.setAttribute('opacity', ((1 - b.l) * 0.92).toFixed(3));

      var out = b.l > 0.02;
      if (out !== b.wl) {
        b.g.classList.toggle('is-out', out);
        b.line.classList.toggle('is-out', out);
        b.wl = out;
      }
    }

    function setLight(i) {
      blocks.forEach(function (b, k) {
        b.g.classList.toggle('is-top', k === i);
      });
    }

    function targets(vals, skip) {
      blocks.forEach(function (b) {
        if (b.i !== skip) b.xb = pos(vals[b.i]);
      });
    }

    function begin(m) {
      var c = CTX[ci], out = argmax(c.v, -1);
      blocks.forEach(function (b) {
        b.xa = b.x; b.xb = b.x; b.la = b.l; b.lb = b.l;
      });
      if (m === 'lift') { setLight(-1); blocks[out].lb = 1; }
      if (m === 'adjust') { targets(c.w, out); }
      if (m === 'restore') { setLight(-1); targets(c.v, -1); blocks[out].lb = 0; }
      if (m === 'shift') {
        setLight(-1);
        ci = (ci + 1) % CTX.length;
        targets(CTX[ci].v, -1);
      }
    }

    function done(m) {
      var c = CTX[ci];
      if (m === 'adjust') setLight(argmax(c.w, argmax(c.v, -1)));
      if (m === 'restore' || m === 'shift') setLight(argmax(c.v, -1));
    }

    function tick(dt) {
      pt += dt;
      var d = PH[phase][1], span = d - MAXD;
      blocks.forEach(function (b) {
        var p = clamp((pt - b.i * STAG) / span);
        b.x = b.xa + (b.xb - b.xa) * easeOut(p);
        b.l = b.la + (b.lb - b.la) * easeSoft(clamp(pt / d));
        write(b);
      });
      if (pt >= d) {
        done(PH[phase][0]);
        phase = (phase + 1) % PH.length;
        pt = 0;
        begin(PH[phase][0]);
      }
    }

    function reset() {
      var c = CTX[ci];
      blocks.forEach(function (b) {
        b.x = b.xa = b.xb = pos(c.v[b.i]);
        b.l = b.la = b.lb = 0;
        write(b);
      });
      setLight(argmax(c.v, -1));
      phase = 0; pt = 0;
    }

    function still() {
      var c = CTX[0], out = argmax(c.v, -1);
      blocks.forEach(function (b) {
        b.x = pos(b.i === out ? c.v[b.i] : c.w[b.i]);
        b.l = b.i === out ? 0.68 : 0;
        write(b);
      });
      setLight(argmax(c.w, out));
    }

    function lay() {
      L = wide.matches ? WIDE : TALL;
      R = build(svg, L);

      blocks = [];
      for (var i = 0; i < N; i++) {
        blocks.push({
          i: i, ry: L.ry0 + i * L.rp,
          sh: sv('ellipse', { 'class': 'dc-sh', rx: BW[i] + 13, ry: 5,
                              fill: 'url(#dc-sh)' }, R.shadows),
          g: block(R.stage, i, L),
          line: R.rows[i],
          x: 0, xa: 0, xb: 0, l: 0, la: 0, lb: 0, wl: null
        });
      }

      labs.innerHTML = '';
      ['lo', 'hi'].forEach(function (k) {
        var p = document.createElement('p');
        p.className = 'dc-lab is-' + k;
        p.textContent = str('hero.axis.' + k);
        labs.appendChild(p);
      });
      labs.style.left = (L.x0 / L.W * 100) + '%';
      labs.style.right = ((L.W - L.x1) / L.W * 100) + '%';
      labs.style.top = (L.axisY / L.H * 100) + '%';

      if (reduced) still(); else reset();
    }

    lay();
    wide.addEventListener('change', lay);
    if (reduced) return;

    var last = 0, raf = 0;

    function frame(ts) {
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
      last = ts;
      tick(dt);
      raf = requestAnimationFrame(frame);
    }

    function run(on) {
      if (on && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    run(true);
    var band = document.getElementById('hero');
    if (window.IntersectionObserver && band) {
      new IntersectionObserver(function (es) {
        run(es[0].isIntersecting);
      }, { threshold: 0 }).observe(band);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFigure);
  } else {
    initFigure();
  }
})();
