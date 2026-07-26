/* ---------------------------------------------------------------------------
   ILLUSTRATIVE DATA — NOT MODEL OUTPUT.
   Representative figures for an interface demonstration. The real models are
   ~13 MB of PyTorch checkpoints and do not run in a browser. Nothing in this
   file is a prediction; do not present it as one.
   --------------------------------------------------------------------------- */

const INDICATORS = [
  { key: 'ghg',  short: 'Greenhouse gas emissions',
    axis: 'Greenhouse\ngas',        unit: 'kg CO₂-eq/kg' },
  { key: 'fw',   short: 'Water depletion potential',
    axis: 'Water\ndepletion',       unit: 'm³/kg' },
  { key: 'ep',   short: 'Eutrophication potential',
    axis: 'Eutrophi-\ncation',      unit: 'kg PO₄-eq/kg' },
  { key: 'ap',   short: 'Acidification potential',
    axis: 'Acidifi-\ncation',       unit: 'kg SO₂-eq/kg' },
  { key: 'adpf', short: 'Abiotic depletion, fossil',
    axis: 'Abiotic\ndepletion',     unit: 'MJ/kg' }
];

/* The category distribution every result is read against. Median plus the
   p25–p75 band of real products in the same category. */
const CATEGORY = {
  name: 'Indoor partition',
  n: 214,
  dist: {
    ghg:  { p25: 0.48,    median: 0.95,    p75: 2.1 },
    fw:   { p25: 0.010,   median: 0.021,   p75: 0.052 },
    ep:   { p25: 0.00040, median: 0.00075, p75: 0.0016 },
    ap:   { p25: 0.0024,  median: 0.0048,  p75: 0.011 },
    adpf: { p25: 6.0,     median: 12.0,    p75: 27.0 }
  }
};

/* Three builds of the same partition — same job, same category, same
   functional unit, only the composition changes.

   Each build owns a colour for the whole page: `color` is the mark, `ink` the
   AA-contrast tint for text. Validated with docs/cvd.py (worst CVD ΔE 10.9);
   re-run it before changing any of them. */
const VARIANTS = [
  {
    id: 'timber',
    name: 'Timber frame',
    color: '#3ecf8e', ink: '#3ecf8e',
    note: 'Softwood studs, wood fibre board, cellulose fill.',
    materials: [
      { name: 'Softwood timber',      pct: 46 },
      { name: 'Wood fibre board',     pct: 28 },
      { name: 'Cellulose insulation', pct: 18 },
      { name: 'Water-based adhesive', pct: 5  },
      { name: 'Steel fasteners',      pct: 3  }
    ],
    values: { ghg: 0.31, fw: 0.018, ep: 0.0024, ap: 0.0032, adpf: 4.1 },
    stages: { a1a3: 0.58, c3: 0.03, c4: 0.02, d: -0.32 }
  },
  {
    id: 'gypsum',
    name: 'Gypsum plasterboard',
    color: '#c98f35', ink: '#dda94f',
    note: 'Boarded steel stud, mineral wool cavity.',
    materials: [
      { name: 'Gypsum plasterboard',   pct: 62 },
      { name: 'Steel stud framing',    pct: 21 },
      { name: 'Mineral wool',          pct: 12 },
      { name: 'Paper facing',          pct: 4  },
      { name: 'Steel screws',          pct: 1  }
    ],
    values: { ghg: 0.74, fw: 0.0072, ep: 0.00065, ap: 0.0056, adpf: 14.5 },
    stages: { a1a3: 0.92, c3: 0.03, c4: 0.05, d: -0.26 }
  },
  {
    id: 'aluminium',
    name: 'Aluminium-framed glazed',
    color: '#5b8dd9', ink: '#79a6e4',
    note: 'Extruded profile, float glass, thermal break.',
    materials: [
      { name: 'Float glass',            pct: 44 },
      { name: 'Aluminium profile',      pct: 38 },
      { name: 'EPDM gasket',            pct: 8  },
      { name: 'Polyamide thermal break', pct: 6 },
      { name: 'Steel fixings',          pct: 4  }
    ],
    values: { ghg: 3.40, fw: 0.082, ep: 0.0011, ap: 0.019, adpf: 44 },
    stages: { a1a3: 4.55, c3: 0.05, c4: 0.04, d: -1.24 }
  }
];

/* Decides when a verdict can be stated plainly and when it has to soften. */
const FOLD_ERROR = 1.35;

/* Each stage is its own model with its own fold error. Not additive — the
   total is predicted separately. */
const STAGES = [
  { key: 'a1a3', label: 'A1–A3', desc: 'Product stage',    fold: 1.18 },
  { key: 'c3',   label: 'C3',    desc: 'Waste processing', fold: 1.62 },
  { key: 'c4',   label: 'C4',    desc: 'Disposal',         fold: 1.90 },
  { key: 'd',    label: 'D',     desc: 'Avoided burden',   fold: 2.35 }
];

const TOTAL_FOLD = 1.24;
