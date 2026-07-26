/* ===========================================================================
   Attribute Predictor — marketing site
   No framework, no build step. Reads the illustrative data in js/data.js.
   =========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- formatting -------------------------------------------------------- */

  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
              '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

  /* Three significant digits, keeping trailing zeros so the readout does not
     change width while it scrubs. Falls back to exponent form at the extremes
     the indicators actually reach. */
  function fmt(v) {
    if (!isFinite(v)) return '–';
    if (v === 0) return '0';
    var a = Math.abs(v);
    if (a < 1e-5 || a >= 1e6) {
      var e = v.toExponential(2).split('e');
      var exp = String(Number(e[1])).split('').map(function (c) {
        return SUP[c] || c;
      }).join('');
      return e[0] + ' × 10' + exp;
    }
    var decimals = Math.max(0, 2 - Math.floor(Math.log10(a)));
    return v.toFixed(Math.min(decimals, 8));
  }

  function fmtRatio(r) {
    return (r >= 10 ? r.toFixed(0) : r.toFixed(2)) + '× median';
  }

  /* --- verdicts ---------------------------------------------------------- */

  function classify(v, d) {
    if (v < d.p25) return 'good';
    if (v > d.p75) return 'bad';
    return 'mid';
  }

  var VERDICT_TEXT = {
    good: 'Better than typical',
    mid:  'Typical for the category',
    bad:  'Worse than typical'
  };

  /* The honest part: if the prediction's own error range straddles a
     threshold, the model cannot settle the claim, so the wording softens. */
  function verdict(v, d) {
    var here = classify(v, d);
    var soft = classify(v / FOLD_ERROR, d) !== classify(v * FOLD_ERROR, d);
    var text = VERDICT_TEXT[here];
    if (soft) text = 'Likely ' + text.charAt(0).toLowerCase() + text.slice(1);
    return { kind: here, soft: soft, text: text };
  }

  function chipClass(v) {
    return 'chip' +
      (v.kind === 'good' ? ' chip-good' : v.kind === 'bad' ? ' chip-bad' : '') +
      (v.soft ? ' chip-soft' : '');
  }

  function paintChip(node, v, d) {
    var vd = verdict(v, d);
    node.textContent = vd.text;
    node.className = chipClass(vd);
  }

  /* --- shared maths ------------------------------------------------------ */

  /* Position on a log₁₀ scale running one decade either side of the category
     median, as a 0–1 fraction. The radar radius and the bar both use it. */
  function logPos(value, median) {
    var l = Math.log10(value / median);
    return (Math.max(-1, Math.min(1, l)) + 1) / 2;
  }

  /* Indicators span orders of magnitude, so cross-fade in log space —
     linear interpolation would swing wildly and read as a glitch. */
  function lerpLog(a, b, t) { return Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t); }

  function lerpValues(a, b, t) {
    var out = {};
    INDICATORS.forEach(function (ind) {
      out[ind.key] = lerpLog(a[ind.key], b[ind.key], t);
    });
    return out;
  }

  function smoothstep(t) { return t * t * (3 - 2 * t); }

  /* slow in, slow out, with a long tail: the "expensive" easing */
  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* --- product identity --------------------------------------------------- */

  function rgb(hex) {
    var h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16)];
  }

  function hexLerp(a, b, t) {
    var x = rgb(a), y = rgb(b);
    return 'rgb(' + x.map(function (v, i) {
      return Math.round(v + (y[i] - v) * t);
    }).join(',') + ')';
  }

  /* Every surface that represents a build reads --pc (mark) and --pi (text),
     so identity stays consistent across the hero loop, both acts and the
     stage chart without each one hardcoding a colour. */
  function setProduct(node, variant) {
    node.style.setProperty('--pc', variant.color);
    node.style.setProperty('--pi', variant.ink);
  }

  /* Staging: hold, move, hold. The hold zones give each build a moment to be
     read; too wide and the stage feels unresponsive to the scroll. */
  function staged(t) {
    if (t <= 0.18) return 0;
    if (t >= 0.82) return 1;
    return smoothstep((t - 0.18) / 0.64);
  }

  /* --- generic pinned scrubber ------------------------------------------- */

  /* Drives one sticky stage from scroll position, and decides at runtime
     whether pinning is viable at all: the stage must fit the viewport or the
     content would be clipped. Breakpoints cannot express that — it depends on
     width, height and rendered font together. */
  function makeScrubber(sectionId, trackId, stageId, innerSel, paint) {
    var section = document.getElementById(sectionId);
    var track   = document.getElementById(trackId);
    var stageEl = document.getElementById(stageId);
    if (!section || !track || !stageEl) return;

    var inner   = stageEl.querySelector(innerSel);
    var pinned  = true;
    var ticking = false;

    function checkFit() {
      section.classList.remove('sim--unpinned');
      var cs = getComputedStyle(stageEl);
      var avail = stageEl.clientHeight -
                  parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      pinned = inner.offsetHeight <= avail;
      section.classList.toggle('sim--unpinned', !pinned);
    }

    function render() {
      ticking = false;
      if (!pinned) return;

      var span = track.offsetHeight - stageEl.offsetHeight;
      var progress = span > 0 ? -track.getBoundingClientRect().top / span : 0;
      progress = Math.max(0, Math.min(1, progress));

      var p   = progress * (VARIANTS.length - 1);
      var seg = Math.min(Math.floor(p), VARIANTS.length - 2);
      paint(seg, staged(p - seg));
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    }
    function onResize() { checkFit(); onScroll(); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    /* Populate first — an empty stage would always look like it fits. */
    render();
    checkFit();
    render();

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  }

  /* --- act one: one indicator, one very large number --------------------- */

  var GHG = CATEGORY.dist.ghg;

  function initBigViz() {
    var num  = document.getElementById('bv-num');
    var fill = document.getElementById('bv-fill');
    var band = document.getElementById('bv-band');
    var med  = document.getElementById('bv-median');
    var name = document.getElementById('bv-name');
    var chip = document.getElementById('bv-chip');
    if (!num) return;

    var p25 = logPos(GHG.p25, GHG.median) * 100;
    var p75 = logPos(GHG.p75, GHG.median) * 100;
    band.style.left  = p25 + '%';
    band.style.width = (p75 - p25) + '%';
    med.style.left   = logPos(GHG.median, GHG.median) * 100 + '%';
    document.getElementById('bv-edge-lo').style.left = p25 + '%';
    document.getElementById('bv-edge-hi').style.left = p75 + '%';

    buildBigVizStatic();
    if (reduced) return;

    var shown = -1;
    var stageEl = document.getElementById('bigviz-stage');

    makeScrubber('bigviz', 'bigviz-track', 'bigviz-stage', '.bv-inner',
      function (seg, t) {
        var a = VARIANTS[seg], b = VARIANTS[seg + 1];
        var v = lerpLog(a.values.ghg, b.values.ghg, t);
        num.textContent = fmt(v);
        fill.style.width = logPos(v, GHG.median) * 100 + '%';
        paintChip(chip, v, GHG);

        stageEl.style.setProperty('--pc', hexLerp(a.color, b.color, t));
        stageEl.style.setProperty('--pi', hexLerp(a.ink, b.ink, t));

        var idx = t < 0.5 ? seg : seg + 1;
        if (idx !== shown) { shown = idx; name.textContent = VARIANTS[idx].name; }
        name.style.opacity = 1 - 0.8 * Math.sin(Math.PI * t);
      });
  }

  function buildBigVizStatic() {
    var wrap = document.getElementById('bv-static');
    if (!wrap) return;
    wrap.innerHTML = '';

    VARIANTS.forEach(function (variant) {
      var v = variant.values.ghg;
      var row = document.createElement('div');
      row.className = 'bvs-row';
      setProduct(row, variant);
      row.innerHTML =
        '<div class="bvs-top"><span class="bvs-name"></span>' +
        '<span><span class="bvs-val"></span>' +
        '<span class="bv-unit"> kg CO₂-eq/kg</span></span></div>' +
        '<div class="bv-scale"><div class="bv-band"></div>' +
        '<div class="bv-fill"></div><div class="bv-edge lo"></div>' +
        '<div class="bv-edge hi"></div><div class="bv-median"></div></div>' +
        '<div class="bv-ticks"><span>0.1× median</span><span>median</span>' +
        '<span>10×</span></div><span class="chip"></span>';

      row.querySelector('.bvs-name').textContent = variant.name;
      row.querySelector('.bvs-val').textContent = fmt(v);

      var p25 = logPos(GHG.p25, GHG.median) * 100;
      var p75 = logPos(GHG.p75, GHG.median) * 100;
      var b = row.querySelector('.bv-band');
      b.style.left = p25 + '%';
      b.style.width = (p75 - p25) + '%';
      row.querySelector('.bv-edge.lo').style.left = p25 + '%';
      row.querySelector('.bv-edge.hi').style.left = p75 + '%';
      row.querySelector('.bv-median').style.left = '50%';

      row.querySelector('.bv-fill').style.width =
        logPos(v, GHG.median) * 100 + '%';

      paintChip(row.querySelector('.chip'), v, GHG);
      wrap.appendChild(row);
    });
  }

  /* --- radar ------------------------------------------------------------- */

  var NS = 'http://www.w3.org/2000/svg';
  var CX = 210, CY = 185, R_MIN = 18, R_MAX = 128;

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function radiusFor(value, median) {
    return R_MIN + logPos(value, median) * (R_MAX - R_MIN);
  }

  function point(i, r) {
    var a = (-90 + i * (360 / INDICATORS.length)) * Math.PI / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }

  function polygonPoints(values) {
    return INDICATORS.map(function (ind, i) {
      var d = CATEGORY.dist[ind.key];
      return point(i, radiusFor(values[ind.key], d.median))
        .map(function (n) { return n.toFixed(1); }).join(',');
    }).join(' ');
  }

  function ringPoints(pick) {
    return INDICATORS.map(function (ind, i) {
      var d = CATEGORY.dist[ind.key];
      return point(i, radiusFor(pick(d), d.median))
        .map(function (n) { return n.toFixed(1); }).join(',');
    }).join(' ');
  }

  function buildRadar(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    INDICATORS.forEach(function (ind, i) {
      var outer = point(i, R_MAX);
      svg.appendChild(el('line', {
        x1: CX, y1: CY, x2: outer[0].toFixed(1), y2: outer[1].toFixed(1),
        stroke: '#22302b', 'stroke-width': 1
      }));
    });

    svg.appendChild(el('polygon', {
      points: INDICATORS.map(function (_, i) {
        return point(i, R_MAX).map(function (n) { return n.toFixed(1); }).join(',');
      }).join(' '),
      fill: 'none', stroke: '#22302b', 'stroke-width': 1
    }));

    /* band: p75 outline with the p25 outline punched out of it */
    svg.appendChild(el('path', {
      d: 'M' + ringPoints(function (d) { return d.p75; }).replace(/ /g, 'L') + 'Z' +
         'M' + ringPoints(function (d) { return d.p25; }).replace(/ /g, 'L') + 'Z',
      'fill-rule': 'evenodd', fill: '#47605a', 'fill-opacity': 0.30, stroke: 'none'
    }));

    svg.appendChild(el('polygon', {
      points: ringPoints(function (d) { return d.median; }),
      fill: 'none', stroke: '#47605a', 'stroke-width': 1, 'stroke-dasharray': '3 4'
    }));

    var fill = el('polygon', {
      points: polygonPoints(VARIANTS[0].values),
      'fill-opacity': 0.16, 'stroke-width': 2, 'stroke-linejoin': 'round'
    });
    svg.appendChild(fill);

    var dots = INDICATORS.map(function () {
      var c = el('circle', { r: 3 });
      svg.appendChild(c);
      return c;
    });

    INDICATORS.forEach(function (ind, i) {
      var p = point(i, R_MAX + 30);
      var lines = ind.axis.split('\n');
      var t = el('text', {
        x: p[0].toFixed(1), y: (p[1] - (lines.length - 1) * 6).toFixed(1),
        fill: '#6f9187', 'font-size': 11,
        'text-anchor': i === 0 ? 'middle' : (p[0] > CX + 4 ? 'start' :
                       p[0] < CX - 4 ? 'end' : 'middle'),
        'dominant-baseline': 'middle'
      });
      lines.forEach(function (line, k) {
        var ts = el('tspan', { x: p[0].toFixed(1), dy: k === 0 ? 0 : 12 });
        ts.textContent = line;
        t.appendChild(ts);
      });
      svg.appendChild(t);
    });

    return { fill: fill, dots: dots };
  }

  function paintRadar(radar, values, color) {
    radar.fill.setAttribute('points', polygonPoints(values));
    radar.fill.setAttribute('fill', color);
    radar.fill.setAttribute('stroke', color);
    INDICATORS.forEach(function (ind, i) {
      var d = CATEGORY.dist[ind.key];
      var p = point(i, radiusFor(values[ind.key], d.median));
      radar.dots[i].setAttribute('cx', p[0].toFixed(1));
      radar.dots[i].setAttribute('cy', p[1].toFixed(1));
      radar.dots[i].setAttribute('fill', color);
    });
  }

  /* --- readouts ---------------------------------------------------------- */

  function buildReadouts(ul) {
    ul.innerHTML = '';
    return INDICATORS.map(function (ind) {
      var li = document.createElement('li');
      li.innerHTML =
        '<div class="r-top">' +
          '<span class="r-name">' + ind.short + '</span>' +
          '<span><span class="r-val"></span>' +
          '<span class="r-unit">' + ind.unit + '</span></span>' +
        '</div>' +
        '<div class="r-bot"><span class="chip"></span>' +
        '<span class="r-ratio"></span></div>';
      ul.appendChild(li);
      return {
        key:   ind.key,
        val:   li.querySelector('.r-val'),
        chip:  li.querySelector('.chip'),
        ratio: li.querySelector('.r-ratio')
      };
    });
  }

  function paintReadouts(rows, values) {
    rows.forEach(function (row) {
      var d = CATEGORY.dist[row.key];
      var v = values[row.key];
      row.val.textContent = fmt(v);
      paintChip(row.chip, v, d);
      row.ratio.textContent = fmtRatio(v / d.median);
    });
  }

  /* --- materials --------------------------------------------------------- */

  function paintMaterials(ul, sumEl, variant) {
    ul.innerHTML = '';
    var sum = 0;
    variant.materials.forEach(function (m) {
      sum += m.pct;
      var li = document.createElement('li');
      li.innerHTML =
        '<span class="m-name"></span>' +
        '<span class="m-pct">' + m.pct + ' %</span>' +
        '<span class="m-bar"><i style="width:' + m.pct + '%"></i></span>';
      li.querySelector('.m-name').textContent = m.name;
      ul.appendChild(li);
    });
    if (sumEl) sumEl.textContent = sum;
  }

  /* --- act two: the full stage ------------------------------------------- */

  function initStage() {
    var svg = document.getElementById('radar');
    if (!svg) return;

    var radar  = buildRadar(svg);
    var rows   = buildReadouts(document.getElementById('readouts'));
    var matsEl = document.getElementById('materials');
    var sumEl  = document.getElementById('materials-sum');
    var nameEl = document.getElementById('variant-name');
    var noteEl = document.getElementById('variant-note');
    var dotsEl = document.getElementById('stage-dots');

    document.getElementById('cat-name').textContent = CATEGORY.name;

    VARIANTS.forEach(function () { dotsEl.appendChild(document.createElement('li')); });
    var dots = Array.prototype.slice.call(dotsEl.children);
    var shown = -1;

    var stageEl = document.getElementById('sim-stage');

    makeScrubber('sim', 'sim-track', 'sim-stage', '.stage-inner',
      function (seg, t) {
        var a = VARIANTS[seg], b = VARIANTS[seg + 1];
        var values = lerpValues(a.values, b.values, t);
        var color = hexLerp(a.color, b.color, t);

        stageEl.style.setProperty('--pc', color);
        stageEl.style.setProperty('--pi', hexLerp(a.ink, b.ink, t));

        paintRadar(radar, values, color);
        paintReadouts(rows, values);

        /* the material list cannot morph — it swaps, under a fade */
        var idx = t < 0.5 ? seg : seg + 1;
        if (idx !== shown) {
          shown = idx;
          paintMaterials(matsEl, sumEl, VARIANTS[idx]);
          nameEl.textContent = VARIANTS[idx].name;
          noteEl.textContent = VARIANTS[idx].note;
          dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
        }

        var dip = 1 - 0.8 * Math.sin(Math.PI * t);
        matsEl.style.opacity = dip;
        nameEl.style.opacity = dip;
        noteEl.style.opacity = dip;
      });
  }

  function initStatic() {
    var grid = document.getElementById('static-grid');
    if (!grid) return;
    grid.innerHTML = '';

    VARIANTS.forEach(function (variant) {
      var card = document.createElement('div');
      card.className = 'static-card';
      setProduct(card, variant);
      card.innerHTML =
        '<h3></h3><p class="sc-note"></p>' +
        '<h4 class="panel-title">Material composition</h4>' +
        '<ul class="materials"></ul>' +
        '<h4 class="panel-title">Estimated, per kilogram</h4>' +
        '<ul class="readouts"></ul>';
      card.querySelector('h3').textContent = variant.name;
      card.querySelector('.sc-note').textContent = variant.note;
      grid.appendChild(card);

      paintMaterials(card.querySelector('.materials'), null, variant);
      paintReadouts(buildReadouts(card.querySelector('.readouts')), variant.values);
    });
  }

  /* --- hero: a loop that plays itself ------------------------------------ */

  var HOLD = 2600, TWEEN = 1150;

  function initHeroLoop() {
    var comp = document.getElementById('hd-comp');
    var name = document.getElementById('hd-name');
    var val  = document.getElementById('hd-val');
    if (!comp) return;

    /* every build has the same number of materials, so the strip morphs
       rather than being rebuilt */
    var segs = VARIANTS[0].materials.map(function (_, i) {
      var s = document.createElement('i');
      s.style.opacity = (1 - i * 0.17).toFixed(2);
      comp.appendChild(s);
      return s;
    });

    var host = document.getElementById('hero-demo');
    var i = 0;

    function show(idx) {
      var v = VARIANTS[idx];
      v.materials.forEach(function (m, k) { segs[k].style.width = m.pct + '%'; });
      setProduct(host, v);
      name.textContent = v.name;
      val.textContent = fmt(v.values.ghg);
    }

    show(0);
    if (reduced) return;   /* one frame, no loop */

    var timer = null, raf = null;

    function tweenTo(next) {
      var from = VARIANTS[i].values.ghg, to = VARIANTS[next].values.ghg;
      var t0 = performance.now();
      cancelAnimationFrame(raf);
      (function step(now) {
        var k = Math.min(1, (now - t0) / TWEEN);
        val.textContent = fmt(lerpLog(from, to, smoothstep(k)));
        if (k < 1) raf = requestAnimationFrame(step);
      })(t0);
    }

    function advance() {
      var next = (i + 1) % VARIANTS.length;
      var v = VARIANTS[next];
      /* widths and colour ride CSS transitions; only the number needs a tween */
      v.materials.forEach(function (m, k) { segs[k].style.width = m.pct + '%'; });
      setProduct(host, v);
      name.textContent = v.name;
      tweenTo(next);
      i = next;
    }

    function play()  { if (!timer) timer = setInterval(advance, HOLD + TWEEN); }
    function pause() { clearInterval(timer); timer = null; cancelAnimationFrame(raf); }

    /* off-screen or backgrounded, it stops — a loop nobody can see is waste */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? play() : pause();
      }, { threshold: 0.15 }).observe(comp);
    } else {
      play();
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? pause() : play();
    });
  }

  /* --- hero headline ------------------------------------------------------ */

  /* Wraps each word so it can rise into place independently. Rebuilding the
     DOM here is safe only because the headline is static markup. */
  function splitHeadline() {
    var head = document.querySelector('[data-split]');
    if (!head || reduced) return;

    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span');
            w.className = 'w';
            var inner = document.createElement('i');
            inner.textContent = part;
            inner.style.setProperty('--i', n++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    })(head);
  }

  /* --- one indicator, stage by stage ------------------------------------- */

  /* Horizontal diverging bars on a shared zero baseline: stage D is negative,
     so polarity is carried by geometry. Each bar wears a whisker for that
     stage's own error range, and the build's own colour.

     The domain is FIXED across all three builds. An auto-scaled domain would
     keep A1–A3 at roughly the same length whichever build is showing, which
     hides the very thing the animation exists to show. Fixed, the bars really
     do explode when aluminium arrives. */

  /* Short hold, long tween: the chart is moving roughly two thirds of the time,
     so a reader arriving at any moment sees motion rather than a still frame. */
  var SC_HOLD = 850, SC_TWEEN = 1500, SC_KICK = 500, SC_RESUME = 4000;

  function scGeom(w) {
    var narrow = w < 520;
    return {
      w: w,
      rowH:   narrow ? 50 : 56,
      top:    16,
      labelW: narrow ? Math.min(64, w * 0.22) : 128,
      valueW: narrow ? 52 : 64,
      bar:    narrow ? 15 : 18,
      radius: 4,
      cap:    narrow ? 4 : 5,
      fCode:  narrow ? 12 : 13,
      fDesc:  narrow ? 10 : 11,
      fVal:   narrow ? 11 : 12,
      fAxis:  narrow ? 10 : 11,
      narrow: narrow
    };
  }

  function niceStep(span, target) {
    var raw = span / target;
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var n = raw / mag;
    return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * mag;
  }

  /* one-end-rounded bar: square where it meets the baseline */
  function barPath(x0, x1, y, h, r) {
    var dir = x1 >= x0 ? 1 : -1;
    var len = Math.abs(x1 - x0);
    r = Math.min(r, len / 2);
    if (len < 0.6) return '';
    var e = x0 + dir * (len - r);
    return 'M' + x0 + ',' + y + 'H' + e +
           'A' + r + ',' + r + ' 0 0 ' + (dir > 0 ? 1 : 0) + ' ' + e + ',' + (y + h) +
           'H' + x0 + 'Z';
  }

  function stageRows(variant) {
    return STAGES.map(function (s) {
      var v = variant.stages[s.key];
      /* a fold error is multiplicative, and stays so through a sign flip */
      var a = v / s.fold, b = v * s.fold;
      return { stage: s, v: v, lo: Math.min(a, b), hi: Math.max(a, b) };
    });
  }

  function initStageChart() {
    var fig = document.getElementById('stagechart');
    if (!fig) return;

    var svg      = document.getElementById('sc-svg');
    var totEl    = document.getElementById('sc-total');
    var totRange = document.getElementById('sc-total-range');
    var tbody    = document.querySelector('#sc-table tbody');
    var switcher = fig.querySelector('.sc-switch');

    /* one domain for every build, so lengths stay comparable */
    var all = VARIANTS.map(stageRows);
    var lo = 0, hi = 0;
    all.forEach(function (rows) {
      rows.forEach(function (r) {
        lo = Math.min(lo, r.lo);
        hi = Math.max(hi, r.hi);
      });
    });
    var pad = (hi - lo) * 0.06;
    lo -= pad; hi += pad;

    VARIANTS.forEach(function (v, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = v.name;
      setProduct(b, v);
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      /* Hovering a build takes the loop straight to it and holds; leaving hands
         control back. Clicking (or focusing by keyboard) is the sticky version,
         which is what touch and keyboard get. */
      b.addEventListener('pointerenter', function () { nudge(i); });
      b.addEventListener('pointerleave', release);
      b.addEventListener('focus', function () { nudge(i); });
      b.addEventListener('blur', release);
      b.addEventListener('click', function () { nudge(i); });
      switcher.appendChild(b);
    });
    var buttons = Array.prototype.slice.call(switcher.children);

    var parts = null;      /* the animated nodes, rebuilt only on resize */
    var geo   = null;
    var scale = null;

    function build() {
      geo = scGeom(Math.max(280, svg.parentNode.clientWidth));
      var height = geo.top + STAGES.length * geo.rowH + 34;
      svg.setAttribute('viewBox', '0 0 ' + geo.w + ' ' + height);
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      var x0 = geo.labelW, x1 = geo.w - geo.valueW - 14;
      scale = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };

      var axisY = geo.top + STAGES.length * geo.rowH + 6;
      var step = niceStep(hi - lo, geo.narrow ? 3 : 5);

      /* gridlines and labels never move: the domain is fixed */
      for (var t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) {
        var gx = scale(t);
        svg.appendChild(el('line', {
          x1: gx, y1: geo.top - 6, x2: gx, y2: axisY,
          stroke: '#22302b', 'stroke-width': 1
        }));
        var lab = el('text', {
          x: gx, y: axisY + 16, fill: '#6f9187', 'font-size': geo.fAxis,
          'text-anchor': 'middle'
        });
        lab.textContent = (Math.abs(t) < 1e-9 ? 0 : +t.toFixed(6)).toString();
        svg.appendChild(lab);
      }

      svg.appendChild(el('line', {
        x1: scale(0), y1: geo.top - 6, x2: scale(0), y2: axisY,
        stroke: '#9ab5ab', 'stroke-width': 1
      }));

      parts = STAGES.map(function (s, i) {
        var cy = geo.top + i * geo.rowH + geo.rowH / 2;

        var code = el('text', {
          x: geo.labelW - 16, y: geo.narrow ? cy + 4 : cy - 4, fill: '#e8f2ee',
          'font-size': geo.fCode, 'font-weight': 600, 'text-anchor': 'end'
        });
        code.textContent = s.label;
        svg.appendChild(code);

        if (!geo.narrow) {
          var desc = el('text', {
            x: geo.labelW - 16, y: cy + 12, fill: '#6f9187',
            'font-size': geo.fDesc, 'text-anchor': 'end'
          });
          desc.textContent = s.desc;
          svg.appendChild(desc);
        }

        var bar  = el('path', { 'fill-opacity': 0.92 });
        var line = el('line', {
          stroke: '#e8f2ee', 'stroke-width': 2, 'stroke-opacity': 0.8
        });
        var capA = el('line', {
          stroke: '#e8f2ee', 'stroke-width': 2, 'stroke-opacity': 0.8
        });
        var capB = el('line', {
          stroke: '#e8f2ee', 'stroke-width': 2, 'stroke-opacity': 0.8
        });
        /* values live in their own right-hand column, so they never collide
           with a bar end, a whisker cap or the row labels */
        var val = el('text', {
          x: geo.w - 4, y: cy + 4, fill: '#e8f2ee',
          'font-size': geo.fVal, 'text-anchor': 'end'
        });
        [bar, line, capA, capB, val].forEach(function (n) { svg.appendChild(n); });

        return { cy: cy, bar: bar, line: line, capA: capA, capB: capB, val: val };
      });
    }

    /* --- painting -------------------------------------------------------- */

    function paint(rows, color) {
      rows.forEach(function (r, i) {
        var p = parts[i];
        var y = p.cy - geo.bar / 2;
        p.bar.setAttribute('d', barPath(scale(0), scale(r.v), y, geo.bar, geo.radius));
        p.bar.setAttribute('fill', color);

        var wl = scale(r.lo), wh = scale(r.hi);
        p.line.setAttribute('x1', wl); p.line.setAttribute('x2', wh);
        p.line.setAttribute('y1', p.cy); p.line.setAttribute('y2', p.cy);
        [[p.capA, wl], [p.capB, wh]].forEach(function (pair) {
          pair[0].setAttribute('x1', pair[1]); pair[0].setAttribute('x2', pair[1]);
          pair[0].setAttribute('y1', p.cy - geo.cap);
          pair[0].setAttribute('y2', p.cy + geo.cap);
        });

        p.val.setAttribute('x', geo.w - 4);
        p.val.textContent = fmt(r.v);
      });
    }

    function paintTotal(v) {
      totEl.textContent = fmt(v);
      totRange.textContent =
        'kg CO₂-eq/kg · likely ' + fmt(v / TOTAL_FOLD) + ' to ' + fmt(v * TOTAL_FOLD);
    }

    function paintTable(vi) {
      var rows = all[vi], tv = VARIANTS[vi].values.ghg;
      tbody.innerHTML = '';
      rows.forEach(function (r) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + r.stage.label + ' · ' + r.stage.desc + '</td>' +
          '<td>' + fmt(r.v) + '</td>' +
          '<td>' + fmt(r.lo) + ' to ' + fmt(r.hi) + '</td>';
        tbody.appendChild(tr);
      });
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>Total</td><td>' + fmt(tv) + '</td><td>' +
        fmt(tv / TOTAL_FOLD) + ' to ' + fmt(tv * TOTAL_FOLD) + '</td>';
      tbody.appendChild(tr);
    }

    function settle(vi) {
      paint(all[vi], VARIANTS[vi].color);
      paintTotal(VARIANTS[vi].values.ghg);
      paintTable(vi);
      setProduct(fig, VARIANTS[vi]);
      buttons.forEach(function (b, i) {
        b.setAttribute('aria-pressed', i === vi ? 'true' : 'false');
      });
    }

    /* --- the loop -------------------------------------------------------- */

    var cur = 0, raf = null, timer = null, kick = null, resume = null;
    var visible = false;

    function transition(to) {
      var from = cur, t0 = performance.now();
      var A = all[from], B = all[to];
      var va = VARIANTS[from], vb = VARIANTS[to];

      buttons.forEach(function (b, i) {
        b.setAttribute('aria-pressed', i === to ? 'true' : 'false');
      });

      cancelAnimationFrame(raf);
      (function step(now) {
        var k = Math.min(1, (now - t0) / SC_TWEEN);
        var e = easeInOut(k);

        /* bars are on a linear axis, so they interpolate linearly; the total
           is strictly positive and jumps an order of magnitude, so it rides
           log space to keep an even visual rate */
        paint(A.map(function (r, i) {
          return {
            stage: r.stage,
            v:  r.v  + (B[i].v  - r.v)  * e,
            lo: r.lo + (B[i].lo - r.lo) * e,
            hi: r.hi + (B[i].hi - r.hi) * e
          };
        }), hexLerp(va.color, vb.color, e));

        paintTotal(lerpLog(va.values.ghg, vb.values.ghg, e));
        fig.style.setProperty('--pc', hexLerp(va.color, vb.color, e));
        fig.style.setProperty('--pi', hexLerp(va.ink, vb.ink, e));

        if (k < 1) { raf = requestAnimationFrame(step); }
        else { cur = to; paintTable(to); }
      })(t0);
    }

    function advance() { transition((cur + 1) % VARIANTS.length); }

    /* The loop is the default state. It never stops for good: every way of
       interrupting it schedules its own restart, so the chart cannot be found
       sitting still. */
    function play() {
      if (timer || kick || reduced || !visible || document.hidden) return;
      kick = setTimeout(function () {
        kick = null;
        advance();
        timer = setInterval(advance, SC_HOLD + SC_TWEEN);
      }, SC_KICK);
    }
    function pause() {
      clearTimeout(kick); kick = null;
      clearInterval(timer); timer = null;
    }

    /* Hovering, focusing or clicking a build takes the chart there and holds it
       for a few seconds, then the loop resumes on its own. */
    function nudge(vi) {
      pause();
      clearTimeout(resume);
      if (vi !== cur) transition(vi);
      resume = setTimeout(play, SC_RESUME);
    }
    function release() {
      clearTimeout(resume);
      resume = setTimeout(play, 700);
    }

    build();
    settle(0);

    /* off-screen or backgrounded, it stops */
    if (!reduced && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        visible ? play() : pause();
      }, { threshold: 0.1 }).observe(fig);
    } else if (!reduced) {
      visible = true;
      play();
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? pause() : play();
    });

    /* geometry is derived from the container, so it has to follow it */
    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { build(); settle(cur); }, 150);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { build(); settle(cur); });
    }
  }

  /* --- reveals ----------------------------------------------------------- */

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

  /* --- top bar ------------------------------------------------------------ */

  function initTopbar() {
    var bar = document.getElementById('topbar');
    if (!bar) return;
    /* timed to arrive while the hero mark is still on its way out, so the two
       read as one handover rather than two separate events */
    function check() {
      bar.classList.toggle('visible', window.scrollY > window.innerHeight * 0.45);
    }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* --- go ---------------------------------------------------------------- */

  function init() {
    splitHeadline();
    initHeroLoop();
    initStageChart();
    initReveals();
    initTopbar();

    /* Both pinned and unpinned layouts are populated; CSS picks which shows,
       so a window that becomes too short already has its fallback rendered. */
    initStatic();
    initBigViz();
    if (!reduced) initStage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
