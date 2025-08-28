document.addEventListener("DOMContentLoaded", () => {
  // Load navbar
  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(data => document.getElementById("navbar").innerHTML = data);

  // Load footer
  fetch("partials/footer.html")
    .then(res => res.text())
    .then(data => document.getElementById("footer").innerHTML = data);

  // Get wishlist (IDs) and products
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const wishlistContainer = document.getElementById("wishlistContainer");

  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = `<p class="text-muted">Your wishlist is empty.</p>`;
    return;
  }


  const wishlistProducts = products.filter(p => wishlist.includes(String(p.id)));

  wishlistProducts.forEach(product => {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-3 mb-5"; // العمود هنا

  col.innerHTML = `
    <div class="card h-100 d-flex flex-column">

    <a href="product.html?id=${product.id}" > <img 
        src="assets/${product.images[0]}" 
        onerror="this.src='assets/images/placeholder.jpg'" 
        class="card-img-top" 
        alt="${product.name}" height=200> </a>
      
      <div class="d-flex">
        <button class="btn w-50 rounded-0 addtocart" data-id="${product.id}" 
          style="background-color:#284b63; color:white">
          Add to Cart
        </button>
        <button class="btn w-50 rounded-0 remove-btn" data-id="${product.id}" 
          style="background-color:#a0804d; color:white">
          Remove from Wishlist
        </button>
      </div>

      <div class="card-body flex-grow-1">
        <h5 class="card-title">${product.name}</h5>
        <p class="card-text">${product.description}</p>
      </div>
      
      <hr>
      <div class="d-flex justify-content-evenly align-items-center p-3">
        <span><strong>${product.price} ${product.currency}</strong></span>
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


  // زرار الحذف + الاضافة للكارت
  wishlistContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-btn');
    if (removeBtn) {
      const id = removeBtn.getAttribute('data-id');
      const updatedWishlist = wishlist.filter(itemId => itemId !== id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      const itemEl = removeBtn.closest('[class*="col-"]'); // يمسح الكارد كله
      if (itemEl) itemEl.remove();
      return;
    }

    const addBtn = e.target.closest('.addtocart');
if (addBtn) {
  const id = addBtn.getAttribute('data-id');
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // هات المنتج من الـ products
  const product = products.find(p => String(p.id) === id);

  if (product) {
    // هل موجود قبل كدا؟
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += 1; // زود الكمية
    } else {
      // ضيف المنتج بنفس الشكل المطلوب
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        images: product.images,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // بدل alert ممكن تعمل Toast أو أي إشعار
    alert(`${product.name} added to cart!`);
  }
  return;
}

  });

});
