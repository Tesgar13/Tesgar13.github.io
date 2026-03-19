const fechaObjetivo = new Date("2029-01-11T23:59:00");
const TIMELINE_KEY = "timelineEntries";

const planes = [
  "plan1", "plan2", "plan3", "plan4", "plan5",
  "plan6", "plan7", "plan8", "plan9", "plan10"
];

function claveFoto(planId) {
  return `${planId}_foto`;
}

function claveFecha(planId) {
  return `${planId}_fecha`;
}

function obtenerTimeline() {
  try {
    return JSON.parse(localStorage.getItem(TIMELINE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function guardarTimeline(entries) {
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(entries));
}

function normalizarFecha(valor) {
  if (!valor) {
    return "";
  }

  return valor.slice(0, 10);
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

  const ahora = new Date();
  const diferencia = fechaObjetivo - ahora;

  if (diferencia <= 0) {
    diasEl.textContent = "00";
    horasEl.textContent = "00";
    minutosEl.textContent = "00";
    segundosEl.textContent = "00";
    return;
  }

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
  const segundos = Math.floor((diferencia / 1000) % 60);

  diasEl.textContent = String(dias).padStart(2, "0");
  horasEl.textContent = String(horas).padStart(2, "0");
  minutosEl.textContent = String(minutos).padStart(2, "0");
  segundosEl.textContent = String(segundos).padStart(2, "0");
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

function insertarBloquesDeFoto() {
  document.querySelectorAll(".card[data-plan]").forEach((card) => {
    const planId = card.dataset.plan;
    const acciones = card.querySelector(".card__actions");

    if (!planId || !acciones || card.querySelector(".memory-upload")) {
      return;
    }

    const bloque = document.createElement("div");
    bloque.className = "memory-upload";
    bloque.innerHTML = `
      <label class="memory-upload__label" for="foto-${planId}">
        Sube una foto para completar este recuerdo
      </label>
      <input
        class="memory-upload__input"
        id="foto-${planId}"
        type="file"
        accept="image/*"
      />
      <label class="memory-upload__label" for="fecha-${planId}">
        Fecha del plan
      </label>
      <input
        class="memory-upload__date"
        id="fecha-${planId}"
        type="date"
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
  });
}

function crearEntradaPlan(planId, titulo, fecha, imagen) {
  const entradas = obtenerTimeline();
  const existente = entradas.find((entry) => entry.id === `plan:${planId}`);

  const nuevaEntrada = {
    id: `plan:${planId}`,
    type: "plan",
    planId,
    date: fecha,
    title: titulo,
    description: `Plan completado y guardado dentro de la ruta.`,
    image: imagen
  };

  if (existente) {
    const actualizadas = entradas.map((entry) => (
      entry.id === nuevaEntrada.id ? nuevaEntrada : entry
    ));
    guardarTimeline(actualizadas);
    return;
  }

  entradas.push(nuevaEntrada);
  guardarTimeline(entradas);
}

function renderizarTimeline() {
  const contenedor = document.getElementById("timeline");
  const empty = document.getElementById("timeline-empty");

  if (!contenedor || !empty) {
    return;
  }

  const entradas = obtenerTimeline()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

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

async function activarPlan(planId) {
  if (localStorage.getItem(planId)) {
    return;
  }

  const input = document.getElementById(`foto-${planId}`);
  const inputFecha = document.getElementById(`fecha-${planId}`);
  const boton = document.getElementById(`boton-${planId}`);
  const card = document.querySelector(`.card[data-plan="${planId}"]`);
  const titulo = card ? card.dataset.planTitle : planId;
  const fecha = normalizarFecha(inputFecha ? inputFecha.value : "");

  if (!input || !input.files || !input.files[0]) {
    alert("Antes de completar el plan, anade una foto del recuerdo.");
    return;
  }

  if (!fecha) {
    alert("Antes de completar el plan, anade tambien la fecha.");
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
    localStorage.setItem(planId, "activado");
    localStorage.setItem(claveFoto(planId), imagenBase64);
    localStorage.setItem(claveFecha(planId), fecha);

    crearEntradaPlan(planId, titulo, fecha, imagenBase64);
    actualizarEstados();
    renderizarTimeline();
  } catch (error) {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Completar con foto";
    }

    alert("No se pudo guardar la foto. Intentalo otra vez.");
  }
}

function actualizarEstados() {
  let activados = 0;

  planes.forEach((plan) => {
    const estado = document.getElementById(`estado-${plan}`);
    const boton = document.getElementById(`boton-${plan}`);
    const mensaje = document.getElementById(`mensaje-${plan}`);
    const input = document.getElementById(`foto-${plan}`);
    const inputFecha = document.getElementById(`fecha-${plan}`);
    const card = document.querySelector(`.card[data-plan="${plan}"]`);
    const fotoGuardada = localStorage.getItem(claveFoto(plan));
    const fechaGuardada = localStorage.getItem(claveFecha(plan));
    const activo = Boolean(localStorage.getItem(plan) && fotoGuardada && fechaGuardada);

    if (inputFecha && fechaGuardada) {
      inputFecha.value = fechaGuardada;
    }

    if (activo) {
      activados += 1;
      if (card) {
        crearEntradaPlan(plan, card.dataset.planTitle || plan, fechaGuardada, fotoGuardada);
      }
    }

    if (estado) {
      estado.textContent = activo ? "Completado" : "Pendiente";
      estado.classList.toggle("card__status--active", activo);
    }

    if (boton) {
      boton.disabled = activo;
      boton.textContent = activo ? "Recuerdo guardado" : "Completar con foto";
    }

    if (input) {
      input.disabled = activo;
    }

    if (inputFecha) {
      inputFecha.disabled = activo;
    }

    if (mensaje) {
      mensaje.textContent = activo
        ? "Este plan ya esta completado y su foto ya forma parte de la linea del tiempo."
        : "Para completarlo, sube una foto, anade la fecha y guarda el recuerdo.";
    }

    if (card) {
      card.classList.toggle("card--completed", activo);
    }

    actualizarPreview(plan, fotoGuardada || "");
  });

  const contador = document.getElementById("contador-planes");
  if (contador) {
    contador.textContent = `${activados} / ${planes.length}`;
  }

  const final = document.getElementById("mensaje-final");
  if (final) {
    final.hidden = activados !== planes.length;
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

    const temporal = await leerArchivoComoDataUrl(file);
    preview.hidden = false;
    previewImg.src = temporal;
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
      date: normalizarFecha(dateInput.value),
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

window.onload = function () {
  insertarBloquesDeFoto();
  actualizarCountdown();
  actualizarEstados();
  prepararTarjetas();
  prepararFormularioTimeline();
  renderizarTimeline();
  setInterval(actualizarCountdown, 1000);
};
