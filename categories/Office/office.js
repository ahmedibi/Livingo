// Office script.js placeholder

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

const productContainer = document.getElementById("productsList");


fetch("../../json/products.json")
  .then(response => response.json())
  .then(products => {

    const filtered = products.filter(product => product.category.startsWith("Office"));


    filtered.forEach(product => {
      const imagePath = `../../assets/${product.images[0]}`;  // JSON يكون "assets/images/..."


      productContainer.innerHTML += `
            <div class="col-12 col-md-6 col-lg-3 mb-5">
              <div class="card h-100">
                <img src="${imagePath}" class="card-img-top" alt="${product.name}">

                <div class="product-actions">
                  <button ><span class="iconify" data-icon="mdi:heart-outline" style="font-size:20px;"></span></button>
                </div>
                <button class="btn w-100">Add to Cart</button>

                <div class="card-body">
                  <h5 class="card-title">${product.name}</h5>
                  <p class="card-text">${product.description}</p>
                  
                </div>
                <div class=" d-flex justify-content-evenly align-items-center p-3">
                  <span><strong>${product.price} ${product.currency}</strong></span>
                  <span>⭐ ${product.rating}</span>
                  <span class="text-muted"> (${product.stock})</span>
                </div>
              </div>
            </div>
          `;

    });
  })
  .catch(error => console.error("Error loading products:", error));


////////////////////////////////////////////

