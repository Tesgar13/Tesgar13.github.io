document.documentElement.classList.add("access-locked");

function setPendingAccessState() {
  document.body.classList.add("access-pending");
  document.body.classList.remove("access-granted");
  document.documentElement.classList.add("access-locked");
}

function setAuthenticatedState(user) {
  const overlay = document.getElementById("auth-overlay");
  const authBar = document.getElementById("auth-bar");
  const authUser = document.getElementById("auth-user");
  const loginError = document.getElementById("login-error");
  const siteShell = document.querySelector(".site-shell");

  if (overlay) {
    overlay.setAttribute("aria-hidden", "true");
  }

  if (authBar) {
    authBar.style.display = "flex";
  }

  if (authUser) {
    authUser.textContent = user?.email || "Sesion iniciada";
  }

  if (loginError) {
    loginError.textContent = "";
  }

  if (siteShell) {
    siteShell.style.visibility = "visible";
    siteShell.style.opacity = "1";
  }

  document.body.classList.remove("access-pending");
  document.body.classList.add("access-granted");
  document.documentElement.classList.remove("access-locked");
}

function setLoggedOutState() {
  const overlay = document.getElementById("auth-overlay");
  const authBar = document.getElementById("auth-bar");
  const authUser = document.getElementById("auth-user");
  const siteShell = document.querySelector(".site-shell");

  if (overlay) {
    overlay.setAttribute("aria-hidden", "false");
  }

  if (authBar) {
    authBar.style.display = "none";
  }

  if (authUser) {
    authUser.textContent = "";
  }

  if (siteShell) {
    siteShell.style.visibility = "";
    siteShell.style.opacity = "";
  }

  setPendingAccessState();
}

window.addEventListener("load", () => {
  const auth = window.firebaseAuth;
  const { signInWithEmailAndPassword, signOut, onAuthStateChanged } = window.firebaseFns || {};

  const form = document.getElementById("auth-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");
  const loginError = document.getElementById("login-error");

  setPendingAccessState();

  if (!auth || !signInWithEmailAndPassword || !signOut || !onAuthStateChanged) {
    if (loginError) {
      loginError.textContent = "No se pudo iniciar el acceso privado.";
    }
    setLoggedOutState();
    return;
  }

  if (form && emailInput && passwordInput && loginButton) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      loginError.textContent = "";
      loginButton.disabled = true;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        passwordInput.value = "";
        window.location.reload();
      } catch (error) {
        loginError.textContent = "Correo o clave incorrectos.";
      } finally {
        loginButton.disabled = false;
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;

      try {
        await signOut(auth);
      } finally {
        logoutButton.disabled = false;
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setAuthenticatedState(user);
      return;
    }

    setLoggedOutState();

    if (emailInput && !emailInput.value) {
      emailInput.focus();
    }
  });
});
