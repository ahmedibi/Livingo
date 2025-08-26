document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const emailInput = e.target.email.value.trim().toLowerCase();
  const passwordInput = e.target.password.value.trim();
  const errorMsg = document.getElementById("errorMsg");

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // STRICT email and password match
  const user = users.find((u) => {
    return (
      (u.email || "").trim().toLowerCase() === emailInput &&
      (u.password || "") === passwordInput
    );
  });

  if (user) {
    errorMsg.textContent = "";
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Login successful! Welcome, " + user.name);
    window.location.href = "home.html";
  } else {
    errorMsg.style.color = "red";
    errorMsg.textContent = "Invalid credentials.";
  }
});
