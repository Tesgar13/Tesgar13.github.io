const fechaObjetivo = new Date("2029-01-11T23:59:00");

const planes = [
  "plan1", "plan2", "plan3", "plan4", "plan5",
  "plan6", "plan7", "plan8", "plan9", "plan10"
];

function actualizarCountdown() {
  const ahora = new Date();
  const diferencia = fechaObjetivo - ahora;

  if (diferencia <= 0) {
    document.getElementById("dias").textContent = "00";
    document.getElementById("horas").textContent = "00";
    document.getElementById("minutos").textContent = "00";
    document.getElementById("segundos").textContent = "00";
    return;
  }

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
  const segundos = Math.floor((diferencia / 1000) % 60);

  document.getElementById("dias").textContent = String(dias).padStart(2, "0");
  document.getElementById("horas").textContent = String(horas).padStart(2, "0");
  document.getElementById("minutos").textContent = String(minutos).padStart(2, "0");
  document.getElementById("segundos").textContent = String(segundos).padStart(2, "0");
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

function activarPlan(planId) {
  if (localStorage.getItem(planId)) return;

  localStorage.setItem(planId, "activado");

  const boton = document.getElementById(`boton-${planId}`);
  const mensaje = document.getElementById(`mensaje-${planId}`);

  if (boton) {
    boton.disabled = true;
    boton.textContent = "Plan activado";
  }

  if (mensaje) {
    mensaje.textContent = "Este plan ya ha sido activado.";
  }

  actualizarEstados();
}

function actualizarEstados() {
  let activados = 0;

  planes.forEach((plan) => {
    const estado = document.getElementById(`estado-${plan}`);
    const boton = document.getElementById(`boton-${plan}`);
    const mensaje = document.getElementById(`mensaje-${plan}`);
    const activo = Boolean(localStorage.getItem(plan));

    if (activo) {
      activados += 1;
    }

    if (estado) {
      estado.textContent = activo ? "Activado" : "Pendiente";
      estado.classList.toggle("card__status--active", activo);
    }

    if (boton) {
      boton.disabled = activo;
      boton.textContent = activo ? "Plan activado" : "Activar plan";
    }

    if (mensaje && activo) {
      mensaje.textContent = "Este plan ya ha sido activado.";
    }
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
      if (event.target.closest("button")) {
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

window.onload = function () {
  actualizarCountdown();
  actualizarEstados();
  prepararTarjetas();
  setInterval(actualizarCountdown, 1000);
};
