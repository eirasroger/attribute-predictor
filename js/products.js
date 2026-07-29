/* ---------------------------------------------------------------------------
   The catalogue. Names are placeholders. `slug` is the URL segment.
   Tints live in css/base.css under [data-tint]; re-run docs/cvd.py before changing.
   --------------------------------------------------------------------------- */
var PRODUCTS = [
  {
    id: 'extractor',
    slug: 'extractor',
    name: 'Field Extractor',
    tagline: {
      en: 'Turns documents into structured data.',
      ca: 'Converteix documents en dades estructurades.'
    },
    body: {
      en: 'Reads technical documents and returns fields you can query, ' +
          'compare and analyse. Language models do the reading. The ' +
          'structure stays yours to define.',
      ca: 'Llegeix documents tècnics i retorna camps que pots consultar, ' +
          'comparar i analitzar. Els models de llenguatge fan la lectura. ' +
          'L\'estructura la defineixes tu.'
    },
    ready: true
  },
  {
    id: 'predictor',
    slug: 'predictor',
    name: 'Attribute Predictor',
    tagline: {
      en: 'Estimates environmental performance from material composition.',
      ca: 'Estima el comportament ambiental a partir de la composició de ' +
          'materials.'
    },
    body: {
      en: 'Give it a material composition. It estimates how a construction ' +
          'product is likely to perform environmentally, and tells you how ' +
          'far to trust the number.',
      ca: 'Dona-li una composició de materials. Estima com és probable que ' +
          'es comporti ambientalment un producte de construcció, i et diu ' +
          'fins a quin punt pots confiar en la xifra.'
    },
    ready: true
  },
  {
    id: 'circularity',
    slug: 'circularity',
    name: 'Circularity Forecaster',
    tagline: {
      en: 'Forecasts end-of-life circularity from material composition.',
      ca: 'Preveu la circularitat al final de vida a partir de la composició ' +
          'de materials.'
    },
    body: {
      en: 'Estimates what becomes of a product once it leaves the building: ' +
          'what can be recovered, what is lost, and how much of that was ' +
          'decided the day it was assembled.',
      ca: 'Estima què passa amb un producte quan surt de l\'edifici: què es ' +
          'pot recuperar, què es perd, i quina part d\'això es va decidir el ' +
          'dia que es va muntar.'
    },
    ready: false
  },
  {
    id: 'compliance',
    slug: 'compliance',
    name: 'Compliance Filter',
    tagline: {
      en: 'Narrows a catalogue to what the project actually allows.',
      ca: 'Redueix un catàleg al que el projecte realment permet.'
    },
    body: {
      en: 'Filters products against regulatory requirements and project ' +
          'constraints, with a person in the loop at every decision that ' +
          'needs judgement.',
      ca: 'Filtra productes segons requisits normatius i restriccions de ' +
          'projecte, amb una persona decidint cada punt que demana criteri.'
    },
    ready: false
  },
  {
    id: 'recommender',
    slug: 'recommender',
    name: 'Decision Engine',
    tagline: {
      en: 'Automates the trade-off between cost, performance, impact and ' +
          'circularity.',
      ca: 'Automatitza el compromís entre cost, prestacions, impacte i ' +
          'circularitat.'
    },
    body: {
      en: 'Complex product choices come down to four things pulling against ' +
          'each other: what it costs, how it performs, what it does to the ' +
          'environment, and what becomes of it afterwards. An adaptive model ' +
          'weighs all four, learns how a project settles those trade-offs, ' +
          'and makes the call.',
      ca: 'Les decisions complexes de producte es redueixen a quatre coses ' +
          'que estiren en direccions oposades: què costa, com es comporta, ' +
          'què fa a l\'entorn, i què se\'n fa després. Un model adaptatiu ' +
          'pondera les quatre, aprèn com un projecte resol aquests ' +
          'compromisos, i pren la decisió.'
    },
    ready: false
  }
];
