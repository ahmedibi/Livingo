document.addEventListener("DOMContentLoaded", () => {
  // تحميل السايد بار
  fetch("../sidebar/sidebar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("sideBar").innerHTML = data;
      const script = document.createElement("script");
      script.src = "../sidebar/sidebar.js";
      document.body.appendChild(script);

      const fontAwesome = document.createElement("link");
      fontAwesome.rel = "stylesheet";
      fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
      document.head.appendChild(fontAwesome);
    })
    .catch(err => {
      console.error("Error loading sidebar:", err);
      document.getElementById("sideBar").style.display = "none";
      document.querySelector(".main-content").style.marginLeft = "0";
    });

  // عناصر الفورم
  const form = document.getElementById("editSellerForm");
  const nameInput = document.getElementById("sellerName");
  const emailInput = document.getElementById("sellerEmail");
  const passwordInput = document.getElementById("sellerPassword");
  const storeInput = document.getElementById("sellerStore");

  // تحميل بيانات المستخدم المختار من localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userId = localStorage.getItem("editingUserId");
  let currentUser = users.find(u => u.id === userId);

  if (!currentUser) {
    alert("لم يتم العثور على البائع!");
    window.location.href = "sellers.html";
    return;
  }

  // تعبئة الفورم بالبيانات الحالية
  nameInput.value = currentUser.name || "";
  emailInput.value = currentUser.email || "";
  passwordInput.value = currentUser.password || "";
  storeInput.value = currentUser.storeName || "";

  // دوال لعرض/مسح الأخطاء
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

  // التحقق من المدخلات
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

  function validateStore() {
    if (!storeInput.value.trim()) {
      showError(storeInput, "Store Name is required.");
      return false;
    }
    clearError(storeInput);
    return true;
  }

  function validateForm() {
    return validateName() && validateEmail() && validatePassword() && validateStore();
  }

  // تحقق لحظي
  nameInput.addEventListener("input", validateName);
  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", validatePassword);
  storeInput.addEventListener("input", validateStore);

  // عند الحفظ
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
      if (storeInput.value.trim() !== currentUser.storeName) {
        currentUser.storeName = storeInput.value.trim();
        updated = true;
      }

      if (updated) {
        // حفظ في localStorage
        const index = users.findIndex(u => u.id === currentUser.id);
        if (index !== -1) {
          users[index] = currentUser;
          localStorage.setItem("users", JSON.stringify(users));
        }
        alert("Seller info updated successfully!");
      } else {
        alert("No changes were made.");
      }

      // رجوع لصفحة sellers
      window.location.href = "sellers.html";
    } else {
      const firstErrorField = form.querySelector(".input-error-border");
      if (firstErrorField) firstErrorField.focus();
    }
  });
});
