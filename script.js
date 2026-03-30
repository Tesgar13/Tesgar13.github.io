const fechaObjetivo = new Date("2029-01-11T23:59:00");
const TIMELINE_KEY = "timelineEntries";
const ASSET_MAP_KEY = "firebaseAssetMap";
const MOCK_SLOTS = 10;
let songActualIndex = -1;
let turntablePlaying = false;
let planLibraryState = [];
let memoryLibraryState = [];
let songLibraryState = [];
let audioPlayer = null;
let audioObjectUrl = "";
const PORTADA_DESTACADA_ID = "memory:fotofav";
const DEFAULT_MEMORY_NOTE = "Escribe aqui una frase vuestra.";
const DEFAULT_MEMORY_DESCRIPTION = "Pon aqui una Descripción pequena que luego cambiaras.";
const DEFAULT_SONG_NOTE = "Escribe aqui por que esta canción es vuestra.";
const DEBUG_PLAN_RESET_KEY = "debugPlanResetDone";
const TIMELINE_SEED = [
  { id: "seed:dedo", type: "seed", date: "2023-03-07", title: "", note: "", description: "", image: "img/dedo.jpeg" },
  { id: "seed:nohablo", type: "seed", date: "2023-05-03", title: "", note: "", description: "", image: "img/NoHablo.jpeg" },
  { id: "seed:estudiando", type: "seed", date: "2023-06-20", title: "", note: "", description: "", image: "img/estudiando.jpeg" },
  { id: "seed:cafe", type: "seed", date: "2023-09-21", title: "", note: "", description: "", image: "img/cafe.jpeg" },
  { id: "seed:bano", type: "seed", date: "2023-09-26", title: "", note: "", description: "", image: "img/baño.jpeg" },
  { id: "seed:labo", type: "seed", date: "2023-10-06", title: "", note: "", description: "", image: "img/labo.jpeg" },
  { id: "seed:biblioteca", type: "seed", date: "2023-10-27", title: "", note: "", description: "", image: "img/biblioteca.jpeg" },
  { id: "seed:code1", type: "seed", date: "2023-11-22", title: "", note: "", description: "", image: "img/code1.jpeg" },
  { id: "seed:gemes", type: "seed", date: "2023-11-24", title: "", note: "", description: "", image: "img/gemes.jpeg" },
  { id: "seed:cono", type: "seed", date: "2023-12-23", title: "", note: "", description: "", image: "img/cono.jpeg" },
  { id: "seed:imaginaria", type: "seed", date: "2024-01-28", title: "", note: "", description: "", image: "img/imaginaria.jpeg" },
  { id: "seed:fondo", type: "seed", date: "2024-02-07", title: "", note: "", description: "", image: "img/fondo.jpeg" },
  { id: "seed:rosa", type: "seed", date: "2024-03-10", title: "", note: "", description: "", image: "img/rosa.jpeg" },
  { id: "seed:nopuc", type: "seed", date: "2024-04-23", title: "", note: "", description: "", image: "img/nopuc.jpeg" },
  { id: PORTADA_DESTACADA_ID, type: "seed", date: "2024-04-27", title: "", note: "", description: "", image: "img/fotofav.jpeg" }
];
const PLAN_SEED = [
  { id: "plan1", number: 1, slug: "plan1", title: "Donde todo empezó", frontText: "¿Recuerdas dónde fue nuestra primera comida juntos?", backText: "Nuestra primera comida juntos, aunque no fue todo lo bien que podía ir. Esta vez prometo no parecer raro y no comer nada, ya no voy a estar nervioso (espero jjj).", metaLabel: "Pista", metaText: "Uno de tus sitios de hamburguesas favoritos.", status: "pendiente", active: true, visible: true, order: 1, imagePath: "img/GH.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." },
  { id: "plan2", number: 2, slug: "plan2", title: "¿Hay sitio para aparcar?", frontText: "Uno de tus sitios favoritos, primera vez cenando juntos, ¿donde sera?", backText: "Yo habia salido de entrenar, fui a STZ y mi mayor preocupacion era dónde aparcar (no había tantos sitios como decías).", metaLabel: "Promesa", metaText: "Esta vez no me preocupare por aparcar (me vienes a buscar).", status: "pendiente", active: true, visible: true, order: 2, imagePath: "img/Marias.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." },
  { id: "plan3", number: 3, slug: "plan3", title: "¿Comida de viejas o de Naroa?", frontText: "Ummm... que puede ser?", backText: "Ya sean del Mercadona, de bote, de la uni, de tu ama, de un restaurante, con curry... de cualquier manera estan buenas.", metaLabel: "Problema", metaText: "Nunca las hemos comido juntos, si tú tenías lentejas, yo tenía otra cosa, NO PUEDE SER ESO.", status: "pendiente", active: true, visible: true, order: 3, imagePath: "img/Lentejas.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." },
  { id: "plan4", number: 4, slug: "plan4", title: "Solo para darle sabor", frontText: "Una de las cosas que más veces hemos comido, en uno de los sitios donde mas hemos estado.", backText: "Un clásico, bocadillo de jamon CON pimiento, aunque después me lo comía yo. Cuantas veces lo habremos hecho, aunque a veces no daba ni tiempo a comerlo...", metaLabel: "Plan", metaText: "Comernos un bocadillito juntos aunque no tiene por que ser donde siempre, pero si con la de siempre.", status: "pendiente", active: true, visible: true, order: 4, imagePath: "img/Jamon.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." },
  { id: "plan5", number: 5, slug: "plan5", title: "¿Paso con el coche y comemos?", frontText: "Pausa para comer, llevo comida, un paseo.", backText: "Una Naroa no tan jefa como ahora, salio a comer con un chico que le llevo la comida.", metaLabel: "Plan", metaText: "CBO, en el coche, en la calle o donde sea.", status: "pendiente", active: true, visible: true, order: 5, imagePath: "img/MCD.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." },
  { id: "plan6", number: 6, slug: "plan6", title: "En que momento dije que pagaba yo...", frontText: "De los mejores desayunos, pero mi tarjeta sigue sufriendo.", backText: "TOP desayunos de mi vida, pero en que momento dije que pagaba yo. Es bromiii contigo no me importa arruinarme jjj", metaLabel: "Plan", metaText: "Desayunito rico donde sea, con jamon obviamente y zumo jjj.", status: "pendiente", active: true, visible: true, order: 6, imagePath: "img/Desayuno.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." },
  { id: "plan7", number: 7, slug: "plan7", title: "¿Te apetece una hamburguesa?", frontText: "Cuántas veces hemos comido hamburguesas juntos... y en que sitios tan ricos.", backText: "No podía faltar una parada en la rutita para comer hamburguesas (la primera no cuenta). Take a Buey, Champions Burger, Aitaren...", metaLabel: "Propuesta", metaText: "Hamburguesa en un sitio rico, el que quieras, hayamos comido ya o no. ¿Aceptas?.", status: "pendiente", active: true, visible: true, order: 7, imagePath: "img/Hamburguesa.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." },
  { id: "plan8", number: 8, slug: "plan8", title: "Unas aceitunas", frontText: "Aceitunas, vinito, algun juego y la mejor compañía. ¿Que mas se puede pedir?", backText: "De los mejores planes juntos, vinito y aceitunas, no se puede anadir nada mas.", metaLabel: "Plan", metaText: "Unas aceitunitas ricas con la mejor compañía.", status: "pendiente", active: true, visible: true, order: 8, imagePath: "img/Aceitunas.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." },
  { id: "plan9", number: 9, slug: "plan9", title: "COCINO YO", frontText: "Ahora me toca a mi.", backText: "COMO PUEDE SER QUE YO NUNCA TE HAYA COCINADO?????. Tu me hiciste una hamburguesa muuuy rica, pero yo a ti nunca nada como puede ser eso???", metaLabel: "Pista", metaText: "Tengo ya algo en mente, lo hemos comido muchas veces.", status: "pendiente", active: true, visible: true, order: 9, imagePath: "img/Cocina.jpg", message: "Para completarlo, sube una foto y guarda el recuerdo." }
];
const MEMORY_SEED = TIMELINE_SEED.map((entry, index) => ({
  id: entry.id === "seed:fotofav" ? PORTADA_DESTACADA_ID : entry.id.replace("seed:", "memory:"),
  type: entry.type,
  date: entry.date,
  title: entry.title,
  note: entry.note,
  description: entry.description,
  imagePath: entry.image,
  visible: true,
  order: index + 1
}));
const LETTERS = [
  {
    id: "letter1",
    unlockAt: 3,
    title: "La primera carta",
    preview: "Se abre cuando la ruta ya empieza a sentirse vuestra.",
    message: "Si has llegado hasta aqui, esta ruta ya no es una idea bonita: ya es una coleccion de momentos reales contigo. Cada parada suma, pero lo mejor sigue siendo que todas son a tu lado."
  },
  {
    id: "letter2",
    unlockAt: 6,
    title: "La carta del medio",
    preview: "A mitad del camino ya hay demasiadas cosas bonitas como para no dejarlo por escrito.",
    message: "Ya llevamos suficientes recuerdos como para saber que repetir contigo nunca se siente repetido. Da igual el sitio si al final lo importante es seguir construyendo algo tan nuestro."
  },
  {
    id: "letter3",
    unlockAt: 9,
    title: "La carta final",
    preview: "Solo aparece cuando la ruta ya esta completa.",
    message: "Terminamos esta ruta, pero no la historia. Lo bonito de llegar aqui es saber que siempre se puede empezar otra, con mas planes, mas fotos, mas canciónes y mas nosotros."
  }
];
const SONG_LIBRARY = [
  {
    id: "song-1",
    slot: 1,
    title: "Saturno",
    artist: "Pablo Alboran",
    note: "La que siempre parece llegar al sitio exacto, aunque la escuchemos en dias distintos.",
    coverImage: "img/fotofav.jpeg",
    audio: "",
    spotifyUrl: "",
    appleMusicUrl: ""
  },
  {
    id: "song-2",
    slot: 2,
    title: "Ojitos Lindos",
    artist: "Bad Bunny, Bomba Estereo",
    note: "Perfecta para dejar una foto bonita en el centro del vinilo y una nota vuestra debajo.",
    coverImage: "img/rosa.jpeg",
    audio: "",
    spotifyUrl: "",
    appleMusicUrl: ""
  },
  {
    id: "song-3",
    slot: 3,
    title: "Paris in the Rain",
    artist: "Lauv",
    note: "Sirve de ejemplo para una canción suave, intima y muy facil de reemplazar por la vuestra.",
    coverImage: "img/cafe.jpeg",
    audio: "",
    spotifyUrl: "",
    appleMusicUrl: ""
  },
  {
    id: "song-4",
    slot: 4,
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    note: "Deja aqui una razon pequena, personal y concreta para recordar por que se quedo con vosotros.",
    coverImage: "img/imaginaria.jpeg",
    audio: "",
    spotifyUrl: "",
    appleMusicUrl: ""
  }
];

const STATIC_IMAGE_PATHS = [
  "img/Entrada.png",
  "img/fotofav.jpeg",
  "img/GH.jpg",
  "img/Marias.jpg",
  "img/Lentejas.jpg",
  "img/MCD.jpg",
  "img/Desayuno.jpg",
  "img/Hamburguesa.jpg",
  "img/Aceitunas.jpg",
  "img/Jamon.jpg",
  "img/Cocina.jpg"
];
const ASSET_STORAGE_NAME_MAP = {
  "img/GH.jpg": "GH",
  "img/Marias.jpg": "Marias",
  "img/Lentejas.jpg": "Lentejas",
  "img/Hamburguesa.jpg": "Hamburguesa",
  "img/Desayuno.jpg": "Desayuno",
  "img/Aceitunas.jpg": "Aceitunas",
  "img/Jamon.jpg": "Jamon",
  "img/MCD.jpg": "MCD",
  "img/Cocina.jpg": "Cocina"
};
const MIGRATABLE_ASSET_PATHS = Array.from(new Set([
  ...STATIC_IMAGE_PATHS,
  ...TIMELINE_SEED.map((entry) => entry.image),
  ...PLAN_SEED.map((entry) => entry.imagePath),
  ...SONG_LIBRARY.map((entry) => entry.coverImage)
]));
let assetUrlMap = leerStorageRecord(ASSET_MAP_KEY);

function claveEstado(planId) {
  return `${planId}_estado`;
}

function claveFoto(planId) {
  return `${planId}_foto`;
}

function claveFecha(planId) {
  return `${planId}_fecha`;
}

function hoyIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatearFecha(valor) {
  if (!valor) {
    return "";
  }

  return new Date(`${valor}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function obtenerTextoRecuerdo(entry) {
  if (entry.note && entry.note.trim()) {
    return entry.note.trim();
  }

  if (entry.type === "manual" && entry.title && entry.title.trim()) {
    return entry.title.trim();
  }

  return DEFAULT_MEMORY_NOTE;
}

function obtenerDescripciónRecuerdo(entry) {
  if (entry.type !== "manual" && !(entry.note && entry.note.trim())) {
    return DEFAULT_MEMORY_DESCRIPTION;
  }

  if (entry.description && entry.description.trim()) {
    return entry.description.trim();
  }

  return DEFAULT_MEMORY_DESCRIPTION;
}

function obtenerAltRecuerdo(entry) {
  const texto = obtenerTextoRecuerdo(entry);
  return texto === DEFAULT_MEMORY_NOTE ? `Recuerdo del ${formatearFecha(entry.date)}` : texto;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizarcanción(song, fallbackIndex = 0) {
  const slotNumber = Number(song?.slot);
  const orderNumber = Number(song?.order || slotNumber || fallbackIndex + 1);

  return {
    id: song?.id || `song:${Date.now()}-${fallbackIndex}`,
    slot: Number.isFinite(slotNumber) && slotNumber > 0 ? slotNumber : fallbackIndex + 1,
    order: Number.isFinite(orderNumber) && orderNumber > 0 ? orderNumber : fallbackIndex + 1,
    title: song?.title || "",
    artist: song?.artist || "",
    note: song?.note || "",
    coverImage: song?.coverImage || song?.imagePath || song?.imageUrl || song?.image || "",
    audio: song?.audio || song?.audioUrl || song?.audioPath || "",
    spotifyUrl: song?.spotifyUrl || song?.spotifyLink || song?.link || "",
    appleMusicUrl: song?.appleMusicUrl || song?.appleLink || "",
    visible: song?.visible !== false,
    isCustom: Boolean(song?.isCustom)
  };
}

function ordenarcanciónes(canciónes) {
  return [...canciónes].sort((a, b) => {
    const porOrden = Number(a.order || 0) - Number(b.order || 0);
    if (porOrden !== 0) {
      return porOrden;
    }

    const porSlot = Number(a.slot || 0) - Number(b.slot || 0);
    if (porSlot !== 0) {
      return porSlot;
    }

    return a.title.localeCompare(b.title, "es");
  });
}

function inicializarBibliotecacanciónes() {
  songLibraryState = ordenarcanciónes(SONG_LIBRARY.map((song, index) => normalizarcanción(song, index)));
  if (songActualIndex >= songLibraryState.length) {
    songActualIndex = songLibraryState.length ? 0 : -1;
  }
}

function obtenerNúmeroHuecocanción(canciónes) {
  const maxSlot = canciónes.reduce((maximo, song) => Math.max(maximo, Number(song.slot || 0)), 0);
  return maxSlot + 1;
}

function obtenercanciónes() {
  if (!songLibraryState.length && SONG_LIBRARY.length) {
    inicializarBibliotecacanciónes();
  }

  return songLibraryState.filter((song) => song.visible !== false);
}

function normalizarPlan(plan, fallbackIndex = 0) {
  return {
    id: plan?.id || `plan${fallbackIndex + 1}`,
    number: Number(plan?.number || fallbackIndex + 1),
    slug: plan?.slug || plan?.id || `plan${fallbackIndex + 1}`,
    title: plan?.title || `Plan ${fallbackIndex + 1}`,
    frontText: plan?.frontText || "",
    backText: plan?.backText || "",
    metaLabel: plan?.metaLabel || "Pista",
    metaText: plan?.metaText || "",
    status: plan?.status || "pendiente",
    active: plan?.active !== false,
    visible: plan?.visible !== false,
    order: Number(plan?.order || fallbackIndex + 1),
    imagePath: plan?.imagePath || (typeof plan?.image === "string" && plan.image.startsWith("img/") ? plan.image : ""),
    imageUrl: plan?.imageUrl || (typeof plan?.image === "string" && !plan.image.startsWith("img/") ? plan.image : ""),
    message: plan?.message || "Para completarlo, sube una foto y guarda el recuerdo.",
    completionPhotoUrl: plan?.completionPhotoUrl || "",
    completionDate: plan?.completionDate || ""
  };
}

function normalizarRecuerdo(entry, fallbackIndex = 0) {
  const rawImage = entry?.image || "";
  const imagePath = entry?.imagePath || (typeof rawImage === "string" && rawImage.startsWith("img/") ? rawImage : "");
  const imageUrl = entry?.imageUrl || (typeof rawImage === "string" && !rawImage.startsWith("img/") ? rawImage : "");
  return {
    id: entry?.id || `memory:${Date.now()}-${fallbackIndex}`,
    type: entry?.type || "manual",
    planId: entry?.planId || "",
    date: entry?.date || hoyIso(),
    title: entry?.title || "",
    note: entry?.note || "",
    description: entry?.description || "",
    imagePath,
    imageUrl,
    image: imageUrl || imagePath,
    visible: entry?.visible !== false,
    order: Number(entry?.order || fallbackIndex + 1)
  };
}

function obtenerClaveUnicaRecuerdo(entry) {
  if (entry?.id) {
    return `id:${entry.id}`;
  }

  return [
    entry?.type || "manual",
    entry?.planId || "",
    entry?.date || "",
    entry?.title || "",
    entry?.note || "",
    entry?.imageUrl || entry?.imagePath || entry?.image || ""
  ].join("|");
}

function puntuarRecuerdo(entry) {
  let score = 0;

  if (entry?.imageUrl || entry?.imagePath || entry?.image) score += 8;
  if (entry?.description) score += 4;
  if (entry?.note) score += 3;
  if (entry?.title) score += 2;
  if (entry?.planId) score += 1;

  return score;
}

function deduplicarRecuerdos(entries) {
  const recuerdosPorClave = new Map();

  entries.forEach((entry, index) => {
    const normalizado = normalizarRecuerdo(entry, index);
    const clave = obtenerClaveUnicaRecuerdo(normalizado);
    const existente = recuerdosPorClave.get(clave);

    if (!existente) {
      recuerdosPorClave.set(clave, normalizado);
      return;
    }

    const candidato = {
      ...existente,
      ...normalizado,
      id: existente.id || normalizado.id,
      order: Math.min(
        Number.isFinite(existente.order) ? existente.order : Number.MAX_SAFE_INTEGER,
        Number.isFinite(normalizado.order) ? normalizado.order : Number.MAX_SAFE_INTEGER
      )
    };

    recuerdosPorClave.set(
      clave,
      puntuarRecuerdo(normalizado) >= puntuarRecuerdo(existente) ? candidato : existente
    );
  });

  return Array.from(recuerdosPorClave.values())
    .sort((a, b) => {
      const porFecha = new Date(b.date) - new Date(a.date);
      if (porFecha !== 0) {
        return porFecha;
      }

      return (a.order || 0) - (b.order || 0);
    })
    .map((entry, index) => ({
      ...entry,
      order: Number.isFinite(entry.order) && entry.order > 0 ? entry.order : index + 1
    }));
}

function obtenerPlanes() {
  return [...planLibraryState].filter((plan) => plan.visible !== false).sort((a, b) => a.order - b.order);
}

function obtenerTimeline() {
  return deduplicarRecuerdos(memoryLibraryState).filter((entry) => entry.visible !== false);
}

async function guardarcanciónEnFirestore(song) {
  if (!window.firebaseDb || !window.firebaseFns) {
    throw new Error("Firebase no esta cargado.");
  }

  const db = window.firebaseDb;
  const { collection, addDoc } = window.firebaseFns;

  await addDoc(collection(db, "songs"), {
    songId: song.id,
    slot: Number(song.slot || 0),
    title: song.title || "",
    artist: song.artist || "",
    note: song.note || "",
    coverImage: song.coverImage || "",
    audio: song.audio || "",
    spotifyUrl: song.spotifyUrl || "",
    appleMusicUrl: song.appleMusicUrl || "",
    createdAt: Date.now()
  });
}

async function cargarcanciónesFirestore() {
  if (!window.firebaseDb || !window.firebaseFns) {
    return;
  }

  const db = window.firebaseDb;
  const { collection, getDocs, query, orderBy } = window.firebaseFns;

  try {
    const snapshot = await getDocs(query(collection(db, "songs"), orderBy("createdAt", "desc")));
    const base = obtenercanciónes();
    const porId = new Map(base.map((song) => [song.id, song]));
    const idsRemotos = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const songId = data.songId || `song:${doc.id}`;
      idsRemotos.add(songId);

      if (porId.has(songId)) {
        return;
      }

      porId.set(songId, normalizarcanción({
        id: songId,
        slot: Number(data.slot || 0),
        title: data.title || "",
        artist: data.artist || "",
        note: data.note || "",
        coverImage: data.coverImage || "",
        audio: data.audio || "",
        spotifyUrl: data.spotifyUrl || "",
        appleMusicUrl: data.appleMusicUrl || "",
        isCustom: true
      }, porId.size));
    });

    await Promise.all(base
      .filter((song) => !idsRemotos.has(song.id))
      .map((song) => guardarcanciónEnFirestore(song).catch((error) => {
        console.error(`No se pudo respaldar la canción ${song.title} en Firestore.`, error);
      })));

    songLibraryState = ordenarcanciónes(Array.from(porId.values()));
  } catch (error) {
    console.error("No se pudieron cargar las canciónes desde Firestore.", error);
  }
}

function resolveSongCover(song) {
  return resolveImageUrl(song?.coverImage || song?.image || "");
}

function resolveSongAudio(song) {
  return song?.audio || "";
}

function inferAudioMimeType(audioUrl) {
  const normalizedUrl = String(audioUrl || "").toLowerCase();

  if (normalizedUrl.endsWith(".mp3")) {
    return "audio/mpeg";
  }

  if (normalizedUrl.endsWith(".wav")) {
    return "audio/wav";
  }

  if (normalizedUrl.endsWith(".ogg")) {
    return "audio/ogg";
  }

  if (normalizedUrl.endsWith(".m4a")) {
    return "audio/mp4";
  }

  return "";
}

function liberarAudioTemporal() {
  if (!audioObjectUrl) {
    return;
  }

  URL.revokeObjectURL(audioObjectUrl);
  audioObjectUrl = "";
}

async function prepararFuenteAudio(audioUrl) {
  if (!audioUrl || audioUrl.startsWith("blob:") || audioUrl.startsWith("data:")) {
    return audioUrl;
  }

  try {
    const resolvedUrl = new URL(audioUrl, window.location.href);
    if (resolvedUrl.origin !== window.location.origin) {
      return audioUrl;
    }
  } catch (error) {
    return audioUrl;
  }

  try {
    const response = await fetch(audioUrl, {
      method: "GET",
      mode: "cors",
      credentials: "omit"
    });

    if (!response.ok) {
      throw new Error(`No se pudo descargar el audio (${response.status}).`);
    }

    const audioBlob = await response.blob();
    const mimeType = audioBlob.type || inferAudioMimeType(audioUrl) || "audio/mpeg";
    const playableBlob = audioBlob.type === mimeType
      ? audioBlob
      : new Blob([audioBlob], { type: mimeType });

    liberarAudioTemporal();
    audioObjectUrl = URL.createObjectURL(playableBlob);
    return audioObjectUrl;
  } catch (error) {
    console.warn(`No se pudo normalizar el audio antes de reproducirlo. Se intentara usar la URL original: ${audioUrl}`, error);
    return audioUrl;
  }
}

function renderizarDiscocanción(song) {
  const cover = resolveSongCover(song);
  const alt = song?.title ? `Portada de ${song.title}` : "Portada de la canción";

  if (cover) {
    return `
      <div class="song-item__record-label">
        <img src="${cover}" alt="${escapeHtml(alt)}" />
      </div>
      <div class="song-item__record-hole" aria-hidden="true"></div>
    `;
  }

  return `
    <div class="song-item__record-label song-item__record-label--fallback">
      <span>${escapeHtml(song?.title || "Tu foto")}</span>
      <small>${escapeHtml(song?.artist || "Portada")}</small>
    </div>
    <div class="song-item__record-hole" aria-hidden="true"></div>
  `;
}

function mensajeDetrasDeRecuerdo(entry) {
  const Descripción = obtenerDescripciónRecuerdo(entry);

  if (entry.type === "plan") {
    return Descripción === DEFAULT_MEMORY_DESCRIPTION
      ? "Esta parada ya forma parte de vuestra ruta. Aqui puedes escribir lo que os guardo esta foto."
      : Descripción;
  }

  return Descripción;
}

function leerStorageJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

function leerStorageRecord(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch (error) {
    return {};
  }
}

function escribirStorageJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function guardarAssetMap(map) {
  assetUrlMap = map;
  localStorage.setItem(ASSET_MAP_KEY, JSON.stringify(map));
}

function resolveImageUrl(path) {
  if (!path || !path.startsWith("img/")) {
    return path;
  }

  return assetUrlMap[path] || path;
}

function resolveStorageAssetUrl(path) {
  if (!path || !path.startsWith("img/")) {
    return "";
  }

  return assetUrlMap[path] || "";
}

async function resolverStoragePath(path, kind = "archivo") {
  if (!path) {
    return path;
  }

  const normalizedPath = String(path).trim();
  if (!normalizedPath) {
    return "";
  }

  if (
    normalizedPath.startsWith("img/")
    || /^https?:/i.test(normalizedPath)
    || normalizedPath.startsWith("data:")
    || normalizedPath.startsWith("blob:")
  ) {
    return normalizedPath;
  }

  if (/^gs:\/\//i.test(normalizedPath)) {
    if (!window.firebaseStorage || !window.firebaseFns) {
      return "";
    }

    try {
      const { ref, getDownloadURL } = window.firebaseFns;
      return await getDownloadURL(ref(window.firebaseStorage, normalizedPath));
    } catch (error) {
      console.error(`No se pudo resolver ${kind} desde Firebase Storage: ${normalizedPath}`, error);
      return "";
    }
  }

  const cleanedPath = normalizedPath.replace(/^\/+/, "");
  if (cleanedPath.startsWith("img/")) {
    return cleanedPath;
  }

  if (!window.firebaseStorage || !window.firebaseFns) {
    return cleanedPath;
  }

  try {
    const { ref, getDownloadURL } = window.firebaseFns;
    return await getDownloadURL(ref(window.firebaseStorage, cleanedPath));
  } catch (error) {
    console.error(`No se pudo resolver ${kind} desde Firebase Storage: ${cleanedPath}`, error);
    return "";
  }
}

function aplicarAssetsRemotosAlDom() {
  const root = document.documentElement;
  root.style.setProperty("--entrada-image", `url("${resolveImageUrl("img/Entrada.png")}")`);
  root.style.setProperty("--hero-featured-image", `url("${resolveImageUrl("img/fotofav.jpeg")}")`);

  document.querySelectorAll("img[data-asset-path]").forEach((image) => {
    const originalPath = image.dataset.assetPath;

    if (!originalPath || !originalPath.startsWith("img/")) {
      return;
    }

    const remoteUrl = resolveStorageAssetUrl(originalPath);

    if (remoteUrl) {
      image.src = remoteUrl;
    }
  });

  document.querySelectorAll("img:not([data-asset-path])").forEach((image) => {
    const originalPath = image.getAttribute("src");

    if (!originalPath || !originalPath.startsWith("img/")) {
      return;
    }

    const remoteUrl = resolveImageUrl(originalPath);
    if (remoteUrl) {
      image.src = remoteUrl;
    }
  });
}

function sincronizarTimelineSemilla() {
  const existentes = leerStorageJson(TIMELINE_KEY);
  const ids = new Set(existentes.map((entry) => entry.id));
  const combinadas = [...existentes];
  let cambio = false;

  TIMELINE_SEED.forEach((entry) => {
    if (!ids.has(entry.id)) {
      combinadas.push({ ...entry });
      cambio = true;
    }
  });

  combinadas.forEach((entry) => {
    if (entry.id === "seed:bano" && entry.image !== "img/baño.jpeg") {
      entry.image = "img/baño.jpeg";
      cambio = true;
    }
  });

  if (cambio) {
    escribirStorageJson(TIMELINE_KEY, combinadas);
  }

  return cambio ? combinadas : existentes;
}

function obtenerTimeline() {
  return sincronizarTimelineSemilla();
}

function guardarTimeline(entries) {
  escribirStorageJson(TIMELINE_KEY, entries);
}

async function guardarRecuerdoEnFirestore(entry, fileName = "") {
  if (!window.firebaseDb || !window.firebaseFns) {
    return;
  }

  const db = window.firebaseDb;
  const { collection, addDoc } = window.firebaseFns;

  await addDoc(collection(db, "recuerdos"), {
    entryId: entry.id,
    planId: entry.planId || "",
    type: entry.type || "manual",
    date: entry.date || hoyIso(),
    title: entry.title || "",
    note: entry.note || "",
    description: entry.description || "",
    url: entry.image || "",
    image: entry.image || "",
    createdAt: Date.now(),
    name: fileName
  });
}

function sincronizarEstadosDePlanesDesdeTimeline() {
  const entradas = obtenerTimeline();

  planes.forEach((planId) => {
    const entry = entradas.find((item) => item.id === `plan:${planId}` && item.image);

    if (!entry) {
      return;
    }

    localStorage.setItem(claveEstado(planId), "completado");
    localStorage.setItem(claveFoto(planId), entry.image);
    localStorage.setItem(claveFecha(planId), entry.date || hoyIso());
  });
}

function storagePathsDesdeAssetLocal(assetPath) {
  const originalName = assetPath.split("/").pop() || "";
  const mappedName = ASSET_STORAGE_NAME_MAP[assetPath] || "";
  const stem = originalName.replace(/\.[^.]+$/, "");
  const relativePath = assetPath.replace(/^\.?\/*/, "");
  const relativeWithoutImg = relativePath.replace(/^img\//i, "");
  const candidates = Array.from(new Set([
    `assets/${relativePath}`,
    `assets/${relativeWithoutImg}`,
    relativePath,
    relativeWithoutImg,
    mappedName,
    originalName,
    stem,
    `${stem}.jpg`,
    `${stem}.jpeg`,
    `${stem}.png`,
    `${mappedName}.jpg`,
    `${mappedName}.jpeg`,
    `${mappedName}.png`
  ].filter(Boolean)));

  return candidates.map((candidate) => (
    candidate.startsWith("assets/") || candidate.startsWith("img/") ? candidate : `assets/${candidate}`
  ));
}

function recogerAssetPathsDelDom() {
  return Array.from(document.querySelectorAll("img[data-asset-path]"))
    .map((image) => image.dataset.assetPath || "")
    .filter((assetPath) => assetPath.startsWith("img/"));
}

function obtenerAssetPathsAResolver() {
  return Array.from(new Set([
    ...MIGRATABLE_ASSET_PATHS,
    ...recogerAssetPathsDelDom()
  ]));
}

async function cargarAssetsDesdeStorage() {
  if (!window.firebaseStorage || !window.firebaseFns) {
    aplicarAssetsRemotosAlDom();
    return;
  }

  const { ref, getDownloadURL } = window.firebaseFns;
  const storage = window.firebaseStorage;
  const nextMap = { ...assetUrlMap };

  await Promise.all(obtenerAssetPathsAResolver().map(async (assetPath) => {
    const candidatePaths = storagePathsDesdeAssetLocal(assetPath);

    for (const candidatePath of candidatePaths) {
      try {
        const remoteUrl = await getDownloadURL(ref(storage, candidatePath));
        nextMap[assetPath] = remoteUrl;
        return;
      } catch (error) {
        // Probamos la siguiente variante del nombre antes de descartarlo.
      }
    }

    console.error(`No se pudo cargar ${assetPath} desde Firebase Storage. Rutas probadas: ${candidatePaths.join(", ")}`);
  }));

  guardarAssetMap(nextMap);
  aplicarAssetsRemotosAlDom();
}

async function cargarRecuerdosFirestore() {
  if (!window.firebaseDb || !window.firebaseFns) {
    return;
  }

  const db = window.firebaseDb;
  const { collection, getDocs, query, orderBy } = window.firebaseFns;

  try {
    const snapshot = await getDocs(query(collection(db, "recuerdos"), orderBy("createdAt", "desc")));
    const locales = obtenerTimeline();
    const porId = new Map(locales.map((entry) => [entry.id, entry]));

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (!data.url) {
        return;
      }

      const entryId = data.entryId || `firebase:${doc.id}`;
      const existente = porId.get(entryId) || {};
      const existenteCreatedAt = Number(existente.createdAt || 0);
      const actualCreatedAt = Number(data.createdAt || 0);

      if (existente.id && existenteCreatedAt > actualCreatedAt) {
        return;
      }

      porId.set(entryId, {
        ...existente,
        id: entryId,
        type: data.type || existente.type || "manual",
        planId: data.planId || existente.planId || "",
        date: data.date || existente.date || hoyIso(),
        title: data.title || existente.title || "",
        note: data.note || existente.note || data.title || "",
        description: data.description || existente.description || "",
        image: data.url,
        createdAt: actualCreatedAt
      });
    });

    guardarTimeline(Array.from(porId.values()));
    sincronizarEstadosDePlanesDesdeTimeline();
  } catch (error) {
    console.error("Error cargando recuerdos:", error);
  }
}

async function guardarEstadoPlanEnFirestore(planId, status, extra = {}) {
  if (!window.firebaseDb || !window.firebaseFns) {
    return;
  }

  const db = window.firebaseDb;
  const { collection, addDoc } = window.firebaseFns;

  await addDoc(collection(db, "planStates"), {
    planId,
    status,
    photoUrl: extra.photoUrl || "",
    date: extra.date || "",
    createdAt: Date.now()
  });
}

async function cargarEstadosPlanesFirestore() {
  if (!window.firebaseDb || !window.firebaseFns) {
    return;
  }

  const db = window.firebaseDb;
  const { collection, getDocs, query, orderBy } = window.firebaseFns;

  try {
    const snapshot = await getDocs(query(collection(db, "planStates"), orderBy("createdAt", "desc")));
    const latestByPlan = new Map();

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (!data.planId || latestByPlan.has(data.planId)) {
        return;
      }

      latestByPlan.set(data.planId, data);
    });

    latestByPlan.forEach((data, planId) => {
      if (data.status === "completado") {
        localStorage.setItem(claveEstado(planId), "completado");
        if (data.photoUrl) {
          localStorage.setItem(claveFoto(planId), data.photoUrl);
        }
        if (data.date) {
          localStorage.setItem(claveFecha(planId), data.date);
        }
        return;
      }

      if (data.status === "activado" && localStorage.getItem(claveEstado(planId)) !== "completado") {
        localStorage.setItem(claveEstado(planId), "activado");
      }
    });
  } catch (error) {
    console.error("Error cargando estados de planes:", error);
  }
}

function limpiarPlanesActivadosDePrueba() {
  if (localStorage.getItem(DEBUG_PLAN_RESET_KEY) === "true") {
    return;
  }

  planes.forEach((planId) => {
    if (localStorage.getItem(claveEstado(planId)) === "activado") {
      localStorage.removeItem(claveEstado(planId));
    }
  });

  localStorage.setItem(DEBUG_PLAN_RESET_KEY, "true");
}

function barajar(array) {
  const copia = [...array];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
}

function leerArchivoComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

async function subirArchivoAFirebase(file, folder, typePrefix, validationMessage) {
  if (!file || !file.type.startsWith(typePrefix)) {
    throw new Error(validationMessage);
  }

  if (!window.firebaseStorage || !window.firebaseFns) {
    throw new Error("Firebase no esta cargado.");
  }

  const { ref, uploadBytes, getDownloadURL } = window.firebaseFns;
  const storage = window.firebaseStorage;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${Date.now()}-${safeName}`;
  const fileRef = ref(storage, `${folder}/${fileName}`);

  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

async function subirImagenAFirebase(file, folder = "recuerdos") {
  return subirArchivoAFirebase(file, folder, "image/", "El archivo debe ser una imagen.");
}

async function subirAudioAFirebase(file, folder = "musica/audios") {
  return subirArchivoAFirebase(file, folder, "audio/", "El archivo debe ser un audio.");
}

function esperarAuthFirebase() {
  return new Promise((resolve) => {
    if (!window.firebaseAuth || !window.firebaseFns?.onAuthStateChanged) {
      resolve(null);
      return;
    }

    const unsubscribe = window.firebaseFns.onAuthStateChanged(window.firebaseAuth, (user) => {
      unsubscribe();
      resolve(user || null);
    });
  });
}

function actualizarCountdown() {
  const diasEl = document.getElementById("dias");
  const horasEl = document.getElementById("horas");
  const minutosEl = document.getElementById("minutos");
  const segundosEl = document.getElementById("segundos");

  if (!diasEl || !horasEl || !minutosEl || !segundosEl) {
    return;
  }

  const diferencia = fechaObjetivo - new Date();

  if (diferencia <= 0) {
    diasEl.textContent = "00";
    horasEl.textContent = "00";
    minutosEl.textContent = "00";
    segundosEl.textContent = "00";
    return;
  }

  diasEl.textContent = String(Math.floor(diferencia / (1000 * 60 * 60 * 24))).padStart(2, "0");
  horasEl.textContent = String(Math.floor((diferencia / (1000 * 60 * 60)) % 24)).padStart(2, "0");
  minutosEl.textContent = String(Math.floor((diferencia / (1000 * 60)) % 60)).padStart(2, "0");
  segundosEl.textContent = String(Math.floor((diferencia / 1000) % 60)).padStart(2, "0");
}

function cerrarTarjetas() {
  document.querySelectorAll(".card.is-open").forEach((card) => {
    card.classList.remove("is-open");
  });
  document.body.classList.remove("card-overlay-open");
}

function abrirTarjeta(card) {
  const yaAbierta = card.classList.contains("is-open");
  cerrarTarjetas();

  if (!yaAbierta) {
    document.body.classList.add("card-overlay-open");
    card.classList.add("is-open");
  }
}

function actualizarPreview(planId, imageSrc) {
  const preview = document.getElementById(`preview-${planId}`);
  const previewImg = document.getElementById(`preview-img-${planId}`);

  if (!preview || !previewImg) {
    return;
  }

  if (imageSrc) {
    preview.hidden = false;
    previewImg.src = imageSrc;
  } else {
    preview.hidden = true;
    previewImg.removeAttribute("src");
  }
}

function pedirFotoParaPlan() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.hidden = true;

    input.addEventListener("change", () => {
      const file = input.files && input.files[0] ? input.files[0] : null;
      input.remove();
      resolve(file);
    });

    document.body.appendChild(input);
    input.click();
  });
}

function insertarControlesDePlan() {
  document.querySelectorAll(".card[data-plan]").forEach((card) => {
    const planId = card.dataset.plan;
    const acciones = card.querySelector(".card__actions");
    const botonCompletar = document.getElementById(`boton-${planId}`);

    if (!planId || !acciones || !botonCompletar) {
      return;
    }

    botonCompletar.removeAttribute("onclick");
    botonCompletar.addEventListener("click", (event) => {
      event.stopPropagation();
      completarPlan(planId);
    });

    if (!document.getElementById(`activar-${planId}`)) {
      const botonActivar = document.createElement("button");
      botonActivar.id = `activar-${planId}`;
      botonActivar.type = "button";
      botonActivar.className = "activate-button activate-button--ghost";
      botonActivar.textContent = "Activar plan";
      botonActivar.addEventListener("click", (event) => {
        event.stopPropagation();
        activarPlan(planId);
      });
      acciones.insertBefore(botonActivar, botonCompletar);
    }
  });
}

function crearEntradaPlan(planId, titulo, fecha, imagen) {
  const entradas = obtenerTimeline();
  const nuevaEntrada = {
    id: `plan:${planId}`,
    type: "plan",
    planId,
    date: fecha,
    title: titulo,
    note: "",
    description: "",
    image: imagen
  };

  const actualizadas = entradas.some((entry) => entry.id === nuevaEntrada.id)
    ? entradas.map((entry) => (entry.id === nuevaEntrada.id ? nuevaEntrada : entry))
    : [...entradas, nuevaEntrada];

  guardarTimeline(actualizadas);
}

function renderizarTimeline() {
  const contenedor = document.getElementById("timeline");
  const empty = document.getElementById("timeline-empty");
  const polaroidLayouts = [
    { offset: "6px", tilt: "-5.4deg", lift: "10px", width: "292px", pinLeft: "22%", pinTop: "42px", shadow: "0 30px 42px rgba(58, 36, 20, 0.24)" },
    { offset: "34px", tilt: "4.1deg", lift: "-14px", width: "330px", pinLeft: "74%", pinTop: "38px", shadow: "0 24px 34px rgba(72, 44, 24, 0.2)" },
    { offset: "14px", tilt: "-1.8deg", lift: "18px", width: "308px", pinLeft: "43%", pinTop: "34px", shadow: "0 34px 44px rgba(63, 39, 22, 0.22)" },
    { offset: "46px", tilt: "5.6deg", lift: "-2px", width: "286px", pinLeft: "63%", pinTop: "46px", shadow: "0 26px 36px rgba(68, 41, 22, 0.22)" },
    { offset: "2px", tilt: "-3.4deg", lift: "14px", width: "342px", pinLeft: "31%", pinTop: "36px", shadow: "0 32px 46px rgba(61, 39, 24, 0.2)" },
    { offset: "28px", tilt: "2.2deg", lift: "-18px", width: "300px", pinLeft: "81%", pinTop: "40px", shadow: "0 22px 32px rgba(71, 45, 28, 0.18)" }
  ];

  if (!contenedor || !empty) {
    return;
  }

  const entradas = obtenerTimeline().sort((a, b) => new Date(b.date) - new Date(a.date));
  contenedor.innerHTML = "";

  if (!entradas.length) {
    empty.hidden = false;
    empty.textContent = "Aqui abajo ves la plantilla del corcho con 10 huecos para que te hagas una idea de como quedara.";
    renderizarPortada([]);
  } else {
    empty.hidden = true;
    renderizarPortada(entradas);
  }

  entradas.forEach((entry) => {
    const texto = obtenerTextoRecuerdo(entry);
    const layout = polaroidLayouts[contenedor.children.length % polaroidLayouts.length];
    const item = document.createElement("article");
    item.className = "timeline-item polaroid-card";
    item.dataset.entryId = entry.id;
    item.style.setProperty("--polaroid-offset", layout.offset);
    item.style.setProperty("--polaroid-tilt", layout.tilt);
    item.style.setProperty("--polaroid-lift", layout.lift);
    item.style.setProperty("--polaroid-width", layout.width);
    item.style.setProperty("--polaroid-pin-left", layout.pinLeft);
    item.style.setProperty("--polaroid-pin-top", layout.pinTop);
    item.style.setProperty("--polaroid-shadow", layout.shadow);
    item.innerHTML = `
      <button class="timeline-item__content polaroid-card__button polaroid-card__inner" type="button" aria-label="Abrir recuerdo del ${formatearFecha(entry.date)}">
        <section class="polaroid-card__face polaroid-card__face--front">
          <div class="polaroid-card__photo-frame">
            <div class="timeline-item__media polaroid-card__media">
              <img src="${resolveImageUrl(entry.image)}" alt="${obtenerAltRecuerdo(entry)}" />
            </div>
          </div>
          <p class="timeline-item__note polaroid-card__title">${texto}</p>
        </section>
      </button>
    `;

    const trigger = item.querySelector(".polaroid-card__button");
    if (trigger) {
      trigger.addEventListener("click", () => abrirModalRecuerdo(entry.id));
    }

    contenedor.appendChild(item);
  });

  for (let i = entradas.length; i < MOCK_SLOTS; i += 1) {
    const layout = polaroidLayouts[i % polaroidLayouts.length];
    const placeholder = document.createElement("article");
    placeholder.className = "timeline-item timeline-item--placeholder polaroid-card";
    placeholder.style.setProperty("--polaroid-offset", layout.offset);
    placeholder.style.setProperty("--polaroid-tilt", layout.tilt);
    placeholder.style.setProperty("--polaroid-lift", layout.lift);
    placeholder.style.setProperty("--polaroid-width", layout.width);
    placeholder.style.setProperty("--polaroid-pin-left", layout.pinLeft);
    placeholder.style.setProperty("--polaroid-pin-top", layout.pinTop);
    placeholder.style.setProperty("--polaroid-shadow", layout.shadow);
    placeholder.innerHTML = `
      <div class="timeline-item__content polaroid-card__inner" aria-hidden="true">
        <section class="polaroid-card__face polaroid-card__face--front">
          <div class="polaroid-card__photo-frame">
            <div class="timeline-item__media timeline-item__media--placeholder polaroid-card__media"></div>
          </div>
          <p class="timeline-item__note polaroid-card__title">${DEFAULT_MEMORY_NOTE}</p>
        </section>
      </div>
    `;
    contenedor.appendChild(placeholder);
  }
}

function renderizarPortada(entradas) {
  const board = document.getElementById("cover-board");

  if (!board) {
    return;
  }

  board.innerHTML = "";

  if (!entradas.length) {
    board.innerHTML = `
      <div class="cover-board__empty">
        <p>Todavía no hay fotos clavadas en vuestra historia. En cuanto guardes recuerdos, iran apareciendo aqui.</p>
      </div>
    `;
    return;
  }

  const posiciones = [
    { top: "10%", left: "4%", tilt: "-10deg" },
    { top: "8%", left: "74%", tilt: "8deg" },
    { top: "52%", left: "6%", tilt: "6deg" },
    { top: "55%", left: "76%", tilt: "-8deg" }
  ];

  const destacada = entradas.find((entry) => entry.id === PORTADA_DESTACADA_ID) || entradas[0];
  const featured = document.createElement("article");
  featured.className = "cover-memory cover-memory--featured";
  featured.innerHTML = `
    <img src="${resolveImageUrl(destacada.image)}" alt="${obtenerAltRecuerdo(destacada)}" />
  `;
  featured.tabIndex = 0;
  featured.setAttribute("role", "button");
  featured.setAttribute("aria-label", `Abrir recuerdo del ${formatearFecha(destacada.date)}`);
  featured.addEventListener("click", () => abrirModalRecuerdo(destacada.id));
  featured.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      abrirModalRecuerdo(destacada.id);
    }
  });
  board.appendChild(featured);

  barajar(entradas.filter((entry) => entry.id !== destacada.id)).slice(0, posiciones.length).forEach((entry, index) => {
    const posicion = posiciones[index];
    const foto = document.createElement("article");
    foto.className = "cover-memory";
    foto.style.top = posicion.top;
    foto.style.left = posicion.left;
    foto.style.setProperty("--tilt", posicion.tilt);
    foto.innerHTML = `
      <img src="${resolveImageUrl(entry.image)}" alt="${obtenerAltRecuerdo(entry)}" />
    `;
    foto.tabIndex = 0;
    foto.setAttribute("role", "button");
    foto.setAttribute("aria-label", `Abrir recuerdo del ${formatearFecha(entry.date)}`);
    foto.addEventListener("click", () => abrirModalRecuerdo(entry.id));
    foto.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        abrirModalRecuerdo(entry.id);
      }
    });
    board.appendChild(foto);
  });
}

function renderizarcanciónes() {
  const contenedor = document.getElementById("songs-list");
  const empty = document.getElementById("songs-empty");

  if (!contenedor || !empty) {
    return;
  }

  const canciónes = obtenercanciónes();
  contenedor.innerHTML = "";
  if (songActualIndex >= canciónes.length) {
    songActualIndex = canciónes.length ? 0 : -1;
  }
  actualizarTocadiscos(canciónes);

  if (!canciónes.length) {
    empty.hidden = false;
    empty.textContent = "Todavía no hay canciónes en la biblioteca. Anade la primera con el formulario.";
  } else {
    empty.hidden = true;
  }

  canciónes.forEach((song, index) => {
    const isActive = index === songActualIndex;
    const isPlaying = isActive && turntablePlaying;
    const item = document.createElement("article");
    item.className = `song-item${isActive ? " song-item--active" : ""}${isPlaying ? " is-playing" : ""}`;
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `${isPlaying ? "Pausar" : "Reproducir"} ${song.title} de ${song.artist}`);
    item.innerHTML = `
      <div class="song-item__sleeve">
        <div class="song-item__record" aria-hidden="true">
          ${renderizarDiscocanción(song)}
        </div>
        <span class="song-item__play-state">${isPlaying ? "Sonando" : (song.audio ? "Play" : "Sin audio")}</span>
      </div>
      <div class="song-item__content">
        <p class="song-item__eyebrow">Pista ${String(song.slot || index + 1).padStart(2, "0")}</p>
        <h4>${escapeHtml(song.title)}</h4>
        <p class="song-item__artist">${escapeHtml(song.artist)}</p>
        <p>${escapeHtml(song.note || DEFAULT_SONG_NOTE)}</p>
        <div class="song-item__links">
          ${song.spotifyUrl ? `<a class="song-item__link" href="${escapeHtml(song.spotifyUrl)}" target="_blank" rel="noopener noreferrer">Spotify</a>` : ""}
          ${song.appleMusicUrl ? `<a class="song-item__link" href="${escapeHtml(song.appleMusicUrl)}" target="_blank" rel="noopener noreferrer">Apple Music</a>` : ""}
        </div>
      </div>
    `;
    item.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        return;
      }

      alternarcanción(index);
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        alternarcanción(index);
      }
    });
    contenedor.appendChild(item);
  });

  for (let i = canciónes.length; i < MOCK_SLOTS; i += 1) {
    const item = document.createElement("article");
    item.className = "song-item song-item--placeholder";
    const slot = obtenerNúmeroHuecocanción(canciónes) + (i - canciónes.length);
    item.innerHTML = `
      <div class="song-item__sleeve">
        <div class="song-item__record" aria-hidden="true">
          ${renderizarDiscocanción({ title: "Tu foto", artist: "Aqui", coverImage: "" })}
        </div>
      </div>
      <div class="song-item__content">
        <p class="song-item__eyebrow">Hueco ${slot}</p>
        <h4>canción pendiente</h4>
        <p class="song-item__artist">Artista pendiente</p>
        <p>${DEFAULT_SONG_NOTE}</p>
      </div>
    `;
    contenedor.appendChild(item);
  }

  marcarcanciónActiva();
  prepararCarruselcanciónes();
}

function marcarcanciónActiva() {
  document.querySelectorAll(".songs-list .song-item").forEach((item, index) => {
    const activa = index === songActualIndex;
    item.classList.toggle("song-item--active", activa);
    item.classList.toggle("is-playing", activa && turntablePlaying);
  });

  const activa = document.querySelector(".songs-list .song-item--active");
  if (activa) {
    activa.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function asegurarAudioGlobal() {
  if (audioPlayer) {
    return audioPlayer;
  }

  audioPlayer = document.getElementById("song-audio-player");
  if (!audioPlayer) {
    audioPlayer = new Audio();
    audioPlayer.preload = "metadata";
  }

  audioPlayer.addEventListener("play", () => {
    turntablePlaying = true;
    actualizarTocadiscos(obtenercanciónes());
    marcarcanciónActiva();
    actualizarControlesAudio();
  });

  audioPlayer.addEventListener("pause", () => {
    if (!audioPlayer.ended) {
      turntablePlaying = false;
      actualizarTocadiscos(obtenercanciónes());
      marcarcanciónActiva();
    }
    actualizarControlesAudio();
  });

  audioPlayer.addEventListener("ended", () => {
    turntablePlaying = false;
    audioPlayer.currentTime = 0;
    actualizarTocadiscos(obtenercanciónes());
    marcarcanciónActiva();
    actualizarControlesAudio();
  });

  audioPlayer.addEventListener("timeupdate", actualizarControlesAudio);
  audioPlayer.addEventListener("loadedmetadata", actualizarControlesAudio);
  audioPlayer.addEventListener("volumechange", actualizarControlesAudio);

  if (!audioPlayer.dataset.volumeInitialized) {
    audioPlayer.volume = 0.85;
    audioPlayer.dataset.volumeInitialized = "true";
  }

  return audioPlayer;
}

function formatearTiempoAudio(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function actualizarControlesAudio() {
  const player = asegurarAudioGlobal();
  const progress = document.getElementById("turntable-progress");
  const currentTime = document.getElementById("turntable-time-current");
  const totalTime = document.getElementById("turntable-time-total");
  const volume = document.getElementById("turntable-volume");
  const volumeValue = document.getElementById("turntable-volume-value");

  if (!progress || !currentTime || !totalTime || !volume || !volumeValue) {
    return;
  }

  const duration = Number.isFinite(player.duration) ? player.duration : 0;
  const time = Number.isFinite(player.currentTime) ? player.currentTime : 0;
  const progressValue = duration > 0 ? (time / duration) * 100 : 0;

  progress.value = String(progressValue);
  currentTime.textContent = formatearTiempoAudio(time);
  totalTime.textContent = formatearTiempoAudio(duration);
  volume.value = String(player.volume ?? 0.85);
  volumeValue.textContent = `${Math.round((player.volume ?? 0.85) * 100)}%`;
}

function cambiarVolumen(delta) {
  const player = asegurarAudioGlobal();
  const nextVolume = Math.max(0, Math.min(1, (player.volume ?? 0.85) + delta));
  player.volume = Number(nextVolume.toFixed(2));
  actualizarControlesAudio();
}

async function reproducircanción(index, { restart = false } = {}) {
  const canciónes = obtenercanciónes();
  const song = canciónes[index];

  if (!song) {
    return;
  }

  songActualIndex = index;
  const audioUrl = resolveSongAudio(song);
  if (!audioUrl) {
    turntablePlaying = false;
    actualizarTocadiscos(canciónes);
    marcarcanciónActiva();
    return;
  }

  const player = asegurarAudioGlobal();
  const mismacanción = player.dataset.songId === song.id;

  if (!mismacanción) {
    const playableAudioUrl = await prepararFuenteAudio(audioUrl);
    player.src = playableAudioUrl;
    player.dataset.audioUrl = audioUrl;
    player.dataset.songId = song.id;
    player.load();
  } else if (restart) {
    player.currentTime = 0;
  }

  actualizarControlesAudio();

  player.play().catch((error) => {
    turntablePlaying = false;
    console.error(`No se pudo reproducir la canción ${song.title}. URL usada: ${player.dataset.audioUrl || audioUrl}`, error);
    actualizarTocadiscos(canciónes);
    marcarcanciónActiva();
    actualizarControlesAudio();
  });
}

function detenercanciónActual() {
  const player = asegurarAudioGlobal();
  if (player.src) {
    player.pause();
    player.currentTime = 0;
  }

  if (player.dataset.songId) {
    delete player.dataset.songId;
    delete player.dataset.audioUrl;
  }

  liberarAudioTemporal();
  turntablePlaying = false;
  actualizarTocadiscos(obtenercanciónes());
  marcarcanciónActiva();
  actualizarControlesAudio();
}

function alternarcanción(index) {
  const player = asegurarAudioGlobal();
  const mismacanción = songActualIndex === index && player.dataset.songId === obtenercanciónes()[index]?.id;

  if (mismacanción && !player.paused) {
    player.pause();
    return;
  }

  reproducircanción(index);
}

function actualizarTocadiscos(canciónes) {
  const record = document.getElementById("turntable-record");
  const title = document.getElementById("turntable-title");
  const artist = document.getElementById("turntable-artist");
  const spotifyLink = document.getElementById("turntable-link-spotify");
  const appleLink = document.getElementById("turntable-link-apple");
  const coverImage = document.getElementById("turntable-cover-image");
  const coverFallback = document.getElementById("turntable-cover-fallback");
  const nowPlaying = document.getElementById("turntable-now-playing");

  if (!record || !title || !artist || !spotifyLink || !appleLink || !coverImage || !coverFallback || !nowPlaying) {
    return;
  }

  if (!canciónes.length) {
    record.classList.remove("is-spinning");
    title.textContent = "Sin canción";
    artist.textContent = "Abre la biblioteca y anade la primera canción.";
    nowPlaying.textContent = "Todavía no esta sonando nada.";
    coverImage.hidden = true;
    coverImage.removeAttribute("src");
    coverFallback.hidden = false;
    coverFallback.textContent = "Sin portada";
    spotifyLink.hidden = true;
    spotifyLink.removeAttribute("href");
    appleLink.hidden = true;
    appleLink.removeAttribute("href");
    return;
  }

  if (songActualIndex < 0) {
    songActualIndex = 0;
  }

  const song = canciónes[songActualIndex];
  const spotifyUrl = song.spotifyUrl || "";
  const appleUrl = song.appleMusicUrl || "";
  const coverUrl = resolveSongCover(song);
  const player = asegurarAudioGlobal();
  turntablePlaying = Boolean(player.src && !player.paused && player.dataset.songId === song.id);
  record.classList.toggle("is-spinning", turntablePlaying);
  title.textContent = song.title || "Sin titulo";
  artist.textContent = song.artist || "Sin artista";
  nowPlaying.textContent = turntablePlaying
    ? `Reproduciendo ahora: ${song.title} de ${song.artist}.`
    : (song.audio ? `Seleccionada: ${song.title}. Pulsa play para escucharla.` : `Seleccionada: ${song.title}. Falta anadir el archivo de audio.`);

  if (coverUrl) {
    coverImage.hidden = false;
    coverImage.src = coverUrl;
    coverImage.alt = song.title ? `Portada de ${song.title}` : "Portada de la canción";
    coverFallback.hidden = true;
    coverFallback.textContent = "";
  } else {
    coverImage.hidden = true;
    coverImage.removeAttribute("src");
    coverFallback.hidden = false;
    coverFallback.textContent = song.title || "Sin portada";
  }

  if (spotifyUrl) {
    spotifyLink.hidden = false;
    spotifyLink.href = spotifyUrl;
  } else {
    spotifyLink.hidden = true;
    spotifyLink.removeAttribute("href");
  }

  if (appleUrl) {
    appleLink.hidden = false;
    appleLink.href = appleUrl;
  } else {
    appleLink.hidden = true;
    appleLink.removeAttribute("href");
  }
}

function moverTocadiscos(direccion) {
  const canciónes = obtenercanciónes();

  if (!canciónes.length) {
    return;
  }

  if (songActualIndex < 0) {
    songActualIndex = 0;
  } else {
    songActualIndex = (songActualIndex + direccion + canciónes.length) % canciónes.length;
  }

  reproducircanción(songActualIndex, { restart: true });
}

function prepararCarruselcanciónes() {
  const contenedor = document.getElementById("songs-list");
  const prev = document.getElementById("songs-carousel-prev");
  const next = document.getElementById("songs-carousel-next");

  if (!contenedor || !prev || !next || contenedor.dataset.carouselReady === "true") {
    return;
  }

  const mover = (direccion) => {
    const distancia = Math.max(contenedor.clientWidth * 0.72, 280);
    contenedor.scrollBy({ left: distancia * direccion, behavior: "smooth" });
  };

  prev.addEventListener("click", () => mover(-1));
  next.addEventListener("click", () => mover(1));
  contenedor.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    contenedor.scrollBy({ left: event.deltaY, behavior: "auto" });
  }, { passive: false });

  contenedor.dataset.carouselReady = "true";
}

function activarPlan(planId) {
  const estado = localStorage.getItem(claveEstado(planId)) || "pendiente";

  if (estado === "activado" || estado === "completado") {
    return;
  }

  localStorage.setItem(claveEstado(planId), "activado");
  guardarEstadoPlanEnFirestore(planId, "activado").catch((error) => {
    console.error("No se pudo sincronizar la activacion del plan:", error);
  });
  actualizarEstados();
}

async function completarPlan(planId) {
  const estado = localStorage.getItem(claveEstado(planId)) || "pendiente";

  if (estado === "pendiente") {
    alert("Primero activa el plan y luego completalo.");
    return;
  }

  if (estado === "completado") {
    return;
  }

  const boton = document.getElementById(`boton-${planId}`);
  const card = document.querySelector(`.card[data-plan="${planId}"]`);
  const titulo = card ? card.dataset.planTitle : planId;
  const foto = await pedirFotoParaPlan();

  if (!foto) {
    return;
  }

  if (!foto.type.startsWith("image/")) {
    alert("El archivo debe ser una imagen.");
    return;
  }

  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Subiendo foto...";
    }

    const imageUrl = await subirImagenAFirebase(foto, `recuerdos/planes/${planId}`);
    const fecha = hoyIso();

    const entry = {
      id: `plan:${planId}`,
      type: "plan",
      planId,
      date: fecha,
      title: titulo,
      note: "",
      description: "",
      image: imageUrl
    };

    localStorage.setItem(claveEstado(planId), "completado");
    localStorage.setItem(claveFoto(planId), imageUrl);
    localStorage.setItem(claveFecha(planId), fecha);

    crearEntradaPlan(planId, titulo, fecha, imageUrl);
    await guardarRecuerdoEnFirestore(entry, foto.name);
    await guardarEstadoPlanEnFirestore(planId, "completado", { photoUrl: imageUrl, date: fecha });
    actualizarEstados();
    renderizarTimeline();
  } catch (error) {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Completar plan";
    }

    alert(error.message || "No se pudo subir la foto. Intentalo otra vez.");
  }
}

function actualizarEstados() {
  let activados = 0;
  let completados = 0;

  planes.forEach((plan) => {
    const estadoEl = document.getElementById(`estado-${plan}`);
    const botonActivar = document.getElementById(`activar-${plan}`);
    const botonCompletar = document.getElementById(`boton-${plan}`);
    const mensaje = document.getElementById(`mensaje-${plan}`);
    const card = document.querySelector(`.card[data-plan="${plan}"]`);

    const estado = localStorage.getItem(claveEstado(plan)) || "pendiente";
    const fotoGuardada = localStorage.getItem(claveFoto(plan));
    const fechaGuardada = localStorage.getItem(claveFecha(plan));

    const estaActivado = estado === "activado" || estado === "completado";
    const estaCompletado = estado === "completado" && fotoGuardada && fechaGuardada;

    if (estaActivado) {
      activados += 1;
    }

    if (estaCompletado) {
      completados += 1;
      if (card) {
        crearEntradaPlan(plan, card.dataset.planTitle || plan, fechaGuardada, fotoGuardada);
      }
    }

    if (estadoEl) {
      estadoEl.textContent = estaCompletado ? "Completado" : (estaActivado ? "Activado" : "Pendiente");
      estadoEl.classList.toggle("card__status--active", estaActivado && !estaCompletado);
      estadoEl.classList.toggle("card__status--complete", estaCompletado);
    }

    if (botonActivar) {
      botonActivar.disabled = estaActivado;
      botonActivar.textContent = estaActivado ? "Plan activado" : "Activar plan";
    }

    if (botonCompletar) {
      botonCompletar.disabled = estaCompletado;
      botonCompletar.textContent = estaCompletado ? "Recuerdo guardado" : "Completar plan";
      botonCompletar.classList.toggle("is-disabled-look", !estaActivado && !estaCompletado);
    }

    if (mensaje) {
      if (estaCompletado) {
        mensaje.textContent = "Este plan ya esta completado y su foto ya forma parte de la línea del tiempo.";
      } else if (estaActivado) {
        mensaje.textContent = "El plan esta activado. Cuando le des a completar, te pedira una foto y se guardara automaticamente con la fecha de hoy.";
      } else {
        mensaje.textContent = "Primero activa el plan. Cuando lo hagais, podras completarlo con una foto.";
      }
    }

    if (card) {
      card.classList.toggle("card--active", estaActivado && !estaCompletado);
      card.classList.toggle("card--completed", estaCompletado);
    }

  });

  const contador = document.getElementById("contador-planes");
  const contadorComidas = document.getElementById("contador-planes-comidas");
  const restantes = document.getElementById("planes-restantes");
  if (contador) {
    contador.textContent = `${activados} / ${planes.length}`;
  }
  if (contadorComidas) {
    contadorComidas.textContent = `${activados} / ${planes.length}`;
  }
  if (restantes) {
    restantes.textContent = String(planes.length - completados);
  }

  const final = document.getElementById("mensaje-final");
  if (final) {
    final.hidden = completados !== planes.length;
  }

  renderizarCartas(completados);
}

function renderizarCartas(completados) {
  const contenedores = document.querySelectorAll("#letters-grid, #letters-grid-cover");

  if (!contenedores.length) {
    return;
  }

  contenedores.forEach((contenedor) => {
    contenedor.innerHTML = "";

    LETTERS.forEach((letter) => {
      const unlocked = completados >= letter.unlockAt;
      const item = document.createElement("article");
      item.className = `letter-card${unlocked ? "" : " letter-card--locked"}`;
      item.innerHTML = `
        <div class="letter-card__inner">
          <section class="letter-card__face letter-card__face--front">
            <div class="letter-card__seal">${unlocked ? "Ab" : "?"}</div>
            <div>
              <span class="${unlocked ? "letter-card__unlock" : "letter-card__status"}">
                ${unlocked ? "Desbloqueada" : `Se abre con ${letter.unlockAt} planes`}
              </span>
              <h3 class="letter-card__title">${letter.title}</h3>
              <p class="letter-card__text">${unlocked ? letter.preview : "Todavía está bloqueada. Hay que seguir haciendo planes para abrirla."}</p>
            </div>
            <button class="activate-button letter-card__action" type="button" ${unlocked ? "" : "disabled"}>
              ${unlocked ? "Abrir carta" : "Bloqueada"}
            </button>
          </section>
          <section class="letter-card__face letter-card__face--back">
            <div>
              <span class="letter-card__unlock">Carta abierta</span>
              <h3 class="letter-card__title">${letter.title}</h3>
              <p class="letter-card__text">${letter.message}</p>
            </div>
            <button class="activate-button activate-button--ghost letter-card__action" type="button">Cerrar carta</button>
          </section>
        </div>
      `;

      if (unlocked) {
        const buttons = item.querySelectorAll("button");
        buttons.forEach((button) => {
          button.addEventListener("click", () => {
            item.classList.toggle("is-open");
          });
        });
      }

      contenedor.appendChild(item);
    });
  });
}

function abrirModalRecuerdo(entryId) {
  const modal = document.getElementById("memory-modal");
  const flip = document.getElementById("memory-flip");
  const image = document.getElementById("memory-modal-image");
  const date = document.getElementById("memory-modal-date");
  const title = document.getElementById("memory-modal-title");
  const descriptionInput = document.getElementById("memory-modal-description-input");
  const saved = document.getElementById("memory-modal-saved");
  const entry = obtenerTimeline().find((item) => item.id === entryId);

  if (!modal || !flip || !image || !date || !title || !descriptionInput || !saved || !entry) {
    return;
  }

  flip.classList.remove("is-flipped");
  image.src = resolveImageUrl(entry.image);
  image.alt = obtenerAltRecuerdo(entry);
  date.textContent = formatearFecha(entry.date);
  title.textContent = obtenerTextoRecuerdo(entry);
  descriptionInput.value = obtenerDescripciónRecuerdo(entry);
  saved.hidden = true;
  modal.dataset.entryId = entryId;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function cerrarModalRecuerdo() {
  const modal = document.getElementById("memory-modal");
  const flip = document.getElementById("memory-flip");

  if (!modal || !flip) {
    return;
  }

  flip.classList.remove("is-flipped");
  delete modal.dataset.entryId;
  modal.hidden = true;
  document.body.style.overflow = "";
}

function guardarTextoRecuerdoActual() {
  const modal = document.getElementById("memory-modal");
  const descriptionInput = document.getElementById("memory-modal-description-input");
  const saved = document.getElementById("memory-modal-saved");
  const title = document.getElementById("memory-modal-title");

  if (!modal || !descriptionInput || !saved || !title || !modal.dataset.entryId) {
    return;
  }

  const Descripción = descriptionInput.value.trim();

  const actualizadas = obtenerTimeline().map((entry) => {
    if (entry.id !== modal.dataset.entryId) {
      return entry;
    }

      return {
        ...entry,
        description: Descripción
      };
    });

  guardarTimeline(actualizadas);
  renderizarTimeline();

  const actualizada = actualizadas.find((entry) => entry.id === modal.dataset.entryId);
  if (!actualizada) {
    return;
  }

  title.textContent = obtenerTextoRecuerdo(actualizada);
  saved.hidden = false;

  guardarRecuerdoEnFirestore(actualizada).catch((error) => {
    console.error("No se pudo sincronizar el recuerdo:", error);
  });
}

function prepararModalRecuerdo() {
  const modal = document.getElementById("memory-modal");
  const flip = document.getElementById("memory-flip");
  const turn = document.getElementById("memory-modal-turn");
  const back = document.getElementById("memory-modal-return");
  const save = document.getElementById("memory-modal-save");
  const descriptionInput = document.getElementById("memory-modal-description-input");
  const saved = document.getElementById("memory-modal-saved");

  if (!modal || !flip || !turn || !back || !save || !descriptionInput || !saved) {
    return;
  }

  document.querySelectorAll("[data-close-memory-modal]").forEach((element) => {
    element.addEventListener("click", cerrarModalRecuerdo);
  });

  turn.addEventListener("click", () => {
    flip.classList.add("is-flipped");
  });

  back.addEventListener("click", () => {
    flip.classList.remove("is-flipped");
  });

  save.addEventListener("click", guardarTextoRecuerdoActual);
  descriptionInput.addEventListener("input", () => {
    saved.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      cerrarModalRecuerdo();
    }
  });
}

function aplicarTema(tabId) {
  document.body.classList.remove("theme-portada", "theme-comidas", "theme-recuerdos", "theme-musica");
  document.body.classList.add(`theme-${tabId}`);
}

function activarTab(tabId) {
  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    const activa = panel.dataset.tabPanel === tabId;
    panel.hidden = !activa;
    panel.classList.toggle("is-active", activa);
  });

  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    if (!button.dataset.tabTarget) {
      return;
    }

    if (button.classList.contains("section-line__link")) {
      button.classList.toggle("is-active", button.dataset.tabTarget === tabId);
    }
  });

  aplicarTema(tabId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function prepararTabs() {
  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => {
      activarTab(button.dataset.tabTarget);
    });
  });

  activarTab("portada");
}

function prepararTarjetas() {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, input, label")) {
        return;
      }

      abrirTarjeta(card);
    });
  });

  document.querySelectorAll("[data-close-card]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      document.body.classList.remove("card-overlay-open");
      const card = button.closest(".card");
      if (card) {
        card.classList.remove("is-open");
      }
    });
  });
}

function prepararFormularioTimeline() {
  const form = document.getElementById("timeline-form");
  const imageInput = document.getElementById("timeline-image");
  const preview = document.getElementById("timeline-form-preview");
  const previewImg = document.getElementById("timeline-form-preview-image");

  if (!form || !imageInput || !preview || !previewImg) {
    return;
  }

  imageInput.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      preview.hidden = true;
      previewImg.removeAttribute("src");
      return;
    }

    preview.hidden = false;
    previewImg.src = await leerArchivoComoDataUrl(file);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const dateInput = document.getElementById("timeline-date");
    const titleInput = document.getElementById("timeline-title");
    const descriptionInput = document.getElementById("timeline-description");
    const file = imageInput.files && imageInput.files[0];

    if (!dateInput.value || !titleInput.value.trim() || !file) {
      alert("Para anadir un recuerdo manual necesitas fecha, texto y foto.");
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Subiendo recuerdo...";
      }

      const imageUrl = await subirImagenAFirebase(file, "recuerdos/manuales");
      const nuevaEntrada = {
        id: `manual:${Date.now()}`,
        type: "manual",
        date: dateInput.value,
        title: titleInput.value.trim(),
        note: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        image: imageUrl
      };
      const entradas = obtenerTimeline();

      entradas.push(nuevaEntrada);

      guardarTimeline(entradas);
      await guardarRecuerdoEnFirestore(nuevaEntrada, file.name);
      renderizarTimeline();
      form.reset();
      preview.hidden = true;
      previewImg.removeAttribute("src");

      const shell = document.getElementById("timeline-form-shell");
      const button = document.querySelector('[data-toggle-form="timeline-form-shell"]');
      if (shell) {
        shell.hidden = true;
      }
      if (button) {
        button.textContent = "Añadir recuerdo";
      }
    } catch (error) {
      alert(error.message || "No se pudo subir el recuerdo.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Guardar en la línea del tiempo";
      }
    }
  });
}

function prepararTogglesDeFormulario() {
  document.querySelectorAll("[data-toggle-form]").forEach((button) => {
    button.addEventListener("click", () => {
      const shell = document.getElementById(button.dataset.toggleForm);

      if (!shell) {
        return;
      }

      const abierto = !shell.hidden;
      shell.hidden = abierto;
      button.textContent = abierto
        ? (button.dataset.toggleForm === "song-form-shell" ? "Anadir nueva canción" : "Añadir recuerdo")
        : "Cerrar";
    });
  });
}

function prepararTocadiscos() {
  const toggle = document.getElementById("turntable-toggle");
  const library = document.getElementById("song-library");
  const prev = document.getElementById("turntable-prev");
  const next = document.getElementById("turntable-next");
  const stop = document.getElementById("turntable-stop");
  const play = document.getElementById("turntable-play");
  const progress = document.getElementById("turntable-progress");
  const volume = document.getElementById("turntable-volume");
  const volumeDown = document.getElementById("turntable-volume-down");
  const volumeUp = document.getElementById("turntable-volume-up");
  const volumeValue = document.getElementById("turntable-volume-value");

  if (!toggle || !library || !prev || !next || !stop || !play || !progress || !volume || !volumeDown || !volumeUp || !volumeValue) {
    return;
  }

  const alternarBiblioteca = () => {
    const abierto = !library.hidden;
    library.hidden = abierto;
    toggle.setAttribute("aria-expanded", abierto ? "false" : "true");
  };

  toggle.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      return;
    }

    alternarBiblioteca();
  });
  toggle.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    alternarBiblioteca();
  });

  prev.addEventListener("click", () => moverTocadiscos(-1));
  next.addEventListener("click", () => moverTocadiscos(1));
  stop.addEventListener("click", () => {
    detenercanciónActual();
  });
  play.addEventListener("click", () => {
    const canciónes = obtenercanciónes();
    if (!canciónes.length) {
      return;
    }

    if (songActualIndex < 0) {
      songActualIndex = 0;
    }

    reproducircanción(songActualIndex);
  });

  progress.addEventListener("input", () => {
    const player = asegurarAudioGlobal();
    if (!Number.isFinite(player.duration) || player.duration <= 0) {
      return;
    }

    player.currentTime = (Number(progress.value) / 100) * player.duration;
    actualizarControlesAudio();
  });

  volume.addEventListener("input", () => {
    const player = asegurarAudioGlobal();
    player.volume = Number(volume.value);
    actualizarControlesAudio();
  });

  volumeDown.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    cambiarVolumen(-0.1);
  });

  volumeUp.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    cambiarVolumen(0.1);
  });

  actualizarControlesAudio();
}

function prepararFormulariocanciónes() {
  const form = document.getElementById("song-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const slotInput = document.getElementById("song-slot");
    const titleInput = document.getElementById("song-title");
    const artistInput = document.getElementById("song-artist");
    const noteInput = document.getElementById("song-note");
    const coverInput = document.getElementById("song-cover-image");
    const coverFileInput = document.getElementById("song-cover-file");
    const audioInput = document.getElementById("song-audio");
    const audioFileInput = document.getElementById("song-audio-file");
    const spotifyInput = document.getElementById("song-link-spotify");
    const appleInput = document.getElementById("song-link-apple");
    const submitButton = form.querySelector('button[type="submit"]');

    if (!titleInput.value.trim() || !artistInput.value.trim()) {
      alert("La canción necesita al menos titulo y artista.");
      return;
    }

    try {
      let coverImage = coverInput ? coverInput.value.trim() : "";
      let audio = audioInput ? audioInput.value.trim() : "";

      if (!coverImage && coverFileInput?.files?.[0]) {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Subiendo portada...";
        }
        coverImage = await subirImagenAFirebase(coverFileInput.files[0], "musica/portadas");
      }

      if (!audio && audioFileInput?.files?.[0]) {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Subiendo audio...";
        }
        audio = await subirAudioAFirebase(audioFileInput.files[0], "musica/audios");
      }

      if (!audio) {
        throw new Error("Para anadir una canción reproducible necesitas una ruta de audio o subir un archivo.");
      }

      const canciónes = obtenercanciónes();
      const nuevacanción = normalizarcanción({
        id: `song:${Date.now()}`,
        slot: slotInput?.value ? Number(slotInput.value) : obtenerNúmeroHuecocanción(canciónes),
        title: titleInput.value.trim(),
        artist: artistInput.value.trim(),
        note: noteInput.value.trim(),
        coverImage,
        audio,
        spotifyUrl: spotifyInput.value.trim(),
        appleMusicUrl: appleInput.value.trim(),
        isCustom: true
      }, canciónes.length);

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Guardando canción...";
      }

      await guardarcanciónEnFirestore(nuevacanción);
      songLibraryState = ordenarcanciónes([...canciónes, nuevacanción]);
      songActualIndex = songLibraryState.findIndex((song) => song.id === nuevacanción.id);
      renderizarcanciónes();
      actualizarTocadiscos(obtenercanciónes());
      form.reset();

      const shell = document.getElementById("song-form-shell");
      const button = document.querySelector('[data-toggle-form="song-form-shell"]');
      if (shell) {
        shell.hidden = true;
      }
      if (button) {
        button.textContent = "Anadir nueva canción";
      }
    } catch (error) {
      alert(error.message || "No se pudo anadir la canción.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Anadir canción";
      }
    }
  });
}

function inicializarMusica() {
  inicializarBibliotecacanciónes();
  asegurarAudioGlobal();
}

function inicializarContenidoDesdeSemillas() {
  planLibraryState = PLAN_SEED.map((plan, index) => normalizarPlan(plan, index));
  memoryLibraryState = MEMORY_SEED.map((memory, index) => normalizarRecuerdo(memory, index));
  inicializarMusica();
}

function renderizarPlanes() {
  const grid = document.getElementById("plans-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";
  obtenerPlanes().forEach((plan) => {
    const imageSource = plan.imageUrl
      ? escapeHtml(plan.imageUrl)
      : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    const imageAttrs = plan.imagePath
      ? `src="${imageSource}" data-asset-path="${escapeHtml(plan.imagePath)}"`
      : `src="${imageSource}"`;
    const article = document.createElement("article");
    article.className = "card";
    article.dataset.plan = plan.id;
    article.dataset.planTitle = plan.title;
    article.innerHTML = `
      <div class="card__inner">
        <div class="card__face card__face--front">
          <img ${imageAttrs} alt="${escapeHtml(plan.title)}" class="card__image" />
          <div class="card__content">
            <p class="card__number">Plan ${plan.number}</p>
            <h3>${escapeHtml(plan.title)}</h3>
            <p>${escapeHtml(plan.frontText)}</p>
            <span class="card__status" id="estado-${plan.id}">Pendiente</span>
          </div>
        </div>
        <div class="card__face card__face--back">
          <div class="card__details">
            <p class="card__number">Plan ${plan.number}</p>
            <h3>${escapeHtml(plan.title)}</h3>
            <p class="card__detail-text">${escapeHtml(plan.backText)}</p>
            <p class="card__detail-meta"><strong>${escapeHtml(plan.metaLabel)}:</strong> ${escapeHtml(plan.metaText)}</p>
            <p id="mensaje-${plan.id}" class="plan-message">${escapeHtml(plan.message)}</p>
            <div class="card__actions">
              <button id="activar-${plan.id}" class="activate-button activate-button--ghost" type="button">Activar plan</button>
              <button id="boton-${plan.id}" class="activate-button" type="button">Completar con foto</button>
              <button class="card__close" type="button" data-close-card>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(article);
  });

  aplicarAssetsRemotosAlDom();
  prepararTarjetas();
  insertarControlesDePlan();
}

async function seedFirebaseContent() {
  if (!window.firebaseDb || !window.firebaseFns) {
    return;
  }

  const db = window.firebaseDb;
  const { collection, getDocs, query, orderBy, doc, setDoc } = window.firebaseFns;
  const colecciones = [
    { name: "plans", items: PLAN_SEED, normalize: normalizarPlan },
    { name: "memories", items: MEMORY_SEED, normalize: normalizarRecuerdo },
    { name: "songs", items: SONG_LIBRARY, normalize: normalizarcanción }
  ];

  for (const collectionInfo of colecciones) {
    const snapshot = await getDocs(collection(db, collectionInfo.name));
    const existingIds = new Set(snapshot.docs.map((item) => {
      const data = item.data();
      return data.songId || data.id || item.id;
    }));

    for (let index = 0; index < collectionInfo.items.length; index += 1) {
      const item = collectionInfo.normalize(collectionInfo.items[index], index);
      if (existingIds.has(item.id)) {
        continue;
      }

      await setDoc(doc(db, collectionInfo.name, item.id), item, { merge: true });
    }
  }

  const recuerdosLegacy = await getDocs(collection(db, "recuerdos"));
  for (const legacyDoc of recuerdosLegacy.docs) {
    const data = legacyDoc.data();
    const memoryId = data.entryId || legacyDoc.id;
    await setDoc(doc(db, "memories", memoryId), normalizarRecuerdo({
      id: memoryId,
      planId: data.planId || "",
      type: data.type || "manual",
      date: data.date || hoyIso(),
      title: data.title || "",
      note: data.note || "",
      description: data.description || "",
      imageUrl: data.url || data.image || "",
      visible: true
    }), { merge: true });
  }

  const planStatesLegacy = await getDocs(query(collection(db, "planStates"), orderBy("createdAt", "desc")));
  const latestPlanState = new Map();
  planStatesLegacy.forEach((legacyDoc) => {
    const data = legacyDoc.data();
    if (!data.planId || latestPlanState.has(data.planId)) {
      return;
    }

    latestPlanState.set(data.planId, data);
  });

  for (const [planId, data] of latestPlanState.entries()) {
    await setDoc(doc(db, "plans", planId), {
      status: data.status || "pendiente",
      completionPhotoUrl: data.photoUrl || "",
      completionDate: data.date || ""
    }, { merge: true });
  }
}

window.seedFirebaseContent = seedFirebaseContent;

async function cargarPlanesFirestore() {
  if (!window.firebaseDb || !window.firebaseFns) {
    planLibraryState = PLAN_SEED.map((plan, index) => normalizarPlan(plan, index));
    return;
  }

  const db = window.firebaseDb;
  const { collection, getDocs, query, orderBy } = window.firebaseFns;
  try {
    const snapshot = await getDocs(query(collection(db, "plans"), orderBy("order", "asc")));
    planLibraryState = snapshot.docs.length
      ? await Promise.all(snapshot.docs.map(async (item, index) => {
        const plan = normalizarPlan({ id: item.id, ...item.data() }, index);
        if (!plan.imageUrl && plan.imagePath && !plan.imagePath.startsWith("img/")) {
          plan.imageUrl = await resolverStoragePath(plan.imagePath, "imagen del plan");
        }
        return plan;
      }))
      : PLAN_SEED.map((plan, index) => normalizarPlan(plan, index));
  } catch (error) {
    console.error("No se pudieron cargar los planes desde Firestore.", error);
    planLibraryState = PLAN_SEED.map((plan, index) => normalizarPlan(plan, index));
  }
}

async function cargarRecuerdosFirestore() {
  if (!window.firebaseDb || !window.firebaseFns) {
    memoryLibraryState = deduplicarRecuerdos(MEMORY_SEED);
    return;
  }

  const db = window.firebaseDb;
  const { collection, getDocs, query, orderBy } = window.firebaseFns;
  try {
    const snapshot = await getDocs(query(collection(db, "memories"), orderBy("order", "asc")));
    if (!snapshot.docs.length) {
      memoryLibraryState = deduplicarRecuerdos(MEMORY_SEED);
      return;
    }

    const loadedMemories = await Promise.all(snapshot.docs.map(async (item, index) => {
        const memory = normalizarRecuerdo({ id: item.id, ...item.data() }, index);
        if (!memory.imageUrl && memory.imagePath && !memory.imagePath.startsWith("img/")) {
          memory.imageUrl = await resolverStoragePath(memory.imagePath, "imagen del recuerdo");
          memory.image = memory.imageUrl || memory.imagePath;
        }
        return memory;
      }));

    memoryLibraryState = deduplicarRecuerdos(loadedMemories);
  } catch (error) {
    console.error("No se pudieron cargar los recuerdos desde Firestore.", error);
    memoryLibraryState = deduplicarRecuerdos(MEMORY_SEED);
  }
}

async function cargarcanciónesFirestore() {
  if (!window.firebaseDb || !window.firebaseFns) {
    inicializarMusica();
    return;
  }

  const db = window.firebaseDb;
  const { collection, getDocs, query, orderBy } = window.firebaseFns;
  try {
    const snapshot = await getDocs(query(collection(db, "songs"), orderBy("order", "asc")));
    songLibraryState = snapshot.docs.length
      ? ordenarcanciónes(await Promise.all(snapshot.docs.map(async (item, index) => {
        const song = normalizarcanción({ id: item.data().songId || item.id, ...item.data() }, index);
        if (song.coverImage && !song.coverImage.startsWith("img/") && !/^https?:/i.test(song.coverImage)) {
          song.coverImage = await resolverStoragePath(song.coverImage, "portada de la canción");
        }
        if (song.audio && !/^https?:/i.test(song.audio)) {
          song.audio = await resolverStoragePath(song.audio, "audio de la canción");
        }
        return song;
      })))
      : ordenarcanciónes(SONG_LIBRARY.map((song, index) => normalizarcanción(song, index)));
  } catch (error) {
    console.error("No se pudieron cargar las canciónes desde Firestore.", error);
    songLibraryState = ordenarcanciónes(SONG_LIBRARY.map((song, index) => normalizarcanción(song, index)));
  }
}

async function guardarcanciónEnFirestore(song) {
  if (!window.firebaseDb || !window.firebaseFns) {
    throw new Error("Firebase no esta cargado.");
  }

  const db = window.firebaseDb;
  const { doc, setDoc } = window.firebaseFns;
  const normalizada = normalizarcanción(song);
  await setDoc(doc(db, "songs", normalizada.id), { ...normalizada, songId: normalizada.id }, { merge: true });
}

async function guardarRecuerdoEnFirestore(entry) {
  if (!window.firebaseDb || !window.firebaseFns) {
    throw new Error("Firebase no esta cargado.");
  }

  const db = window.firebaseDb;
  const { doc, setDoc } = window.firebaseFns;
  const normalizada = normalizarRecuerdo(entry);
  await setDoc(doc(db, "memories", normalizada.id), { ...normalizada, id: normalizada.id }, { merge: true });
  memoryLibraryState = memoryLibraryState.some((item) => item.id === normalizada.id)
    ? memoryLibraryState.map((item) => (item.id === normalizada.id ? normalizada : item))
    : [...memoryLibraryState, normalizada];
  memoryLibraryState = deduplicarRecuerdos(memoryLibraryState);
}

async function guardarPlanEnFirestore(plan) {
  if (!window.firebaseDb || !window.firebaseFns) {
    throw new Error("Firebase no esta cargado.");
  }

  const db = window.firebaseDb;
  const { doc, setDoc } = window.firebaseFns;
  const normalizado = normalizarPlan(plan);
  await setDoc(doc(db, "plans", normalizado.id), { ...normalizado, id: normalizado.id }, { merge: true });
  planLibraryState = planLibraryState.some((item) => item.id === normalizado.id)
    ? planLibraryState.map((item) => (item.id === normalizado.id ? normalizado : item))
    : [...planLibraryState, normalizado];
}

function guardarTimeline(entries) {
  memoryLibraryState = deduplicarRecuerdos(entries);
}

function obtenerTimeline() {
  return [...memoryLibraryState].filter((entry) => entry.visible !== false).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function insertarControlesDePlan() {
  document.querySelectorAll(".card[data-plan]").forEach((card) => {
    const planId = card.dataset.plan;
    const activar = card.querySelector(`#activar-${planId}`);
    const completar = card.querySelector(`#boton-${planId}`);

    if (activar) {
      activar.onclick = null;
      activar.addEventListener("click", (event) => {
        event.stopPropagation();
        activarPlan(planId);
      }, { once: false });
    }

    if (completar) {
      completar.onclick = null;
      completar.addEventListener("click", (event) => {
        event.stopPropagation();
        completarPlan(planId);
      }, { once: false });
    }
  });
}

function actualizarEstados() {
  const planes = obtenerPlanes();
  let activados = 0;
  let completados = 0;

  planes.forEach((plan) => {
    const estadoEl = document.getElementById(`estado-${plan.id}`);
    const botonActivar = document.getElementById(`activar-${plan.id}`);
    const botonCompletar = document.getElementById(`boton-${plan.id}`);
    const mensaje = document.getElementById(`mensaje-${plan.id}`);
    const card = document.querySelector(`.card[data-plan="${plan.id}"]`);
    const estaActivado = plan.status === "activado" || plan.status === "completado";
    const estaCompletado = plan.status === "completado" && plan.completionPhotoUrl && plan.completionDate;

    if (estaActivado) activados += 1;
    if (estaCompletado) completados += 1;

    if (estadoEl) {
      estadoEl.textContent = estaCompletado ? "Completado" : (estaActivado ? "Activado" : "Pendiente");
      estadoEl.classList.toggle("card__status--active", estaActivado && !estaCompletado);
      estadoEl.classList.toggle("card__status--complete", estaCompletado);
    }

    if (botonActivar) {
      botonActivar.disabled = estaActivado || !plan.active;
      botonActivar.textContent = estaActivado ? "Plan activado" : "Activar plan";
    }

    if (botonCompletar) {
      botonCompletar.disabled = estaCompletado || !estaActivado;
      botonCompletar.textContent = estaCompletado ? "Recuerdo guardado" : "Completar plan";
      botonCompletar.classList.toggle("is-disabled-look", !estaActivado && !estaCompletado);
    }

    if (mensaje) {
      mensaje.textContent = estaCompletado
        ? "Este plan ya esta completado y su foto ya forma parte de la línea del tiempo."
        : (estaActivado
          ? "El plan esta activado. Cuando le des a completar, te pedira una foto y se guardara automaticamente con la fecha de hoy."
          : (plan.message || "Primero activa el plan. Cuando lo hagais, podras completarlo con una foto."));
    }

    if (card) {
      card.classList.toggle("card--active", estaActivado && !estaCompletado);
      card.classList.toggle("card--completed", estaCompletado);
    }
  });

  const contador = document.getElementById("contador-planes");
  const contadorComidas = document.getElementById("contador-planes-comidas");
  const restantes = document.getElementById("planes-restantes");
  if (contador) contador.textContent = `${activados} / ${planes.length}`;
  if (contadorComidas) contadorComidas.textContent = `${activados} / ${planes.length}`;
  if (restantes) restantes.textContent = String(planes.length - completados);
  const final = document.getElementById("mensaje-final");
  if (final) final.hidden = completados !== planes.length;
  renderizarCartas(completados);
}

async function activarPlan(planId) {
  const plan = planLibraryState.find((item) => item.id === planId);
  if (!plan || plan.status === "activado" || plan.status === "completado") {
    return;
  }

  await guardarPlanEnFirestore({ ...plan, status: "activado" });
  actualizarEstados();
}

async function completarPlan(planId) {
  const plan = planLibraryState.find((item) => item.id === planId);
  if (!plan) {
    return;
  }

  if (plan.status === "pendiente") {
    alert("Primero activa el plan y luego completalo.");
    return;
  }

  if (plan.status === "completado") {
    return;
  }

  const foto = await pedirFotoParaPlan();
  if (!foto) return;
  if (!foto.type.startsWith("image/")) {
    alert("El archivo debe ser una imagen.");
    return;
  }

  const boton = document.getElementById(`boton-${planId}`);
  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Subiendo foto...";
    }

    const imageUrl = await subirImagenAFirebase(foto, `plans/${planId}`);
    const fecha = hoyIso();
    await guardarPlanEnFirestore({ ...plan, status: "completado", completionPhotoUrl: imageUrl, completionDate: fecha });
    await guardarRecuerdoEnFirestore({
      id: `plan:${planId}`,
      type: "plan",
      planId,
      date: fecha,
      title: plan.title,
      note: plan.title,
      description: plan.backText,
      imageUrl,
      visible: true,
      order: 100 + Number(plan.order || 0)
    });
    renderizarTimeline();
    actualizarEstados();
  } catch (error) {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Completar plan";
    }
    alert(error.message || "No se pudo subir la foto. Intentalo otra vez.");
  }
}

window.onload = async function () {
  inicializarContenidoDesdeSemillas();
  actualizarCountdown();
  renderizarPlanes();
  prepararFormularioTimeline();
  prepararFormulariocanciónes();
  prepararTogglesDeFormulario();
  prepararModalRecuerdo();
  prepararTabs();
  prepararTocadiscos();
  await esperarAuthFirebase();
  await cargarAssetsDesdeStorage();
  await seedFirebaseContent();
  await cargarPlanesFirestore();
  await cargarRecuerdosFirestore();
  await cargarcanciónesFirestore();
  renderizarPlanes();
  actualizarEstados();
  renderizarTimeline();
  renderizarcanciónes();
  setInterval(actualizarCountdown, 1000);
};
