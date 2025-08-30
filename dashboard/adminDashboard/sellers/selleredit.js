document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editSellerForm");
  const nameInput = document.getElementById("sellerName");
  const emailInput = document.getElementById("sellerEmail");
  const passwordInput = document.getElementById("sellerPassword");
  const storeInput = document.getElementById("sellerStore");
  const statusSelect = document.getElementById("sellerStatus");

  // Utility: show error message next to input
  function showError(input, message) {
    clearError(input);
    const error = document.createElement("div");
    error.className = "input-error";
    error.style =
      "color:#a0804d; font-weight:700; font-size:0.9rem; margin-top:0.2rem; text-align:left;";
    error.textContent = message;
    input.insertAdjacentElement("afterend", error);
    input.classList.add("input-error-border");
  }

  // Utility: clear existing error for input
  function clearError(input) {
    input.classList.remove("input-error-border");
    const next = input.nextElementSibling;
    if (next && next.classList.contains("input-error")) {
      next.remove();
    }
  }

  // Validate individual fields returning true if valid or false if invalid
  function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
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
      showError(emailInput, "Please enter a valid email address.");
      return false;
    }
    clearError(emailInput);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    if (!value) {
      showError(passwordInput, "Password is required.");
      return false;
    }
    if (value.length < 6) {
      showError(passwordInput, "Password must be at least 6 characters.");
      return false;
    }
    clearError(passwordInput);
    return true;
  }

  function validateStore() {
    const value = storeInput.value.trim();
    if (!value) {
      showError(storeInput, "Store Name is required.");
      return false;
    }
    clearError(storeInput);
    return true;
  }

  function validateStatus() {
    const value = statusSelect.value;
    if (!value) {
      showError(statusSelect, "Please select a status.");
      return false;
    }
    clearError(statusSelect);
    return true;
  }

  // Validate all fields together; return true if all valid
  function validateForm() {
    const validName = validateName();
    const validEmail = validateEmail();
    const validPassword = validatePassword();
    const validStore = validateStore();
    const validStatus = validateStatus();

    return (
      validName && validEmail && validPassword && validStore && validStatus
    );
  }

  // Real-time validation on input/change
  nameInput.addEventListener("input", validateName);
  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", validatePassword);
  storeInput.addEventListener("input", validateStore);
  statusSelect.addEventListener("change", validateStatus);

  // Handle form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // prevent actual submission for demo or ajax
    if (validateForm()) {
      // Example: simulate form submission or do whatever you want here
      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value,
        store: storeInput.value.trim(),
        status: statusSelect.value,
      };
      console.log("Form valid and ready to submit:", formData);

      // Optionally close modal or reset form here
      // form.reset();
      // Or trigger your API call etc.

      alert("Seller info saved successfully!");
    } else {
      // Focus first invalid input for accessibility
      const firstErrorField = form.querySelector(".input-error-border");
      if (firstErrorField) firstErrorField.focus();
    }
  });
});
