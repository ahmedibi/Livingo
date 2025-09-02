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

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

const signupForm = document.getElementById("signupForm");
const signUpMsg = document.getElementById("signUpMsg");

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const emailOrPhone = form.email.value.trim().toLowerCase();
  const password = form.password.value;

  // check role
  const roleRadios = form.querySelectorAll('input[name="role"]');
  let role = "";
  for (const radio of roleRadios) {
    if (radio.checked) {
      role = radio.value;
      break;
    }
  }

  // validate fields
  if (!name || !emailOrPhone || !password || !role) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent =
      "Please fill all fields including user type, and either email or phone.";
    return;
  }

  // check email or phone
  let email = "";
  let phone = "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,15}$/;

  if (emailRegex.test(emailOrPhone)) {
    email = emailOrPhone;
  } else if (phoneRegex.test(emailOrPhone)) {
    phone = emailOrPhone;
  } else {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = "Please enter a valid email or phone number.";
    return;
  }

  // load users
  let users = loadUsers();

  // check duplicate username
  if (users.find((u) => u.name.toLowerCase() === name.toLowerCase())) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = `The username "${name}" is already taken. Please choose another one.`;
    return;
  }

  // check duplicate email
  if (email && users.find((u) => u.email && u.email.toLowerCase() === email)) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = `An account already exists with the email "${email}". Please use another email.`;
    return;
  }

  // check duplicate phone
  if (phone && users.find((u) => u.phone && u.phone === phone)) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = `An account already exists with the phone "${phone}". Please use another phone.`;
    return;
  }

  // password length
  if (password.length < 6) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = "Password must be at least 6 characters long.";
    return;
  }

  // new user
  const newUser = {
    id: "user" + Date.now(),
    name,
    email,
    phone,
    password,
    role,
    address: "",
    orders: [],
  };

  users.push(newUser);
  saveUsers(users);

  // success message
  signUpMsg.style.color = "#28a745";
  signUpMsg.textContent = `Account created successfully as ${role}!`;
  signUpMsg.classList.add("active");
  signUpMsg.style.opacity = "1";

  form.reset();
});
