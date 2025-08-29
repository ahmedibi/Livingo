document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("inputEmail");
  const inputpass = document.getElementById("inputpass");
  const errorMsg = document.getElementById("errorMsg");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = inputpass.value.trim();

    // البحث عن يوزر
    function findUser(users) {
      return users.find(
        (u) =>
          (u.email || "").trim().toLowerCase() === email &&
          (u.password || "").trim() === password
      );
    }

    // مسح أي currentUser قديم
    localStorage.removeItem("currentUser");

    function handleSuccessfulLogin(user) {
      errorMsg.textContent = "";
      alert("Login successful! Welcome, " + user.name);

      const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        password:user.password,
        phone: user.phone,
        role: user.role,
        address: user.address || "",
        orders:[],
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      console.log("Current user set to:", currentUser);

      if (user.role === "admin") {
        window.location.href = "../../../dashboard/adminDashboard/orders/orders.html";
      } else if (user.role === "seller") {
        window.location.href = "../../../dashboard/sellerDashboard/orders/orders.html";
      } else {
        window.location.href = "../../index.html";
      }
    }

    function handleFailedLogin() {
      errorMsg.style.color = "red";
      errorMsg.textContent = "Invalid credentials.";
    }

    // نجمع users من localStorage + users.json
    fetch("../../json/users.json")
      .then((res) => res.json())
      .then((jsonUsers) => {
        const localUsers = JSON.parse(localStorage.getItem("users")) || [];
        const allUsers = [...jsonUsers, ...localUsers]; // دمج الاثنين

        const foundUser = findUser(allUsers);

        if (foundUser) {
          handleSuccessfulLogin(foundUser);
        } else {
          handleFailedLogin();
        }
      })
      .catch((err) => {
        console.error("Error fetching users.json:", err);
        errorMsg.textContent = "Something went wrong. Please try again.";
      });
  });
});