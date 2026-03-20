const fechaObjetivo = new Date("2029-01-11T23:59:00");
const TIMELINE_KEY = "timelineEntries";
const SONGS_KEY = "soundtrackEntries";

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
    return;
  }

  empty.hidden = true;

  entradas.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "timeline-item";
    item.innerHTML = `
      <div class="timeline-item__dot"></div>
      <div class="timeline-item__content">
        <p class="timeline-item__date">${formatearFecha(entry.date)}</p>
        <h4>${entry.title}</h4>
        <p>${entry.description || ""}</p>
        <div class="timeline-item__media">
          <img src="${entry.image}" alt="${entry.title}" />
        </div>
        <span class="timeline-item__tag">${entry.type === "plan" ? "Plan completado" : "Recuerdo manual"}</span>
      </div>
    `;
    contenedor.appendChild(item);
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

  if (!canciones.length) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  canciones.forEach((song) => {
    const item = document.createElement("article");
    item.className = "song-item";
    item.innerHTML = `
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
  renderizarTimeline();
  renderizarCanciones();
  setInterval(actualizarCountdown, 1000);
};
