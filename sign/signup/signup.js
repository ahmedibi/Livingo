// Load users data from localStorage or return empty array
function loadUsers() {
  const usersJSON = localStorage.getItem("users");
  if (usersJSON) {
    try {
      return JSON.parse(usersJSON);
    } catch {
      localStorage.removeItem("users");
      return [];
    }
  }
  return [];
}

// Save users array to localStorage
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

const signupForm = document.getElementById("signupForm");
const signUpMsg = document.getElementById("signUpMsg");

// Add event listener for the login anchor link outside the form submit handler
document.querySelector(".alt-link").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "../login/login.html";
});

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Collect and normalize inputs
  const name = e.target.name.value.trim();
  const email = e.target.email.value.trim().toLowerCase();
  const phone = e.target.phone ? e.target.phone.value.trim() : "";
  const password = e.target.password.value;
  const role = e.target.role.value;

  // Validate inputs (email or phone required)
  if (!name || (!email && !phone) || !password || !role) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent =
      "Please fill all fields including user type, and either email or phone.";
    return;
  }

  let users = loadUsers();

  // Debug: log current users for troubleshooting
  console.log("Loaded users from localStorage:", users);

  // Check if email or phone already exists
  if (
    users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === email) ||
        (u.phone && u.phone === phone)
    )
  ) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = "Account already exists for this email or phone.";
    return;
  }

  // Create new user object
  const newUser = {
    id: "user" + (users.length + 1),
    name,
    email,
    phone,
    password,
    role,
    address: "",
    orders: [],
  };

  // Add new user and save to localStorage
  users.push(newUser);
  saveUsers(users);

  // Show success message
  signUpMsg.style.color = "#28a745";
  signUpMsg.textContent = `Account created as ${role}! You can now log in.`;

  // Optional: clear form inputs
  // signupForm.reset();
  
});
