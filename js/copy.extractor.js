/* an unescaped apostrophe here fails the parse silently and ships English */
I18N.add({

  'meta.title': {
    en: 'Field Extractor: technical documents, returned as structured data',
    ca: 'Field Extractor: documents tècnics, retornats com a dades estructurades',
    es: 'Field Extractor: documentos técnicos, devueltos como datos estructurados'
  },
  'meta.description': {
    en: 'Reads technical documents and returns the fields you asked for, ' +
        'wherever they sit inside them. Prose, tables, footnotes, any language.',
    ca: 'Llegeix documents tècnics i retorna els camps que has demanat, siguin ' +
        'on siguin a dins. Prosa, taules, notes al peu, en qualsevol idioma.',
    es: 'Lee documentos técnicos y devuelve los campos que has pedido, estén ' +
        'donde estén dentro. Prosa, tablas, notas al pie, en cualquier idioma.'
  },
  'topbar.tag': {
    en: 'Documents to data',
    ca: 'De documents a dades',
    es: 'De documentos a datos'
  },

  /* --- hero -------------------------------------------------------------- */

  'hero.head': {
    en: 'Written for people.<br>Returned as <span class="accent">data</span>.',
    ca: 'Escrits per a persones.<br>Retornats com a <span class="accent">dades</span>.',
    es: 'Escritos para personas.<br>Devueltos como <span class="accent">datos</span>.'
  },
  'hero.lede': {
    en: 'Point it at technical documents. It reads them the way a person would, ' +
        'finds what you asked for wherever it happens to be, and hands back a ' +
        'catalogue you can query.',
    ca: 'Apunta\'l a documents tècnics. Els llegeix com ho faria una persona, ' +
        'troba el que has demanat allà on sigui, i et torna un catàleg que pots ' +
        'consultar.',
    es: 'Apúntalo a documentos técnicos. Los lee como lo haría una persona, ' +
        'encuentra lo que has pedido esté donde esté, y te devuelve un ' +
        'catálogo que puedes consultar.'
  },

  /* --- the gap ----------------------------------------------------------- */

  'gap.statement': {
    en: 'Every product you sell is fully documented.<br>' +
        '<span class="dim">And none of it can be counted, sorted or compared.</span>',
    ca: 'Cada producte que vens està del tot documentat.<br>' +
        '<span class="dim">I res d\'això no es pot comptar, ordenar ni comparar.</span>',
    es: 'Cada producto que vendes está documentado por completo.<br>' +
        '<span class="dim">Y nada de eso se puede contar, ordenar ni comparar.</span>'
  },

  /* --- where it starts ---------------------------------------------------- */

  'fits.head': {
    en: 'It starts with a folder.',
    ca: 'Comença amb una carpeta.',
    es: 'Empieza con una carpeta.'
  },
  'fits.lede': {
    en: 'Almost everything a company knows about its products lives in ' +
        'documents, and a document is not something you can run a question ' +
        'against. Until it is data, none of it can be used twice.',
    ca: 'Gairebé tot el que una empresa sap dels seus productes viu en ' +
        'documents, i un document no és una cosa a la qual puguis fer una ' +
        'pregunta. Fins que no són dades, res no es pot fer servir dos cops.',
    es: 'Casi todo lo que una empresa sabe de sus productos vive en ' +
        'documentos, y un documento no es algo a lo que puedas hacerle una ' +
        'pregunta. Hasta que no son datos, nada de eso se puede usar dos veces.'
  },
  'fits.a.head': {
    en: 'A catalogue nobody can read at once',
    ca: 'Un catàleg que ningú no pot llegir de cop',
    es: 'Un catálogo que nadie puede leer de una vez'
  },
  'fits.a.body': {
    en: 'Four hundred products, every one of them fully described, none of it ' +
        'in a form anything can add up. The knowledge is already there. It has ' +
        'simply never been available.',
    ca: 'Quatre-cents productes, tots descrits amb detall, i res en una forma ' +
        'que es pugui sumar. El coneixement ja hi és. Només que no ha estat ' +
        'mai disponible.',
    es: 'Cuatrocientos productos, todos descritos con detalle, y nada en una ' +
        'forma que se pueda sumar. El conocimiento ya está ahí. Solo que ' +
        'nunca ha estado disponible.'
  },
  'fits.b.head': {
    en: 'One question, a whole catalogue',
    ca: 'Una pregunta, tot un catàleg',
    es: 'Una pregunta, todo un catálogo'
  },
  'fits.b.body': {
    en: 'Which of these are A1, under 0,035, and still valid next spring. ' +
        'Nobody opens four hundred files to answer that. With the fields in ' +
        'columns it is one filter.',
    ca: 'Quins són A1, per sota de 0,035, i encara vigents la primavera que ve. ' +
        'Ningú obre quatre-cents fitxers per respondre això. Amb els camps en ' +
        'columnes és un sol filtre.',
    es: 'Cuáles son A1, por debajo de 0,035, y siguen vigentes la primavera ' +
        'que viene. Nadie abre cuatrocientos archivos para responder eso. Con ' +
        'los campos en columnas es un solo filtro.'
  },
  'fits.c.head': {
    en: 'Documents nobody designed for this',
    ca: 'Documents que ningú no va pensar per a això',
    es: 'Documentos que nadie pensó para esto'
  },
  'fits.c.body': {
    en: 'Scans, exports, sheets written in whatever language the factory works ' +
        'in. There is no format underneath them, which is exactly why parsing ' +
        'them has never worked.',
    ca: 'Escanejos, exportacions, fitxes escrites en l\'idioma en què treballa ' +
        'la fàbrica. No hi ha cap format a sota, que és precisament per què ' +
        'analitzar-los mai no ha funcionat.',
    es: 'Escaneos, exportaciones, fichas escritas en el idioma en que trabaja ' +
        'la fábrica. No hay ningún formato debajo, que es justamente por lo ' +
        'que analizarlos nunca ha funcionado.'
  },
  'fits.callout': {
    en: 'The document stays the authority. What comes back is a working copy ' +
        'that points at it, line by line.',
    ca: 'El document continua sent l\'autoritat. El que en surt és una còpia de ' +
        'treball que hi apunta, línia per línia.',
    es: 'El documento sigue siendo la autoridad. Lo que sale es una copia de ' +
        'trabajo que apunta a él, línea por línea.'
  },

  /* --- the pipeline ------------------------------------------------------- */

  'pipe.head': {
    en: 'From a page to a record.',
    ca: 'D\'una pàgina a un registre.',
    es: 'De una página a un registro.'
  },
  'pipe.sub': {
    en: 'One document, read end to end.',
    ca: 'Un document, llegit de cap a cap.',
    es: 'Un documento, leído de cabo a rabo.'
  },
  'pipe.col.a': {
    en: 'The page, as it arrived',
    ca: 'La pàgina, tal com ha arribat',
    es: 'La página, tal como ha llegado'
  },
  'pipe.col.b': {
    en: 'What it found, and what it made of it',
    ca: 'Què hi ha trobat, i què n\'ha fet',
    es: 'Qué ha encontrado, y qué ha hecho con ello'
  },
  'pipe.col.c': { en: 'The record', ca: 'El registre', es: 'El registro' },
  'pipe.doc.kind': {
    en: 'Technical data sheet',
    ca: 'Fitxa tècnica',
    es: 'Ficha técnica'
  },
  'pipe.doc.maker': { en: 'Manufacturer', ca: 'Fabricant', es: 'Fabricante' },
  'pipe.doc.title': {
    en: 'Mineral wool board',
    ca: 'Placa de llana mineral',
    es: 'Panel de lana mineral'
  },
  'pipe.doc.sub': {
    en: '140 mm, for ventilated façades',
    ca: '140 mm, per a façanes ventilades',
    es: '140 mm, para fachadas ventiladas'
  },
  'pipe.comp.chip': {
    en: 'Basalt 58,0 · Blast furnace slag 28,0 · Limestone 9,2 …',
    ca: 'Basalt 58,0 · Escòria d\'alt forn 28,0 · Calcària 9,2 …',
    es: 'Basalto 58,0 · Escoria de alto horno 28,0 · Caliza 9,2 …'
  },
  'pipe.comp.unit': {
    en: 'materials, share of mass',
    ca: 'materials, proporció en massa',
    es: 'materiales, proporción en masa'
  },

  /* --- composition -------------------------------------------------------- */

  'comp.head': {
    en: 'Nobody writes a composition the same way twice.',
    ca: 'Ningú no escriu una composició dues vegades igual.',
    es: 'Nadie escribe una composición dos veces igual.'
  },
  'comp.lede': {
    en: 'This is where reading stops being pattern matching. The same board, ' +
        'declared four ways: a table, a sentence, another language, and a ' +
        'different basis entirely. All four have to land in the same shape, or ' +
        'none of them can be compared to anything.',
    ca: 'Aquí és on llegir deixa de ser reconèixer patrons. La mateixa placa, ' +
        'declarada de quatre maneres: una taula, una frase, un altre idioma, i ' +
        'una base completament diferent. Les quatre han d\'acabar en la mateixa ' +
        'forma, o cap no es pot comparar amb res.',
    es: 'Aquí es donde leer deja de ser reconocer patrones. El mismo panel, ' +
        'declarado de cuatro maneras: una tabla, una frase, otro idioma, y una ' +
        'base completamente distinta. Las cuatro tienen que acabar en la misma ' +
        'forma, o ninguna se puede comparar con nada.'
  },
  'comp.out': { en: 'Normalised', ca: 'Normalitzat', es: 'Normalizado' },
  'comp.from': { en: 'read from', ca: 'llegit de', es: 'leído de' },
  'comp.total': { en: 'Total', ca: 'Total', es: 'Total' },
  'comp.note': {
    en: 'A composition is not one value. It is a list of materials and the ' +
        'share of each, and a share means nothing until you know what it is a ' +
        'share of. Getting the basis wrong is how a whole catalogue quietly ' +
        'stops adding up.',
    ca: 'Una composició no és un valor. És una llista de materials i la ' +
        'proporció de cadascun, i una proporció no vol dir res fins que saps de ' +
        'què és proporció. Errar la base és com un catàleg sencer deixa de ' +
        'quadrar sense que ningú se n\'adoni.',
    es: 'Una composición no es un valor. Es una lista de materiales y la ' +
        'proporción de cada uno, y una proporción no significa nada hasta que ' +
        'sabes de qué es proporción. Equivocar la base es como un catálogo ' +
        'entero deja de cuadrar sin que nadie se dé cuenta.'
  },

  /* --- four documents ----------------------------------------------------- */

  'docs.head': {
    en: 'One product. Four documents. One row.',
    ca: 'Un producte. Quatre documents. Una fila.',
    es: 'Un producto. Cuatro documentos. Una fila.'
  },
  'docs.lede': {
    en: 'No single document holds the whole picture. The declaration has the ' +
        'carbon, the data sheet has the physics, the end of life sheet has the ' +
        'part everyone forgets to ask for. Read together they make one record.',
    ca: 'Cap document sol no té la imatge sencera. La declaració té el carboni, ' +
        'la fitxa té la física, la fitxa de final de vida té la part que ningú ' +
        'no recorda demanar. Llegits alhora fan un sol registre.',
    es: 'Ningún documento por sí solo tiene la imagen completa. La declaración ' +
        'tiene el carbono, la ficha tiene la física, la ficha de final de vida ' +
        'tiene la parte que nadie se acuerda de pedir. Leídos juntos hacen un ' +
        'solo registro.'
  },
  'docs.merged': {
    en: 'The merged record',
    ca: 'El registre combinat',
    es: 'El registro combinado'
  },
  'docs.cap': {
    en: 'Take a document to see what only it can give you.',
    ca: 'Tria un document per veure què només ell et pot donar.',
    es: 'Elige un documento para ver qué solo él te puede dar.'
  },

  /* --- the schema --------------------------------------------------------- */

  'schema.head': {
    en: 'You decide what a row looks like.',
    ca: 'Tu decideixes com és una fila.',
    es: 'Tú decides cómo es una fila.'
  },
  'schema.lede': {
    en: 'A field is a name, a type, a unit, and one sentence saying what to ' +
        'look for. Write that sentence the way you would explain it to a new ' +
        'colleague. Change the fields and the same documents give you a ' +
        'different table.',
    ca: 'Un camp és un nom, un tipus, una unitat i una frase que diu què cal ' +
        'buscar. Escriu aquesta frase com l\'explicaries a un company nou. ' +
        'Canvia els camps i els mateixos documents et donen una taula diferent.',
    es: 'Un campo es un nombre, un tipo, una unidad y una frase que dice qué ' +
        'hay que buscar. Escribe esa frase como se la explicarías a un ' +
        'compañero nuevo. Cambia los campos y los mismos documentos te dan una ' +
        'tabla distinta.'
  },
  'schema.pick': {
    en: 'Choose a schema',
    ca: 'Tria un esquema',
    es: 'Elige un esquema'
  },
  'schema.th.field': { en: 'Field', ca: 'Camp',  es: 'Campo' },
  'schema.th.type':  { en: 'Type',  ca: 'Tipus', es: 'Tipo'  },
  'schema.th.look': {
    en: 'What to look for',
    ca: 'Què cal buscar',
    es: 'Qué hay que buscar'
  },
  'schema.out': {
    en: 'What comes back',
    ca: 'Què en surt',
    es: 'Qué sale de ahí'
  },

  /* --- trust -------------------------------------------------------------- */

  'trust.head': {
    en: 'Every value points back.',
    ca: 'Cada valor apunta enrere.',
    es: 'Cada valor apunta atrás.'
  },
  'trust.body': {
    en: 'A number with no source is a number somebody has to go and check by ' +
        'hand. Each field carries the document it came from and the place ' +
        'inside it, so the value and the evidence arrive together.',
    ca: 'Una xifra sense font és una xifra que algú haurà d\'anar a comprovar a ' +
        'mà. Cada camp porta el document d\'on surt i el lloc exacte a dins, de ' +
        'manera que el valor i l\'evidència arriben junts.',
    es: 'Una cifra sin fuente es una cifra que alguien tendrá que ir a ' +
        'comprobar a mano. Cada campo lleva el documento del que sale y el ' +
        'lugar exacto dentro, de modo que el valor y la evidencia llegan ' +
        'juntos.'
  },
  'blank.head': {
    en: 'Empty is an answer.',
    ca: 'Buit també és una resposta.',
    es: 'Vacío también es una respuesta.'
  },
  'blank.body': {
    en: 'When a document does not say, the field comes back empty and names ' +
        'the document it looked in. A blank you can trust is worth more than a ' +
        'value you cannot.',
    ca: 'Quan un document no ho diu, el camp torna buit i diu en quin document ' +
        'ha mirat. Un buit de fiar val més que un valor que no ho és.',
    es: 'Cuando un documento no lo dice, el campo vuelve vacío y nombra el ' +
        'documento en el que ha mirado. Un vacío del que fiarte vale más que ' +
        'un valor del que no.'
  },

  /* --- the catalogue ------------------------------------------------------- */

  'work.head': {
    en: 'Then you can ask it anything.',
    ca: 'I llavors ja li pots preguntar el que sigui.',
    es: 'Y entonces ya le puedes preguntar lo que sea.'
  },
  'work.lede': {
    en: 'This is what the reading was for. A question that used to be a week ' +
        'of someone opening files is now three clicks, and the answer holds ' +
        'still long enough to act on.',
    ca: 'Per això servia la lectura. Una pregunta que abans era una setmana ' +
        'd\'algú obrint fitxers ara són tres clics, i la resposta es queda ' +
        'quieta prou estona per actuar-hi.',
    es: 'Para esto servía la lectura. Una pregunta que antes era una semana de ' +
        'alguien abriendo archivos ahora son tres clics, y la respuesta se ' +
        'queda quieta el rato suficiente para actuar sobre ella.'
  },
  'work.filters': { en: 'Narrow it down', ca: 'Acota-ho', es: 'Acótalo' },
  'work.showing': { en: 'match', ca: 'hi encaixen', es: 'encajan' },
  'work.of': { en: 'of', ca: 'de', es: 'de' },
  'work.empty': {
    en: 'Nothing clears all of those.',
    ca: 'Res no supera tot això.',
    es: 'Nada supera todo eso.'
  },
  'work.col.ref':   { en: 'Reference', ca: 'Referència', es: 'Referencia' },
  'work.col.fam':   { en: 'Family',    ca: 'Família',    es: 'Familia'    },
  'work.col.lam':   { en: 'λD',        ca: 'λD',         es: 'λD'         },
  'work.col.rho':   { en: 'Density',   ca: 'Densitat',   es: 'Densidad'   },
  'work.col.gwp':   { en: 'GWP (A1–A3)', ca: 'GWP (A1–A3)', es: 'GWP (A1–A3)' },
  'work.col.fire': {
    en: 'Reaction to fire',
    ca: 'Reacció al foc',
    es: 'Reacción al fuego'
  },
  'work.col.valid': { en: 'Valid to', ca: 'Vàlid fins', es: 'Válido hasta' },
  'work.chart': {
    en: 'Conductivity against density',
    ca: 'Conductivitat contra densitat',
    es: 'Conductividad frente a densidad'
  },
  'work.chart.x': {
    en: 'Density, kg/m³',
    ca: 'Densitat, kg/m³',
    es: 'Densidad, kg/m³'
  },
  'work.chart.y': {
    en: 'λD, W/(m·K)',
    ca: 'λD, W/(m·K)',
    es: 'λD, W/(m·K)'
  },

  /* --- it feeds the rest --------------------------------------------------- */

  'feeds.head': {
    en: 'And it feeds the rest.',
    ca: 'I alimenta la resta.',
    es: 'Y alimenta al resto.'
  },
  'feeds.lede': {
    en: 'A material composition with the shares normalised is exactly what the ' +
        'Attribute Predictor takes. Structured product data is the input our ' +
        'other tools were built for. This is where it comes from.',
    ca: 'Una composició de materials amb les proporcions normalitzades és ' +
        'justament el que demana l\'Attribute Predictor. Les dades ' +
        'estructurades de producte són l\'entrada per a la qual es van fer les ' +
        'nostres altres eines. D\'aquí és d\'on surten.',
    es: 'Una composición de materiales con las proporciones normalizadas es ' +
        'justamente lo que pide el Attribute Predictor. Los datos ' +
        'estructurados de producto son la entrada para la que se hicieron ' +
        'nuestras otras herramientas. De aquí es de donde salen.'
  },

  /* --- call to action ------------------------------------------------------ */

  'cta.head': {
    en: 'Point it at your folder.',
    ca: 'Apunta\'l a la teva carpeta.',
    es: 'Apúntalo a tu carpeta.'
  },
  'cta.body': {
    en: 'Tell us what you need out of it, and we will show you what comes back.',
    ca: 'Digues-nos què en necessites, i et mostrarem què en surt.',
    es: 'Dinos qué necesitas de ella, y te enseñamos qué sale.'
  },
  'cta.btn': { en: 'Get in touch', ca: 'Parlem-ne', es: 'Hablemos' },

  /* --- close --------------------------------------------------------------- */

  'close.statement': {
    en: 'The reading is done.<br><span class="dim">Now the work can start.</span>',
    ca: 'La lectura ja està feta.<br><span class="dim">Ara pot començar la feina.</span>',
    es: 'La lectura ya está hecha.<br><span class="dim">Ahora puede empezar el trabajo.</span>'
  },

  'footer.note': {
    en: 'Every document, value and figure on this page was written to ' +
        'illustrate the interface. Nothing here is a real declaration, and ' +
        'nothing here is output from the product.',
    ca: 'Tots els documents, valors i figures d\'aquesta pàgina s\'han escrit ' +
        'per il·lustrar la interfície. Res no és una declaració real, i res no ' +
        'és resultat del producte.',
    es: 'Todos los documentos, valores y figuras de esta página se han escrito ' +
        'para ilustrar la interfaz. Nada es una declaración real, y nada es ' +
        'resultado del producto.'
  }
});
