const $ = (id) => document.getElementById(id);

const loginForm = $("loginForm");
const registerForm = $("registerForm");
const authSwitchButton = $("authSwitchButton");
const authSubtitle = $("authSubtitle");
const authMessage = $("authMessage");

let isRegisterMode = false;

function saveSession(data) {
  localStorage.setItem("walletflow_token", data.token);
  localStorage.setItem("walletflow_user", JSON.stringify(data.user));
}

function setAuthMode(registerMode) {
  isRegisterMode = registerMode;
  authMessage.textContent = "";

  if (isRegisterMode) {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    authSwitchButton.textContent = "Back to login";
    authSubtitle.textContent = "Create your WalletFlow account";
  } else {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    authSwitchButton.textContent = "Create account";
    authSubtitle.textContent = "Secure personal finance tracker";
  }
}

async function sendAuthRequest(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

authSwitchButton.addEventListener("click", () => {
  setAuthMode(!isRegisterMode);
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    name: document.getElementById("registerName").value,
    email: document.getElementById("registerEmail").value,
    password: document.getElementById("registerPassword").value
  };

  try {
    const data = await sendAuthRequest("/api/auth/register", body);
    saveSession(data);
    window.location.href = "dashboard.html";
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value
  };

  try {
    const data = await sendAuthRequest("/api/auth/login", body);
    saveSession(data);
    window.location.href = "dashboard.html";
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

if (localStorage.getItem("walletflow_token")) {
  window.location.href = "dashboard.html";
}