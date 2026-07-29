/* ===========================================================================
   ILLUSTRATIVE DATA ONLY.

   Every document, value and figure below was written for this page. Nothing is
   a real declaration and nothing is output from the product. The manufacturer
   is deliberately unnamed, the same way the wordmark is the literal word
   Company. Standard numbers are real standards, cited so the illustrated
   documents look like the documents they imitate.

   Document body text is not translated. A supplier's sheet arrives in whatever
   language it was written in, and the set below is mixed on purpose. Field
   names, labels and captions are pairs like everywhere else.
   =========================================================================== */

/* The scalar fields the pipeline lifts off the sheet. The marks in
   extractor/index.html carry data-lane, matching the ids here. */
var LANES = [
  {
    id: 'lambda',
    field: { en: 'Thermal conductivity', ca: 'Conductivitat tèrmica' },
    raw: 'declared thermal conductivity is 0,035 W/(m·K)',
    value: '0.035',
    unit: 'W/(m·K)',
    where: { en: 'Description, mid sentence', ca: 'Descripció, dins la frase' }
  },
  {
    id: 'density',
    field: { en: 'Density', ca: 'Densitat' },
    raw: 'nominal density is 40 kg/m³',
    value: '40',
    unit: 'kg/m³',
    where: { en: 'Description, mid sentence', ca: 'Descripció, dins la frase' }
  },
  {
    id: 'fire',
    field: { en: 'Reaction to fire', ca: 'Reacció al foc' },
    raw: 'A1',
    value: 'A1',
    unit: 'EN 13501-1',
    where: { en: 'Performance table', ca: 'Taula de prestacions' }
  }
];

/* The composition lane is a different shape: one field, many rows, each with a
   name and a share. It is the reason a record is not a flat list of scalars. */
var COMP = {
  basis: { en: '% by mass', ca: '% en massa' },
  field: { en: 'Material composition', ca: 'Composició de materials' },
  where: { en: 'Composition table', ca: 'Taula de composició' },
  raw: '5 components, normalised',
  materials: [
    { id: 'basalt', name: { en: 'Basalt',             ca: 'Basalt' },            share: 58.0 },
    { id: 'slag',   name: { en: 'Blast furnace slag', ca: 'Escòria d\'alt forn' }, share: 28.0 },
    { id: 'lime',   name: { en: 'Limestone',          ca: 'Calcària' },          share: 9.2 },
    { id: 'binder', name: { en: 'Phenolic binder',    ca: 'Lligant fenòlic' },   share: 4.3 },
    { id: 'oil',    name: { en: 'Mineral oil',        ca: 'Oli mineral' },       share: 0.5 }
  ]
};

var LANE_MISSING = {
  field: { en: 'Compressive strength', ca: 'Resistència a compressió' },
  note: { en: 'Not stated in this document', ca: 'No consta en aquest document' }
};

/* Four ways the same composition is written down. `from` is the phrase each
   source actually used for that material, which is what the resolver had to
   get past. */
var SOURCES = [
  {
    id: 'table',
    label: { en: 'A table, in percent by mass', ca: 'Una taula, en percentatge en massa' },
    note: { en: 'The easy one. Almost nobody sends this.',
            ca: 'La fàcil. Gairebé ningú no l\'envia.' },
    lang: 'en',
    kind: 'table',
    head: ['Component', '% by mass'],
    rows: [
      ['Basalt', '58,0'],
      ['Blast furnace slag', '28,0'],
      ['Limestone', '9,2'],
      ['Phenolic binder', '4,3'],
      ['Mineral oil', '0,5']
    ],
    from: {
      basalt: 'Basalt · 58,0',
      slag: 'Blast furnace slag · 28,0',
      lime: 'Limestone · 9,2',
      binder: 'Phenolic binder · 4,3',
      oil: 'Mineral oil · 0,5'
    }
  },
  {
    id: 'prose',
    label: { en: 'A sentence, with the numbers inside it',
             ca: 'Una frase, amb les xifres a dins' },
    note: { en: 'Nothing here is in a cell. Position tells you nothing.',
            ca: 'Aquí no hi ha cap cel·la. La posició no diu res.' },
    lang: 'en',
    kind: 'prose',
    text: 'The board is spun from basaltic rock at 58 % of product mass and ' +
          'recycled blast furnace slag at 28 %, with limestone added as a flux ' +
          'at 9,2 %. A thermosetting phenolic binder accounts for a further ' +
          '4,3 %, and 0,5 % mineral oil suppresses dust in handling.',
    from: {
      basalt: 'basaltic rock at 58 % of product mass',
      slag: 'recycled blast furnace slag at 28 %',
      lime: 'limestone added as a flux at 9,2 %',
      binder: 'a thermosetting phenolic binder ... a further 4,3 %',
      oil: '0,5 % mineral oil'
    }
  },
  {
    id: 'lang',
    label: { en: 'Another language, another vocabulary',
             ca: 'Un altre idioma, un altre vocabulari' },
    note: { en: 'Roca basáltica is basalt. Escoria siderúrgica is slag. Neither string matches anything.',
            ca: 'Roca basáltica és basalt. Escoria siderúrgica és escòria. Cap cadena no coincideix amb res.' },
    lang: 'es',
    kind: 'prose',
    text: 'Composición declarada: roca basáltica 58 %, escoria siderúrgica ' +
          '28 %, caliza 9,2 %, resina fenólica termoendurecible 4,3 %, aceite ' +
          'mineral 0,5 %. Porcentajes referidos a la masa del producto.',
    from: {
      basalt: 'roca basáltica 58 %',
      slag: 'escoria siderúrgica 28 %',
      lime: 'caliza 9,2 %',
      binder: 'resina fenólica termoendurecible 4,3 %',
      oil: 'aceite mineral 0,5 %'
    }
  },
  {
    id: 'mass',
    label: { en: 'By mass per cubic metre, not percent',
             ca: 'En massa per metre cúbic, no en percentatge' },
    note: { en: 'A different basis entirely. It only becomes comparable once it is divided through.',
            ca: 'Una base completament diferent. Només es torna comparable un cop dividida.' },
    lang: 'en',
    kind: 'table',
    head: ['Constituent', 'kg per m³'],
    rows: [
      ['Basalt rock', '23,20'],
      ['Slag, granulated', '11,20'],
      ['Limestone filler', '3,68'],
      ['Binder, phenolic', '1,72'],
      ['Oil, mineral', '0,20']
    ],
    foot: 'Product density 40 kg/m³.',
    from: {
      basalt: '23,20 kg of 40 kg',
      slag: '11,20 kg of 40 kg',
      lime: '3,68 kg of 40 kg',
      binder: '1,72 kg of 40 kg',
      oil: '0,20 kg of 40 kg'
    }
  }
];

/* Same product, four documents. `lines` is what the sheet shows, `record` is
   what that sheet alone contributes to the merged row. */
var DOCS = [
  {
    id: 'epd',
    kind: { en: 'Environmental declaration', ca: 'Declaració ambiental' },
    ref: 'EN 15804+A2',
    lang: 'en',
    lines: [
      { t: 'Declared unit', v: '1 m²', hit: false },
      { t: 'GWP A1–A3', v: '1,88', hit: true },
      { t: 'GWP C3–C4', v: '0,18', hit: false },
      { t: 'Module D', v: '−0,09', hit: false },
      { t: 'Valid until', v: '2029-03-14', hit: true }
    ],
    record: [
      { k: { en: 'Product-stage carbon', ca: 'Carboni d\'etapa de producte' },
        v: '1.88', u: 'kg CO₂-eq' },
      { k: { en: 'Valid until', ca: 'Vàlida fins' }, v: '2029-03-14', u: '' }
    ],
    gives: { en: 'The carbon, and the date it stops being true',
             ca: 'El carboni, i la data en què deixa de ser cert' }
  },
  {
    id: 'dop',
    kind: { en: 'Declaration of performance', ca: 'Declaració de prestacions' },
    ref: 'CPR 305/2011',
    lang: 'ca',
    lines: [
      { t: 'Reacció al foc', v: 'A1', hit: true },
      { t: 'Conductivitat', v: 'λD = 0,035', hit: true },
      { t: 'Resistència tèrmica', v: 'RD = 4,00', hit: false },
      { t: 'Absorció d\'aigua', v: 'WS ≤ 1,0', hit: false },
      { t: 'Sistema AVCP', v: '1', hit: false }
    ],
    record: [
      { k: { en: 'Reaction to fire', ca: 'Reacció al foc' }, v: 'A1', u: 'EN 13501-1' },
      { k: { en: 'Thermal conductivity', ca: 'Conductivitat tèrmica' },
        v: '0.035', u: 'W/(m·K)' }
    ],
    gives: { en: 'What the maker will stand behind',
             ca: 'Allò de què el fabricant respon' }
  },
  {
    id: 'tech',
    kind: { en: 'Technical data sheet', ca: 'Fitxa tècnica' },
    ref: 'Rev. 04',
    lang: 'es',
    lines: [
      { t: 'Densidad nominal', v: '40 kg/m³', hit: true },
      { t: 'Espesor', v: '140 mm', hit: false },
      { t: 'Formato', v: '1200 × 600', hit: false },
      { t: 'Composición', v: '5 componentes', hit: true },
      { t: 'Factor de resistencia', v: 'μ = 1', hit: false }
    ],
    record: [
      { k: { en: 'Density', ca: 'Densitat' }, v: '40', u: 'kg/m³' },
      { k: { en: 'Material composition', ca: 'Composició de materials' },
        v: '5', u: { en: 'materials', ca: 'materials' } }
    ],
    gives: { en: 'The physics, and what the thing is actually made of',
             ca: 'La física, i de què està fet realment' }
  },
  {
    id: 'eol',
    kind: { en: 'End of life sheet', ca: 'Fitxa de final de vida' },
    ref: 'LER 17 06 04',
    lang: 'en',
    lines: [
      { t: 'Waste code', v: '17 06 04', hit: true },
      { t: 'Recovery', v: 'Remelt', hit: false },
      { t: 'Recycled content', v: '31 %', hit: true },
      { t: 'Take-back', v: 'On request', hit: false }
    ],
    record: [
      { k: { en: 'Waste code', ca: 'Codi de residu' }, v: '17 06 04', u: 'LER' },
      { k: { en: 'Recycled content', ca: 'Contingut reciclat' }, v: '31', u: '%' }
    ],
    gives: { en: 'What becomes of it, which nobody else states',
             ca: 'Què se\'n fa, que ningú més no diu' }
  }
];

/* Three schemas over the same pile of documents. */
var SCHEMAS = [
  {
    id: 'thermal',
    name: { en: 'Thermal design', ca: 'Disseny tèrmic' },
    fields: [
      { n: { en: 'Thermal conductivity', ca: 'Conductivitat tèrmica' },
        t: 'number', u: 'W/(m·K)',
        d: { en: 'The declared value λD, whatever it is called',
             ca: 'El valor declarat λD, es digui com es digui' },
        v: '0.035' },
      { n: { en: 'Thickness', ca: 'Gruix' },
        t: 'number', u: 'mm',
        d: { en: 'Nominal board thickness', ca: 'Gruix nominal de la placa' },
        v: '140' },
      { n: { en: 'Thermal resistance', ca: 'Resistència tèrmica' },
        t: 'number', u: 'm²·K/W',
        d: { en: 'Declared, or worked out from the two above',
             ca: 'Declarada, o deduïda dels dos anteriors' },
        v: '4.00' },
      { n: { en: 'Reaction to fire', ca: 'Reacció al foc' },
        t: 'class', u: 'EN 13501-1',
        d: { en: 'Euroclass, including any s and d suffix',
             ca: 'Euroclasse, amb els sufixos s i d si n\'hi ha' },
        v: 'A1' }
    ]
  },
  {
    id: 'composition',
    name: { en: 'Material composition', ca: 'Composició de materials' },
    fields: [
      { n: { en: 'Materials', ca: 'Materials' },
        t: 'list', u: '',
        d: { en: 'One row per constituent, however the document groups them',
             ca: 'Una fila per constituent, els agrupi com els agrupi el document' },
        v: '5' },
      { n: { en: 'Share', ca: 'Proporció' },
        t: 'number', u: '%',
        d: { en: 'Per material, converted to mass share if it is stated any other way',
             ca: 'Per material, convertida a proporció en massa si ve d\'una altra manera' },
        v: '58.0 … 0.5' },
      { n: { en: 'Basis', ca: 'Base' },
        t: 'class', u: '',
        d: { en: 'Mass, volume or per declared unit. Getting this wrong ruins the row',
             ca: 'Massa, volum o per unitat declarada. Errar-la fa malbé la fila' },
        v: 'mass' },
      { n: { en: 'Recycled content', ca: 'Contingut reciclat' },
        t: 'number', u: '%',
        d: { en: 'Pre or post consumer, if the document distinguishes',
             ca: 'Pre o post consum, si el document ho distingeix' },
        v: '31' }
    ]
  },
  {
    id: 'carbon',
    name: { en: 'Carbon accounting', ca: 'Comptabilitat de carboni' },
    fields: [
      { n: { en: 'Declared unit', ca: 'Unitat declarada' },
        t: 'text', u: '',
        d: { en: 'What the numbers below are per',
             ca: 'A què es refereixen les xifres de sota' },
        v: '1 m²' },
      { n: { en: 'GWP-total A1–A3', ca: 'GWP-total A1–A3' },
        t: 'number', u: 'kg CO₂-eq',
        d: { en: 'Product stage, total, not fossil only',
             ca: 'Etapa de producte, total, no només fòssil' },
        v: '1.88' },
      { n: { en: 'GWP-total C3–C4', ca: 'GWP-total C3–C4' },
        t: 'number', u: 'kg CO₂-eq',
        d: { en: 'Waste processing and disposal',
             ca: 'Tractament de residus i abocament' },
        v: '0.18' },
      { n: { en: 'Valid until', ca: 'Vàlida fins' },
        t: 'date', u: '',
        d: { en: 'The declaration expires; the row should know',
             ca: 'La declaració caduca; la fila ho ha de saber' },
        v: '2029-03-14' }
    ]
  }
];

/* The catalogue behind the closing section: what a folder becomes. */
var CATALOGUE = {
  total: 84,
  rows: [
    { ref: 'MW-030',  fam: 'Mineral wool', rho: 30,  lam: 0.039, gwp: 1.42, fire: 'A1', valid: 2027 },
    { ref: 'MW-035',  fam: 'Mineral wool', rho: 35,  lam: 0.037, gwp: 1.61, fire: 'A1', valid: 2029 },
    { ref: 'MW-040',  fam: 'Mineral wool', rho: 40,  lam: 0.035, gwp: 1.88, fire: 'A1', valid: 2029 },
    { ref: 'MW-045',  fam: 'Mineral wool', rho: 45,  lam: 0.035, gwp: 2.05, fire: 'A1', valid: 2028 },
    { ref: 'MW-050',  fam: 'Mineral wool', rho: 50,  lam: 0.034, gwp: 2.31, fire: 'A1', valid: 2030 },
    { ref: 'MW-060',  fam: 'Mineral wool', rho: 60,  lam: 0.034, gwp: 2.66, fire: 'A1', valid: 2027 },
    { ref: 'MW-070',  fam: 'Mineral wool', rho: 70,  lam: 0.033, gwp: 3.12, fire: 'A1', valid: 2030 },
    { ref: 'MW-090',  fam: 'Mineral wool', rho: 90,  lam: 0.034, gwp: 3.94, fire: 'A1', valid: 2029 },
    { ref: 'GW-018',  fam: 'Glass wool',   rho: 18,  lam: 0.040, gwp: 1.05, fire: 'A2', valid: 2029 },
    { ref: 'GW-024',  fam: 'Glass wool',   rho: 24,  lam: 0.038, gwp: 1.24, fire: 'A2', valid: 2026 },
    { ref: 'GW-032',  fam: 'Glass wool',   rho: 32,  lam: 0.036, gwp: 1.47, fire: 'A2', valid: 2030 },
    { ref: 'PIR-032', fam: 'PIR',          rho: 32,  lam: 0.023, gwp: 4.60, fire: 'B',  valid: 2029 },
    { ref: 'EPS-020', fam: 'EPS',          rho: 20,  lam: 0.036, gwp: 2.94, fire: 'E',  valid: 2028 },
    { ref: 'XPS-033', fam: 'XPS',          rho: 33,  lam: 0.034, gwp: 5.12, fire: 'E',  valid: 2027 }
  ],
  /* `col` is the column a filter judges: it is what lets a failing cell say so */
  filters: [
    { id: 'fire', col: 'fire',
      label: { en: 'Reaction to fire A1', ca: 'Reacció al foc A1' },
      test: function (r) { return r.fire === 'A1'; } },
    { id: 'lam', col: 'lam',
      label: { en: 'λD at or below 0,035', ca: 'λD igual o inferior a 0,035' },
      test: function (r) { return r.lam <= 0.035; } },
    { id: 'valid', col: 'valid',
      label: { en: 'Valid past 2028', ca: 'Vigent més enllà de 2028' },
      test: function (r) { return r.valid > 2028; } }
  ]
};
