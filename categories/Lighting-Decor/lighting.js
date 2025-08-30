// lighting-decore script.js placeholder


window.scrollTo({
  top: 0,
  behavior: 'smooth'
});

// Load navbar and footer
document.addEventListener("DOMContentLoaded", () => {
  // Load navbar
  fetch("../../partials/navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar").innerHTML = data;
    })
    .catch(err => console.error("Error loading navbar:", err));

  // Load footer
  fetch("../../partials/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch(err => console.error("Error loading footer:", err));
})

/////////////////////////////////////////////


const categoryName = "Lighting & Decor";

// عرض العنوان في أول الصفحة
document.addEventListener("DOMContentLoaded", () => {
  const titleContainer = document.getElementById("header");
  if (titleContainer) {
    titleContainer.textContent = categoryName;
  }
});

const productContainer = document.getElementById("productsList");
let filtered = []; // نخزن المنتجات هنا علشان نستخدمها في الفلترة


// نجيب من اللوكال ستوردج
const productsData = JSON.parse(localStorage.getItem("products")) || [];

// فلترة بالكاتيجوري
filtered = productsData.filter(product => product.category.startsWith(categoryName));

// عرض أول مرة
renderProducts(filtered);

// دالة لعرض المنتجات
function renderProducts(products) {
  productContainer.innerHTML = ""; // نفرغ الكونتينر الأول

  products.forEach(product => {
    const imagePath = `../../assets/${product.images[0]}`;

    productContainer.innerHTML += `
      <div class="col-12 col-md-6 col-lg-3 mb-5">
        <div class="card h-100">
          <a href="../../product.html?id=${product.id}">
            <img src="${imagePath}" class="card-img-top" alt="${product.name}">
          </a>

          <div class="product-actions">
            
              <button id="wishlistBtn" data-id="${product.id}"><span class="iconify" data-icon="mdi:heart-outline" style="font-size:20px;"></span></button>
            
          </div>
           <button class="btn w-100 cartBtn" data-id="${product.id}">Add to Cart</button>

          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.description}</p>
          </div>
          <div class=" d-flex justify-content-evenly align-items-center p-3">
            <span><strong style="color:#dc3545">${product.currency} ${product.price}</strong></span>
            <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="width: 20px;"><!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="#FFD43B" d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/></svg> ${product.rating}</span>
            <span class="text-muted"> (${product.stock})</span>
          </div>
        </div>
      </div>
    `;
  });
}


// لما المستخدم يغير الفلتر
document.querySelectorAll(".dropdown-item").forEach(item => {
  item.addEventListener("click", (e) => {
    const sortType = e.target.getAttribute("data-sort");
    let sorted = [...filtered];

    if (sortType === "priceLow") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortType === "priceHigh") {
      sorted.sort((a, b) => b.price - a.price);
    }
    else if (sortType === "az") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "za") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortType === "featured") {
      sorted = [...filtered]; // تسيبها زي ما هي (الترتيب الافتراضي)
    }
    renderProducts(sorted);
  });
});

// فلترة بالـ price
const rangeMin = document.getElementById("rangeMin");
const rangeMax = document.getElementById("rangeMax");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");

// إنشاء المسار الملون
const trackContainer = document.querySelector(".position-relative");
const trackFill = document.createElement("div");
trackFill.className = "range-track-fill";
trackContainer.appendChild(trackFill);

// تحديث المسار الملون
function updateTrack() {
  const min = parseInt(rangeMin.value);
  const max = parseInt(rangeMax.value);
  const percentMin = (min / rangeMin.max) * 100;
  const percentMax = (max / rangeMax.max) * 100;

  trackFill.style.left = percentMin + "%";
  trackFill.style.width = (percentMax - percentMin) + "%";
}

// تنفيذ الفلتر مباشرة
function applyPriceFilter() {
  const minPrice = parseInt(minPriceInput.value) || 0;
  const maxPrice = parseInt(maxPriceInput.value) || Infinity;

  const filteredByPrice = filtered.filter(
    product => product.price >= minPrice && product.price <= maxPrice
  );

  renderProducts(filteredByPrice);
}

// تحديث القيم لما السلايدر يتحرك
function syncInputs() {
  let min = parseInt(rangeMin.value);
  let max = parseInt(rangeMax.value);

  if (min > max - 100) {
    rangeMin.value = max - 100;
    min = max - 100;
  }
  if (max < min + 100) {
    rangeMax.value = min + 100;
    max = min + 100;
  }

  minPriceInput.value = min;
  maxPriceInput.value = max;
  updateTrack();
  applyPriceFilter(); // فلترة مباشرة
}

rangeMin.addEventListener("input", syncInputs);
rangeMax.addEventListener("input", syncInputs);

// تحديث السلايدر لما تتغير الـ inputs
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

// أول تحديث
syncInputs();


// زرار Reset
const resetBtn = document.getElementById("resetPrice");

resetBtn.addEventListener("click", () => {
  rangeMin.value = 0;
  rangeMax.value = 1800;
  minPriceInput.value = 0;
  maxPriceInput.value = 1800;

  updateTrack();
  renderProducts(filtered); // رجّع كل المنتجات من غير فلتر
});




////////////////////////////////////////////



////////////////////// Wishlist & Cart Buttons ///////////////////////
document.addEventListener("click", (e) => {
  // Wishlist button
  const wishlistBtn = e.target.closest("#wishlistBtn");
  if (wishlistBtn) {
    const productId = wishlistBtn.dataset.id;
    toggleStorageItem("wishlist", productId, "❤ Added to wishlist", "❌ Removed from wishlist");
    return;
  }

  // Cart button
  const cartBtn = e.target.closest(".cartBtn");
  if (cartBtn) {
    const productId = cartBtn.dataset.id;

    // Load products from storage
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products.find(p => p.id === productId);

    if (!product) {
      alert("⚠ Product not found!");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        images: product.images,
        quantity: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✅ Added to cart!");
  }
});

// Generic toggle function
function toggleStorageItem(key, productId, addMsg, removeMsg) {
  let items = JSON.parse(localStorage.getItem(key)) || [];
  if (items.includes(productId)) {
    items = items.filter(id => id !== productId);
    alert(removeMsg);
  } else {
    items.push(productId);
    alert(addMsg);
  }
  localStorage.setItem(key, JSON.stringify(items));
}