document.addEventListener("DOMContentLoaded", () => {

    const editModal = new bootstrap.Modal(document.getElementById('editSellerModal'));
  editModal.show();

  const form = document.getElementById("editSellerForm");
  const nameInput = document.getElementById("sellerName");
  const emailInput = document.getElementById("sellerEmail");
  const passwordInput = document.getElementById("sellerPassword");
  const storeInput = document.getElementById("sellerStore");

  
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userId = localStorage.getItem("editingUserId");
  let currentUser = users.find(u => u.id === userId);

  if (!currentUser) {
    alert("no seller found");
    window.location.href = "sellers.html";
    return;
  }

  nameInput.value = currentUser.name || "";
  emailInput.value = currentUser.email || "";
  passwordInput.value = currentUser.password || "";
  


  function showError(input, message) {
    clearError(input);
    const error = document.createElement("div");
    error.className = "input-error";
    error.style = "color:#a0804d; font-weight:700; font-size:0.9rem; margin-top:0.2rem;";
    error.textContent = message;
    input.insertAdjacentElement("afterend", error);
    input.classList.add("input-error-border");
  }

  function clearError(input) {
    input.classList.remove("input-error-border");
    const next = input.nextElementSibling;
    if (next && next.classList.contains("input-error")) next.remove();
  }

  
  function validateName() {
    if (!nameInput.value.trim()) {
      showError(nameInput, "Name is required.");
      return false;
    }
    clearError(nameInput);
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      showError(emailInput, "Email is required.");
      return false;
    }
    if (!emailRegex.test(value)) {
      showError(emailInput, "Please enter a valid email.");
      return false;
    }
    clearError(emailInput);
    return true;
  }

  function validatePassword() {
    if (!passwordInput.value) {
      showError(passwordInput, "Password is required.");
      return false;
    }
    if (passwordInput.value.length < 6) {
      showError(passwordInput, "Password must be at least 6 characters.");
      return false;
    }
    clearError(passwordInput);
    return true;
  }

  
  function validateForm() {
    return validateName() && validateEmail() && validatePassword() ;
  }


  nameInput.addEventListener("input", validateName);
  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", validatePassword);


  
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validateForm()) {
      let updated = false;

      if (nameInput.value.trim() !== currentUser.name) {
        currentUser.name = nameInput.value.trim();
        updated = true;
      }
      if (emailInput.value.trim().toLowerCase() !== currentUser.email) {
        currentUser.email = emailInput.value.trim().toLowerCase();
        updated = true;
      }
      if (passwordInput.value !== currentUser.password) {
        currentUser.password = passwordInput.value;
        updated = true;
      }
    
      if (updated) {
        
        const index = users.findIndex(u => u.id === currentUser.id);
        if (index !== -1) {
          users[index] = currentUser;
          localStorage.setItem("users", JSON.stringify(users));
        }
        alert("Seller info updated successfully!");
      } else {
        alert("No changes were made.");
      }
      window.location.href = "sellers.html";
    } else {
      const firstErrorField = form.querySelector(".input-error-border");
      if (firstErrorField) firstErrorField.focus();
    }
  });
});


