/* ---------------------------------------------------------------------------
   ILLUSTRATIVE DATA — NOT MODEL OUTPUT.
   Representative figures for an interface demonstration. The real models are
   ~13 MB of PyTorch checkpoints and do not run in a browser. Nothing in this
   file is a prediction; do not present it as one.
   --------------------------------------------------------------------------- */

/* User-facing strings are { en, ca, es } triples; units are not, SI is SI.
   Axis labels are drawn into a fixed radar — keep them to two short lines. */
const INDICATORS = [
  { key: 'ghg',
    short: { en: 'Greenhouse gas emissions',   ca: 'Emissions de GEH',
             es: 'Emisiones de GEI' },
    axis:  { en: 'Greenhouse\ngas',            ca: 'Gasos\nd\'hivernacle',
             es: 'Efecto\ninvernadero' },
    unit: 'kg CO₂-eq/kg' },
  { key: 'fw',
    short: { en: 'Water depletion potential',  ca: 'Potencial d\'esgotament d\'aigua',
             es: 'Potencial de agotamiento de agua' },
    axis:  { en: 'Water\ndepletion',           ca: 'Esgotament\nd\'aigua',
             es: 'Agotamiento\nde agua' },
    unit: 'm³/kg' },
  { key: 'ep',
    short: { en: 'Eutrophication potential',   ca: 'Potencial d\'eutrofització',
             es: 'Potencial de eutrofización' },
    axis:  { en: 'Eutrophi-\ncation',          ca: 'Eutrofit-\nzació',
             es: 'Eutrofi-\nzación' },
    unit: 'kg PO₄-eq/kg' },
  { key: 'ap',
    short: { en: 'Acidification potential',    ca: 'Potencial d\'acidificació',
             es: 'Potencial de acidificación' },
    axis:  { en: 'Acidifi-\ncation',           ca: 'Acidifi-\ncació',
             es: 'Acidifi-\ncación' },
    unit: 'kg SO₂-eq/kg' },
  { key: 'adpf',
    short: { en: 'Abiotic depletion, fossil',  ca: 'Esgotament abiòtic, fòssil',
             es: 'Agotamiento abiótico, fósil' },
    axis:  { en: 'Abiotic\ndepletion',         ca: 'Esgotament\nabiòtic',
             es: 'Agotamiento\nabiótico' },
    unit: 'MJ/kg' }
];

/* The category distribution every result is read against. Median plus the
   p25–p75 band of real products in the same category. */
const CATEGORY = {
  name: { en: 'Indoor partition', ca: 'Envà interior', es: 'Tabique interior' },
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
    name: { en: 'Timber frame', ca: 'Estructura de fusta',
            es: 'Estructura de madera' },
    color: '#3ecf8e', ink: '#3ecf8e',
    note: { en: 'Softwood studs, wood fibre board, cellulose fill.',
            ca: 'Muntants de fusta tova, tauler de fibra de fusta, reblert de cel·lulosa.',
            es: 'Montantes de madera blanda, tablero de fibra de madera, relleno de celulosa.' },
    materials: [
      { name: { en: 'Softwood timber',      ca: 'Fusta tova',
                es: 'Madera blanda' },                                          pct: 46 },
      { name: { en: 'Wood fibre board',     ca: 'Tauler de fibra de fusta',
                es: 'Tablero de fibra de madera' },                             pct: 28 },
      { name: { en: 'Cellulose insulation', ca: 'Aïllament de cel·lulosa',
                es: 'Aislamiento de celulosa' },                                pct: 18 },
      { name: { en: 'Water-based adhesive', ca: 'Adhesiu de base aquosa',
                es: 'Adhesivo de base acuosa' },                                pct: 5  },
      { name: { en: 'Steel fasteners',      ca: 'Fixacions d\'acer',
                es: 'Fijaciones de acero' },                                    pct: 3  }
    ],
    values: { ghg: 0.31, fw: 0.018, ep: 0.0024, ap: 0.0032, adpf: 4.1 },
    stages: { a1a3: 0.58, c3: 0.03, c4: 0.02, d: -0.32 }
  },
  {
    id: 'gypsum',
    name: { en: 'Gypsum plasterboard', ca: 'Cartró guix',
            es: 'Yeso laminado' },
    color: '#c98f35', ink: '#dda94f',
    note: { en: 'Boarded steel stud, mineral wool cavity.',
            ca: 'Muntants d\'acer amb plaques, cambra amb llana mineral.',
            es: 'Montantes de acero con placas, cámara con lana mineral.' },
    materials: [
      { name: { en: 'Gypsum plasterboard', ca: 'Placa de cartró guix',
                es: 'Placa de yeso laminado' },                                 pct: 62 },
      { name: { en: 'Steel stud framing',  ca: 'Estructura de muntants d\'acer',
                es: 'Estructura de montantes de acero' },                       pct: 21 },
      { name: { en: 'Mineral wool',        ca: 'Llana mineral',
                es: 'Lana mineral' },                                           pct: 12 },
      { name: { en: 'Paper facing',        ca: 'Revestiment de paper',
                es: 'Revestimiento de papel' },                                 pct: 4  },
      { name: { en: 'Steel screws',        ca: 'Cargols d\'acer',
                es: 'Tornillos de acero' },                                     pct: 1  }
    ],
    values: { ghg: 0.74, fw: 0.0072, ep: 0.00065, ap: 0.0056, adpf: 14.5 },
    stages: { a1a3: 0.92, c3: 0.03, c4: 0.05, d: -0.26 }
  },
  {
    id: 'aluminium',
    name: { en: 'Aluminium-framed glazed', ca: 'Vidre amb marc d\'alumini',
            es: 'Vidrio con marco de aluminio' },
    color: '#5b8dd9', ink: '#79a6e4',
    note: { en: 'Extruded profile, float glass, thermal break.',
            ca: 'Perfil extrudit, vidre float, trencament de pont tèrmic.',
            es: 'Perfil extruido, vidrio float, rotura de puente térmico.' },
    materials: [
      { name: { en: 'Float glass',       ca: 'Vidre float',
                es: 'Vidrio float' },                                pct: 44 },
      { name: { en: 'Aluminium profile', ca: 'Perfil d\'alumini',
                es: 'Perfil de aluminio' },                          pct: 38 },
      { name: { en: 'EPDM gasket',       ca: 'Junta d\'EPDM',
                es: 'Junta de EPDM' },                               pct: 8  },
      { name: { en: 'Polyamide thermal break',
                ca: 'Trencament tèrmic de poliamida',
                es: 'Rotura térmica de poliamida' },                 pct: 6  },
      { name: { en: 'Steel fixings',     ca: 'Fixacions d\'acer',
                es: 'Fijaciones de acero' },                         pct: 4  }
    ],
    values: { ghg: 3.40, fw: 0.082, ep: 0.0011, ap: 0.019, adpf: 44 },
    stages: { a1a3: 4.55, c3: 0.05, c4: 0.04, d: -1.24 }
  }
];

/* Decides when a verdict can be stated plainly and when it has to soften. */
const FOLD_ERROR = 1.35;

/* Each stage is its own model with its own fold error. Not additive — the
   total is predicted separately. `label` is the EN 15804 module code. */
const STAGES = [
  { key: 'a1a3', label: 'A1–A3', fold: 1.18,
    desc: { en: 'Product stage',    ca: 'Etapa de producte',
            es: 'Etapa de producto'      } },
  { key: 'c3',   label: 'C3',    fold: 1.62,
    desc: { en: 'Waste processing', ca: 'Tractament de residus',
            es: 'Tratamiento de residuos' } },
  { key: 'c4',   label: 'C4',    fold: 1.90,
    desc: { en: 'Disposal',         ca: 'Disposició final',
            es: 'Disposición final'      } },
  { key: 'd',    label: 'D',     fold: 2.35,
    desc: { en: 'Avoided burden',   ca: 'Càrregues evitades',
            es: 'Cargas evitadas'        } }
];

const TOTAL_FOLD = 1.24;
