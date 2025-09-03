window.scrollTo({
  top: 0,
  behavior: "smooth",
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/navbar.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;
    })
    .catch((err) => console.error("Error loading navbar:", err));

  fetch("partials/footer.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch((err) => console.error("Error loading footer:", err));
});

// ========== Variables ==========
const productContainer = document.getElementById("productList");
const paginationContainer = document.getElementById("pagination");
const categoriesList = document.getElementById("categoriesList");
const mobileCategories = document.getElementById("mobileCategoriesList");

const productsData = JSON.parse(localStorage.getItem("products")) || [];
let filteredProducts = [...productsData];
let currentPage = 1;
const itemsPerPage = 12;

// ========== Categories ==========
const categories = [...new Set(productsData.map((p) => p.category))];
categories.forEach((cat, index) => {
  const item = `
    <li class="list-group-item d-flex align-items-center">
      <input type="radio" name="category" value="${cat}" id="cat-${index}" class="form-check-input me-2">
      <label for="cat-${index}" class="mb-0">${cat}</label>
    </li>`;
  categoriesList.innerHTML += item;
  mobileCategories.innerHTML += item;
});

// ========== Price Range ==========
const prices = productsData.map((p) => p.price);
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);

const rangeMinMobile = document.getElementById("rangeMinMobile");
const rangeMaxMobile = document.getElementById("rangeMaxMobile");
const minPriceMobile = document.getElementById("minPriceMobile");
const maxPriceMobile = document.getElementById("maxPriceMobile");

const rangeMinDesktop = document.getElementById("rangeMinDesktop");
const rangeMaxDesktop = document.getElementById("rangeMaxDesktop");
const minPriceDesktop = document.getElementById("minPriceDesktop");
const maxPriceDesktop = document.getElementById("maxPriceDesktop");

[rangeMinMobile, rangeMinDesktop].forEach((r) => {
  r.min = minPrice;
  r.max = maxPrice;
  r.value = minPrice;
});
[rangeMaxMobile, rangeMaxDesktop].forEach((r) => {
  r.min = minPrice;
  r.max = maxPrice;
  r.value = maxPrice;
});
[minPriceMobile, minPriceDesktop].forEach((input) => (input.value = minPrice));
[maxPriceMobile, maxPriceDesktop].forEach((input) => (input.value = maxPrice));

// ========== Sync Sliders ==========
function syncSliders(rMin, rMax, inMin, inMax, products) {
  function update() {
    let minVal = +rMin.value;
    let maxVal = +rMax.value;
    if (minVal > maxVal) [minVal, maxVal] = [maxVal, minVal];
    inMin.value = minVal;
    inMax.value = maxVal;
    applyFilters(products);
  }
  rMin.addEventListener("input", update);
  rMax.addEventListener("input", update);
  inMin.addEventListener("change", () => {
    rMin.value = inMin.value;
    update();
  });
  inMax.addEventListener("change", () => {
    rMax.value = inMax.value;
    update();
  });
}
syncSliders(rangeMinMobile, rangeMaxMobile, minPriceMobile, maxPriceMobile, productsData);
syncSliders(rangeMinDesktop, rangeMaxDesktop, minPriceDesktop, maxPriceDesktop, productsData);



// ========== Filters ==========
[categoriesList, mobileCategories].forEach((list) => {
  list.addEventListener("change", () => applyFilters(productsData));
});

function resetFilters() {
  document.querySelectorAll("input[type=radio], input[type=checkbox]").forEach((r) => (r.checked = false));

  minPriceDesktop.value = rangeMinDesktop.min;
  maxPriceDesktop.value = rangeMaxDesktop.max;
  rangeMinDesktop.value = rangeMinDesktop.min;
  rangeMaxDesktop.value = rangeMaxDesktop.max;

  minPriceMobile.value = rangeMinMobile.min;
  maxPriceMobile.value = rangeMaxMobile.max;
  rangeMinMobile.value = rangeMinMobile.min;
  rangeMaxMobile.value = rangeMaxMobile.max;

  filteredProducts = [...productsData];
  currentPage = 1;
  renderProducts(filteredProducts, currentPage);
}

document.getElementById("resetBtnMobile").addEventListener("click", resetFilters);
document.getElementById("resetBtnDesktop").addEventListener("click", resetFilters);

function applyFilters(products) {
  filteredProducts = [...products];
  const selectedCat = document.querySelector("input[name='category']:checked");
  if (selectedCat) filteredProducts = filteredProducts.filter((p) => p.category === selectedCat.value);

  let minMobile = +minPriceMobile?.value || minPrice;
  let maxMobile = +maxPriceMobile?.value || maxPrice;
  let minDesktop = +minPriceDesktop?.value || minPrice;
  let maxDesktop = +maxPriceDesktop?.value || maxPrice;

  if (window.innerWidth < 768)
    filteredProducts = filteredProducts.filter((p) => p.price >= minMobile && p.price <= maxMobile);
  else filteredProducts = filteredProducts.filter((p) => p.price >= minDesktop && p.price <= maxDesktop);

  currentPage = 1;
  renderProducts(filteredProducts, currentPage);
}

// ========== Pagination ==========
function renderPagination(totalItems, currentPage) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#">${i}</a>
      </li>
    `;
  }

  document.querySelectorAll("#pagination .page-link").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = +btn.textContent;
      renderProducts(filteredProducts, currentPage);
    });
  });
}

// ========== Render Products ==========
function renderProducts(list, page = 1) {
  productContainer.innerHTML = "";
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = list.slice(start, end);

  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  let wishlist = currentUser?.wishlist || [];

  paginated.forEach((product) => {
    const imagePath = `assets/${product.images[0]}`;
    const disabled = product.stock <= 0 ? "disabled" : "";
    const isInWishlist = wishlist.includes(String(product.id));

    productContainer.innerHTML += `
      <div class="col-12 col-md-6 col-lg-3 mb-5">
        <div class="card h-100">
          <a href="./product.html?id=${product.id}">  
            <img src="${imagePath}" class="card-img-top" alt="${product.name}">
          </a>  

          <div class="product-actions">
            <button id="wishlistBtn" data-id="${product.id}">
              <span class="iconify" 
                data-icon="${isInWishlist ? "mdi:heart" : "mdi:heart-outline"}" 
                style="font-size:20px; color:${isInWishlist ? "red" : "black"}">
              </span>
            </button>
          </div>

          <button class="btn btn-secondary w-100 cartBtn" data-id="${product.id}" ${disabled}>
            ${product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>

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

  renderPagination(list.length, page);
}

// ========== Wishlist & Cart ==========
document.addEventListener("click", (e) => {
  const wishlistBtn = e.target.closest("#wishlistBtn");
  const cartBtn = e.target.closest(".cartBtn");

  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  if (!currentUser) {
    if (wishlistBtn || cartBtn) {
      alert("⚠ You must be logged in!");
    }
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.id === currentUser.id);

  if (wishlistBtn) {
    const productId = wishlistBtn.dataset.id;
    toggleUserList("wishlist", productId, "❤ Added to wishlist", "❌ Removed from wishlist");
    renderProducts(filteredProducts, currentPage); // تحديث القلب
    return;
  }

  if (cartBtn) {
    const productId = cartBtn.dataset.id;
    if (!currentUser.cart) currentUser.cart = [];
    const product = productsData.find((p) => String(p.id) === String(productId));
    if (!product) {
      alert("⚠ Product not found!");
      return;
    }

    if (product.stock <= 0) {
      alert("⚠ This product is out of stock!");
      return;
    }

    const existing = currentUser.cart.find((p) => String(p.id) === String(product.id));
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`⚠ Only ${product.stock} items available in stock!`);
        return;
      }
      existing.quantity += 1;
    } else {
      currentUser.cart.push({ ...product, quantity: 1 });
    }

    if (userIndex !== -1) users[userIndex] = currentUser;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("users", JSON.stringify(users));
    alert(" Added to cart!");
  }
});

function toggleUserList(key, productId, addMsg, removeMsg) {
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  if (!currentUser) {
    alert("⚠ You must be logged in!");
    return;
  }

  if (!currentUser[key]) currentUser[key] = [];

  let added;
  if (currentUser[key].includes(productId)) {
    currentUser[key] = currentUser[key].filter((id) => id !== productId);
    added = false;
  } else {
    currentUser[key].push(productId);
    added = true;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.id === currentUser.id);
  if (userIndex !== -1) users[userIndex] = currentUser;
  else users.push(currentUser);

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("users", JSON.stringify(users));

  alert(added ? addMsg : removeMsg);
}

// أول تحميل
renderProducts(filteredProducts, currentPage);
