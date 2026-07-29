/* ===========================================================================
   ILLUSTRATIVE DATA ONLY. Nothing below is a real declaration or output from
   the product. The manufacturer stays unnamed, and the document body text
   stays untranslated on purpose: a supplier's sheet arrives in whatever
   language it was written in. Field names, labels and captions are pairs like
   everywhere else.
   =========================================================================== */

/* the marks in extractor/index.html carry data-lane, matching these ids */
var LANES = [
  {
    id: 'lambda',
    field: { en: 'Thermal conductivity', ca: 'Conductivitat tèrmica',
             es: 'Conductividad térmica' },
    raw: 'declared thermal conductivity is 0,035 W/(m·K)',
    value: '0.035',
    unit: 'W/(m·K)',
    where: { en: 'Description, mid sentence', ca: 'Descripció, dins la frase',
             es: 'Descripción, dentro de la frase' }
  },
  {
    id: 'density',
    field: { en: 'Density', ca: 'Densitat', es: 'Densidad' },
    raw: 'nominal density is 40 kg/m³',
    value: '40',
    unit: 'kg/m³',
    where: { en: 'Description, mid sentence', ca: 'Descripció, dins la frase',
             es: 'Descripción, dentro de la frase' }
  },
  {
    id: 'fire',
    field: { en: 'Reaction to fire', ca: 'Reacció al foc',
             es: 'Reacción al fuego' },
    raw: 'A1',
    value: 'A1',
    unit: 'EN 13501-1',
    where: { en: 'Performance table', ca: 'Taula de prestacions',
             es: 'Tabla de prestaciones' }
  }
];

var COMP = {
  basis: { en: '% by mass', ca: '% en massa', es: '% en masa' },
  field: { en: 'Material composition', ca: 'Composició de materials',
           es: 'Composición de materiales' },
  where: { en: 'Composition table', ca: 'Taula de composició',
           es: 'Tabla de composición' },
  raw: '5 components, normalised',
  materials: [
    { id: 'basalt', name: { en: 'Basalt',             ca: 'Basalt',
                            es: 'Basalto' },                    share: 58.0 },
    { id: 'slag',   name: { en: 'Blast furnace slag', ca: 'Escòria d\'alt forn',
                            es: 'Escoria de alto horno' },      share: 28.0 },
    { id: 'lime',   name: { en: 'Limestone',          ca: 'Calcària',
                            es: 'Caliza' },                     share: 9.2 },
    { id: 'binder', name: { en: 'Phenolic binder',    ca: 'Lligant fenòlic',
                            es: 'Ligante fenólico' },           share: 4.3 },
    { id: 'oil',    name: { en: 'Mineral oil',        ca: 'Oli mineral',
                            es: 'Aceite mineral' },             share: 0.5 }
  ]
};

var LANE_MISSING = {
  field: { en: 'Compressive strength', ca: 'Resistència a compressió',
           es: 'Resistencia a compresión' },
  note: { en: 'Not stated in this document', ca: 'No consta en aquest document',
          es: 'No consta en este documento' }
};

/* `from` is the phrase that source used for the material, shown on every row */
var SOURCES = [
  {
    id: 'table',
    label: { en: 'A table, in percent by mass',
             ca: 'Una taula, en percentatge en massa',
             es: 'Una tabla, en porcentaje en masa' },
    note: { en: 'The easy one. Almost nobody sends this.',
            ca: 'La fàcil. Gairebé ningú no l\'envia.',
            es: 'La fácil. Casi nadie la envía.' },
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
             ca: 'Una frase, amb les xifres a dins',
             es: 'Una frase, con las cifras dentro' },
    note: { en: 'Nothing here is in a cell. Position tells you nothing.',
            ca: 'Aquí no hi ha cap cel·la. La posició no diu res.',
            es: 'Aquí no hay ninguna celda. La posición no dice nada.' },
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
             ca: 'Un altre idioma, un altre vocabulari',
             es: 'Otro idioma, otro vocabulario' },
    note: { en: 'Roca basáltica is basalt. Escoria siderúrgica is slag. Neither string matches anything.',
            ca: 'Roca basáltica és basalt. Escoria siderúrgica és escòria. Cap cadena no coincideix amb res.',
            es: 'Roca basáltica es basalto. Escoria siderúrgica es escoria de alto horno. Ninguna de las dos cadenas coincide con nada.' },
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
             ca: 'En massa per metre cúbic, no en percentatge',
             es: 'En masa por metro cúbico, no en porcentaje' },
    note: { en: 'A different basis entirely. It only becomes comparable once it is divided through.',
            ca: 'Una base completament diferent. Només es torna comparable un cop dividida.',
            es: 'Una base completamente distinta. Solo se vuelve comparable una vez dividida.' },
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

/* `lines` is what the sheet shows, `record` what that sheet alone contributes */
var DOCS = [
  {
    id: 'epd',
    kind: { en: 'Environmental declaration', ca: 'Declaració ambiental',
            es: 'Declaración ambiental' },
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
      { k: { en: 'Product-stage carbon', ca: 'Carboni d\'etapa de producte',
             es: 'Carbono de etapa de producto' },
        v: '1.88', u: 'kg CO₂-eq' },
      { k: { en: 'Valid until', ca: 'Vàlida fins', es: 'Válida hasta' },
        v: '2029-03-14', u: '' }
    ],
    gives: { en: 'The carbon, and the date it stops being true',
             ca: 'El carboni, i la data en què deixa de ser cert',
             es: 'El carbono, y la fecha en que deja de ser cierto' }
  },
  {
    id: 'dop',
    kind: { en: 'Declaration of performance', ca: 'Declaració de prestacions',
            es: 'Declaración de prestaciones' },
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
      { k: { en: 'Reaction to fire', ca: 'Reacció al foc',
             es: 'Reacción al fuego' }, v: 'A1', u: 'EN 13501-1' },
      { k: { en: 'Thermal conductivity', ca: 'Conductivitat tèrmica',
             es: 'Conductividad térmica' },
        v: '0.035', u: 'W/(m·K)' }
    ],
    gives: { en: 'What the maker will stand behind',
             ca: 'Allò de què el fabricant respon',
             es: 'Aquello de lo que el fabricante responde' }
  },
  {
    id: 'tech',
    kind: { en: 'Technical data sheet', ca: 'Fitxa tècnica',
            es: 'Ficha técnica' },
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
      { k: { en: 'Density', ca: 'Densitat', es: 'Densidad' }, v: '40', u: 'kg/m³' },
      { k: { en: 'Material composition', ca: 'Composició de materials',
             es: 'Composición de materiales' },
        v: '5', u: { en: 'materials', ca: 'materials', es: 'materiales' } }
    ],
    gives: { en: 'The physics, and what the thing is actually made of',
             ca: 'La física, i de què està fet realment',
             es: 'La física, y de qué está hecho realmente' }
  },
  {
    id: 'eol',
    kind: { en: 'End of life sheet', ca: 'Fitxa de final de vida',
            es: 'Ficha de final de vida' },
    ref: 'LER 17 06 04',
    lang: 'en',
    lines: [
      { t: 'Waste code', v: '17 06 04', hit: true },
      { t: 'Recovery', v: 'Remelt', hit: false },
      { t: 'Recycled content', v: '31 %', hit: true },
      { t: 'Take-back', v: 'On request', hit: false }
    ],
    record: [
      { k: { en: 'Waste code', ca: 'Codi de residu', es: 'Código de residuo' },
        v: '17 06 04', u: 'LER' },
      { k: { en: 'Recycled content', ca: 'Contingut reciclat',
             es: 'Contenido reciclado' }, v: '31', u: '%' }
    ],
    gives: { en: 'What becomes of it, which nobody else states',
             ca: 'Què se\'n fa, que ningú més no diu',
             es: 'Qué se hace con ello, que nadie más dice' }
  }
];

var SCHEMAS = [
  {
    id: 'thermal',
    name: { en: 'Thermal design', ca: 'Disseny tèrmic', es: 'Diseño térmico' },
    fields: [
      { n: { en: 'Thermal conductivity', ca: 'Conductivitat tèrmica',
             es: 'Conductividad térmica' },
        t: 'number', u: 'W/(m·K)',
        d: { en: 'The declared value λD, whatever it is called',
             ca: 'El valor declarat λD, es digui com es digui',
             es: 'El valor declarado λD, se llame como se llame' },
        v: '0.035' },
      { n: { en: 'Thickness', ca: 'Gruix', es: 'Espesor' },
        t: 'number', u: 'mm',
        d: { en: 'Nominal board thickness', ca: 'Gruix nominal de la placa',
             es: 'Espesor nominal de la placa' },
        v: '140' },
      { n: { en: 'Thermal resistance', ca: 'Resistència tèrmica',
             es: 'Resistencia térmica' },
        t: 'number', u: 'm²·K/W',
        d: { en: 'Declared, or worked out from the two above',
             ca: 'Declarada, o deduïda dels dos anteriors',
             es: 'Declarada, o deducida de los dos anteriores' },
        v: '4.00' },
      { n: { en: 'Reaction to fire', ca: 'Reacció al foc',
             es: 'Reacción al fuego' },
        t: 'class', u: 'EN 13501-1',
        d: { en: 'Euroclass, including any s and d suffix',
             ca: 'Euroclasse, amb els sufixos s i d si n\'hi ha',
             es: 'Euroclase, con los sufijos s y d si los hay' },
        v: 'A1' }
    ]
  },
  {
    id: 'composition',
    name: { en: 'Material composition', ca: 'Composició de materials',
            es: 'Composición de materiales' },
    fields: [
      { n: { en: 'Materials', ca: 'Materials', es: 'Materiales' },
        t: 'list', u: '',
        d: { en: 'One row per constituent, however the document groups them',
             ca: 'Una fila per constituent, els agrupi com els agrupi el document',
             es: 'Una fila por constituyente, los agrupe como los agrupe el documento' },
        v: '5' },
      { n: { en: 'Share', ca: 'Proporció', es: 'Proporción' },
        t: 'number', u: '%',
        d: { en: 'Per material, converted to mass share if it is stated any other way',
             ca: 'Per material, convertida a proporció en massa si ve d\'una altra manera',
             es: 'Por material, convertida a proporción en masa si viene de otra forma' },
        v: '58.0 … 0.5' },
      { n: { en: 'Basis', ca: 'Base', es: 'Base' },
        t: 'class', u: '',
        d: { en: 'Mass, volume or per declared unit. Getting this wrong ruins the row',
             ca: 'Massa, volum o per unitat declarada. Errar-la fa malbé la fila',
             es: 'Masa, volumen o por unidad declarada. Equivocarla estropea la fila' },
        v: 'mass' },
      { n: { en: 'Recycled content', ca: 'Contingut reciclat',
             es: 'Contenido reciclado' },
        t: 'number', u: '%',
        d: { en: 'Pre or post consumer, if the document distinguishes',
             ca: 'Pre o post consum, si el document ho distingeix',
             es: 'Pre o post consumo, si el documento lo distingue' },
        v: '31' }
    ]
  },
  {
    id: 'carbon',
    name: { en: 'Carbon accounting', ca: 'Comptabilitat de carboni',
            es: 'Contabilidad de carbono' },
    fields: [
      { n: { en: 'Declared unit', ca: 'Unitat declarada',
             es: 'Unidad declarada' },
        t: 'text', u: '',
        d: { en: 'What the numbers below are per',
             ca: 'A què es refereixen les xifres de sota',
             es: 'A qué se refieren las cifras de abajo' },
        v: '1 m²' },
      { n: { en: 'GWP-total A1–A3', ca: 'GWP-total A1–A3',
             es: 'GWP-total A1–A3' },
        t: 'number', u: 'kg CO₂-eq',
        d: { en: 'Product stage, total, not fossil only',
             ca: 'Etapa de producte, total, no només fòssil',
             es: 'Etapa de producto, total, no solo fósil' },
        v: '1.88' },
      { n: { en: 'GWP-total C3–C4', ca: 'GWP-total C3–C4',
             es: 'GWP-total C3–C4' },
        t: 'number', u: 'kg CO₂-eq',
        d: { en: 'Waste processing and disposal',
             ca: 'Tractament de residus i abocament',
             es: 'Tratamiento de residuos y vertido' },
        v: '0.18' },
      { n: { en: 'Valid until', ca: 'Vàlida fins', es: 'Válida hasta' },
        t: 'date', u: '',
        d: { en: 'The declaration expires; the row should know',
             ca: 'La declaració caduca; la fila ho ha de saber',
             es: 'La declaración caduca; la fila lo tiene que saber' },
        v: '2029-03-14' }
    ]
  }
];

/* the acronyms are plain strings on purpose: they are the same in every
   language, and audit() knows it */
var FAMILIES = {
  mw:  { en: 'Mineral wool', ca: 'Llana mineral',  es: 'Lana mineral'  },
  gw:  { en: 'Glass wool',   ca: 'Llana de vidre', es: 'Lana de vidrio' },
  pir: 'PIR',
  eps: 'EPS',
  xps: 'XPS'
};

var CATALOGUE = {
  total: 84,
  rows: [
    { ref: 'MW-030',  fam: FAMILIES.mw,  rho: 30, lam: 0.039, gwp: 1.42, fire: 'A1', valid: 2027 },
    { ref: 'MW-035',  fam: FAMILIES.mw,  rho: 35, lam: 0.037, gwp: 1.61, fire: 'A1', valid: 2029 },
    { ref: 'MW-040',  fam: FAMILIES.mw,  rho: 40, lam: 0.035, gwp: 1.88, fire: 'A1', valid: 2029 },
    { ref: 'MW-045',  fam: FAMILIES.mw,  rho: 45, lam: 0.035, gwp: 2.05, fire: 'A1', valid: 2028 },
    { ref: 'MW-050',  fam: FAMILIES.mw,  rho: 50, lam: 0.034, gwp: 2.31, fire: 'A1', valid: 2030 },
    { ref: 'MW-060',  fam: FAMILIES.mw,  rho: 60, lam: 0.034, gwp: 2.66, fire: 'A1', valid: 2027 },
    { ref: 'MW-070',  fam: FAMILIES.mw,  rho: 70, lam: 0.033, gwp: 3.12, fire: 'A1', valid: 2030 },
    { ref: 'MW-090',  fam: FAMILIES.mw,  rho: 90, lam: 0.034, gwp: 3.94, fire: 'A1', valid: 2029 },
    { ref: 'GW-018',  fam: FAMILIES.gw,  rho: 18, lam: 0.040, gwp: 1.05, fire: 'A2', valid: 2029 },
    { ref: 'GW-024',  fam: FAMILIES.gw,  rho: 24, lam: 0.038, gwp: 1.24, fire: 'A2', valid: 2026 },
    { ref: 'GW-032',  fam: FAMILIES.gw,  rho: 32, lam: 0.036, gwp: 1.47, fire: 'A2', valid: 2030 },
    { ref: 'PIR-032', fam: FAMILIES.pir, rho: 32, lam: 0.023, gwp: 4.60, fire: 'B',  valid: 2029 },
    { ref: 'EPS-020', fam: FAMILIES.eps, rho: 20, lam: 0.036, gwp: 2.94, fire: 'E',  valid: 2028 },
    { ref: 'XPS-033', fam: FAMILIES.xps, rho: 33, lam: 0.034, gwp: 5.12, fire: 'E',  valid: 2027 }
  ],
  /* `col` is the column a filter judges: it is what lets a failing cell say so */
  filters: [
    { id: 'fire', col: 'fire',
      label: { en: 'Reaction to fire A1', ca: 'Reacció al foc A1',
               es: 'Reacción al fuego A1' },
      test: function (r) { return r.fire === 'A1'; } },
    { id: 'lam', col: 'lam',
      label: { en: 'λD at or below 0,035', ca: 'λD igual o inferior a 0,035',
               es: 'λD igual o inferior a 0,035' },
      test: function (r) { return r.lam <= 0.035; } },
    { id: 'valid', col: 'valid',
      label: { en: 'Valid past 2028', ca: 'Vigent més enllà de 2028',
               es: 'Vigente más allá de 2028' },
      test: function (r) { return r.valid > 2028; } }
  ]
};
