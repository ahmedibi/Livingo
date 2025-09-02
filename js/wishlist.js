document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(data => document.getElementById("navbar").innerHTML = data);

  fetch("partials/footer.html")
    .then(res => res.text())
    .then(data => document.getElementById("footer").innerHTML = data);

  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const wishlistContainer = document.getElementById("wishlistContainer");

  if (!currentUser || !currentUser.wishlist || currentUser.wishlist.length === 0) {
    wishlistContainer.innerHTML = `<p class="text-muted">Your wishlist is empty.</p>`;
    return;
  }

  const wishlistProducts = products.filter(p => currentUser.wishlist.includes(String(p.id)));

  wishlistProducts.forEach(product => {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-3 mb-5";


  const disabled = product.stock <= 0 ? "disabled" : "";

  col.innerHTML = `
    <div class="card h-100 d-flex flex-column">
      <a href="product.html?id=${product.id}">
        <img 
          src="assets/${product.images[0]}" 
          onerror="this.src='assets/images/placeholder.jpg'" 
          class="card-img-top" 
          alt="${product.name}" height=200>
      </a>

      <div class="product-actions">
        <button class="wishlistBtn" data-id="${product.id}">
          <span class="iconify" data-icon="mdi:heart-outline" style="font-size:20px;"></span>
        </button>
      </div>

      <div class="d-flex">
        <button class="btn  w-100 rounded-0 addtocart" data-id="${product.id}" ${disabled}>
          ${product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>

      <div class="card-body flex-grow-1">
        <h5 class="card-title">${product.name}</h5>
        <p class="card-text">${product.description}</p>
      </div>
      
      <hr>
      <div class="d-flex justify-content-evenly align-items-center p-3">
        <span><strong style="color:crimson">${product.price} ${product.currency}</strong></span>
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFD43B" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg> 
          ${product.rating}
        </span>
        <span class="text-muted"> (${product.stock})</span>
      </div>
    </div>
  `;

  wishlistContainer.appendChild(col);
});

  wishlistContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.wishlistBtn');
    if (removeBtn) {
      const id = removeBtn.getAttribute('data-id');
      if (currentUser && currentUser.wishlist) {
        currentUser.wishlist = currentUser.wishlist.filter(itemId => itemId !== id);

        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) users[userIndex] = currentUser;

        
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("users", JSON.stringify(users));
      }
      const itemEl = removeBtn.closest('[class*="col-"]');
      if (itemEl) itemEl.remove();
      return;
    }

    const addBtn = e.target.closest('.addtocart');
if (addBtn) {
  const id = addBtn.getAttribute('data-id');
  if (!currentUser) {
    alert("You must be logged in to add items to cart!");
    return;
  }

  if (!Array.isArray(currentUser.cart)) currentUser.cart = [];

  const product = products.find(p => String(p.id) === id);

  if (product) {
   
    if (product.stock <= 0) {
      alert("This product is out of stock!");
      return;
    }

    const existing = currentUser.cart.find(item => String(item.id) === String(product.id));
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(` Only ${product.stock} items available in stock!`);
        return;
      }
      existing.quantity += 1;
    } else {
      currentUser.cart.push({ ...product, quantity: 1 });
    }

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) users[userIndex] = currentUser;

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("users", JSON.stringify(users));

    alert(` ${product.name} added to cart!`);
  }
  return;
}

  });
});
