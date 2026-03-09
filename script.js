// =============================
// CONFIGURACIÓN
// =============================

const fechaObjetivo = new Date("2029-01-11T23:59:00");

// lista de planes
const planes = [
  "plan1","plan2","plan3","plan4",
  "plan5","plan6","plan7","plan8",
  "plan9","plan10","plan11","plan12"
];


// =============================
// CONTADOR REGRESIVO
// =============================

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

  document.getElementById("dias").textContent = dias;
  document.getElementById("horas").textContent = horas;
  document.getElementById("minutos").textContent = minutos;
  document.getElementById("segundos").textContent = segundos;
}

setInterval(actualizarCountdown, 1000);


// =============================
// ACTIVAR PLAN
// =============================

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
    mensaje.textContent = "✔ Este plan ya ha sido activado";
  }

  actualizarEstados();
}


// =============================
// ACTUALIZAR ESTADOS
// =============================

function actualizarEstados() {

  let activados = 0;

  planes.forEach(plan => {

    const estado = document.getElementById(`estado-${plan}`);

    if (localStorage.getItem(plan)) {

      activados++;

      if (estado) {
        estado.textContent = "Activado";
        estado.style.color = "green";
      }

    } else {

      if (estado) {
        estado.textContent = "Pendiente";
      }

    }

  });

  // actualizar contador
  const contador = document.getElementById("contador-planes");
  if (contador) {
    contador.textContent = `${activados} / 12`;
  }

  // mensaje final
  const final = document.getElementById("mensaje-final");
  if (final && activados === 12) {
    final.hidden = false;
  }

}


// =============================
// AL CARGAR LA WEB
// =============================

window.onload = function() {

  actualizarCountdown();
  actualizarEstados();

};
