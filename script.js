const fechaObjetivo = new Date("2029-01-11T23:59:00");
const TIMELINE_KEY = "timelineEntries";
const SONGS_KEY = "soundtrackEntries";
const ASSET_MAP_KEY = "firebaseAssetMap";
const MOCK_SLOTS = 10;
let songActualIndex = -1;
let turntablePlaying = false;
const PORTADA_DESTACADA_ID = "seed:fotofav";
const DEFAULT_MEMORY_NOTE = "Escribe aqui una frase vuestra.";
const DEFAULT_MEMORY_DESCRIPTION = "Pon aqui una descripcion pequena que luego cambiaras.";
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
    message: "Terminamos esta ruta, pero no la historia. Lo bonito de llegar aqui es saber que siempre se puede empezar otra, con mas planes, mas fotos, mas canciones y mas nosotros."
  }
];

const planes = [
  "plan1", "plan2", "plan3", "plan4", "plan5",
  "plan6", "plan7", "plan8", "plan9"
];
const STATIC_IMAGE_PATHS = [
  "img/Entrada.png",
  "img/fotofav.jpeg",
  "img/GH.jpg",
  "img/Marias.jpg",
  "img/Lentejas.jpg",
  "img/BocadilloJ.jpg"
];
const ASSET_STORAGE_NAME_MAP = {
  "img/BocadilloJ.jpg": "Bocadillo.jpg"
};
const MIGRATABLE_ASSET_PATHS = Array.from(new Set([
  ...STATIC_IMAGE_PATHS,
  ...TIMELINE_SEED.map((entry) => entry.image)
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

function obtenerDescripcionRecuerdo(entry) {
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

function mensajeDetrasDeRecuerdo(entry) {
  const descripcion = obtenerDescripcionRecuerdo(entry);

  if (entry.type === "plan") {
    return descripcion === DEFAULT_MEMORY_DESCRIPTION
      ? "Esta parada ya forma parte de vuestra ruta. Aqui puedes escribir lo que os guardo esta foto."
      : descripcion;
  }

  return descripcion;
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

  return assetUrlMap[path] || "";
}

function aplicarAssetsRemotosAlDom() {
  const root = document.documentElement;
  root.style.setProperty("--entrada-image", `url("${resolveImageUrl("img/Entrada.png")}")`);
  root.style.setProperty("--hero-featured-image", `url("${resolveImageUrl("img/fotofav.jpeg")}")`);

  document.querySelectorAll("img").forEach((image) => {
    const originalPath = image.dataset.assetPath || image.getAttribute("src");

    if (!originalPath || !originalPath.startsWith("img/")) {
      return;
    }

    image.dataset.assetPath = originalPath;
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

function storagePathDesdeAssetLocal(assetPath) {
  const fileName = ASSET_STORAGE_NAME_MAP[assetPath] || assetPath.split("/").pop();
  return fileName ? `assets/${fileName}` : "";
}

async function cargarAssetsDesdeStorage() {
  if (!window.firebaseStorage || !window.firebaseFns) {
    aplicarAssetsRemotosAlDom();
    return;
  }

  const { ref, getDownloadURL } = window.firebaseFns;
  const storage = window.firebaseStorage;
  const nextMap = { ...assetUrlMap };

  await Promise.all(MIGRATABLE_ASSET_PATHS.map(async (assetPath) => {
    try {
      const remoteUrl = await getDownloadURL(ref(storage, storagePathDesdeAssetLocal(assetPath)));
      nextMap[assetPath] = remoteUrl;
    } catch (error) {
      console.error(`No se pudo cargar ${assetPath} desde Firebase Storage.`, error);
    }
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

function obtenerCanciones() {
  return leerStorageJson(SONGS_KEY);
}

function guardarCanciones(entries) {
  escribirStorageJson(SONGS_KEY, entries);
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

async function subirImagenAFirebase(file, folder = "recuerdos") {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
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
    const descripcion = obtenerDescripcionRecuerdo(entry);
    const etiqueta = entry.type === "plan"
      ? "Plan completado"
      : (entry.type === "manual" ? "Recuerdo manual" : "Recuerdo clavado");
    const item = document.createElement("article");
    item.className = "timeline-item";
    item.dataset.entryId = entry.id;
    item.innerHTML = `
      <div class="timeline-item__dot">${formatearFecha(entry.date)}</div>
      <div class="timeline-item__content" role="button" tabindex="0" aria-label="Abrir recuerdo del ${formatearFecha(entry.date)}">
        <p class="timeline-item__date">${formatearFecha(entry.date)}</p>
        <div class="timeline-item__media">
          <img src="${resolveImageUrl(entry.image)}" alt="${obtenerAltRecuerdo(entry)}" />
        </div>
        <p class="timeline-item__note">${texto}</p>
        <p class="timeline-item__caption">${descripcion}</p>
        <span class="timeline-item__tag">${etiqueta}</span>
      </div>
    `;

    const content = item.querySelector(".timeline-item__content");
    content.addEventListener("click", () => abrirModalRecuerdo(entry.id));
    content.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        abrirModalRecuerdo(entry.id);
      }
    });

    contenedor.appendChild(item);
  });

  for (let i = entradas.length; i < MOCK_SLOTS; i += 1) {
    const placeholder = document.createElement("article");
    placeholder.className = "timeline-item timeline-item--placeholder";
    placeholder.innerHTML = `
      <div class="timeline-item__dot">Espacio</div>
      <div class="timeline-item__content" aria-hidden="true">
        <p class="timeline-item__date">Fecha pendiente</p>
        <div class="timeline-item__media timeline-item__media--placeholder"></div>
        <p class="timeline-item__note">${DEFAULT_MEMORY_NOTE}</p>
        <p class="timeline-item__caption">${DEFAULT_MEMORY_DESCRIPTION}</p>
        <span class="timeline-item__tag">Hueco reservado</span>
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
        <p>Todavia no hay fotos clavadas en vuestra historia. En cuanto guardes recuerdos, iran apareciendo aqui.</p>
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

function renderizarCanciones() {
  const contenedor = document.getElementById("songs-list");
  const empty = document.getElementById("songs-empty");

  if (!contenedor || !empty) {
    return;
  }

  const canciones = obtenerCanciones();
  contenedor.innerHTML = "";
  if (songActualIndex >= canciones.length) {
    songActualIndex = canciones.length ? canciones.length - 1 : -1;
  }
  actualizarTocadiscos(canciones);

  if (!canciones.length) {
    empty.hidden = false;
    empty.textContent = "Aqui abajo ves la plantilla de 10 canciones para que puedas imaginar la coleccion terminada.";
  } else {
    empty.hidden = true;
  }

  canciones.forEach((song, index) => {
    const spotifyLink = song.spotifyLink || song.link || "";
    const appleLink = song.appleLink || "";
    const item = document.createElement("article");
    item.className = "song-item";
    item.innerHTML = `
      <div class="song-item__sleeve">
        <div class="song-item__record" aria-hidden="true"></div>
      </div>
      <div class="song-item__content">
        <p class="song-item__eyebrow">En funda</p>
        <h4>${song.title}</h4>
        <p class="song-item__artist">${song.artist}</p>
        <p>${song.note || ""}</p>
        <div class="song-item__links">
          ${spotifyLink ? `<a class="song-item__link" href="${spotifyLink}" target="_blank" rel="noopener noreferrer">Spotify</a>` : ""}
          ${appleLink ? `<a class="song-item__link" href="${appleLink}" target="_blank" rel="noopener noreferrer">Apple Music</a>` : ""}
        </div>
      </div>
    `;
    item.addEventListener("click", () => {
      songActualIndex = index;
      turntablePlaying = true;
      actualizarTocadiscos(canciones);
      marcarCancionActiva();
    });
    contenedor.appendChild(item);
  });

  for (let i = canciones.length; i < MOCK_SLOTS; i += 1) {
    const item = document.createElement("article");
    item.className = "song-item song-item--placeholder";
    item.innerHTML = `
      <div class="song-item__sleeve">
        <div class="song-item__record" aria-hidden="true"></div>
      </div>
      <div class="song-item__content">
        <p class="song-item__eyebrow">Hueco ${i + 1}</p>
        <h4>Titulo pendiente</h4>
        <p class="song-item__artist">Artista pendiente</p>
        <p>Aqui ira la nota que acompane a la cancion y explique por que se ha quedado con vosotros.</p>
      </div>
    `;
    contenedor.appendChild(item);
  }

  marcarCancionActiva();
  prepararCarruselCanciones();
}

function marcarCancionActiva() {
  document.querySelectorAll(".songs-list .song-item").forEach((item, index) => {
    item.classList.toggle("song-item--active", index === songActualIndex);
  });

  const activa = document.querySelector(".songs-list .song-item--active");
  if (activa) {
    activa.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function actualizarTocadiscos(canciones) {
  const record = document.getElementById("turntable-record");
  const title = document.getElementById("turntable-title");
  const artist = document.getElementById("turntable-artist");
  const spotifyLink = document.getElementById("turntable-link-spotify");
  const appleLink = document.getElementById("turntable-link-apple");

  if (!record || !title || !artist || !spotifyLink || !appleLink) {
    return;
  }

  if (!canciones.length) {
    record.classList.remove("is-spinning");
    title.textContent = "Sin cancion";
    artist.textContent = "Toca el tocadiscos para ver la coleccion";
    spotifyLink.hidden = true;
    spotifyLink.removeAttribute("href");
    appleLink.hidden = true;
    appleLink.removeAttribute("href");
    return;
  }

  if (songActualIndex < 0) {
    songActualIndex = canciones.length - 1;
  }

  const song = canciones[songActualIndex];
  const spotifyUrl = song.spotifyLink || song.link || "";
  const appleUrl = song.appleLink || "";
  record.classList.toggle("is-spinning", turntablePlaying);
  title.textContent = song.title;
  artist.textContent = song.note || song.artist;

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
  const canciones = obtenerCanciones();

  if (!canciones.length) {
    return;
  }

  if (songActualIndex < 0) {
    songActualIndex = 0;
  } else {
    songActualIndex = (songActualIndex + direccion + canciones.length) % canciones.length;
  }

  turntablePlaying = true;
  actualizarTocadiscos(canciones);
  marcarCancionActiva();
}

function prepararCarruselCanciones() {
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
        mensaje.textContent = "Este plan ya esta completado y su foto ya forma parte de la linea del tiempo.";
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
              <p class="letter-card__text">${unlocked ? letter.preview : "Todavia esta cerrada. Seguid completando planes para abrirla."}</p>
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
  const noteInput = document.getElementById("memory-modal-note-input");
  const descriptionInput = document.getElementById("memory-modal-description-input");
  const saved = document.getElementById("memory-modal-saved");
  const backTitle = document.getElementById("memory-modal-back-title");
  const message = document.getElementById("memory-modal-message");
  const entry = obtenerTimeline().find((item) => item.id === entryId);

  if (!modal || !flip || !image || !date || !noteInput || !descriptionInput || !saved || !backTitle || !message || !entry) {
    return;
  }

  flip.classList.remove("is-flipped");
  image.src = resolveImageUrl(entry.image);
  image.alt = obtenerAltRecuerdo(entry);
  date.textContent = formatearFecha(entry.date);
  noteInput.value = obtenerTextoRecuerdo(entry);
  descriptionInput.value = obtenerDescripcionRecuerdo(entry);
  saved.hidden = true;
  backTitle.textContent = obtenerTextoRecuerdo(entry);
  message.textContent = mensajeDetrasDeRecuerdo(entry);
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
  const noteInput = document.getElementById("memory-modal-note-input");
  const descriptionInput = document.getElementById("memory-modal-description-input");
  const saved = document.getElementById("memory-modal-saved");
  const backTitle = document.getElementById("memory-modal-back-title");
  const message = document.getElementById("memory-modal-message");

  if (!modal || !noteInput || !descriptionInput || !saved || !backTitle || !message || !modal.dataset.entryId) {
    return;
  }

  const texto = noteInput.value.trim();
  const descripcion = descriptionInput.value.trim();

  if (!texto) {
    alert("Pon al menos una frase corta para esa foto.");
    noteInput.focus();
    return;
  }

  const actualizadas = obtenerTimeline().map((entry) => {
    if (entry.id !== modal.dataset.entryId) {
      return entry;
    }

    return {
      ...entry,
      title: entry.type === "manual" ? texto : entry.title,
      note: texto,
      description: descripcion
    };
  });

  guardarTimeline(actualizadas);
  renderizarTimeline();

  const actualizada = actualizadas.find((entry) => entry.id === modal.dataset.entryId);
  if (!actualizada) {
    return;
  }

  backTitle.textContent = obtenerTextoRecuerdo(actualizada);
  message.textContent = mensajeDetrasDeRecuerdo(actualizada);
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
  const noteInput = document.getElementById("memory-modal-note-input");
  const descriptionInput = document.getElementById("memory-modal-description-input");
  const saved = document.getElementById("memory-modal-saved");

  if (!modal || !flip || !turn || !back || !save || !noteInput || !descriptionInput || !saved) {
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
  noteInput.addEventListener("input", () => {
    saved.hidden = true;
  });
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
        button.textContent = "Anadir recuerdo";
      }
    } catch (error) {
      alert(error.message || "No se pudo subir el recuerdo.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Guardar en la linea del tiempo";
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
        ? (button.dataset.toggleForm === "song-form-shell" ? "Anadir nueva cancion" : "Anadir recuerdo")
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

  if (!toggle || !library || !prev || !next || !stop || !play) {
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
    turntablePlaying = false;
    actualizarTocadiscos(obtenerCanciones());
  });
  play.addEventListener("click", () => {
    if (!obtenerCanciones().length) {
      return;
    }

    if (songActualIndex < 0) {
      songActualIndex = obtenerCanciones().length - 1;
    }

    turntablePlaying = true;
    actualizarTocadiscos(obtenerCanciones());
  });
}

function prepararFormularioCanciones() {
  const form = document.getElementById("song-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const titleInput = document.getElementById("song-title");
    const artistInput = document.getElementById("song-artist");
    const spotifyInput = document.getElementById("song-link-spotify");
    const appleInput = document.getElementById("song-link-apple");
    const noteInput = document.getElementById("song-note");

    if (!titleInput.value.trim() || !artistInput.value.trim()) {
      alert("La cancion necesita al menos titulo y artista.");
      return;
    }

    const canciones = obtenerCanciones();
    canciones.push({
      id: `song:${Date.now()}`,
      title: titleInput.value.trim(),
      artist: artistInput.value.trim(),
      spotifyLink: spotifyInput.value.trim(),
      appleLink: appleInput.value.trim(),
      note: noteInput.value.trim()
    });

    guardarCanciones(canciones);
    renderizarCanciones();
    form.reset();

    const shell = document.getElementById("song-form-shell");
    const button = document.querySelector('[data-toggle-form="song-form-shell"]');
    if (shell) {
      shell.hidden = true;
    }
    if (button) {
      button.textContent = "Anadir nueva cancion";
    }
  });
}

window.onload = async function () {
  insertarControlesDePlan();
  limpiarPlanesActivadosDePrueba();
  actualizarCountdown();
  actualizarEstados();
  prepararTarjetas();
  prepararFormularioTimeline();
  prepararFormularioCanciones();
  prepararTogglesDeFormulario();
  prepararModalRecuerdo();
  prepararTabs();
  prepararTocadiscos();
  await esperarAuthFirebase();
  await cargarAssetsDesdeStorage();
  await cargarRecuerdosFirestore();
  actualizarEstados();
  renderizarTimeline();
  renderizarCanciones();
  setInterval(actualizarCountdown, 1000);
};
