 ////nav///////
document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar").innerHTML = data;
    })
    .catch(err => console.error("Error loading navbar:", err));

///////////////////FOOTER//////////////////////////////////
  fetch("partials/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch(err => console.error("Error loading footer:", err));
///////////////////////////products ////////////////////////////////////////////
let SellBroducts = [];

function loadProductsFromStorage() {
  const productsData = localStorage.getItem('products');
  
  if (productsData) {
    try {
      SellBroducts = JSON.parse(productsData);
      console.log('Products loaded from localStorage:', SellBroducts.length);
      return true;
    } catch (error) {
      console.error('Error parsing products from localStorage:', error);
      return false;
    }
  } else {
    console.warn('No products found in localStorage');
    return false;
  }
}

// Generate stars
function generateStars(rating) {
  let stars = "";
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  for (let i = 0; i < fullStars; i++) stars += `<i class="bi bi-star-fill text-warning"></i>`;
  if (halfStar) stars += `<i class="bi bi-star-half text-warning"></i>`;
  return stars;
}

// Function to check if a name contains exactly three words
function hasExactlyThreeWords(name) {
  // Clean the name and split by any whitespace characters
  const cleanName = name.trim().replace(/\s+/g, ' '); // Replace multiple spaces with single space
  const words = cleanName.split(' ').filter(word => 
    word.length > 0 && // Not empty
    /^[a-zA-Z0-9]+/.test(word) // Contains letters or numbers (actual words)
  );
  
  console.log(`Checking "${name}" -> cleaned: "${cleanName}" -> words: [${words.join(', ')}] -> count: ${words.length}`);
  return words.length === 3;
}

// Filter products to get only those with exactly three words in their names
function getThreeWordProducts() {
  return SellBroducts.filter(product => hasExactlyThreeWords(product.name));
}

// Render responsive carousel
const productList = document.getElementById("product-list");

function getItemsPerSlide() {
  if (window.innerWidth >= 992) return 4; // large
  if (window.innerWidth >= 768) return 2; // medium
  return 1; // small
}

function renderCarousel() {
  // Check if we have products loaded
  if (!SellBroducts || SellBroducts.length === 0) {
    productList.innerHTML = `
      <div class="carousel-item active">
        <div class="row justify-content-center">
          <div class="col-12 text-center">
            <p class="text-muted">No products available</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Get products with exactly three words in their names
  const threeWordProducts = getThreeWordProducts();
  
  if (threeWordProducts.length === 0) {
    productList.innerHTML = `
      <div class="carousel-item active">
        <div class="row justify-content-center">
          <div class="col-12 text-center">
            <p class="text-muted">No products with three-word names available</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  productList.innerHTML = "";
  const perSlide = getItemsPerSlide();
  
  // Take the second 8 products (skip first 8, take next 8)
  const productsToShow = threeWordProducts.slice(8, 16);
  
  console.log(`Showing ${productsToShow.length} products with three-word names:`, 
              productsToShow.map(p => p.name));

  for (let i = 0; i < productsToShow.length; i += perSlide) {
    const isActive = i === 0 ? "active" : "";
    const group = productsToShow.slice(i, i + perSlide);

    let cardsHTML = "";
    group.forEach(product => {
      // Fix image path if it already contains 'assets'
      let imagePath = product.images[0];
      if (imagePath.startsWith('assets/')) {
        imagePath = imagePath; // Use as is
      } else {
        imagePath = `assets/${imagePath}`; // Add assets prefix
      }
      
      cardsHTML += `
        <div class="col">
          <div class="shadow-sm gap-4 product-card">
            <!-- Icons top-right -->
            <div class="position-absolute top-0 end-0 d-flex flex-column m-2 gap-2 product-actions">
              <a href="wishlist.html?id=${product.id}">
                <button class="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center action-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M4.24 12.25a4.2 4.2 0 0 1-1.24-3A4.25 4.25 0 0 1 7.25 5c1.58 0 2.96.86 3.69 2.14h1.12A4.24 4.24 0 0 1 15.75 5A4.25 4.25 0 0 1 20 9.25c0 1.17-.5 2.25-1.24 3L11.5 19.5zm15.22.71C20.41 12 21 10.7 21 9.25A5.25 5.25 0 0 0 15.75 4c-1.75 0-3.3.85-4.25 2.17A5.22 5.22 0 0 0 7.25 4A5.25 5.25 0 0 0 2 9.25c0 1.45.59 2.75 1.54 3.71l7.96 7.96z"/>
                    </svg>
                  </button>
                </a>
              </div>
              <a href="./product.html?id=${product.id}">
                <img src="${imagePath}" class="card-img-top" alt="${product.name}" onerror="console.log('Image failed to load:', this.src); this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';">
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
          </div>
        `;
    });

    const slideHTML = `
      <div class="carousel-item ${isActive}">
        <div class="row justify-content-center g-3">
          ${cardsHTML}
        </div>
      </div>
    `;
    productList.innerHTML += slideHTML;
  }
}

// Initialize the carousel
function initializeCarousel() {
  const dataLoaded = loadProductsFromStorage();
  
  if (dataLoaded) {
    renderCarousel();
    window.addEventListener("resize", renderCarousel);
  } else {
    // Handle case when no data is available
    renderCarousel(); // This will show "No products available" message
  }
}

// Initial render
initializeCarousel();
////////////////////////////// EXPLORE OUR PRODUCTS /////////////////////////////////////
// Function to check if a name contains exactly three words
function hasExactlyThreeWords(name) {
  // Split by spaces and filter out empty strings
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length === 3;
}

// Generate stars function
function generateStars(rating) {
  let stars = "";
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  for (let i = 0; i < fullStars; i++) stars += `<i class="bi bi-star-fill text-warning"></i>`;
  if (halfStar) stars += `<i class="bi bi-star-half text-warning"></i>`;
  return stars;
}

const productsData = localStorage.getItem('products');
const container = document.getElementById('product-container');

if (productsData) {
  try {
    const products = JSON.parse(productsData);
    
    // Filter products to get only those with exactly three words in their names
    const threeWordProducts = products.filter(product => hasExactlyThreeWords(product.name));
    
    // Take the first 8 products with three-word names
    const productsToShow = threeWordProducts.slice(0, 8);
    
    console.log(`Found ${threeWordProducts.length} products with three-word names`);
    console.log(`Showing first ${productsToShow.length} products:`, productsToShow.map(p => p.name));

    if (productsToShow.length === 0) {
      container.innerHTML = '<p class="text-center">No products with three-word names available.</p>';
    } else {
      productsToShow.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-6 col-12 mb-3';
        col.innerHTML = `
          <div class="shadow-sm gap-5 product-card">
            <!-- Icons top-right -->
            <div class="position-absolute top-0 end-0 d-flex flex-column m-2 gap-2 product-actions">
              <a href="wishlist.html?id=${product.id}">
                <button class="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center action-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M4.24 12.25a4.2 4.2 0 0 1-1.24-3A4.25 4.25 0 0 1 7.25 5c1.58 0 2.96.86 3.69 2.14h1.12A4.24 4.24 0 0 1 15.75 5A4.25 4.25 0 0 1 20 9.25c0 1.17-.5 2.25-1.24 3L11.5 19.5zm15.22.71C20.41 12 21 10.7 21 9.25A5.25 5.25 0 0 0 15.75 4c-1.75 0-3.3.85-4.25 2.17A5.22 5.22 0 0 0 7.25 4A5.25 5.25 0 0 0 2 9.25c0 1.45.59 2.75 1.54 3.71l7.96 7.96z"/>
                    </svg>
                  </button>
                </a>
              </div>
              <!-- Product image -->
              <a href="./product.html?id=${product.id}">
                <img src="assets/${product.images[0]}" class="card-img-top" alt="${product.name}">
              </a>
              <a href="./cart.html?id=${product.id}">
                <button class="btn btnc text-light rounded-0 w-100 button-cart">Add to Cart</button>
              </a>
              <div class="card-body p-3">
                <h6 class="card-title mb-4">${product.name}</h6>
                <p class="mb-2">
                  <span class="text-danger fw-bold border border-1 d-inline px-2 py-1 shadow-sm">
                    ${product.currency} ${product.price}
                  </span>
                  <div>
                    ${generateStars(product.rating)}
                    <small class="text-muted">(65)</small>
                  </div>
                </p>
              </div>
            </div>
          `;
        container.appendChild(col);
      });
    }

  } catch (error) {
    console.error('Error parsing products from localStorage:', error);
    container.innerHTML = '<p class="text-center">Error loading products. Please try again.</p>';
  }
} else {
  console.warn('No products found in localStorage');
  container.innerHTML = '<p class="text-center">No products available.</p>';
}

///////////////////////////SHOP SLIDER /////////////////////////////
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
        <a href="product.html?id=${shop.productId}"
           class="fs-3 text-light text-decoration-none border-bottom border-2 pb-1">
          Shop Now
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" class="ms-2">
            <path fill="#fff" class="arrow-icon"
              d="M8.293 2.293a1 1 0 0 1 1.414 0l4.5 4.5a1 1 0 0 1 0 1.414l-4.5 4.5a1 1 0 0 1-1.414-1.414L11 8.5H1.5a1 1 0 0 1 0-2H11L8.293 3.707a1 1 0 0 1 0-1.414" />
          </svg>
        </a>`;
    }
  });
});
