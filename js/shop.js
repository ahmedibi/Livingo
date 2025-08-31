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
  });

  /////////////////////////////////////////////

  const productContainer = document.getElementById("productList");
  const categoriesList = document.getElementById("categoriesList");
  const mobileCategories = document.getElementById("mobileCategoriesList");

  // ================= GET PRODUCTS FROM LOCAL STORAGE =================
  const productsData = JSON.parse(localStorage.getItem("products")) || [];

  // ================= CATEGORIES ================= 
  const categories = [...new Set(productsData.map(p => p.category))];
  categories.forEach((cat, index) => {
    const item = `
      <li class="list-group-item d-flex align-items-center">
        <input type="radio" name="category" value="${cat}" id="cat-${index}" class="form-check-input me-2">
        <label for="cat-${index}" class="mb-0">${cat}</label>
      </li>`;
    categoriesList.innerHTML += item;
    mobileCategories.innerHTML += item;
  });
  
function updateUserData(updatedUser) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));

  const index = users.findIndex(u => u.email === updatedUser.email);
  if (index !== -1) {
    users[index] = updatedUser;
  } else {
    users.push(updatedUser);
  }
  localStorage.setItem("users", JSON.stringify(users));
}

  // ================= PRICE ================= 
  const prices = productsData.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Elements - Mobile
  const rangeMinMobile = document.getElementById("rangeMinMobile"); 
  const rangeMaxMobile = document.getElementById("rangeMaxMobile"); 
  const minPriceMobile = document.getElementById("minPriceMobile"); 
  const maxPriceMobile = document.getElementById("maxPriceMobile");

  // Elements - Desktop
  const rangeMinDesktop = document.getElementById("rangeMinDesktop");
  const rangeMaxDesktop = document.getElementById("rangeMaxDesktop");
  const minPriceDesktop = document.getElementById("minPriceDesktop");
  const maxPriceDesktop = document.getElementById("maxPriceDesktop");

  // Init values
  [rangeMinMobile, rangeMinDesktop].forEach(r => { r.min = minPrice; r.max = maxPrice; r.value = minPrice; });
  [rangeMaxMobile, rangeMaxDesktop].forEach(r => { r.min = minPrice; r.max = maxPrice; r.value = maxPrice; });
  [minPriceMobile, minPriceDesktop].forEach(input => input.value = minPrice);
  [maxPriceMobile, maxPriceDesktop].forEach(input => input.value = maxPrice);

  // Sync sliders with inputs
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
    inMin.addEventListener("change", () => { rMin.value = inMin.value; update(); });
    inMax.addEventListener("change", () => { rMax.value = inMax.value; update(); });
  }

  syncSliders(rangeMinMobile, rangeMaxMobile, minPriceMobile, maxPriceMobile, productsData);
  syncSliders(rangeMinDesktop, rangeMaxDesktop, minPriceDesktop, maxPriceDesktop, productsData);

  // ================= RENDER ALL PRODUCTS=================//
  renderProducts(productsData);

  // ================= FILTER EVENTS ================= 
  [categoriesList, mobileCategories].forEach(list => {
    list.addEventListener("change", () => applyFilters(productsData));
  });

  // زرار الفلتر في الموبايل 
  const filterBtn = document.getElementById("filterBtn"); 
  const filterPanel = document.getElementById("filterPanel"); 
  filterBtn.addEventListener("click", () => {
    filterPanel.classList.toggle("d-none");
  });

  // reset function مشتركة
  function resetFilters() {
    document.querySelectorAll("input[type=radio], input[type=checkbox]").forEach(r => r.checked = false);

    minPriceDesktop.value = rangeMinDesktop.min;
    maxPriceDesktop.value = rangeMaxDesktop.max;
    rangeMinDesktop.value = rangeMinDesktop.min;
    rangeMaxDesktop.value = rangeMaxDesktop.max;

    minPriceMobile.value = rangeMinMobile.min;
    maxPriceMobile.value = rangeMaxMobile.max;
    rangeMinMobile.value = rangeMinMobile.min;
    rangeMaxMobile.value = rangeMaxMobile.max;

    renderProducts(productsData);
  }

  document.getElementById("resetBtnMobile").addEventListener("click", resetFilters);
  document.getElementById("resetBtnDesktop").addEventListener("click", resetFilters);

  // =============== APPLY FILTERS =============== 
  function applyFilters(products) {
    let filtered = [...products];
    const selectedCat = document.querySelector("input[name='category']:checked");
    if (selectedCat) filtered = filtered.filter(p => p.category === selectedCat.value);

    let minMobile = +minPriceMobile?.value || minPrice;
    let maxMobile = +maxPriceMobile?.value || maxPrice;
    let minDesktop = +minPriceDesktop?.value || minPrice;
    let maxDesktop = +maxPriceDesktop?.value || maxPrice;

    if (window.innerWidth < 768) filtered = filtered.filter(p => p.price >= minMobile && p.price <= maxMobile);
    else filtered = filtered.filter(p => p.price >= minDesktop && p.price <= maxDesktop);

    renderProducts(filtered);
  }

  function renderProducts(list) {
    productContainer.innerHTML = "";
    list.forEach(product => {
      const imagePath = `assets/${product.images[0]}`;
      productContainer.innerHTML += `
        <div class="col-12 col-md-6 col-lg-3 mb-5">
          <div class="card h-100">
            <img src="${imagePath}" class="card-img-top" alt="${product.name}">
            <div class="product-actions">
              <button id="wishlistBtn" data-id="${product.id}">
                <span class="iconify" data-icon="mdi:heart-outline" style="font-size:20px;"></span>
              </button>
            </div>
            <button class="btn w-100 cartBtn" data-id="${product.id}">Add to Cart</button>
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.description}</p>
            </div>
            <div class="d-flex justify-content-evenly align-items-center p-3">
              <span><strong style="color:#dc3545">${product.currency} ${product.price}</strong></span>
              <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="width: 20px;"><path fill="#FFD43B" d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/></svg> ${product.rating}</span>
              <span class="text-muted">(${product.stock})</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  ////////////////////// Wishlist & Cart Buttons ///////////////////////
  document.addEventListener("click", (e) => {
    const wishlistBtn = e.target.closest("#wishlistBtn");
    const cartBtn = e.target.closest(".cartBtn");

    let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    if(!currentUser){ alert("⚠ You must be logged in!"); return; }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if(wishlistBtn){
      const productId = wishlistBtn.dataset.id;
      toggleUserList("wishlist", productId, "❤ Added to wishlist", "❌ Removed from wishlist");
      return;
    }

    if(cartBtn){
      const productId = cartBtn.dataset.id;
      if(!currentUser.cart) currentUser.cart=[];
      const product = productsData.find(p => String(p.id) === String(productId));
      if(!product){ alert("⚠ Product not found!"); return; }

      const existing = currentUser.cart.find(p => String(p.id) === String(product.id));
      if(existing) existing.quantity+=1;
      else currentUser.cart.push({...product, quantity:1});

      if(userIndex!==-1) users[userIndex]=currentUser;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("users", JSON.stringify(users));
      alert("✅ Added to cart!");
    }
  });

  function toggleUserList(key, productId, addMsg, removeMsg){
    let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    if(!currentUser){ alert("⚠ You must be logged in!"); return; }

    if(!currentUser[key]) currentUser[key]=[];

    let added;
    if(currentUser[key].includes(productId)){
      currentUser[key] = currentUser[key].filter(id=>id!==productId);
      added=false;
    } else {
      currentUser[key].push(productId);
      added=true;
    }

    let users = JSON.parse(localStorage.getItem("users"))||[];
    const userIndex = users.findIndex(u=>u.id===currentUser.id);
    if(userIndex!==-1) users[userIndex]=currentUser;
    else users.push(currentUser);

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("users", JSON.stringify(users));

    alert(added ? addMsg : removeMsg);
  }
