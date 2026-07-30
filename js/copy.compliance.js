/* an unescaped apostrophe here fails the parse silently and ships English */
I18N.add({

  'meta.title': {
    en: 'Compliance Filter: the catalogue, narrowed to what the project allows',
    ca: 'Compliance Filter: el catàleg, reduït al que el projecte permet',
    es: 'Compliance Filter: el catálogo, reducido a lo que el proyecto permite'
  },
  'meta.description': {
    en: 'Where a product sits decides what it has to be. The exposure, the ' +
        'drawings and the person on site set the limits, and the catalogue ' +
        'answers.',
    ca: 'On es col·loca un producte decideix què ha de ser. L\'exposició, els ' +
        'plànols i la persona a l\'obra fixen els límits, i el catàleg respon.',
    es: 'Dónde se coloca un producto decide qué tiene que ser. La exposición, ' +
        'los planos y la persona en obra fijan los límites, y el catálogo responde.'
  },
  'topbar.tag': {
    en: 'Exposure to a shortlist',
    ca: 'De l\'exposició a una llista curta',
    es: 'De la exposición a una lista corta'
  },

  /* --- hero -------------------------------------------------------------- */

  'hero.head': {
    en: 'Where it sits decides<br>what it <span class="accent">has to be</span>.',
    ca: 'On es col·loca decideix<br>què <span class="accent">ha de ser</span>.',
    es: 'Dónde se coloca decide<br>qué <span class="accent">tiene que ser</span>.'
  },
  'hero.lede': {
    en: 'The exposure sets the limits. The drawings and the person on site add ' +
        'the rest. What clears all of them is what you can specify.',
    ca: 'L\'exposició fixa els límits. Els plànols i la persona a l\'obra hi ' +
        'afegeixen la resta. El que ho compleix tot és el que pots especificar.',
    es: 'La exposición fija los límites. Los planos y la persona en obra añaden ' +
        'el resto. Lo que lo cumple todo es lo que puedes especificar.'
  },

  /* --- the instrument ---------------------------------------------------- */

  'scene.head': {
    en: 'The environment is the requirement.',
    ca: 'L\'entorn és el requisit.',
    es: 'El entorno es el requisito.'
  },
  'scene.adds': {
    en: 'What the site adds',
    ca: 'Què hi afegeix l\'obra',
    es: 'Qué añade la obra'
  },
  'scene.binds': {
    en: 'What binds',
    ca: 'Què obliga',
    es: 'Qué obliga'
  },
  'scene.drawing': {
    en: 'Back to the drawing',
    ca: 'Torna al plànol',
    es: 'Vuelve al plano'
  },
  'scene.catalogue': {
    en: 'The catalogue',
    ca: 'El catàleg',
    es: 'El catálogo'
  },
  'scene.clear': {
    en: 'clear every requirement',
    ca: 'compleixen tots els requisits',
    es: 'cumplen todos los requisitos'
  },
  /* screen readers only: the mint bar and the rose token must not be the sole
     carrier of the verdict */
  'v.ok':  { en: 'Clears', ca: 'Compleix', es: 'Cumple' },
  'v.out': { en: 'Excluded', ca: 'Exclòs', es: 'Excluido' },

  'scene.none': {
    en: 'Nothing here clears all of that.',
    ca: 'Res d\'aquí no compleix tot això.',
    es: 'Nada de aquí cumple todo eso.'
  },

  /* environment bands, drawn on the section */
  'band.IIIa': {
    en: 'Marine air',
    ca: 'Aire marí',
    es: 'Aire marino'
  },
  'band.IIIc': {
    en: 'Tidal splash',
    ca: 'Esquitxos de marea',
    es: 'Salpicaduras de marea'
  },
  'band.Qb': {
    en: 'Sulfate ground',
    ca: 'Terreny amb sulfats',
    es: 'Terreno con sulfatos'
  },

  /* --- the honest line ---------------------------------------------------- */

  'close.statement': {
    en: 'Every one of these satisfies the class it was built for.<br>' +
        '<span class="dim">This project is what rules them out.</span>',
    ca: 'Tots aquests compleixen la classe per a la qual es van fer.<br>' +
        '<span class="dim">És aquest projecte el que els descarta.</span>',
    es: 'Todos estos cumplen la clase para la que se hicieron.<br>' +
        '<span class="dim">Es este proyecto el que los descarta.</span>'
  },

  /* --- call to action ---------------------------------------------------- */

  'cta.head': {
    en: 'Tell it where the product goes.',
    ca: 'Digues-li on va el producte.',
    es: 'Dile dónde va el producto.'
  },
  'cta.body': {
    en: 'Send us a project and its catalogue. We will show you what is left.',
    ca: 'Envia\'ns un projecte i el seu catàleg. Et mostrarem què queda.',
    es: 'Envíanos un proyecto y su catálogo. Te mostraremos qué queda.'
  },
  'cta.btn': { en: 'Get in touch', ca: 'Parlem-ne', es: 'Hablemos' },

  'footer.note': {
    en: 'The section and the nine specimens on this page were drawn to ' +
        'illustrate the interface and belong to no supplier. The instruments ' +
        'named are real and the limiting values are the ones a project works ' +
        'to. Nothing here is output from the product, and nothing here is a ' +
        'statement of compliance.',
    ca: 'La secció i els nou provetes d\'aquesta pàgina s\'han dibuixat per ' +
        'il·lustrar la interfície i no són de cap proveïdor. Les normes citades ' +
        'són reals i els valors límit són els que fa servir un projecte. Res no ' +
        'és resultat del producte, i res no és una declaració de compliment.',
    es: 'La sección y las nueve probetas de esta página se han dibujado para ' +
        'ilustrar la interfaz y no son de ningún proveedor. Las normas citadas ' +
        'son reales y los valores límite son los que usa un proyecto. Nada es ' +
        'resultado del producto, y nada es una declaración de cumplimiento.'
  }
});
