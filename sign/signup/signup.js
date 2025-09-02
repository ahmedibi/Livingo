
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
  const email = form.email.value.trim().toLowerCase();
  const phone = ""; 
  const password = form.password.value;

  
  const roleRadios = form.querySelectorAll('input[name="role"]');
  let role = "";
  for (const radio of roleRadios) {
    if (radio.checked) {
      role = radio.value;
      break;
    }
  }

  
  if (!name || (!email && !phone) || !password || !role) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent =
      "Please fill all fields including user type, and either email or phone.";
    return;
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = "Please enter a valid email address.";
    return;
  }


  let users = loadUsers();


  if (users.find((u) => u.name.toLowerCase() === name.toLowerCase())) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = `The username "${name}" is already taken. Please choose another one.`;
    return;
  }


  if (users.find((u) => u.email && u.email.toLowerCase() === email)) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = `An account already exists with the email "${email}". Please use another email.`;
    return;
  }


  if (password.length < 6) {
    signUpMsg.style.color = "#e94545";
    signUpMsg.textContent = "Password must be at least 6 characters long.";
    return;
  }


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

  
  signUpMsg.style.color = "#28a745";
  signUpMsg.textContent = `Account created successfully as ${role}!`;
  signUpMsg.classList.add("active");
  signUpMsg.style.opacity = "1";

  
  form.reset();
});
