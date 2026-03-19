const PASSWORD_CORRECTA = "123456789";
const CLAVE_ACCESO = "accesoConcedido";

if (sessionStorage.getItem(CLAVE_ACCESO) !== "true") {
  let passwordUsuario = "";

  while (passwordUsuario !== PASSWORD_CORRECTA) {
    passwordUsuario = prompt("Introduce la contraseña para acceder:");

    if (passwordUsuario === PASSWORD_CORRECTA) {
      sessionStorage.setItem(CLAVE_ACCESO, "true");
      break;
    }

    alert("Contraseña incorrecta. Inténtalo de nuevo.");
  }
}
