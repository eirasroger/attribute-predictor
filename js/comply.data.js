/* ===========================================================================
   ILLUSTRATIVE DATA ONLY. Nothing here is output from the product. The nine
   mixes are written, not taken from any supplier, and every one of them
   satisfies its own declared exposure class: they are excluded by this
   project, never by being wrong.

   The instruments named in CODES are real and the limiting values in EXPOSURE
   are the durability limits a Spanish project works to. Change a limit and the
   verdicts in the desk change with it.
   =========================================================================== */

var CODES = {
  ce:  'Código Estructural · Anejo 18',
  en:  'EN 206 · Table F.1',
  cem: 'UNE-EN 197-1',
  sr:  'UNE 80303-1',
  mr:  'UNE 80303-2',
  spec: { en: 'Structural specification', ca: 'Plec d\'estructura',
          es: 'Pliego de estructura' },
  sheet: { en: 'Drawing 04-E-12', ca: 'Plànol 04-E-12', es: 'Plano 04-E-12' },
  geo: { en: 'Geotechnical report', ca: 'Informe geotècnic',
         es: 'Informe geotécnico' },
  site: { en: 'On site', ca: 'A obra', es: 'En obra' }
};

var PROJECT = {
  ref: 'EDAR-04',
  name: { en: 'Coastal pumping station',
          ca: 'Estació de bombament costanera',
          es: 'Estación de bombeo costera' },
  element: { en: 'Pile cap and stem wall',
             ca: 'Encepat i mur d\'arrencada',
             es: 'Encepado y muro de arranque' },
  where: { en: '380 m from the shoreline, tidal splash zone',
           ca: 'A 380 m de la línia de costa, zona de esquitxos de marea',
           es: 'A 380 m de la línea de costa, zona de salpicaduras de marea' },
  life: 50
};

/* the class → limits read in §4 and the only place a numeric limit is stored.
   `needs` is a cement resistance designation, not a value. */
var EXPOSURE = [
  { id: 'IIa',  eq: 'XC2', fck: 25, wc: 0.60, cem: 275, cover: 15, needs: [] },
  { id: 'IIb',  eq: 'XC4', fck: 30, wc: 0.55, cem: 300, cover: 25, needs: [] },
  { id: 'IIIa', eq: 'XS1', fck: 30, wc: 0.50, cem: 300, cover: 30, needs: ['MR'] },
  { id: 'IIIb', eq: 'XS2', fck: 30, wc: 0.50, cem: 325, cover: 35, needs: ['MR'] },
  { id: 'IIIc', eq: 'XS3', fck: 35, wc: 0.45, cem: 350, cover: 40, needs: ['MR'] },
  { id: 'Qb',   eq: 'XA2', fck: 30, wc: 0.50, cem: 350, cover: 40, needs: ['SR'] }
];

/* execution tolerance added to the code's minimum cover */
var COVER_MARGIN = 10;

/* `dir` drives the reconciliation: min takes the largest claim, max the
   smallest, set the union. `design` never reaches the catalogue. */
var REQS = [
  {
    id: 'fck', dir: 'min', unit: 'N/mm²', dp: 0,
    label: { en: 'Characteristic strength', ca: 'Resistència característica',
             es: 'Resistencia característica' },
    short: { en: 'fck', ca: 'fck', es: 'fck' }
  },
  {
    id: 'wc', dir: 'max', unit: '', dp: 2,
    label: { en: 'Water to cement ratio', ca: 'Relació aigua ciment',
             es: 'Relación agua cemento' },
    short: { en: 'a/c', ca: 'a/c', es: 'a/c' }
  },
  {
    id: 'cem', dir: 'min', unit: 'kg/m³', dp: 0,
    label: { en: 'Cement content', ca: 'Contingut de ciment',
             es: 'Contenido de cemento' },
    short: { en: 'Cement', ca: 'Ciment', es: 'Cemento' }
  },
  {
    id: 'res', dir: 'set', unit: '', dp: 0,
    label: { en: 'Cement resistance', ca: 'Resistència del ciment',
             es: 'Resistencia del cemento' },
    short: { en: 'Resistance', ca: 'Resistència', es: 'Resistencia' }
  },
  {
    id: 'dmax', dir: 'max', unit: 'mm', dp: 0,
    label: { en: 'Maximum aggregate size', ca: 'Mida màxima de l\'àrid',
             es: 'Tamaño máximo del árido' },
    short: { en: 'D max', ca: 'D màx', es: 'D máx' }
  },
  {
    id: 'cover', dir: 'min', unit: 'mm', dp: 0, design: true,
    label: { en: 'Nominal cover', ca: 'Recobriment nominal',
             es: 'Recubrimiento nominal' },
    short: { en: 'Cover', ca: 'Recobriment', es: 'Recubrimiento' }
  }
];

var ORIGINS = [
  {
    id: 'code',
    label: { en: 'The regulation', ca: 'La normativa', es: 'La normativa' },
    note: {
      en: 'Read once, by a person, into rules. No model touches this step.',
      ca: 'Llegida una vegada, per una persona, i convertida en regles. Cap ' +
          'model no toca aquest pas.',
      es: 'Leída una vez, por una persona, y convertida en reglas. Ningún ' +
          'modelo toca este paso.'
    }
  },
  {
    id: 'docs',
    label: { en: 'The project documents', ca: 'La documentació del projecte',
             es: 'La documentación del proyecto' },
    note: {
      en: 'Drawings, schedules and the specification, as issued.',
      ca: 'Plànols, quadres i plec, tal com s\'han emès.',
      es: 'Planos, cuadros y pliego, tal como se han emitido.'
    }
  },
  {
    id: 'op',
    label: { en: 'The person running it', ca: 'Qui el fa servir',
             es: 'Quien lo usa' },
    note: {
      en: 'What the drawings never said, and somebody on the job knows.',
      ca: 'El que els plànols no diuen mai, i algú de l\'obra sap.',
      es: 'Lo que los planos nunca dicen, y alguien de la obra sabe.'
    }
  }
];

/* claims made on the exposure class: expanded through EXPOSURE, never read as
   a value directly */
var CLASS_CLAIMS = [
  { origin: 'docs', cls: 'IIIa', via: CODES.spec }
];

/* claims made as a value */
var CLAIMS = [
  { origin: 'docs', req: 'fck',   v: 30,   via: CODES.sheet },
  { origin: 'docs', req: 'wc',    v: 0.50, via: CODES.spec },
  { origin: 'docs', req: 'cover', v: 45,   via: CODES.sheet }
];

/* the three switches. `why` is one line: the section carries the explanation by
   changing, not by saying. */
var EXTRAS = [
  {
    id: 'splash', cls: 'IIIc', via: CODES.site,
    label: { en: 'The tide reaches it',
             ca: 'La marea hi arriba',
             es: 'La marea le llega' },
    why: {
      en: 'Wetted and dried twice a day. The specification said marine air.',
      ca: 'S\'humiteja i s\'asseca dues vegades al dia. El plec deia aire marí.',
      es: 'Se humedece y se seca dos veces al día. El pliego decía aire marino.'
    }
  },
  {
    id: 'sulfate', cls: 'Qb', via: CODES.geo,
    label: { en: 'Sulfates in the groundwater',
             ca: 'Sulfats a l\'aigua subterrània',
             es: 'Sulfatos en el agua subterránea' },
    why: {
      en: '3 100 mg/kg, in the report and on no drawing.',
      ca: '3 100 mg/kg, a l\'informe i a cap plànol.',
      es: '3 100 mg/kg, en el informe y en ningún plano.'
    }
  },
  {
    id: 'congested', req: 'dmax', v: 20, via: CODES.site,
    label: { en: 'The bars are too close',
             ca: 'Les barres són massa juntes',
             es: 'Las barras están muy juntas' },
    why: {
      en: 'At 90 mm centres, 40 mm stone will not pass through them.',
      ca: 'A 90 mm entre eixos, la grava de 40 mm no hi passa.',
      es: 'A 90 mm entre ejes, la grava de 40 mm no pasa.'
    }
  }
];

/* every mix satisfies its own declared class: `cls` is what it was designed
   for, and the desk is the only thing that excludes it */
var MIXES = [
  { ref: 'HA-25/B/20/IIa',      cls: 'IIa',  fck: 25, wc: 0.60, cem: 275,
    dmax: 20, res: [],           cement: 'CEM II/A-L 42,5 R' },
  { ref: 'HA-30/B/20/IIIa',     cls: 'IIIa', fck: 30, wc: 0.50, cem: 305,
    dmax: 20, res: ['MR'],       cement: 'CEM II/A-S 42,5 N/MR' },
  { ref: 'HA-30/F/20/IIIb',     cls: 'IIIb', fck: 30, wc: 0.48, cem: 330,
    dmax: 20, res: ['SR', 'MR'], cement: 'CEM III/A 42,5 N/SR/MR' },
  { ref: 'HA-30/B/20/Qb',       cls: 'Qb',   fck: 30, wc: 0.50, cem: 350,
    dmax: 20, res: ['SR'],       cement: 'CEM I 42,5 N/SR' },
  { ref: 'HA-35/B/20/IIIc',     cls: 'IIIc', fck: 35, wc: 0.45, cem: 355,
    dmax: 20, res: ['SR', 'MR'], cement: 'CEM III/B 42,5 L/SR/MR' },
  { ref: 'HA-35/F/12/IIIc+Qb',  cls: 'IIIc', fck: 35, wc: 0.44, cem: 360,
    dmax: 12, res: ['SR', 'MR'], cement: 'CEM IV/B(V) 32,5 N/SR/MR' },
  { ref: 'HA-38/B/20/IIIc',     cls: 'IIIc', fck: 38, wc: 0.44, cem: 360,
    dmax: 20, res: ['MR'],       cement: 'CEM I 52,5 N/MR' },
  { ref: 'HA-40/B/40/IIIc',     cls: 'IIIc', fck: 40, wc: 0.42, cem: 370,
    dmax: 40, res: ['SR', 'MR'], cement: 'CEM III/B 42,5 L/SR/MR' },
  { ref: 'HA-45/B/20/IIIc',     cls: 'IIIc', fck: 45, wc: 0.40, cem: 385,
    dmax: 20, res: ['SR', 'MR'], cement: 'CEM III/A 42,5 N/SR/MR' }
];

/* the environment bands drawn on the section, back to front. `y` pairs are in
   the scene's own user units; js/comply.js owns the geometry they sit in. */
var BANDS = [
  { cls: 'IIIa', y: [84, 214],  always: true },
  { cls: 'IIIc', y: [214, 392], extra: 'splash' },
  { cls: 'Qb',   y: [392, 516], extra: 'sulfate' }
];
