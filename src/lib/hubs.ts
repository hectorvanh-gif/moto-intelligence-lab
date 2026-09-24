/**
 * Las cuatro secciones tematicas del sitio.
 *
 * Cada una apunta a un cluster de busqueda real (volumenes de Ahrefs,
 * sep-2026) y trae contenido propio arriba mas las notas del agente abajo.
 * El contenido evergreen es lo que posiciona; el feed solo lo mantiene vivo.
 *
 * REGLA: aqui no se escriben precios, anios de modelo ni fichas tecnicas que
 * no esten verificados. Si un dato duro no se pudo confirmar, la seccion no
 * se publica hasta tenerlo.
 */

export interface HubSection {
  heading: string;
  body: string[];
}

export interface HubFaq {
  q: string;
  a: string;
}

export interface Hub {
  slug: string;
  /** Valor de `category` en la base. */
  category: string;
  /** Terminos para rescatar notas cuando la categoria todavia no esta puesta. */
  match: string[];
  title: string;
  metaDescription: string;
  h1: string;
  /** Etiqueta corta para el navbar: el h1 completo no cabe. */
  navLabel: string;
  kicker: string;
  lead: string;
  sections: HubSection[];
  faq: HubFaq[];
  /** Objetivo de busqueda, para no perderlo de vista al editar. */
  target: { keyword: string; volume: string; note?: string };
}

export const HUBS: Hub[] = [
  {
    slug: "motos-doble-proposito",
    category: "AVENTURA",
    match: ["doble prop", "trail", "adventure", "xpulse", "himalayan"],
    title: "Motos doble propósito en México: cómo elegir la tuya",
    metaDescription:
      "Guía de motos doble propósito en México: qué son, en qué fijarte antes de comprar, qué cilindraje elegir y las marcas que más se buscan.",
    h1: "MOTOS DOBLE PROPÓSITO",
    navLabel: "DOBLE PROPÓSITO",
    kicker: "GUÍA DE COMPRA",
    lead:
      "La doble propósito es la moto que no te obliga a escoger entre el asfalto y la terracería. En México es de las categorías que más crece, y también una de las que más confunde a la hora de comprar, porque el nombre se usa para cosas muy distintas.",
    target: { keyword: "motos doble proposito", volume: "3.6K/mes", note: "KD 0" },
    sections: [
      {
        heading: "¿Qué es exactamente una doble propósito?",
        body: [
          "Es una moto homologada para circular en calle que además está preparada para salirse de ella. Eso se traduce en tres cosas concretas: más recorrido de suspensión que una moto de calle, más despeje al piso, y llanta con dibujo mixto o de tacos.",
          "No es lo mismo que una moto de enduro, que es una máquina de competencia con poco o nada de concesiones para la ciudad. Tampoco es una adventure grande de viaje, que pesa mucho más y está pensada para carretera con capacidad ocasional de terracería. La doble propósito vive en medio, y por eso funciona como moto única para mucha gente.",
          "La regla práctica: si quieres una sola moto para ir al trabajo entre semana y meterte a un camino de tierra el domingo, esta categoría es la tuya.",
        ],
      },
      {
        heading: "En qué fijarte antes de comprar",
        body: [
          "**Altura al asiento.** Es el factor que más gente subestima. Una doble propósito es alta por diseño, y si no llegas bien al piso vas a pasarla mal en el tráfico. Siéntate en la moto antes de comprarla, con los zapatos que usas normalmente.",
          "**Peso.** No importa cuánta potencia tenga si no puedes levantarla tú solo cuando se cae en la tierra. Y se va a caer.",
          "**Recorrido de suspensión y despeje.** Son los números que separan una doble propósito de verdad de una moto de calle con llantas de tacos y marketing.",
          "**Rin delantero.** Los 21 pulgadas es el estándar de las que van en serio a la tierra; rines más chicos se comportan mejor en asfalto y peor en piedra suelta.",
          "**Red de servicio y refacciones.** En México esto pesa más que la ficha técnica. Una moto barata cuyo distribuidor está a 300 km o cuyas refacciones tardan semanas te sale cara. Pregunta por el taller más cercano antes de firmar.",
        ],
      },
      {
        heading: "El cilindraje que buscan la mayoría",
        body: [
          "La búsqueda se concentra en los 250 y los 300 cc, y tiene sentido: es el punto donde una doble propósito ya aguanta carretera sin volverse pesada ni impagable, y donde el seguro y el mantenimiento siguen siendo razonables.",
          "Por debajo de eso tienes motos más accesibles y muy manejables, ideales para aprender, que sufren en autopista. Por arriba entras en terreno de las adventure, que son otra cosa: más viaje, más peso, más dinero.",
        ],
      },
      {
        heading: "Las marcas que más se buscan en México",
        body: [
          "Por volumen de búsqueda, los nombres que la gente escribe junto a \"doble propósito\" son Italika, Vento, CFMoto, Yamaha, Honda, KTM, Kawasaki, Suzuki, BMW y Hero. Eso dice mucho del mercado: convive la marca de entrada con la premium en la misma categoría.",
          "No es una lista de recomendación ni un ranking: es lo que se busca. La decisión correcta depende de tu presupuesto, de tu estatura y sobre todo de dónde vas a rodar.",
        ],
      },
      {
        heading: "El casco no es un detalle",
        body: [
          "El casco de doble propósito es una categoría propia: lleva visera y pico, ventilación pensada para ir despacio en terracería, y espacio para goggles. Un casco de calle en un camino de tierra te va a ahogar de calor, y un casco de cross no te sirve en carretera porque el viento te arranca la cabeza.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Una doble propósito sirve para usar diario en la ciudad?",
        a: "Sí, y de hecho es uno de sus puntos fuertes: la suspensión larga se come los baches y la postura erguida te da visibilidad en el tráfico. Lo único que tienes que resolver es la altura al asiento.",
      },
      {
        q: "¿Necesito experiencia para manejar una?",
        a: "No para los cilindrajes de entrada. Son motos tolerantes y de postura cómoda. Lo que sí cambia con la experiencia es qué tan lejos te puedes meter en la tierra.",
      },
      {
        q: "¿Cuál es la diferencia con una moto de enduro?",
        a: "La enduro está hecha para competir fuera del asfalto y hace concesiones enormes en comodidad, autonomía y mantenimiento. La doble propósito está homologada para calle y pensada para convivir con el uso diario.",
      },
      {
        q: "¿Puedo viajar largo en una doble propósito?",
        a: "En los cilindrajes medianos y grandes, sí. En los de entrada puedes, pero vas a ir revolucionado en autopista y sin mucho margen para rebasar. Para viaje constante, las adventure están mejor resueltas.",
      },
    ],
  },
  {
    slug: "motos-electricas",
    category: "ELECTRICA",
    match: ["eléctric", "electric"],
    title: "Motos eléctricas en México: qué revisar antes de comprar",
    metaDescription:
      "Guía de motos eléctricas en México: los tipos que existen, qué revisar de la batería y la autonomía, y las marcas que más se buscan.",
    h1: "MOTOS ELÉCTRICAS",
    navLabel: "ELÉCTRICAS",
    kicker: "GUÍA DE COMPRA",
    lead:
      "\"Moto eléctrica\" es el término más buscado de todo el mundo de las motos en español, y también el más revuelto: bajo el mismo nombre se venden cosas tan distintas como una moto de calle, una bicimoto y un juguete para niños. Antes de comparar precios hay que saber qué estás comparando.",
    target: { keyword: "moto electrica", volume: "50K/mes", note: "KD 0" },
    sections: [
      {
        heading: "Primero: ¿cuál de todas estás buscando?",
        body: [
          "**Moto eléctrica de calle.** Reemplaza a una moto de gasolina: alcanza velocidades de vía primaria, se registra y se maneja como moto.",
          "**Bicimoto o ciclomotor eléctrico.** Es la categoría que más ha crecido. Tiene pedales o aspecto de bicicleta robusta, va más despacio y muchas veces no requiere el mismo trámite que una moto. Es lo que buscan quienes escriben \"moto bici eléctrica\".",
          "**Trimoto o moto de tres llantas.** De carga o de movilidad, con usos muy específicos y estabilidad distinta.",
          "**Moto eléctrica para niños.** Es un juguete, no un vehículo. Buena parte del volumen de búsqueda de \"moto eléctrica\" es en realidad esto, así que si estás comparando precios y te salen cifras que no cuadran, probablemente estás mezclando categorías.",
        ],
      },
      {
        heading: "Lo que de verdad hay que revisar",
        body: [
          "**Autonomía real, no la del folleto.** La cifra que anuncian se mide en condiciones ideales: un solo pasajero, plano, velocidad baja. Con subidas, con tráfico y con alguien atrás, baja. Pregunta por el consumo en uso mixto y desconfía del número redondo.",
          "**Batería extraíble o fija.** Esto define si puedes cargarla en tu departamento o necesitas cajón con contacto. Es la diferencia entre que la moto te sirva o no, y casi nadie lo pregunta a tiempo.",
          "**Tiempo de carga y ciclos.** Cuánto tarda de vacío a lleno, y cuántos ciclos aguanta antes de perder capacidad. La batería es la pieza más cara: saber qué cuesta reemplazarla te dice el costo real de la moto a tres años.",
          "**Servicio y refacciones.** Un motor eléctrico casi no necesita mantenimiento, pero el resto de la moto sí, y los controladores y baterías no los arregla cualquier taller de la esquina. Revisa qué red tiene la marca en tu ciudad.",
        ],
      },
      {
        heading: "Trámites: depende de dónde vivas",
        body: [
          "En México el registro, las placas y la licencia para vehículos eléctricos ligeros **se regulan por estado**, y los criterios cambian según la potencia y la velocidad máxima del vehículo. Lo que aplica en la CDMX no necesariamente aplica en Jalisco o en Nuevo León.",
          "No te fíes de lo que diga el vendedor: verifica con la autoridad de movilidad de tu estado antes de comprar, sobre todo si estás viendo una bicimoto y das por hecho que no necesita nada.",
        ],
      },
      {
        heading: "Las marcas que más se buscan",
        body: [
          "Por volumen de búsqueda en México aparecen Italika, Honey Whale, Kiwo, Evobike, Aima, Yadea y BMW, además de las cadenas donde la gente las busca directamente. Es un mercado joven, con marcas que hace tres años no existían aquí, y eso hace que la pregunta por el servicio y las refacciones sea todavía más importante que la del precio.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Las motos eléctricas necesitan placas en México?",
        a: "Depende del estado y del tipo de vehículo. Las motos eléctricas de calle se registran como motos; los ciclomotores y bicimotos tienen reglas distintas según la entidad y según su potencia y velocidad. Verifica con la autoridad de movilidad de tu estado.",
      },
      {
        q: "¿Cuánto dura la batería?",
        a: "Se mide en ciclos de carga, no en años. Lo importante al comparar es cuántos ciclos declara el fabricante, cuánta capacidad conserva al final de ellos, y cuánto cuesta el reemplazo.",
      },
      {
        q: "¿Sirven para el tráfico de una ciudad grande?",
        a: "Es justo donde mejor funcionan: el par está disponible desde cero, no consumen detenidas y el mantenimiento es mínimo. El límite es la autonomía y, si vas a carretera, la velocidad máxima.",
      },
      {
        q: "¿Se pueden cargar en casa?",
        a: "Si la batería es extraíble, sí, en un contacto normal. Si es fija, necesitas dejar la moto donde haya corriente, y eso descarta a mucha gente que estaciona en la calle.",
      },
    ],
  },
  {
    slug: "motogp",
    category: "MOTOGP",
    match: ["motogp", "moto gp", "moto2", "moto3"],
    title: "MotoGP: cómo funciona el campeonato y últimas noticias",
    metaDescription:
      "MotoGP explicado: las tres categorías, el formato de fin de semana con sprint, cómo se reparten los puntos, y todas las noticias del campeonato.",
    h1: "MOTOGP",
    navLabel: "MOTOGP",
    kicker: "EL CAMPEONATO",
    lead:
      "MotoGP es la categoría reina del motociclismo de velocidad. Si estás entrando ahora, esto es lo que necesitas para seguir un fin de semana de carreras sin perderte.",
    target: {
      keyword: "motogp calendario / pilotos de motogp",
      volume: "250 + 100/mes",
      note: "la cabeza 'motogp' tiene KD 73, no se pelea",
    },
    sections: [
      {
        heading: "Tres campeonatos en el mismo fin de semana",
        body: [
          "En cada Gran Premio corren tres categorías distintas, y cada una reparte su propio campeonato: **Moto3**, la de entrada, con las motos más pequeñas y las carreras más peleadas; **Moto2**, el escalón intermedio; y **MotoGP**, donde están los prototipos más rápidos y los pilotos de fábrica.",
          "Es un escalafón: los pilotos suben de Moto3 a Moto2 y de ahí a MotoGP. Por eso vale la pena seguir las categorías chicas, porque ahí se ven primero los nombres que en dos o tres años van a estar peleando el mundial grande.",
        ],
      },
      {
        heading: "Cómo se arma el fin de semana",
        body: [
          "El viernes y el sábado por la mañana son de entrenamientos y clasificación: ahí se define la parrilla. El sábado se corre una **carrera sprint**, a la mitad de distancia, que reparte menos puntos que la carrera larga pero cuenta para el campeonato. El domingo se corre el Gran Premio, que es el que reparte los puntos completos.",
          "Ese formato con sprint el sábado cambió la manera de seguir el campeonato: una mala clasificación ya te cuesta puntos el mismo sábado, y la remontada del domingo vale más que antes.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Cuál es la diferencia entre MotoGP, Moto2 y Moto3?",
        a: "Son tres campeonatos que corren el mismo fin de semana y forman un escalafón. Moto3 tiene las motos más pequeñas y es la categoría de entrada, Moto2 es el escalón intermedio, y MotoGP es la categoría mayor, con prototipos y equipos de fábrica.",
      },
      {
        q: "¿La carrera sprint cuenta para el campeonato?",
        a: "Sí. Se corre el sábado a la mitad de distancia y reparte menos puntos que el Gran Premio del domingo, pero suman igual para la tabla.",
      },
    ],
  },
  {
    slug: "enduro",
    category: "ENDURO",
    match: ["enduro", "dakar", "rally", "hard enduro"],
    title: "Motos de enduro: qué son y cómo empezar",
    metaDescription:
      "Motos de enduro: en qué se diferencian del motocross y de la doble propósito, qué necesitas para empezar y las noticias de enduro y rally.",
    h1: "ENDURO",
    navLabel: "ENDURO",
    kicker: "GUÍA Y NOTICIAS",
    lead:
      "El enduro es el motociclismo fuera del asfalto llevado a su forma más exigente: terreno difícil, tramos largos y una moto construida para eso y para poco más.",
    target: {
      keyword: "moto enduro / motos enduro",
      volume: "800 + 600/mes",
      note: "buscar 'enduro' solo trae bicicletas y relojes; el término útil es 'moto enduro'",
    },
    sections: [
      {
        heading: "Enduro, motocross y doble propósito no son lo mismo",
        body: [
          "El **motocross** se corre en circuito cerrado, con saltos y vueltas cortas. La moto está optimizada para eso: potencia explosiva y autonomía mínima.",
          "El **enduro** se corre en terreno abierto y tramos largos, muchas veces cronometrados por secciones. La moto necesita ser manejable a baja velocidad, aguantar horas y meterse donde no hay camino. El hard enduro es la versión extrema: obstáculos que se suben casi a pulso.",
          "La **doble propósito** es la prima homologada para calle: comparte la postura y el espíritu, pero está pensada para convivir con el uso diario. Si quieres una moto para ir al trabajo, esa es la categoría, no el enduro.",
        ],
      },
      {
        heading: "Qué necesitas para empezar",
        body: [
          "Una moto de enduro de cilindrada de entrada, que perdona errores y no te va a arrancar el brazo en cada acelerada. El equipo no es opcional: casco de cross con goggles, botas de enduro que protegen el tobillo, guantes, coderas, rodilleras y peto. Las botas son la pieza donde no conviene ahorrar.",
          "Y lo más importante: un lugar donde rodar. Antes de comprar, averigua qué pistas o terrenos hay cerca de ti y si se puede rodar legalmente ahí. Mucha gente compra la moto primero y descubre después que no tiene dónde usarla.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Puedo usar una moto de enduro en la calle?",
        a: "Solo si el modelo está homologado para calle y lo registras. Muchas motos de enduro puras no lo están, y ahí lo que buscas es una doble propósito.",
      },
      {
        q: "¿Qué cilindrada conviene para empezar?",
        a: "Las de entrada. En enduro el terreno te frena, no la potencia: una moto más chica y manejable te deja aprender técnica en vez de pelearte con la moto.",
      },
    ],
  },
];

export const hubBySlug = (slug?: string): Hub | undefined =>
  HUBS.find((h) => h.slug === slug);
