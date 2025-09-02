// Global variables
let cart = [];

// Scroll to top
window.scrollTo({
  top: 0,
  behavior: 'smooth'
});

// Load navbar and footer
document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(data => { document.getElementById("navbar").innerHTML = data; })
    .catch(err => console.error("Error loading navbar:", err));

  fetch("partials/footer.html")
    .then(res => res.text())
    .then(data => { document.getElementById("footer").innerHTML = data; })
    .catch(err => console.error("Error loading footer:", err));

  loadCartData();
  setupCardInputs(); // live validation للـ bank modal
  validateForm();

 const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if(currentUser && currentUser.email){
    emailInput.value = currentUser.email;
    emailInput.readOnly = true; // عشان المستخدم ما يقدرش يغيره
  }

});

// Breadcrumb functionality
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('crumb')) {
    document.querySelectorAll('.crumb').forEach(item => item.classList.remove('activebread'));
    e.target.classList.add('activebread');
  }
});

// Load cart data and display order summary
function loadCartData() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

  if (currentUser && currentUser.cart && currentUser.cart.length > 0) {
    cart = currentUser.cart;
    displayCartProducts(cart);
  } else {
    cart = [];
    showEmptyCart();
  }
}

function displayCartProducts(cartItems) {
  const orderSummary = document.getElementById('orderSummary');
  let productsHTML = '';
  let subtotal = 0;   

  cartItems.forEach(product => {
    const itemTotal = product.price * product.quantity;
    subtotal += itemTotal;
    let imageSrc = 'assets/images/placeholder.jpg';

    if (product.images && product.images.length > 0) imageSrc = `assets/${product.images[0]}`;
    else if (product.image) imageSrc = `assets/${product.image}`;
    else if (product.img) imageSrc = `assets/${product.img}`;
    else if (product.thumbnail) imageSrc = `assets/${product.thumbnail}`;

    productsHTML += `
      <div class="d-flex flex-column flex-lg-row justify-content-lg-between align-items-center mb-3">
        <div class="d-flex flex-column flex-lg-row col-12 col-lg-8 justify-content-lg-start align-items-center small ">
          <img class="rounded-1 me-2 " src="${imageSrc}" alt="${product.name}" width="80" height="80" style="object-fit: stretch;">
          <div>
            <p class="mb-0">${product.name} </p>
            <p class="mb-0 text-secondary">× ${product.quantity} </p>
          </div>
        </div>
        <div class=""><p class="mb-0 fw-bold">${itemTotal.toFixed(2)} EGP</p></div>
      </div>
    `;
  });

  orderSummary.innerHTML = productsHTML;
  document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)} EGP`;
  document.getElementById('total').textContent = `${subtotal.toFixed(2)} EGP`;
}

function showEmptyCart() {
  const orderSummary = document.getElementById('orderSummary');
  orderSummary.innerHTML = `
    <div class="text-center py-4">
      <div style="font-size: 4rem; color: #dee2e6; margin-bottom: 1rem;">🛒</div>
      <h5 class="text-muted">Your cart is empty</h5>
      <p class="text-muted mb-3">Add some products to continue with checkout</p>
      <a href="cart.html" class="btn btn-outline-primary">Go to Cart</a>
    </div>
  `;
  document.getElementById('subtotal').textContent = '$0.00';
  document.getElementById('total').textContent = '$0.00';
}

// ----------------- Bank Modal Validation -----------------
function setupCardInputs() {
  const cardNumberInput = document.getElementById('cardNumber');
  const expiryDateInput = document.getElementById('expiryDate');
  const cvvInput = document.getElementById('cvv');
  
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      if (formattedValue !== e.target.value) {
        e.target.value = formattedValue;
      }
    });
  }
  
  if (expiryDateInput) {
    expiryDateInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }

  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }
}

function validateCardDetails() {
  let isValid = true;
  
  // Clear previous errors
  document.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
  document.querySelectorAll('#bankPaymentModal .form-control').forEach(el => el.classList.remove('is-invalid'));
  
  // Validate card number
  const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  if (!cardNumber) {
    document.getElementById('cardError').textContent = 'Card number is required';
    document.getElementById('cardNumber').classList.add('is-invalid');
    isValid = false;
  } else if (cardNumber.length !== 16) {
    document.getElementById('cardError').textContent = 'Card number must be 16 digits';
    document.getElementById('cardNumber').classList.add('is-invalid');
    isValid = false;
  }
  
  // Validate expiry date
  const expiryDate = document.getElementById('expiryDate').value;
  if (!expiryDate) {
    document.getElementById('expiryError').textContent = 'Expiry date is required';
    document.getElementById('expiryDate').classList.add('is-invalid');
    isValid = false;
  } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    document.getElementById('expiryError').textContent = 'Please enter valid expiry date (MM/YY)';
    document.getElementById('expiryDate').classList.add('is-invalid');
    isValid = false;
  }
  
  // Validate CVV
  const cvv = document.getElementById('cvv').value;
  if (!cvv) {
    document.getElementById('cvvError').textContent = 'CVV is required';
    document.getElementById('cvv').classList.add('is-invalid');
    isValid = false;
  } else if (cvv.length !== 3) {
    document.getElementById('cvvError').textContent = 'CVV must be 3 digits';
    document.getElementById('cvv').classList.add('is-invalid');
    isValid = false;
  }
  
  // Validate cardholder name
  const cardName = document.getElementById('cardName').value.trim();
  if (!cardName) {
    document.getElementById('cardNameError').textContent = 'Cardholder name is required';
    document.getElementById('cardName').classList.add('is-invalid');
    isValid = false;
  }
  
  return isValid;
}

// ----------------- Form validation variables -----------------
var nameInput = document.getElementById("firstName");
var nameError = document.getElementById("nameError");
var companyInput = document.getElementById("companyName");
var companyError = document.getElementById("companyError");
var streetInput= document.getElementById("streetAddress");
var streetError = document.getElementById("streetError");
var cityInput= document.getElementById("city");
var cityError = document.getElementById("cityError");
var phoneInput= document.getElementById("phoneNumber");
var phoneError = document.getElementById("phoneError");
var emailInput = document.getElementById("inputEmail");
var emailError = document.getElementById("emailError");

// Form validation
function validateForm() {
  nameInput.addEventListener("blur", () => {
    const firstVal = nameInput.value.trim();
    if (firstVal === "") nameError.textContent = "First name is required";
    else if (firstVal.includes(" ")) nameError.textContent = "Please enter only one word";
    else nameError.textContent = "";
  });

  companyInput.addEventListener("blur", () => {
    companyError.textContent = companyInput.value.trim() === "" ? "Company Name is required" : "";
  });

  streetInput.addEventListener("blur", () => {
    streetError.textContent = streetInput.value.trim() === "" ? "Street address is required" : "";
  });

  cityInput.addEventListener("blur", () => {
    cityError.textContent = cityInput.value.trim() === "" ? "City is required" : "";
  });

  phoneInput.addEventListener("blur", () => {
    const phoneVal = phoneInput.value.trim();
    if (phoneVal === "") phoneError.textContent = "Phone number is required";
    else if (isNaN(phoneVal) || phoneVal.length !== 11) phoneError.textContent = "You must enter only numbers (11 digits)";
    else phoneError.textContent = "";
  });

  // emailInput.addEventListener("blur", () => {
  //   const myPattern = /^[a-zA-Z0-9]{3,30}@[a-zA-Z]{4,20}\.(com)$/;
  //   emailError.textContent = !myPattern.test(emailInput.value.trim()) ? "Please enter a valid email like example@gmail.com" : "";
  // });
}

// Place order function
// Place order function
function placeOrder(e) {
  e.preventDefault();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if(!currentUser){ alert("please login first"); return; }

  const name = nameInput.value.trim();
  const company = companyInput.value.trim();
  const street = streetInput.value.trim();
  const city = cityInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const bankPayment = document.getElementById('bank').checked;
  const cashPayment = document.getElementById('cash').checked;

  // var emailPattern = /^[a-zA-Z0-9]{3,25}@[a-zA-Z0-9]{4,25}\.(com)$/;
  if (name == "") { nameError.textContent = "First name is required"; nameInput.focus(); return; }
  else if (name.includes(" ")) { nameError.textContent = "Please enter only one word"; nameInput.focus(); return; }
  else if (company == "") { companyError.textContent = "Company Name is required"; companyInput.focus(); return; }
  else if (street == "") { streetError.textContent = "Street address is required"; streetInput.focus(); return; }
  else if (city == "") { cityError.textContent = "City is required"; cityInput.focus(); return; }
  else if (phone == "") { phoneError.textContent = "Phone number is required"; phoneInput.focus(); return; }
  // else if (!emailPattern.test(email)) { emailError.textContent = "Please enter a valid email like Example@gmail.com"; emailInput.focus(); return; }

  cart = currentUser.cart || [];
  if(cart.length === 0){ alert('Your cart is empty!'); return; }
  
  let products = JSON.parse(localStorage.getItem("products")) || [];
  for (let item of cart) {
    let prod = products.find(p => p.id === item.id);
    if (prod && prod.stock < item.quantity) {
      alert(`  the quantity that you want of  "${prod.name}" not available now  : ${prod.stock}`);
      return; 
    }
  }

  // لو كل حاجة تمام يكمل
  if(bankPayment) new bootstrap.Modal(document.getElementById('bankPaymentModal')).show();
  else if(cashPayment) new bootstrap.Modal(document.getElementById('cashPaymentModal')).show();
}


// Confirm payment functions
function confirmPayment() { processPayment("Bank"); }
function confirmCashPayment() { processPayment("Cash"); }

function processPayment(method){
  if(method === "Bank" && !validateCardDetails()) return;

  saveOrder(method);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if(currentUser){
    currentUser.cart = [];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.map(u => u.id === currentUser.id ? {...u, cart: []} : u);
    localStorage.setItem("users", JSON.stringify(users));
  }

  loadCartData();

  const modalId = method === "Bank" ? 'bankPaymentModal' : 'cashPaymentModal';
  const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
  modal.hide();

  setTimeout(() => { window.location.href = 'cart.html'; }, 1000);
}

// Save order function
// Save order function
function saveOrder(paymentMethod) {
  const name = nameInput.value.trim();
  const company = companyInput.value.trim();
  const street = streetInput.value.trim();
  const city = cityInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  const cart = currentUser ? currentUser.cart : [];

  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  const newOrder = {
    id: Date.now(),
    customer: { id: currentUser ? currentUser.id : null, name, company, street, city, phone, email },
    items: cart,
    paymentMethod: paymentMethod,
    status: "Pending",
    date: new Date().toLocaleString()
  };
  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  // ------------------- تحديث المخزون -------------------
  let products = JSON.parse(localStorage.getItem("products")) || [];
  cart.forEach(cartItem => {
    products = products.map(prod => {
      if (prod.id === cartItem.id) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartItem.quantity) // تقليل المخزون
        };
      }
      return prod;
    });
  });
  localStorage.setItem("products", JSON.stringify(products));
}


// Update cart if it changes
window.addEventListener('storage', function(e) {
  if (e.key === 'currentUser') loadCartData();
});
