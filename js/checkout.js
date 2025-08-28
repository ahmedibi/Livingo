// Global variables
let cart = [];

// Scroll to top
window.scrollTo({
  top: 0,
  behavior: 'smooth'
});

// Load navbar and footer
document.addEventListener("DOMContentLoaded", () => {
  // Load navbar
  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar").innerHTML = data;
    })
    .catch(err => console.error("Error loading navbar:", err));

  // Load footer
  fetch("partials/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch(err => console.error("Error loading footer:", err));

  // Load cart data
  loadCartData();
  
  // Setup card input formatting
  setupCardInputs();

  // ✅ استدعاء validateForm()
  validateForm();
});

// Breadcrumb functionality
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('crumb')) {
    document.querySelectorAll('.crumb').forEach(item => {
      item.classList.remove('activebread');
    });
    e.target.classList.add('activebread');
  }
});

// Load cart data and display order summary
function loadCartData() {
  const cartData = localStorage.getItem('cart');
  
  if (cartData) {
    try {
      cart = JSON.parse(cartData);
      if (cart && cart.length > 0) {
        displayCartProducts(cart);
      } else {
        showEmptyCart();
      }
    } catch (error) {
      console.error('Error parsing cart data:', error);
      showEmptyCart();
    }
  } else {
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
     let imageSrc = 'assets/images/placeholder.jpg'; // صورة افتراضية

if (product.images && product.images.length > 0) {
  imageSrc = `assets/${product.images[0]}`;
} else if (product.image) {
  imageSrc = `assets/${product.image}`;
} else if (product.img) {
  imageSrc = `assets/${product.img}`;
} else if (product.thumbnail) {
  imageSrc = `assets/${product.thumbnail}`;
}

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
  
  // Update totals
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
  
  // Reset totals
  document.getElementById('subtotal').textContent = '$0.00';
  document.getElementById('total').textContent = '$0.00';
}

var nameInput = document.getElementById("firstName");
var nameError = document.getElementById("nameError");

var companyInput = document.getElementById("companyName");
var companyError = document.getElementById("companyError");

var streetInput= document.getElementById("streetAddress")
var streetError = document.getElementById("streetError");

var cityInput= document.getElementById("city")
var cityError = document.getElementById("cityError");

var phoneInput= document.getElementById("phoneNumber")
var phoneError = document.getElementById("phoneError");

var emailInput = document.getElementById("inputEmail");
var emailError = document.getElementById("emailError");

// Form validation
function validateForm() {
  // Clear previous errors
  nameInput.addEventListener("blur", function ()  {
    const firstVal=nameInput.value.trim()
    if (firstVal==""){
      nameError.textContent="First name is required";
      nameInput.focus();
    } else if (firstVal.includes(" ")) {
        nameError.textContent = "Please enter only one word";
        nameInput.focus();
    }else{
      firstVal= nameInput.value.trim();
      nameError.textContent=""
    };})

  companyInput.addEventListener("blur", function(){
    if (companyInput.value==""){
      companyError.textContent="Company Name is required";
      companyInput.focus();
    } else{
      company= companyInput.value;
      companyError.textContent=""
    };
  });
   
  streetInput.addEventListener("blur", function(){
    if (streetInput.value==""){
      streetError.textContent="Street address is required";
      streetInput.focus();
    } else{
      street= streetInput.value;
      streetError.textContent=""
    };
  });
  
  cityInput.addEventListener("blur", function(){
    if (cityInput.value==""){
      cityError.textContent="City is required";
      cityInput.focus();
    } else{
      city= cityInput.value;
      cityError.textContent=""
    };
  });

  phoneInput.addEventListener("blur", function(){
    let phoneVal = phoneInput.value.trim()
    if (phoneVal==""){
      phoneError.textContent="Phone number is required";
      phoneInput.focus();
    } else if(isNaN(phoneVal) || phoneVal.length !== 11){
      phoneError.textContent="you must enter only numbers contain 11 number";
      phoneInput.focus();
    }
    else{
      phone= phoneVal;
      phoneError.textContent=""
    };
  });
  
  emailInput.addEventListener("blur", function(){
    var  myPattern =/^[a-zA-Z0-9]{3,12}@[a-zA-Z]{4,20}\.(com)$/;
    if(!myPattern.test(emailInput.value)){
      emailError.textContent="please enter a valid email like this example@gmail.com";
      emailInput.focus()
    } else{
      email=emailInput.value;
      emailError.textContent=""}
  })
  
}

// Place order function
function placeOrder(e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const company = companyInput.value.trim();
  const street = streetInput.value.trim();
  const city = cityInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();

  const bankPayment = document.getElementById('bank').checked;
  const cashPayment = document.getElementById('cash').checked;

  var emailPattern = /^[a-zA-Z0-9]{3,25}@[a-zA-Z0-9]{4,25}\.(com)$/;
  if (name == "") {
    nameError.textContent = "First name is required";
    nameInput.focus();
    return;
  } else if (company == "") {
    companyError.textContent = "Company Name is required";
    companyInput.focus();
    return;
  } else if (street == "") {
    streetError.textContent = "Street address is required";
    streetInput.focus();
    return;
  } else if (city == "") {
    cityError.textContent = "City is required";
    cityInput.focus();
    return;
  } else if (phone == "") {
    phoneError.textContent = "Phone number is required";
    phoneInput.focus();
    return;
  } else if (!emailPattern.test(email)) {
    emailError.textContent = "Please enter a valid email like Example@gmail.com";
    emailInput.focus();
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  if (bankPayment) {
    const modal = new bootstrap.Modal(document.getElementById('bankPaymentModal'));
    modal.show();
  } else if (cashPayment) {
    const modal = new bootstrap.Modal(document.getElementById('cashPaymentModal'));
    modal.show();
  }
}

// Setup card input formatting
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

// Validate card details
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

// Confirm bank payment
function confirmPayment() {
  if (!validateCardDetails()) {
    return;
  }
  saveOrder("Bank");
  
localStorage.removeItem("cart");
loadCartData();
  
  const modal = bootstrap.Modal.getInstance(document.getElementById('bankPaymentModal'));
  modal.hide();
  
  setTimeout(() => {
    window.location.href = 'cart.html';
  }, 1000);
}

function confirmCashPayment() {
  saveOrder("Cash"); 

  localStorage.removeItem("cart");
 loadCartData();

  const modal = bootstrap.Modal.getInstance(document.getElementById('cashPaymentModal'));
  modal.hide();
  
  setTimeout(() => {
    window.location.href = 'cart.html';
  }, 1000);
}


function saveOrder(paymentMethod) {
  const name = nameInput.value.trim();
  const company = companyInput.value.trim();
  const street = streetInput.value.trim();
  const city = cityInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  const newOrder = {
    id: Date.now(),
    customer: {  id: currentUser ? currentUser.id : null ,name, company, street, city, phone, email },
    items: cart,
    paymentMethod: paymentMethod,
    status: "Pending",
    date: new Date().toLocaleString()
  };
  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));
}


// Update cart if it changes (useful if user has multiple tabs open)
window.addEventListener('storage', function(e) {
  if (e.key === 'cart') {
    loadCartData();
  }
});
