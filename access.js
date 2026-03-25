const PASSWORD_CORRECTA = "123456789";
const CLAVE_ACCESO = "accesoConcedido";

document.documentElement.classList.add("access-locked");

function concederAcceso() {
  sessionStorage.setItem(CLAVE_ACCESO, "true");
  document.documentElement.classList.remove("access-locked");
  document.body.classList.remove("access-pending");
  document.body.classList.add("access-granted");

  const pantalla = document.getElementById("access-screen");
  if (pantalla) {
    pantalla.hidden = true;
    pantalla.setAttribute("aria-hidden", "true");
    pantalla.style.display = "none";
  }

  const contenido = document.querySelector(".site-shell");
  if (contenido) {
    contenido.style.visibility = "visible";
    contenido.style.opacity = "1";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const pantalla = document.getElementById("access-screen");
  const form = document.getElementById("access-form");
  const input = document.getElementById("access-password");
  const error = document.getElementById("access-error");

  if (sessionStorage.getItem(CLAVE_ACCESO) === "true") {
    concederAcceso();
    return;
  }

  if (!pantalla || !form || !input || !error) {
    return;
  }

  pantalla.hidden = false;
  pantalla.setAttribute("aria-hidden", "false");
  input.focus();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (input.value === PASSWORD_CORRECTA) {
      error.hidden = true;
      input.value = "";
      concederAcceso();
      return;
    }

    error.hidden = false;
    input.value = "";
    input.focus();
  });
});
