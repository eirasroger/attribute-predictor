/* ---------------------------------------------------------------------------
   ILLUSTRATIVE DATA — NOT MODEL OUTPUT.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var I18N = window.I18N || {};
  var tx  = I18N.t   || function (p) { return p && p.en != null ? p.en : p; };
  var str = I18N.s   || function () { return ''; };
  var dec = I18N.num || function (x) { return String(x); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* outside face first: the draw order depends on it */
  window.ASSEMBLY = {
    layers: [
      { id: 'rainscreen', mm: 8, hatch: 'dot',
        name: { en: 'Fibre cement rainscreen', ca: 'Plaqueta de fibrociment',
                es: 'Placa de fibrocemento' },
        materials: [
          { name: { en: 'Portland cement',  ca: 'Ciment Pòrtland',
                    es: 'Cemento Portland'    }, pct: 42 },
          { name: { en: 'Silica sand',      ca: 'Sorra silícia',
                    es: 'Arena silícea'       }, pct: 34 },
          { name: { en: 'Limestone filler', ca: 'Càrrega calcària',
                    es: 'Carga caliza'        }, pct: 14 },
          { name: { en: 'Cellulose fibre',  ca: 'Fibra de cel·lulosa',
                    es: 'Fibra de celulosa'   }, pct: 7  },
          { name: { en: 'Mineral pigment',  ca: 'Pigment mineral',
                    es: 'Pigmento mineral'    }, pct: 3  }
        ],
        values: { ghg: 0.98, fw: 0.019, ep: 0.00078, ap: 0.0049, adpf: 9.2 } },

      { id: 'sheathing', mm: 22, hatch: 'diag',
        name: { en: 'Wood fibre sheathing', ca: 'Tauler de fibra de fusta',
                es: 'Tablero de fibra de madera' },
        materials: [
          { name: { en: 'Softwood fibre', ca: 'Fibra de fusta tova',
                    es: 'Fibra de madera blanda' }, pct: 94 },
          { name: { en: 'PMDI binder',    ca: 'Lligant PMDI',
                    es: 'Ligante PMDI'           }, pct: 4  },
          { name: { en: 'Paraffin wax',   ca: 'Cera de parafina',
                    es: 'Cera de parafina'       }, pct: 2  }
        ],
        values: { ghg: 0.26, fw: 0.013, ep: 0.00088, ap: 0.0029, adpf: 5.0 } },

      { id: 'insulation', mm: 160, hatch: 'wool',
        name: { en: 'Thermal insulation', ca: 'Aïllament tèrmic',
                es: 'Aislamiento térmico' },
        materials: [
          { name: { en: 'Basalt rock',        ca: 'Roca basàltica',
                    es: 'Roca basáltica'        }, pct: 46 },
          { name: { en: 'Blast furnace slag', ca: 'Escòria d\'alt forn',
                    es: 'Escoria de alto horno' }, pct: 37 },
          { name: { en: 'Limestone',          ca: 'Pedra calcària',
                    es: 'Piedra caliza'         }, pct: 11 },
          { name: { en: 'Phenolic binder',    ca: 'Lligant fenòlic',
                    es: 'Ligante fenólico'      }, pct: 5  },
          { name: { en: 'Mineral oil',        ca: 'Oli mineral',
                    es: 'Aceite mineral'        }, pct: 1  }
        ],
        values: { ghg: 1.25, fw: 0.021, ep: 0.00082, ap: 0.0072, adpf: 16.0 } },

      { id: 'membrane', mm: 0.5, hatch: 'film',
        name: { en: 'Airtightness membrane', ca: 'Membrana d\'estanquitat',
                es: 'Membrana de estanquidad' },
        materials: [
          { name: { en: 'Polypropylene spunbond', ca: 'Polipropilè spunbond',
                    es: 'Polipropileno spunbond' }, pct: 68 },
          { name: { en: 'Polyethylene film',      ca: 'Film de polietilè',
                    es: 'Film de polietileno'    }, pct: 27 },
          { name: { en: 'Acrylic adhesive',       ca: 'Adhesiu acrílic',
                    es: 'Adhesivo acrílico'      }, pct: 5  }
        ],
        values: { ghg: 2.60, fw: 0.048, ep: 0.0011, ap: 0.0094, adpf: 62.0 } },

      { id: 'lining', mm: 15, hatch: 'board',
        name: { en: 'Gypsum plasterboard', ca: 'Placa de cartró guix',
                es: 'Placa de yeso laminado' },
        materials: [
          { name: { en: 'Gypsum',        ca: 'Guix',
                    es: 'Yeso'                    }, pct: 92 },
          { name: { en: 'Paper liner',   ca: 'Cartró de revestiment',
                    es: 'Cartón de revestimiento' }, pct: 6  },
          { name: { en: 'Starch binder', ca: 'Lligant de midó',
                    es: 'Ligante de almidón'      }, pct: 2  }
        ],
        values: { ghg: 0.31, fw: 0.0092, ep: 0.00047, ap: 0.0025, adpf: 4.6 } }
    ]
  };

  function init() {
    var track = document.getElementById('as-track');
    if (!track || typeof INDICATORS === 'undefined') return;

    var group = document.getElementById('as-group');
    var svg   = document.getElementById('as-svg');
    var panel = document.getElementById('as-panel');
    var LAYERS = window.ASSEMBLY.layers, N = LAYERS.length;
    var DEFAULT = 2;

    /* queries duplicated in css/predictor.css; change one, change both */
    var tall = window.matchMedia('(min-height: 34rem)');
    var wide = window.matchMedia('(min-width: 68rem) and (min-height: 38rem)');

    function place() {
      var home = wide.matches ? group : track.parentNode;
      if (panel.parentNode !== home) home.appendChild(panel);
    }

    /* --- geometry --------------------------------------------------------- */

    var NS = 'http://www.w3.org/2000/svg';
    var BW = 200, BD = 140, GAP = 40, PAD = 16;
    var GROW = 1.14, GROW_H = 1.20;
    var ISO = 'matrix(0.866 0.5 -0.866 0.5 0 0)';

    /* diagrammatic thickness, not true scale */
    var H = LAYERS.map(function (l) { return 12 + 78 * Math.sqrt(l.mm / 160); });
    var STACK_H = H.reduce(function (a, b) { return a + b; }, 0) +
                  H[DEFAULT] * (GROW_H - 1) + GAP * (N - 1);

    var OX = BD * GROW * 0.866 + PAD;
    var VB_W = Math.round(2 * (OX + (BW - BD) * 0.433));
    var OY = STACK_H / 2 + PAD;
    var VB_H = Math.round(OY + (BW + BD) * GROW / 2 + STACK_H / 2 + PAD);
    var CENTRE_X = VB_W / 2;
    svg.setAttribute('viewBox', '0 0 ' + VB_W + ' ' + VB_H);

    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    }
    function p(x, y, z) { return [OX + (x - y) * 0.866, OY + (x + y) * 0.5 - z]; }
    function pts(l) {
      return l.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
    }
    function rgb(hex) {
      var h = hex.replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    function mix(a, b, t) {
      var x = rgb(a), y = rgb(b);
      return '#' + x.map(function (v, i) {
        return ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2);
      }).join('');
    }
    function tone(i) { return mix('#4a5b55', '#67796f', i / (N - 1)); }
    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    /* --- hatches ---------------------------------------------------------- */
    var HATCH = {
      dot:   { w: 8,  h: 8,  d: 'M1.8 1.8h1.2M5.6 5.6h1.2', cap: 'round', sw: 1.2 },
      diag:  { w: 8,  h: 8,  d: 'M-1 9 L9 -1 M6 9 L9 6 M-1 2 L2 -1', sw: 0.9 },
      wool:  { w: 18, h: 10, d: 'M0 5 q4.5 -4.6 9 0 t9 0', sw: 1 },
      film:  { w: 10, h: 7,  d: 'M0 3.5 H6', sw: 1 },
      board: { w: 9,  h: 9,  d: 'M2 2 v1.8 M6.5 6.5 v1.8', cap: 'round', sw: 1.1 }
    };

    var defs = el('defs', {});
    Object.keys(HATCH).forEach(function (k) {
      var t = HATCH[k];
      var pat = el('pattern', {
        id: 'as-h-' + k, width: t.w, height: t.h,
        patternUnits: 'userSpaceOnUse', patternTransform: ISO
      });
      pat.appendChild(el('path', {
        d: t.d, fill: 'none', stroke: '#0f1412', 'stroke-opacity': 0.34,
        'stroke-width': t.sw, 'stroke-linecap': t.cap || 'butt'
      }));
      defs.appendChild(pat);
    });
    svg.appendChild(defs);

    var slabs = LAYERS.map(function (l) {
      var g = el('g', {
        'class': 'as-layer', tabindex: '0', role: 'button', 'aria-label': tx(l.name)
      });
      var o = {
        g: g,
        left:  el('polygon', { stroke: '#0f1412', 'stroke-width': 1.1 }),
        right: el('polygon', { stroke: '#0f1412', 'stroke-width': 1.1 }),
        top:   el('polygon', { stroke: '#0f1412', 'stroke-width': 1.1 }),
        hatch: el('polygon', { fill: 'url(#as-h-' + l.hatch + ')', stroke: 'none' }),
        hit:   el('polygon', { fill: 'transparent', stroke: 'none' })
      };
      g.appendChild(o.left); g.appendChild(o.right);
      g.appendChild(o.top); g.appendChild(o.hatch); g.appendChild(o.hit);
      return o;
    });
    var stackG = el('g', {});
    for (var i = N - 1; i >= 0; i--) stackG.appendChild(slabs[i].g);
    svg.appendChild(stackG);

    var callG = el('g', {});
    var callLine = el('path', { stroke: '#6f9187', 'stroke-width': 1, fill: 'none' });
    var callDot  = el('circle', { r: 2.6, fill: '#3ecf8e' });
    var callText = el('text', { fill: '#e8f2ee', 'font-size': 15,
                                'dominant-baseline': 'middle' });
    callG.appendChild(callLine); callG.appendChild(callDot); callG.appendChild(callText);
    svg.appendChild(callG);

    /* --- state ------------------------------------------------------------ */

    var open = 1, hi = 1, sel = DEFAULT, hoverIdx = -1, side = true;

    function draw() {
      var g = [], span = 1 - (N - 2) * 0.11, k;
      for (k = 0; k < N - 1; k++) g.push(ease(clamp((open - k * 0.11) / span)));

      var hs = H.map(function (h, i) {
        return i === sel ? h * (1 + (GROW_H - 1) * hi) : h;
      });
      var total = hs.reduce(function (a, b) { return a + b; }, 0) +
                  g.reduce(function (a, b) { return a + b; }, 0) * GAP;

      var z = -total / 2, zs = [];
      for (k = N - 1; k >= 0; k--) {
        zs[k] = z;
        z += hs[k] + (k > 0 ? GAP * g[k - 1] : 0);
      }

      var order = [], anchor = null, lowest = 0;
      slabs.forEach(function (sl, i) {
        var on = i === sel;
        var s = on ? 1 + (GROW - 1) * hi : 1;
        var lo = (BW - BW * s) / 2, hx = lo + BW * s;
        var lod = (BD - BD * s) / 2, hy = lod + BD * s;
        var t = hs[i], zb = zs[i];

        var top = [p(lo, lod, zb + t), p(hx, lod, zb + t), p(hx, hy, zb + t), p(lo, hy, zb + t)];
        sl.top.setAttribute('points', pts(top));
        sl.hatch.setAttribute('points', pts(top));
        sl.left.setAttribute('points', pts([p(lo, hy, zb), p(hx, hy, zb),
                                            p(hx, hy, zb + t), p(lo, hy, zb + t)]));
        sl.right.setAttribute('points', pts([p(hx, lod, zb), p(hx, hy, zb),
                                             p(hx, hy, zb + t), p(hx, lod, zb + t)]));
        sl.hit.setAttribute('points', pts([p(lo, lod, zb + t), p(hx, lod, zb + t),
                                           p(hx, lod, zb), p(hx, hy, zb),
                                           p(lo, hy, zb), p(lo, hy, zb + t)]));

        var base = on ? mix(tone(i), '#3ecf8e', hi)
                 : i === hoverIdx ? mix(tone(i), '#e8f2ee', 0.18) : tone(i);
        sl.top.setAttribute('fill', mix(base, '#ffffff', 0.07));
        sl.left.setAttribute('fill', mix(base, '#0f1412', 0.30));
        sl.right.setAttribute('fill', mix(base, '#0f1412', 0.50));
        sl.g.setAttribute('opacity', (on ? 1 : 1 - 0.42 * hi).toFixed(3));

        if (on) {
          var a = p(lo, hy * 0.72, zb + t / 2);
          anchor = { x: a[0], y: a[1] };
        }
        lowest = Math.max(lowest, p(hx, hy, zb)[1]);
        order.push({ i: i, on: on, z: zb });
      });

      if (anchor) {
        if (side) {
          var ex = -30;   /* outside the viewBox on purpose; see calloutShift */
          callLine.setAttribute('d', 'M' + anchor.x.toFixed(1) + ' ' +
                                     anchor.y.toFixed(1) + 'H' + ex);
          callText.setAttribute('x', ex - 12);
          callText.setAttribute('y', anchor.y.toFixed(1));
          callText.setAttribute('text-anchor', 'end');
          callDot.setAttribute('cx', anchor.x.toFixed(1));
          callDot.setAttribute('cy', anchor.y.toFixed(1));
          callDot.setAttribute('r', 2.6);
        } else {
          /* steps around the stack: a straight run would cross the boards below */
          var capY = lowest + 36;
          var tw = callText.getComputedTextLength ? callText.getComputedTextLength() : 92;
          var out = -22;
          callLine.setAttribute('d',
            'M' + anchor.x.toFixed(1) + ' ' + anchor.y.toFixed(1) +
            'H' + out + 'V' + capY.toFixed(1) +
            'H' + (CENTRE_X - tw / 2 - 10).toFixed(1));
          callDot.setAttribute('cx', anchor.x.toFixed(1));
          callDot.setAttribute('cy', anchor.y.toFixed(1));
          callDot.setAttribute('r', 2.6);
          callText.setAttribute('x', CENTRE_X);
          callText.setAttribute('y', capY.toFixed(1));
          callText.setAttribute('text-anchor', 'middle');
        }
        callG.setAttribute('opacity', hi.toFixed(3));
      }

      /* front only once highlighted: sooner and it punches through the boards
         still stacked above it */
      order.sort(function (a, b) {
        return (hi > 0.02 ? (a.on ? 1 : 0) - (b.on ? 1 : 0) : 0) || a.z - b.z;
      }).forEach(function (o) { stackG.appendChild(slabs[o.i].g); });
    }

    /* --- the panel -------------------------------------------------------- */

    function fmt(v) {
      var d = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(v))));
      return dec(v.toFixed(Math.min(6, d)));
    }

    /* reflow, not rAF: rAF is parked in a background tab */
    function paint(i) {
      var l = LAYERS[i];
      callText.textContent = tx(l.name);

      panel.classList.remove('ready');
      panel.innerHTML =
        '<h3 class="as-title">' + tx(l.name) + '</h3>' +

        '<p class="as-sub">' + str('assembly.composition') + '</p>' +
        '<ul class="as-rows">' + l.materials.map(function (m) {
          return '<li><div class="as-row"><b>' + tx(m.name) + '</b>' +
                 '<span class="as-val">' + dec(m.pct) + '%</span></div>' +
                 '<div class="as-bar"><i data-w="' + m.pct + '%"></i></div></li>';
        }).join('') + '</ul>' +

        '<p class="as-sub">' + str('assembly.impact') + '</p>' +
        '<ul class="as-rows as-plain">' + INDICATORS.map(function (ind) {
          return '<li><div class="as-row"><b>' + tx(ind.short) + '</b>' +
                 '<span class="as-val">' + fmt(l.values[ind.key]) +
                 '<span class="as-unit">' + ind.unit + '</span></span></div></li>';
        }).join('') + '</ul>';

      void panel.offsetWidth;
      panel.classList.add('ready');
      Array.prototype.forEach.call(panel.querySelectorAll('.as-bar i'), function (b) {
        b.style.width = b.getAttribute('data-w');
      });
    }

    function select(i) {
      if (i === sel) return;
      sel = i;
      paint(i);
      draw();
    }

    /* --- scroll ----------------------------------------------------------- */

    function shiftFor(t) {
      var m = parseFloat(getComputedStyle(panel).marginLeft) || 0;
      return -(panel.offsetWidth + m) / 2 * t;
    }

    /* the callout is outside the layout box; add half its overhang back */
    function calloutShift(t) {
      var w = svg.getBoundingClientRect().width;
      if (!w || !callText.getComputedTextLength) return 0;
      var over = (42 + callText.getComputedTextLength()) * (w / VB_W);
      return over / 2 * t;
    }

    function scrolled() {
      side = wide.matches;
      var vh = window.innerHeight || 800;

      if (reduced || !tall.matches) {
        open = 1; hi = 1;
        panel.style.opacity = ''; group.style.transform = '';
        draw();
        return;
      }

      var r = track.getBoundingClientRect();
      var run = track.offsetHeight - vh;
      var t = run > 0 ? clamp(-r.top / run) : 1;

      if (wide.matches) {
        open = ease(clamp((t - 0.12) / 0.46));
        hi   = ease(clamp((t - 0.45) / 0.27));
        var pin = ease(clamp((t - 0.66) / 0.20));
        panel.style.opacity = pin.toFixed(3);
        draw();
        group.style.transform =
          'translateX(' + (shiftFor(pin) + calloutShift(hi)).toFixed(1) + 'px)';
        return;
      }

      open = ease(clamp((t - 0.15) / 0.50));
      hi   = ease(clamp((t - 0.58) / 0.26));
      panel.style.opacity = '';
      group.style.transform = '';
      draw();
    }

    slabs.forEach(function (o, i) {
      o.g.addEventListener('click', function () { select(i); });
      o.g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
      });
      o.g.addEventListener('pointerenter', function () { hoverIdx = i; draw(); });
      o.g.addEventListener('pointerleave', function () { hoverIdx = -1; draw(); });
    });

    paint(sel);

    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; scrolled(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    [tall, wide].forEach(function (q) {
      if (q.addEventListener) q.addEventListener('change', function () { place(); scrolled(); });
    });
    place();
    scrolled();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
