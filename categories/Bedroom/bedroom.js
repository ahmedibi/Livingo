// bed Room script.js placeholder

window.scrollTo({ top: 0, behavior: 'smooth' });

// Load navbar and footer
document.addEventListener("DOMContentLoaded", () => {
  fetch("../../partials/navbar.html")
    .then(res => res.text())
    .then(data => document.getElementById("navbar").innerHTML = data)
    .catch(err => console.error("Error loading navbar:", err));

  fetch("../../partials/footer.html")
    .then(res => res.text())
    .then(data => document.getElementById("footer").innerHTML = data)
    .catch(err => console.error("Error loading footer:", err));

  initProducts();
});

//////////////////// User helpers ////////////////////
function updateUserData(updatedUser) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));

  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) users[index] = updatedUser;
  else users.push(updatedUser);

  localStorage.setItem("users", JSON.stringify(users));
}

//////////////////// Product rendering ////////////////////
const categoryName = "Bedroom";
const productContainer = document.getElementById("productsList");
let filtered = [];

function initProducts() {
  const productsData = JSON.parse(localStorage.getItem("products")) || [];
  filtered = productsData.filter(p => p.category.startsWith(categoryName));
  renderProducts(filtered);

  const titleContainer = document.getElementById("header");
  if (titleContainer) titleContainer.textContent = categoryName;
}

function renderProducts(products) {
  productContainer.innerHTML = "";
  products.forEach(product => {
    const imagePath = `../../assets/${product.images[0]}`;
    const disabled = product.stock <= 0 ? "disabled" : "";
    const btnText = product.stock <= 0 ? "Out of Stock" : "Add to Cart";

    productContainer.innerHTML += `
      <div class="col-12 col-md-6 col-lg-3 mb-5">
        <div class="card h-100">
          <a href="../../product.html?id=${product.id}">
            <img src="${imagePath}" class="card-img-top" alt="${product.name}">
          </a>
          <div class="product-actions">
            <button class="wishlistBtn" data-id="${product.id}">
              <span class="iconify" data-icon="mdi:heart-outline" style="font-size:20px;"></span>
            </button>
          </div>
          <button class="btn btn-secondary w-100 cartBtn" data-id="${product.id}" ${disabled}>${btnText}</button>
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.description}</p>
          </div>
          <div class="d-flex justify-content-evenly align-items-center p-3">
            <span><strong style="color:#dc3545">${product.currency} ${product.price}</strong></span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="width: 20px;">
                <path fill="#FFD43B" d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/>
              </svg> ${product.rating}
            </span>
            <span class="text-muted">(${product.stock})</span>
          </div>
        </div>
      </div>
    `;
  });
}

//////////////////// Filters ////////////////////
document.querySelectorAll(".dropdown-item").forEach(item => {
  item.addEventListener("click", (e) => {
    const sortType = e.target.getAttribute("data-sort");
    let sorted = [...filtered];

    if (sortType === "priceLow") sorted.sort((a, b) => a.price - b.price);
    else if (sortType === "priceHigh") sorted.sort((a, b) => b.price - a.price);
    else if (sortType === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortType === "za") sorted.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortType === "featured") sorted = [...filtered];

    renderProducts(sorted);
  });
});

// Price filter
const rangeMin = document.getElementById("rangeMin");
const rangeMax = document.getElementById("rangeMax");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");

const trackContainer = document.querySelector(".position-relative");
const trackFill = document.createElement("div");
trackFill.className = "range-track-fill";
trackContainer.appendChild(trackFill);

function updateTrack() {
  const min = parseInt(rangeMin.value);
  const max = parseInt(rangeMax.value);
  const percentMin = (min / rangeMin.max) * 100;
  const percentMax = (max / rangeMax.max) * 100;
  trackFill.style.left = percentMin + "%";
  trackFill.style.width = (percentMax - percentMin) + "%";
}

function applyPriceFilter() {
  const minPrice = parseInt(minPriceInput.value) || 0;
  const maxPrice = parseInt(maxPriceInput.value) || Infinity;
  const filteredByPrice = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
  renderProducts(filteredByPrice);
}

function syncInputs() {
  let min = parseInt(rangeMin.value);
  let max = parseInt(rangeMax.value);

  if (min > max - 100) { rangeMin.value = max - 100; min = max - 100; }
  if (max < min + 100) { rangeMax.value = min + 100; max = min + 100; }

  minPriceInput.value = min;
  maxPriceInput.value = max;
  updateTrack();
  applyPriceFilter();
}

rangeMin.addEventListener("input", syncInputs);
rangeMax.addEventListener("input", syncInputs);

minPriceInput.addEventListener("input", () => {
  let val = parseInt(minPriceInput.value) || 0;
  if (val < 0) val = 0;
  if (val > parseInt(rangeMax.value) - 100) val = parseInt(rangeMax.value) - 100;
  rangeMin.value = val;
  syncInputs();
});

maxPriceInput.addEventListener("input", () => {
  let val = parseInt(maxPriceInput.value) || 1800;
  if (val > 1800) val = 1800;
  if (val < parseInt(rangeMin.value) + 100) val = parseInt(rangeMin.value) + 100;
  rangeMax.value = val;
  syncInputs();
});

syncInputs();

document.getElementById("resetPrice").addEventListener("click", () => {
  rangeMin.value = 0;
  rangeMax.value = 1800;
  minPriceInput.value = 0;
  maxPriceInput.value = 1800;
  updateTrack();
  renderProducts(filtered);
});

//////////////////// Wishlist & Cart ////////////////////
document.addEventListener("click", (e) => {
  const wishlistBtn = e.target.closest(".wishlistBtn");
  if (wishlistBtn) {
    const productId = wishlistBtn.dataset.id;
    toggleUserList("wishlist", productId, "❤ Added to wishlist", "❌ Removed from wishlist");
    return;
  }

  const cartBtn = e.target.closest(".cartBtn");
  if (cartBtn && !cartBtn.disabled) {
    const productId = cartBtn.dataset.id;
    let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    if (!currentUser) { alert("⚠ You must be logged in!"); return; }

    if (!currentUser.cart) currentUser.cart = [];
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) { alert("⚠ Product not found!"); return; }

    // ✅ تحقق من الكمية
    const existing = currentUser.cart.find(item => String(item.id) === String(product.id));
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`⚠ Only ${product.stock} items available in stock!`);
        return;
      }
      existing.quantity += 1;
    } else {
      if (product.stock <= 0) {
        alert("⚠ This product is out of stock!");
        return;
      }
      currentUser.cart.push({ ...product, quantity: 1 });
    }

    updateUserData(currentUser);
    alert(`✅ ${product.name} added to cart!`);
  }
});

function toggleUserList(key, productId, addMsg, removeMsg) {
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  if (!currentUser) { alert("⚠ You must be logged in!"); return; }

  if (!currentUser[key]) currentUser[key] = [];
  if (currentUser[key].includes(productId)) {
    currentUser[key] = currentUser[key].filter(id => id !== productId);
    alert(removeMsg);
  } else {
    currentUser[key].push(productId);
    alert(addMsg);
  }

  updateUserData(currentUser);
}
