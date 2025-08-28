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

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Collect and normalize inputs
  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const phone = ""; // If phone input is not present change accordingly
  const password = form.password.value;

  // Safely get checked radio button role value
  const roleRadios = form.querySelectorAll('input[name="role"]');
  let role = "";
  for (const radio of roleRadios) {
    if (radio.checked) {
      role = radio.value;
      break;
    }
  }

  // Validate inputs (email or phone required)
  if (!name || (!email && !phone) || !password || !role) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent =
      "Please fill all fields including user type, and either email or phone.";
    return;
  }

  // Load existing users
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
    signUpMsg.style.color = "#a0804d";
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
  signUpMsg.textContent = `Account created as ${role}!`;
  signUpMsg.classList.add("active"); // Make message visible
  signUpMsg.style.opacity = "1";

  // Clear form after successful signup
  form.reset();
});
