// ===============================
// CONFIG
// ===============================
const API_URL = "https://pathquestadmin.onrender.com/api/player"; // CHANGE THIS

// ===============================
// DOM
// ===============================
const loginForm = document.getElementById("login-form");
const loginContainer = document.getElementById("login-container");
const gameContainer = document.getElementById("game-container");
const errorMessage = document.getElementById("error-message");

// ===============================
// CHECK TOKEN ON LOAD
// ===============================
window.addEventListener("load", () => {
  const token = localStorage.getItem("token");

  if (token) {
    showGame();
  }
});

// ===============================
// LOGIN
// ===============================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem("token", data.token);
      showGame();
    } else {
      showError("Invalid email or password");
    }
  } catch (err) {
    showError("Server error. Try again.");
  }
});

// ===============================
// SHOW GAME
// ===============================
function showGame() {
  loginContainer.style.display = "none";
  gameContainer.style.display = "block";

  // Start Phaser
  startGame();
}

// ===============================
// ERROR
// ===============================
function showError(msg) {
  errorMessage.innerText = msg;
}

// ===============================
// LOGOUT (optional)
// ===============================
function logout() {
  localStorage.removeItem("token");
  location.reload();
}
