/**
 * Catálogo de direcciones predefinidas y depósito central para LogiRed (CABA).
 * Permite autocompletar coordenadas fijas y trazar recorridos aproximados
 * realistas sin depender de APIs de mapas externas (evita rate limits y mantiene resiliencia).
 */

export const DEPOSITO_BARRACAS = {
  id: 0,
  nombre: "Depósito Central Barracas",
  direccion: "Av. Iriarte 3500, CABA",
  barrio: "Barracas",
  latitud: -34.6462,
  longitud: -58.3858,
};

export const DIRECCIONES_PREDEFINIDAS = [
  {
    id: 1,
    direccion: "Florida 570",
    barrio: "Microcentro",
    direccionCompleta: "Florida 570, Microcentro, CABA",
    latitud: -34.6025,
    longitud: -58.3755,
    // Trayectoria realista saliendo de Barracas por Montes de Oca / 9 de Julio hacia Microcentro
    rutaAproximada: [
      [-34.6462, -58.3858], // Depósito Barracas (Iriarte 3500)
      [-34.6360, -58.3800], // Av. Montes de Oca y Martín García
      [-34.6270, -58.3805], // Av. 9 de Julio Sur (Constitución)
      [-34.6130, -58.3780], // Av. 9 de Julio y Av. Belgrano
      [-34.6060, -58.3750], // Av. Diagonal Norte y San Martín
      [-34.6025, -58.3755], // Florida 570 (Destino)
    ],
  },
  {
    id: 2,
    direccion: "Av. Corrientes 992",
    barrio: "San Nicolás (Obelisco)",
    direccionCompleta: "Av. Corrientes 992, San Nicolás (Obelisco), CABA",
    latitud: -34.6037,
    longitud: -58.3816,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6350, -58.3810],
      [-34.6240, -58.3820], // 9 de Julio Sur
      [-34.6110, -58.3820], // 9 de Julio y Av. de Mayo
      [-34.6037, -58.3816], // Av. Corrientes 992 (Obelisco)
    ],
  },
  {
    id: 3,
    direccion: "Av. Córdoba 1765",
    barrio: "Barrio Norte",
    direccionCompleta: "Av. Córdoba 1765, Barrio Norte, CABA",
    latitud: -34.5982,
    longitud: -58.3937,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6340, -58.3810],
      [-34.6210, -58.3830],
      [-34.6120, -58.3890], // Av. Entre Ríos / Callao
      [-34.6040, -58.3920], // Av. Callao y Viamonte
      [-34.5982, -58.3937], // Av. Córdoba 1765 (Destino)
    ],
  },
  {
    id: 4,
    direccion: "Av. Santa Fe 2468",
    barrio: "Recoleta",
    direccionCompleta: "Av. Santa Fe 2468, Recoleta, CABA",
    latitud: -34.5947,
    longitud: -58.4018,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6320, -58.3820],
      [-34.6170, -58.3870],
      [-34.6060, -58.3960], // Av. Callao y Av. Santa Fe
      [-34.5990, -58.3995], // Av. Santa Fe y Larrea
      [-34.5947, -58.4018], // Av. Santa Fe 2468 (Destino)
    ],
  },
  {
    id: 5,
    direccion: "Av. Alicia Moreau de Justo 1190",
    barrio: "Puerto Madero",
    direccionCompleta: "Av. Alicia Moreau de Justo 1190, Puerto Madero, CABA",
    latitud: -34.6133,
    longitud: -58.3656,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6370, -58.3710], // Parque Lezama / Paseo Colón
      [-34.6260, -58.3670], // Av. Paseo Colón e Independencia
      [-34.6180, -58.3650], // Av. Belgrano y Alicia Moreau de Justo
      [-34.6133, -58.3656], // Puerto Madero Dique 2 (Destino)
    ],
  },
  {
    id: 6,
    direccion: "Av. Corrientes 1650",
    barrio: "San Nicolás",
    direccionCompleta: "Av. Corrientes 1650, San Nicolás, CABA",
    latitud: -34.6047,
    longitud: -58.3915,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6330, -58.3815],
      [-34.6200, -58.3840],
      [-34.6110, -58.3880], // Av. Entre Ríos y Corrientes
      [-34.6047, -58.3915], // Av. Corrientes 1650 (Destino)
    ],
  },
  {
    id: 7,
    direccion: "Av. Cabildo 2254",
    barrio: "Belgrano",
    direccionCompleta: "Av. Cabildo 2254, Belgrano, CABA",
    latitud: -34.5617,
    longitud: -58.4564,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6260, -58.3830],
      [-34.6050, -58.3970], // 9 de Julio / Santa Fe
      [-34.5820, -58.4200], // Plaza Italia / Pacífico
      [-34.5710, -58.4410], // Av. Cabildo y Olleros
      [-34.5617, -58.4564], // Av. Cabildo 2254 (Destino)
    ],
  },
  {
    id: 8,
    direccion: "Av. Santa Fe 4280",
    barrio: "Palermo",
    direccionCompleta: "Av. Santa Fe 4280, Palermo, CABA",
    latitud: -34.5802,
    longitud: -58.4215,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6270, -58.3830],
      [-34.6060, -58.3970],
      [-34.5930, -58.4060], // Santa Fe y Cnel. Díaz
      [-34.5802, -58.4215], // Plaza Italia / Av. Santa Fe 4280 (Destino)
    ],
  },
  {
    id: 9,
    direccion: "Av. Federico Lacroze 3496",
    barrio: "Colegiales",
    direccionCompleta: "Av. Federico Lacroze 3496, Colegiales, CABA",
    latitud: -34.5818,
    longitud: -58.4513,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6280, -58.3850],
      [-34.6100, -58.4020], // Corrientes / Almagro
      [-34.5940, -58.4270], // Corrientes y Dorrego (Chacarita)
      [-34.5870, -58.4420], // Av. Álvarez Thomas y Lacroze
      [-34.5818, -58.4513], // Av. Federico Lacroze 3496 (Destino)
    ],
  },
  {
    id: 10,
    direccion: "Av. Elcano 3240",
    barrio: "Colegiales",
    direccionCompleta: "Av. Elcano 3240, Colegiales, CABA",
    latitud: -34.5779,
    longitud: -58.4589,
    rutaAproximada: [
      [-34.6462, -58.3858],
      [-34.6280, -58.3850],
      [-34.6100, -58.4020],
      [-34.5940, -58.4270],
      [-34.5840, -58.4460], // Av. Forest y Elcano
      [-34.5779, -58.4589], // Av. Elcano 3240 (Destino)
    ],
  },
];

/**
 * Normaliza un texto para búsqueda tolerante (sin tildes, minúsculas, sin puntuación).
 */
export const normalizarTexto = (texto = "") => String(texto)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

/**
 * Busca si un texto de dirección coincide con alguno de los 10 puntos de CABA.
 */
export const buscarCoordenadasPorDireccion = (direccionTexto = "") => {
  if (!direccionTexto) return null;
  const textoNorm = normalizarTexto(direccionTexto);

  // 1. Coincidencia exacta por número de altura si la calle coincide
  for (const item of DIRECCIONES_PREDEFINIDAS) {
    const calleNorm = normalizarTexto(item.direccion);
    const barrioNorm = normalizarTexto(item.barrio);

    // Extraer número de altura de la dirección predefinida (ej: "3496", "570")
    const matchNumero = item.direccion.match(/\d+/);
    const numero = matchNumero ? matchNumero[0] : "";

    const tieneCalle = calleNorm.split(" ").filter((p) => p.length > 2).some((p) => textoNorm.includes(p));
    const tieneNumero = numero ? textoNorm.includes(numero) : false;
    const tieneBarrio = barrioNorm.split(" ").filter((p) => p.length > 3).some((p) => textoNorm.includes(p));

    if ((tieneCalle && tieneNumero) || (tieneCalle && tieneBarrio)) {
      return item;
    }
  }

  // 2. Coincidencia secundaria si contiene nombre representativo
  for (const item of DIRECCIONES_PREDEFINIDAS) {
    if (textoNorm.includes(normalizarTexto(item.direccion))) {
      return item;
    }
  }

  return null;
};

/**
 * Genera una serie de coordenadas que representan un recorrido urbano realista
 * entre un origen y un destino, sin utilizar APIs externas.
 */
export const generarTrayectoriaAproximada = (origen, destino, direccionTexto = "") => {
  if (!origen || !destino) return [];
  const [latOrig, lonOrig] = origen;
  const [latDest, lonDest] = destino;

  // Si coincide con alguna de las 10 rutas fijas, devolvemos la ruta calibrada
  const coincidencia = buscarCoordenadasPorDireccion(direccionTexto);
  if (coincidencia?.rutaAproximada) {
    return coincidencia.rutaAproximada;
  }

  // Si las coordenadas de destino coinciden con alguno de los 10 puntos (tolerancia 0.005)
  const itemPorCoordenadas = DIRECCIONES_PREDEFINIDAS.find((item) => (
    Math.abs(item.latitud - latDest) < 0.005
    && Math.abs(item.longitud - lonDest) < 0.005
  ));
  if (itemPorCoordenadas?.rutaAproximada) {
    return itemPorCoordenadas.rutaAproximada;
  }

  // Generación algorítmica de ruta urbana (recorrido en arterias perpendiculares con curvas suaves)
  const puntos = [origen];
  const pasos = 6;
  const deltaLat = latDest - latOrig;
  const deltaLon = lonDest - lonOrig;

  // Simulación de cuadrícula porteña: avance inicial norte/sur, giro por avenida, avance este/oeste
  for (let i = 1; i < pasos; i += 1) {
    const t = i / pasos;
    // Función de transición suave (Sigmoide / S-curve) para simular giros en esquinas principales
    const factorS = 3 * t ** 2 - 2 * t ** 3;
    // Desvío leve para que no sea una línea geométrica pura sino un trazado de avenidas
    const desvioOndulacion = Math.sin(t * Math.PI) * 0.0025;

    const latPunto = latOrig + deltaLat * factorS + desvioOndulacion * 0.3;
    const lonPunto = lonOrig + deltaLon * t + desvioOndulacion;
    puntos.push([latPunto, lonPunto]);
  }

  puntos.push(destino);
  return puntos;
};
