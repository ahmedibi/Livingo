
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


  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  let users = JSON.parse(localStorage.getItem("users")) || [];

  function updateUserData(updatedUser) {
    currentUser = updatedUser;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    const index = users.findIndex((u) => u.email === updatedUser.email);
    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem("users", JSON.stringify(users));
  }


  document.addEventListener("click", (e) => {
 
    const wishlistBtn = e.target.closest(".wishlistBtn");
    if (wishlistBtn) {
      const productId = wishlistBtn.dataset.id;
      toggleWishlist(
        productId,
        "Added to wishlist",
        "Removed from wishlist"
      );
      return;
    }

    const cartBtn = e.target.closest(".cartBtn");
    if (cartBtn) {
      const productId = cartBtn.dataset.id;

      const products = JSON.parse(localStorage.getItem("products")) || [];
      const product = products.find((p) => p.id === productId);

      if (!product) {
        alert("⚠️ Product not found!");
        return;
      }

      let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
      if (!currentUser) {
        alert("⚠️ You must be logged in!");
        return;
      }

      if (!Array.isArray(currentUser.cart)) currentUser.cart = [];

      const existing = currentUser.cart.find((item) => item.id === product.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        currentUser.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          currency: product.currency,
          images: product.images,
          quantity: 1,
        });
      }

      updateUserData(currentUser);
      alert("Added to cart!");
    }
  });


  function toggleWishlist(productId, addMsg, removeMsg) {
    let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    if (!currentUser) {
      alert("You must be logged in!");
      return;
    }

    if (!Array.isArray(currentUser.wishlist)) currentUser.wishlist = [];

    if (currentUser.wishlist.includes(productId)) {
      currentUser.wishlist = currentUser.wishlist.filter(
        (id) => id !== productId
      );
      alert(removeMsg);
    } else {
      currentUser.wishlist.push(productId);
      alert(addMsg);
    }

    updateUserData(currentUser);
  }


  let SellBroducts = [];

  function loadProductsFromStorage() {
    const productsData = localStorage.getItem("products");
    if (productsData) {
      try {
        SellBroducts = JSON.parse(productsData);
        console.log("Products loaded from localStorage:", SellBroducts.length);
        return true;
      } catch (error) {
        console.error("Error parsing products from localStorage:", error);
        return false;
      }
    } else {
      console.warn("No products found in localStorage");
      return false;
    }
  }

  function generateStars(rating) {
    let stars = "";
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++)
      stars += `<i class="bi bi-star-fill text-warning"></i>`;
    if (halfStar) stars += `<i class="bi bi-star-half text-warning"></i>`;
    return stars;
  }

  function hasExactlyThreeWords(name) {
    const words = name
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length === 3;
  }

  function getThreeWordProducts() {
    return SellBroducts.filter((product) => hasExactlyThreeWords(product.name));
  }

  const productList = document.getElementById("product-list");

  function getItemsPerSlide() {
    if (window.innerWidth >= 992) return 4;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function renderCarousel() {
    if (!SellBroducts || SellBroducts.length === 0) {
      productList.innerHTML = `
          <div class="carousel-item active">
            <div class="row justify-content-center">
              <div class="col-12 text-center">
                <p class="text-muted">No products available</p>
              </div>
            </div>
          </div>`;
      return;
    }

    const threeWordProducts = getThreeWordProducts();

    if (threeWordProducts.length === 0) {
      productList.innerHTML = `
          <div class="carousel-item active">
            <div class="row justify-content-center">
              <div class="col-12 text-center">
                <p class="text-muted">No products with three-word names available</p>
              </div>
            </div>
          </div>`;
      return;
    }

    productList.innerHTML = "";
    const perSlide = getItemsPerSlide();
    const productsToShow = threeWordProducts.slice(8, 16);

    for (let i = 0; i < productsToShow.length; i += perSlide) {
      const isActive = i === 0 ? "active" : "";
      const group = productsToShow.slice(i, i + perSlide);

      let cardsHTML = "";
      group.forEach((product) => {
        const imagePath = product.images[0].startsWith("assets/")
          ? product.images[0]
          : `assets/${product.images[0]}`;

        const wishlistButtonHTML = `
            <button class="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center  wishlistBtn"
                    data-id="${product.id}">
             <span class="iconify" data-icon="mdi:heart-outline" style="font-size:20px;"></span>
            </button>`;

        const cartTopButtonHTML = `
            <button class="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center cartBtn"
                    data-id="${product.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1h1
                         a.5.5 0 0 1 .485.379L2.89 6H14.5
                         a.5.5 0 0 1 .491.592l-1.5 7
                         A.5.5 0 0 1 13 14H4
                         a.5.5 0 0 1-.491-.408L1.01 2H.5
                         a.5.5 0 0 1-.5-.5zM3.14 7l1.25 6h8.22l1.25-6H3.14z"></path>
                <path d="M5.5 16a1 1 0 1 0 0-2
                         1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2
                         0 1 1 0 0 1 2 0z"></path>
              </svg>
            </button>`;

        cardsHTML += `
            <div class="col">
              <div class="shadow-sm gap-4 product-card position-relative">
                <div class="position-absolute top-0 end-0 d-flex flex-column m-2 gap-2 product-actions">
                  ${wishlistButtonHTML}
                  ${cartTopButtonHTML}
                </div>
                <a href="./product.html?id=${product.id}">
                  <img src="${imagePath}" class="card-img-top" alt="${product.name}"
                      onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';">
                </a>
                <div class="card-body p-3">
                  <h6 class="card-title mb-3 border-bottom border-2 pb-1">${product.name}</h6>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div>${generateStars(product.rating)}</div>
                    <small>(${product.rating})</small>
                  </div>
                  <p class="fw-bold text-danger border border-1 d-inline px-2 py-1">
                    ${product.price} ${product.currency}
                  </p>
                  <small class="text-muted">Stock: ${product.stock}</small>
                </div>
              </div>
            </div>`;
      });

      const slideHTML = `
          <div class="carousel-item ${isActive}">
            <div class="row justify-content-center g-3">
              ${cardsHTML}
            </div>
          </div>`;
      productList.insertAdjacentHTML("beforeend", slideHTML);
    }
  }

  function initializeCarousel() {
    const dataLoaded = loadProductsFromStorage();
    renderCarousel();
    if (dataLoaded) {
      window.addEventListener("resize", renderCarousel);
    }
  }

  initializeCarousel();

  const productsData = localStorage.getItem("products");
  const container = document.getElementById("product-container");

  if (productsData) {
    try {
      const products = JSON.parse(productsData);
      const threeWordProducts = products.filter((product) =>
        hasExactlyThreeWords(product.name)
      );
      const productsToShow = threeWordProducts.slice(0, 8);

      if (productsToShow.length === 0) {
        container.innerHTML =
          '<p class="text-center">No products with three-word names available.</p>';
      } else {
        productsToShow.forEach((product) => {
          const col = document.createElement("div");
          col.className = "col-lg-3 col-md-6 col-12 mb-3";

          col.innerHTML = `
              <div class="shadow-sm gap-5 product-card position-relative">
                <div class="position-absolute top-0 end-0 d-flex m-2 product-actions">
                  <button class="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center wishlistBtn" data-id="${product.id}">  
                  <span class="iconify" data-icon="mdi:heart-outline" style="font-size:20px;"></span>
                  </button>
                </div>

                <a href="./product.html?id=${product.id}">
                  <img src="assets/${product.images[0]}" class="card-img-top" alt="${product.name}">
                </a>

                <button class="btn btnc text-light rounded-0 w-100 button-cart cartBtn" data-id="${product.id}">
                  Add to Cart
                </button>

                <div class="card-body p-3">
                  <h6 class="card-title mb-4">${product.name}</h6>
                  <p class="mb-2">
                    <span class="text-danger fw-bold border border-1 d-inline px-2 py-1 shadow-sm">
                      ${product.currency} ${product.price}
                    </span>
                    <div>${generateStars(product.rating)}</div>
                  </p>
                </div>
              </div>`;
          container.appendChild(col);
        });
      }
    } catch (error) {
      console.error("Error parsing products from localStorage:", error);
      container.innerHTML =
        '<p class="text-center">Error loading products. Please try again.</p>';
    }
  } else {
    container.innerHTML = '<p class="text-center">No products available.</p>';
  }


  const shopLinks = [
    { id: "shop1", productId: "p021" },
    { id: "shop2", productId: "p033" },
    { id: "shop3", productId: "p069" },
    { id: "shop4", productId: "p009" },
    { id: "shop5", productId: "p037" },
    { id: "shop6", productId: "p053" }
  ];

  shopLinks.forEach(shop => {
    const element = document.getElementById(shop.id);
    if (element) {
      element.innerHTML = `
        <a href="./product.html?id=${shop.productId}"
           class="fs-3 text-light text-decoration-none border-bottom border-2 pb-1">
          Shop Now →
        </a>`;
    }
  });
});



  document.addEventListener("DOMContentLoaded", () => {
    const shopLinks = [
      { id: "shopnow1", productId: "p015" }, 
      { id: "shopnow2", productId: "p031" }, 
      { id: "shopnow3", productId: "p035" }, 
      { id: "shopnow4", productId: "p001" }  
    ];

    shopLinks.forEach(shop => {
      const element = document.getElementById(shop.id);
      if (element) {
        element.innerHTML = `
          <a href="./product.html?id=${shop.productId}" 
             class="btn btn-outline-light rounded-pill px-4 align-self-start">
            Shop Now
          </a>`;
      }
    });

   
    const contactForm = document.getElementById("contactForm");
  const emailInput = document.getElementById("contactEmail");

  // لو في مستخدم عامل login
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser && currentUser.email && emailInput) {
    emailInput.value = currentUser.email; // جِب الايميل وحطه تلقائي
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const contactData = {
        id: Date.now(),
        name: document.getElementById("contactName").value.trim(),
        email: emailInput.value.trim(),
        subject: document.getElementById("contactSubject").value.trim(),
        message: document.getElementById("contactMessage").value.trim(),
        date: new Date().toLocaleString()
      };

      let contacts = JSON.parse(localStorage.getItem("contactus")) || [];
      contacts.push(contactData);
      localStorage.setItem("contactus", JSON.stringify(contacts));

      contactForm.reset();

      // بعد reset نرجّع الايميل تاني عشان ما يروحش
      if (currentUser && currentUser.email) {
        emailInput.value = currentUser.email;
      }

      alert("✅ Your message has been saved successfully!");
    });
  }
  });

window.addEventListener("load", () => {
  const overlay = document.getElementById("loading-overlay");
  overlay.style.opacity = "0";
  overlay.addEventListener("transitionend", () => {
    overlay.style.display = "none";
    document.documentElement.classList.add("loaded");
  });
});

window.addEventListener("load", () => {
  document.documentElement.classList.add("loaded");
});
