/* `slug` is the URL segment. Every name here is a placeholder. Tints live in
   css/base.css under [data-tint]; re-run docs/cvd.py before changing one. */
var PRODUCTS = [
  {
    id: 'extractor',
    slug: 'extractor',
    name: 'Field Extractor',
    tagline: {
      en: 'Turns documents into structured data.',
      ca: 'Converteix documents en dades estructurades.',
      es: 'Convierte documentos en datos estructurados.'
    },
    body: {
      en: 'Reads technical documents and returns fields you can query, ' +
          'compare and analyse. Language models do the reading. The ' +
          'structure stays yours to define.',
      ca: 'Llegeix documents tècnics i retorna camps que pots consultar, ' +
          'comparar i analitzar. Els models de llenguatge fan la lectura. ' +
          'L\'estructura la defineixes tu.',
      es: 'Lee documentos técnicos y devuelve campos que puedes consultar, ' +
          'comparar y analizar. Los modelos de lenguaje hacen la lectura. ' +
          'La estructura la defines tú.'
    },
    ready: true
  },
  {
    id: 'predictor',
    slug: 'predictor',
    name: 'Attribute Predictor',
    tagline: {
      en: 'Estimates environmental performance from material composition.',
      ca: 'Estima el comportament ambiental d\'un producte a partir de la seva composició de ' +
          'materials.',
      es: 'Estima el comportamiento ambiental de un producto a partir de su composición de ' +
          'materiales.'
    },
    body: {
      en: 'Give it a material composition. It estimates how a construction ' +
          'product is likely to perform environmentally, and tells you how ' +
          'far to trust the number.',
      ca: 'Dona-li una composició de materials. Estima com de probable és que ' +
          'es comporti ambientalment un producte de construcció, i et diu ' +
          'fins a quin punt pots confiar en la xifra.',
      es: 'Dale una composición de materiales. Estima cómo es probable que ' +
          'se comporte ambientalmente un producto de construcción, y te dice ' +
          'hasta qué punto puedes fiarte de la cifra.'
    },
    ready: true
  },
  {
    id: 'circularity',
    slug: 'circularity',
    name: 'Circularity Forecaster',
    tagline: {
      en: 'Forecasts end-of-life circularity from material composition.',
      ca: 'Preveu la circularitat al final de vida d\'un producte a partir de la composició ' +
          'de materials.',
      es: 'Prevé la circularidad al final de vida de un producto a partir de la composición ' +
          'de materiales.'
    },
    body: {
        en: 'Assesses end-of-life performance by estimating material recovery potential ' +
        'and waste fractions derived from product characteristics.',

        ca: 'Avalua el rendiment al final de vida estimant el potencial de recuperació de materials ' +
        'i les fraccions de residus derivades de les característiques del producte.',

        es: 'Evalúa el rendimiento al final de vida estimando el potencial de recuperación de materiales ' +
        'y las fracciones de residuos derivadas de las características del producto.',
          },
    ready: true
  },
  {
    id: 'compliance',
    slug: 'compliance',
    name: 'Compliance Filter',
    tagline: {
      en: 'Narrows a catalogue to what the project actually allows.',
      ca: 'Redueix un catàleg de productes al que el projecte realment permet.',
      es: 'Reduce un catálogo de productos a lo que el proyecto realmente permite.'
    },
    body: {
      en: 'Filters products against regulatory requirements and project ' +
          'constraints, with a person in the loop at every decision that ' +
          'needs judgement.',
      ca: 'Filtra productes segons requisits normatius i restriccions de ' +
          'projecte, amb una persona decidint cada punt que requereix d\'un criteri especialitzat.',
      es: 'Filtra productos según requisitos normativos y condicionantes de ' +
          'proyecto, con una persona decidiendo cada punto que requiere de un criterio especializado.'
    },
    ready: true
  },
  {
    id: 'recommender',
    slug: 'recommender',
    name: 'Decision Engine',
    tagline: {
      en: 'Automates the trade-off between cost, performance, impact and ' +
          'circularity.',
      ca: 'Automatitza el compromís entre cost, prestacions, impacte i ' +
          'circularitat.',
      es: 'Automatiza el equilibrio entre coste, prestaciones, impacto y ' +
          'circularidad.'
    },
    body: {
      en: 'Complex product choices are shaped by stakeholder requirements and project context, ' +
      'then evaluated along cost, performance, environmental impact, and end-of-life outcomes. ' +
      'An adaptive model learns how a project balances these criteria under its constraints ' +
      'and reproduces that decision logic.',

      ca: 'La selecció complexa de productes està condicionada pels requisits de les parts interessades ' +
      'i pel context del projecte, i després s\'avalua segons cost, rendiment, impacte ambiental ' +
      'i resultats al final de vida. Un model adaptatiu aprèn com un projecte equilibra aquests ' +
      'criteris dins de les seves restriccions i reprodueix aquesta lògica de decisió.',

      es: 'La selección compleja de productos está condicionada por los requisitos de las partes interesadas ' +
      'y por el contexto del proyecto, y luego se evalúa según coste, rendimiento, impacto ambiental ' +
      'y resultados al final de vida. Un modelo adaptativo aprende cómo un proyecto equilibra esos ' +
      'criterios dentro de sus restricciones y reproduce esa lógica de decisión.',
    },
    ready: false
  }
];
