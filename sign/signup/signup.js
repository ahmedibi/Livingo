
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

  
  let users = loadUsers();

  
  console.log("Loaded users from localStorage:", users);

  
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

  
  users.push(newUser);
  saveUsers(users);

  
  signUpMsg.style.color = "#28a745";
  signUpMsg.textContent = `Account created as ${role}!`;
  signUpMsg.classList.add("active"); 
  signUpMsg.style.opacity = "1";

  
  form.reset();
});
