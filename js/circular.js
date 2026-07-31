(function () {
  'use strict';

  var I18N = window.I18N || {};
  var str = I18N.s || function () { return ''; };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function sv(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag), k;
    if (attrs) for (k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIO(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function rnd(a, b) {
    var x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  var S = {
    W: 640, H: 452,
    cols: 16, rows: 7,
    cw: 17, ch: 13,
    bx: 164, by: 34,
    dx: 40, dy: -23,
    gy: 372,
    bedX0: 18, bedW: 136, bedGap: 20,
    bedCols: 8, bpx: 17, bpy: 13,
    form: 1.2, hold: 1, shed: 4.4, land: 0.22, full: 4.4, drain: 1.05
  };

  var N = S.cols * S.rows;
  var FATE = ['is-r', 'is-i', 'is-n', 'is-h'];

  var MIX = [
    [92, 11,  6,  3],
    [30, 70, 10,  2],
    [12,  6, 58, 36]
  ];

  var STONE = [
    ['#c2c9c4', '#dde2dc'],
    ['#b4bcb8', '#d2d8d2'],
    ['#a8b0ad', '#c8cec9'],
    ['#bec6c0', '#d8ded8']
  ];

  function blockSlot(i) {
    var c = i % S.cols, r = (i / S.cols) | 0;
    return {
      x: S.bx + c * S.cw + S.cw / 2,
      y: S.by + r * S.ch + S.ch / 2,
      row: r
    };
  }

  function bedX(b) { return S.bedX0 + b * (S.bedW + S.bedGap); }

  var ORDER = {};

  function colOrder(wide) {
    if (ORDER[wide]) return ORDER[wide];
    var mid = (wide - 1) / 2, idx = [], c;
    for (c = 0; c < wide; c++) idx.push(c);
    idx.sort(function (a, b) {
      return Math.abs(a - mid) - Math.abs(b - mid) || a - b;
    });
    return (ORDER[wide] = idx);
  }

  function bedSlot(b, k, total) {
    var row = (k / S.bedCols) | 0;
    var full = (total / S.bedCols) | 0;
    var wide = row < full ? S.bedCols : total % S.bedCols;
    return {
      x: bedX(b) + (S.bedW - wide * S.bpx) / 2 +
         colOrder(wide)[k % S.bedCols] * S.bpx + S.bpx / 2,
      y: S.gy - row * S.bpy - S.bpy / 2
    };
  }

  function path(pts) {
    return 'M' + pts.map(function (q) {
      return q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    }).join('L') + 'Z';
  }

  function chip(parent, i) {
    var w = 7.1, h = 5.3;
    var base = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    var p = base.map(function (q, k) {
      return [q[0] * w + (rnd(i, k) - 0.5) * 1.2,
              q[1] * h + (rnd(i, k + 40) - 0.5) * 1];
    });
    var lit = [p[0], p[1],
               [p[1][0] - 0.6, p[1][1] + 1.7],
               [p[0][0] + 0.6, p[0][1] + 1.7]];

    var g = sv('g', { 'class': 'cy-chip' }, parent);
    sv('path', { 'class': 'ck-f', d: path(p) }, g);
    sv('path', { 'class': 'ck-t', d: path(lit) }, g);
    var s = STONE[i % STONE.length];
    g.style.setProperty('--f', s[0]);
    g.style.setProperty('--t', s[1]);
    g.style.setProperty('--o', (0.42 + rnd(i, 57) * 0.58).toFixed(2));
    return g;
  }

  function build(svg) {
    svg.setAttribute('viewBox', '0 0 ' + S.W + ' ' + S.H);
    svg.innerHTML = '';
    var defs = sv('defs', null, svg);

    function radial(id, colour, stops) {
      var g = sv('radialGradient', { id: id }, defs);
      stops.forEach(function (s) {
        sv('stop', { offset: s[0], 'stop-color': colour, 'stop-opacity': s[1] }, g);
      });
    }
    radial('cy-air',  '#8fd2ce', [[0, 0.07], [0.6, 0.02], [1, 0]]);
    radial('cy-glow', '#6bdcd2', [[0, 0.30], [0.55, 0.10], [1, 0]]);
    radial('cy-seat', '#050d11', [[0, 0.55], [0.65, 0.20], [1, 0]]);

    var top = sv('linearGradient', { id: 'cy-top', x1: 0, y1: 0, x2: 1, y2: 0.4 }, defs);
    sv('stop', { offset: 0, 'stop-color': '#dde3de' }, top);
    sv('stop', { offset: 1, 'stop-color': '#aeb7b3' }, top);

    var side = sv('linearGradient', { id: 'cy-side', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    sv('stop', { offset: 0, 'stop-color': '#7e8a89' }, side);
    sv('stop', { offset: 1, 'stop-color': '#576362' }, side);

    sv('ellipse', { cx: S.bx + 136, cy: 100, rx: 250, ry: 118,
                    fill: 'url(#cy-air)' }, svg);

    var glow = sv('ellipse', { cx: bedX(0) + S.bedW / 2, cy: S.gy - 72,
                               rx: 88, ry: 148, fill: 'url(#cy-glow)',
                               opacity: 0 }, svg);

    var seats = [];
    for (var b = 0; b < 4; b++) {
      seats.push(sv('ellipse', {
        cx: bedX(b) + S.bedW / 2, cy: S.gy + 5, rx: 70, ry: 11,
        fill: 'url(#cy-seat)', opacity: 0
      }, svg));
    }

    sv('path', { d: 'M14 ' + S.gy + 'H' + (S.W - 14), 'class': 'cy-gnd' }, svg);
    for (b = 0; b < 4; b++) {
      sv('path', { d: 'M' + bedX(b) + ' ' + S.gy + 'h' + S.bedW,
                   'class': 'cy-base' + (b ? '' : ' is-r') }, svg);
    }

    var body = sv('g', null, svg);
    var wash = sv('rect', { x: S.bx, y: S.by, width: S.cols * S.cw, height: 0,
                            'class': 'cy-b-w' }, body);
    var flank = sv('polygon', { fill: 'url(#cy-side)' }, body);
    var x2 = S.bx + S.cols * S.cw;
    sv('polygon', {
      fill: 'url(#cy-top)',
      points: S.bx + ',' + S.by + ' ' + x2 + ',' + S.by + ' ' +
              (x2 + S.dx) + ',' + (S.by + S.dy) + ' ' +
              (S.bx + S.dx) + ',' + (S.by + S.dy)
    }, body);
    sv('path', { d: 'M' + S.bx + ' ' + S.by + 'H' + x2, 'class': 'cy-b-e' }, body);

    var stage = sv('g', null, svg);

    function setH(h) {
      body.style.opacity = clamp(h / 6);
      if (h <= 0) return;
      wash.setAttribute('height', h.toFixed(1));
      flank.setAttribute('points',
        x2 + ',' + S.by + ' ' + (x2 + S.dx) + ',' + (S.by + S.dy) + ' ' +
        (x2 + S.dx) + ',' + (S.by + S.dy + h).toFixed(1) + ' ' +
        x2 + ',' + (S.by + h).toFixed(1));
    }

    return { stage: stage, glow: glow, seats: seats, setH: setH };
  }

  function initFigure() {
    var svg = document.getElementById('cy-svg');
    var labs = document.getElementById('cy-labs');
    if (!svg || !labs) return;

    var R = build(svg);
    var BH = S.rows * S.ch;

    ['hero.lab.r', 'hero.lab.i', 'hero.lab.n', 'hero.lab.h']
      .forEach(function (key, b) {
        var p = document.createElement('p');
        p.className = 'cy-lab' + (b ? '' : ' is-r');
        p.textContent = str(key);
        p.style.left = (bedX(b) / S.W * 100) + '%';
        p.style.width = (S.bedW / S.W * 100) + '%';
        p.style.top = (S.gy / S.H * 100) + '%';
        labs.appendChild(p);
      });

    var chips = [];
    for (var i = 0; i < N; i++) {
      var slot = blockSlot(i);
      chips.push({
        g: chip(R.stage, i), i: i, row: slot.row,
        bx: slot.x, by: slot.y,
        a0: (rnd(i, 3) - 0.5) * 5,
        formT: (slot.row / (S.rows - 1)) * 0.7 + rnd(i, 17) * 0.22,
        x: slot.x, y: slot.y, a: 0, op: 0, wop: -1,
        phase: 'packed'
      });
    }

    function write(c) {
      c.g.setAttribute('transform', 'translate(' + c.x.toFixed(1) + ' ' +
        c.y.toFixed(1) + ') rotate(' + c.a.toFixed(1) + ')');
      if (c.op !== c.wop) { c.g.style.opacity = c.op; c.wop = c.op; }
    }

    function assign(list, share, seed) {
      var order = list.slice(), j, s, tmp;
      for (j = order.length - 1; j > 0; j--) {
        s = Math.floor(rnd(j, seed) * (j + 1));
        tmp = order[j]; order[j] = order[s]; order[s] = tmp;
      }
      var beds = [[], [], [], []], b = 0, n = 0;
      order.forEach(function (c) {
        while (b < 3 && n >= share[b]) { b++; n = 0; }
        c.fate = b;
        n++;
        c.spin = rnd(c.i, 31) < 0.5 ? -1 : 1;
        c.dur = 1.45 + rnd(c.i, 5) * 0.9;
        c.rel = (S.rows - 1 - c.row) / (S.rows - 1) * (S.shed * 0.68) +
                rnd(c.i, 13) * (S.shed * 0.3);
        beds[b].push(c);
      });

      beds.forEach(function (set, f) {
        set.sort(function (u, v) { return (u.rel + u.dur) - (v.rel + v.dur); });
        set.forEach(function (c, k) {
          var p = bedSlot(f, k, set.length);
          c.slot = k; c.total = set.length;
          c.rx = p.x; c.ry = p.y;
        });
      });
    }

    var mi = -1;

    function deal() {
      mi = (mi + 1) % MIX.length;
      assign(chips, MIX[mi], mi * 17 + 5);
      chips.forEach(function (c) {
        c.phase = 'packed';
        c.x = c.bx; c.y = c.by; c.a = c.a0; c.op = 0;
        c.g.setAttribute('class', 'cy-chip');
        write(c);
      });
    }

    var mode = 'form', mt = 0, clock = 0;

    function tick(dt) {
      clock += dt; mt += dt;

      var bob = Math.sin(clock * 0.62) * 2.2;
      var packed = 0, landed = [0, 0, 0, 0], flying = 0;
      var veil = mode === 'drain' ? 1 - clamp(mt / S.drain) : 1;

      chips.forEach(function (c) {
        if (c.phase === 'packed') {
          c.op = mode === 'form' ? clamp((mt - c.formT) / 0.4) : 1;
          if (c.op > 0.5) packed++;
          if (mode === 'shed' && mt >= c.rel) {
            c.phase = 'fly'; c.t = 0; c.sx = c.x; c.sy = c.y;
          } else {
            c.x = c.bx; c.y = c.by + bob;
            write(c);
            return;
          }
        }

        if (c.phase === 'fly') {
          flying++;
          c.t += dt;
          var p = clamp(c.t / c.dur);
          c.x = c.sx + (c.rx - c.sx) * easeIO(p);
          c.y = c.sy + (c.ry - c.sy) * p * p;
          c.a = c.a0 + c.spin * 360 * easeOut(p);
          write(c);
          if (p >= 1) {
            c.phase = 'settle'; c.t = 0; c.a = c.a0;
            c.g.setAttribute('class', 'cy-chip ' + FATE[c.fate]);
          }
          return;
        }

        if (c.phase === 'settle') {
          flying++;
          landed[c.fate]++;
          c.t += dt;
          var q = clamp(c.t / S.land);
          c.y = c.ry + Math.sin(q * Math.PI) * 2;
          write(c);
          if (q >= 1) { c.phase = 'rest'; c.y = c.ry; write(c); }
          return;
        }

        landed[c.fate]++;
        if (mode === 'drain') {
          c.op = veil;
          c.y = c.ry + (1 - veil) * 8;
          write(c);
        }
      });

      R.setH(mode === 'form' || mode === 'shed' ? BH * packed / N
                                                : mode === 'hold' ? BH : 0);
      R.glow.setAttribute('opacity',
        (Math.min(1, landed[0] / 55) * 0.95 * veil).toFixed(3));
      for (var b = 0; b < 4; b++) {
        R.seats[b].setAttribute('opacity',
          (Math.min(1, landed[b] / 12) * veil).toFixed(3));
      }

      if (mode === 'form' && mt >= S.form) { mode = 'hold'; mt = 0; }
      else if (mode === 'hold' && mt >= S.hold) { mode = 'shed'; mt = 0; }
      else if (mode === 'shed' && !packed && !flying) { mode = 'full'; mt = 0; }
      else if (mode === 'full' && mt >= S.full) { mode = 'drain'; mt = 0; }
      else if (mode === 'drain' && mt >= S.drain) { deal(); mode = 'form'; mt = 0; }
    }

    function still() {
      var early = [], late = [];
      chips.forEach(function (c) { (c.row < 4 ? early : late).push(c); });

      assign(late, [40, 5, 2, 1], 5);
      early.forEach(function (c) {
        c.op = 1; c.x = c.bx; c.y = c.by; c.a = c.a0; write(c);
      });

      var air = 0, landed = [0, 0, 0, 0];
      late.forEach(function (c) {
        c.op = 1;
        if (!c.fate && c.slot >= c.total - 6 && air < 6) {
          air++;
          var p = 0.34 + air * 0.09;
          c.x = c.bx + (c.rx - c.bx) * easeIO(p);
          c.y = c.by + (c.ry - c.by) * p * p;
          c.a = c.a0 + c.spin * 360 * easeOut(p);
        } else {
          landed[c.fate]++;
          c.x = c.rx; c.y = c.ry; c.a = c.a0;
          c.g.setAttribute('class', 'cy-chip ' + FATE[c.fate]);
        }
        write(c);
      });

      R.setH(BH * 4 / S.rows);
      R.glow.setAttribute('opacity', (Math.min(1, landed[0] / 55) * 0.95).toFixed(3));
      for (var b = 0; b < 4; b++) {
        R.seats[b].setAttribute('opacity', Math.min(1, landed[b] / 12).toFixed(3));
      }
    }

    deal();

    if (reduced) { still(); return; }

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
