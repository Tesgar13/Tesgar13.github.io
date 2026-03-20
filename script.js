const fechaObjetivo = new Date("2029-01-11T23:59:00");
const TIMELINE_KEY = "timelineEntries";
const SONGS_KEY = "soundtrackEntries";
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
    unlockAt: 10,
    title: "La carta final",
    preview: "Solo aparece cuando la ruta ya esta completa.",
    message: "Terminamos esta ruta, pero no la historia. Lo bonito de llegar aqui es saber que siempre se puede empezar otra, con mas planes, mas fotos, mas canciones y mas nosotros."
  }
];

const planes = [
  "plan1", "plan2", "plan3", "plan4", "plan5",
  "plan6", "plan7", "plan8", "plan9", "plan10"
];

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

function mensajeDetrasDeRecuerdo(entry) {
  if (entry.type === "plan") {
    return `Esta parada ya forma parte de vuestra ruta. ${entry.description || "Un recuerdo guardado para volver a el cuando querais."}`;
  }

  return entry.description || "Un recuerdo pequeno, pero clavado para quedarse en vuestra historia.";
}

function leerStorageJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

function escribirStorageJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function obtenerTimeline() {
  return leerStorageJson(TIMELINE_KEY);
}

function guardarTimeline(entries) {
  escribirStorageJson(TIMELINE_KEY, entries);
}

function obtenerCanciones() {
  return leerStorageJson(SONGS_KEY);
}

function guardarCanciones(entries) {
  escribirStorageJson(SONGS_KEY, entries);
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
}

function abrirTarjeta(card) {
  const yaAbierta = card.classList.contains("is-open");
  cerrarTarjetas();

  if (!yaAbierta) {
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

    if (!card.querySelector(".memory-upload")) {
      const bloque = document.createElement("div");
      bloque.className = "memory-upload";
      bloque.innerHTML = `
        <label class="memory-upload__label" for="foto-${planId}">
          Foto del recuerdo
        </label>
        <input
          class="memory-upload__input"
          id="foto-${planId}"
          type="file"
          accept="image/*"
        />
        <div class="memory-upload__preview" id="preview-${planId}" hidden>
          <img id="preview-img-${planId}" alt="Foto del ${planId}" />
        </div>
      `;
      acciones.parentNode.insertBefore(bloque, acciones);

      const input = bloque.querySelector(".memory-upload__input");
      input.addEventListener("change", async (event) => {
        const file = event.target.files && event.target.files[0];

        if (!file || !file.type.startsWith("image/")) {
          actualizarPreview(planId, "");
          return;
        }

        const temporal = await leerArchivoComoDataUrl(file);
        actualizarPreview(planId, temporal);
      });
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
    description: "Plan completado y guardado dentro de la ruta.",
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

  const entradas = obtenerTimeline().sort((a, b) => new Date(a.date) - new Date(b.date));
  contenedor.innerHTML = "";

  if (!entradas.length) {
    empty.hidden = false;
    renderizarPortada([]);
    return;
  }

  empty.hidden = true;
  renderizarPortada(entradas);

  entradas.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "timeline-item";
    item.dataset.entryId = entry.id;
    item.innerHTML = `
      <div class="timeline-item__dot">${formatearFecha(entry.date)}</div>
      <div class="timeline-item__content" role="button" tabindex="0" aria-label="Abrir recuerdo ${entry.title}">
        <p class="timeline-item__date">${formatearFecha(entry.date)}</p>
        <div class="timeline-item__media">
          <img src="${entry.image}" alt="${entry.title}" />
        </div>
        <h4>${entry.title}</h4>
        <p class="timeline-item__caption">${entry.description || "Pulsa para ampliar este recuerdo."}</p>
        <span class="timeline-item__tag">${entry.type === "plan" ? "Plan completado" : "Recuerdo manual"}</span>
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
    { top: "8%", left: "8%", tilt: "-10deg" },
    { top: "10%", left: "38%", tilt: "8deg" },
    { top: "14%", left: "67%", tilt: "-6deg" },
    { top: "44%", left: "12%", tilt: "6deg" },
    { top: "48%", left: "41%", tilt: "-8deg" },
    { top: "50%", left: "69%", tilt: "10deg" }
  ];

  barajar(entradas).slice(0, posiciones.length).forEach((entry, index) => {
    const posicion = posiciones[index];
    const foto = document.createElement("article");
    foto.className = "cover-memory";
    foto.style.top = posicion.top;
    foto.style.left = posicion.left;
    foto.style.setProperty("--tilt", posicion.tilt);
    foto.innerHTML = `
      <img src="${entry.image}" alt="${entry.title}" />
      <p class="cover-memory__caption">${entry.title}</p>
    `;
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
  actualizarVinilo(canciones);

  if (!canciones.length) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  canciones.forEach((song) => {
    const item = document.createElement("article");
    item.className = "song-item";
    item.innerHTML = `
      <div class="song-item__record" aria-hidden="true"></div>
      <div class="song-item__content">
        <p class="song-item__eyebrow">Banda sonora</p>
        <h4>${song.title}</h4>
        <p class="song-item__artist">${song.artist}</p>
        <p>${song.note || ""}</p>
        ${song.link ? `<a class="song-item__link" href="${song.link}" target="_blank" rel="noopener noreferrer">Escuchar cancion</a>` : ""}
      </div>
    `;
    contenedor.appendChild(item);
  });
}

function actualizarVinilo(canciones) {
  const vinylRecord = document.getElementById("vinyl-record");
  const vinylTitle = document.getElementById("vinyl-title");
  const vinylArtist = document.getElementById("vinyl-artist");
  const copyTitle = document.getElementById("vinyl-copy-title");
  const copyNote = document.getElementById("vinyl-copy-note");
  const link = document.getElementById("vinyl-link");

  if (!vinylRecord || !vinylTitle || !vinylArtist || !copyTitle || !copyNote || !link) {
    return;
  }

  if (!canciones.length) {
    vinylRecord.classList.remove("is-spinning");
    vinylTitle.textContent = "Sin cancion";
    vinylArtist.textContent = "Anade una para empezar vuestra banda sonora";
    copyTitle.textContent = "Esperando vuestra primera cancion";
    copyNote.textContent = "Cuando guardes una cancion, aparecera aqui como el disco principal de vuestra historia.";
    link.hidden = true;
    link.removeAttribute("href");
    return;
  }

  const song = canciones[canciones.length - 1];
  vinylRecord.classList.add("is-spinning");
  vinylTitle.textContent = song.title;
  vinylArtist.textContent = song.artist;
  copyTitle.textContent = song.title;
  copyNote.textContent = song.note || `${song.artist} ya forma parte de vuestra banda sonora.`;

  if (song.link) {
    link.hidden = false;
    link.href = song.link;
  } else {
    link.hidden = true;
    link.removeAttribute("href");
  }
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

  const input = document.getElementById(`foto-${planId}`);
  const boton = document.getElementById(`boton-${planId}`);
  const card = document.querySelector(`.card[data-plan="${planId}"]`);
  const titulo = card ? card.dataset.planTitle : planId;

  if (!input || !input.files || !input.files[0]) {
    alert("Para completar el plan necesitas anadir una foto.");
    return;
  }

  const foto = input.files[0];

  if (!foto.type.startsWith("image/")) {
    alert("El archivo debe ser una imagen.");
    return;
  }

  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Guardando recuerdo...";
    }

    const imagenBase64 = await leerArchivoComoDataUrl(foto);
    const fecha = hoyIso();

    localStorage.setItem(claveEstado(planId), "completado");
    localStorage.setItem(claveFoto(planId), imagenBase64);
    localStorage.setItem(claveFecha(planId), fecha);

    crearEntradaPlan(planId, titulo, fecha, imagenBase64);
    actualizarEstados();
    renderizarTimeline();
  } catch (error) {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Completar plan";
    }

    alert("No se pudo guardar la foto. Intentalo otra vez.");
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
    const input = document.getElementById(`foto-${plan}`);
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

    if (input) {
      input.disabled = estaCompletado;
    }

    if (mensaje) {
      if (estaCompletado) {
        mensaje.textContent = "Este plan ya esta completado y su foto ya forma parte de la linea del tiempo.";
      } else if (estaActivado) {
        mensaje.textContent = "El plan esta activado. Cuando pase, completalo con una foto y se guardara automaticamente con la fecha de hoy.";
      } else {
        mensaje.textContent = "Primero activa el plan. Cuando lo hagais, podras completarlo con una foto.";
      }
    }

    if (card) {
      card.classList.toggle("card--active", estaActivado && !estaCompletado);
      card.classList.toggle("card--completed", estaCompletado);
    }

    actualizarPreview(plan, fotoGuardada || "");
  });

  const contador = document.getElementById("contador-planes");
  if (contador) {
    contador.textContent = `${activados} / ${planes.length}`;
  }

  const final = document.getElementById("mensaje-final");
  if (final) {
    final.hidden = completados !== planes.length;
  }

  renderizarCartas(completados);
}

function renderizarCartas(completados) {
  const contenedor = document.getElementById("letters-grid");

  if (!contenedor) {
    return;
  }

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
}

function abrirModalRecuerdo(entryId) {
  const modal = document.getElementById("memory-modal");
  const flip = document.getElementById("memory-flip");
  const image = document.getElementById("memory-modal-image");
  const date = document.getElementById("memory-modal-date");
  const title = document.getElementById("memory-modal-title");
  const description = document.getElementById("memory-modal-description");
  const backTitle = document.getElementById("memory-modal-back-title");
  const message = document.getElementById("memory-modal-message");
  const entry = obtenerTimeline().find((item) => item.id === entryId);

  if (!modal || !flip || !image || !date || !title || !description || !backTitle || !message || !entry) {
    return;
  }

  flip.classList.remove("is-flipped");
  image.src = entry.image;
  image.alt = entry.title;
  date.textContent = formatearFecha(entry.date);
  title.textContent = entry.title;
  description.textContent = entry.description || "Un recuerdo guardado para volver a este momento cuando querais.";
  backTitle.textContent = entry.title;
  message.textContent = mensajeDetrasDeRecuerdo(entry);
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
  modal.hidden = true;
  document.body.style.overflow = "";
}

function prepararModalRecuerdo() {
  const modal = document.getElementById("memory-modal");
  const flip = document.getElementById("memory-flip");
  const turn = document.getElementById("memory-modal-turn");
  const back = document.getElementById("memory-modal-return");

  if (!modal || !flip || !turn || !back) {
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

  document.querySelectorAll(".tab-nav__button, [data-tab-target]").forEach((button) => {
    if (!button.dataset.tabTarget) {
      return;
    }

    button.classList.toggle("is-active", button.dataset.tabTarget === tabId && button.classList.contains("tab-nav__button"));
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
      alert("Para anadir un recuerdo manual necesitas fecha, titulo y foto.");
      return;
    }

    const imagen = await leerArchivoComoDataUrl(file);
    const entradas = obtenerTimeline();

    entradas.push({
      id: `manual:${Date.now()}`,
      type: "manual",
      date: dateInput.value,
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      image: imagen
    });

    guardarTimeline(entradas);
    renderizarTimeline();
    form.reset();
    preview.hidden = true;
    previewImg.removeAttribute("src");
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
    const linkInput = document.getElementById("song-link");
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
      link: linkInput.value.trim(),
      note: noteInput.value.trim()
    });

    guardarCanciones(canciones);
    renderizarCanciones();
    form.reset();
  });
}

window.onload = function () {
  insertarControlesDePlan();
  actualizarCountdown();
  actualizarEstados();
  prepararTarjetas();
  prepararFormularioTimeline();
  prepararFormularioCanciones();
  prepararModalRecuerdo();
  prepararTabs();
  renderizarTimeline();
  renderizarCanciones();
  setInterval(actualizarCountdown, 1000);
};
