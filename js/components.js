//navbar
//!*back-to-top

window.addEventListener("scroll", () => {
  const backToTop = document.getElementsByClassName("back-to-top")[0];
  if (window.scrollY > 200) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

//* script for underline in navbar
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("nav-link")) {
    document.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.remove("active");
    });
    e.target.classList.add("active");
  }
});
////////////////////////////////////////////////

// loading the json files into the local storage on site load!
document.addEventListener("DOMContentLoaded", () => {
  // Load products.json into localStorage
  fetch("../json/products.json")
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("products", JSON.stringify(data));
      console.log("✅ Products loaded into localStorage");
    })
    .catch((err) => console.error("Error loading products.json:", err));

  // Load users.json into localStorage
  // loading the json files into the local storage on site load!

  // Load users.json into localStorage
  fetch("../json/users.json")
    .then((res) => res.json())
    .then((jsonUsers) => {
      // users الموجودين قبل كده في localStorage
      const localUsers = JSON.parse(localStorage.getItem("users")) || [];

      // نعمل merge بحيث ما يتكررش نفس الإيميل/التليفون
      const mergedUsers = [
        ...jsonUsers,
        ...localUsers.filter(
          (lu) =>
            !jsonUsers.some(
              (ju) =>
                (ju.email && ju.email === lu.email) ||
                (ju.phone && ju.phone === lu.phone)
            )
        ),
      ];

      localStorage.setItem("users", JSON.stringify(mergedUsers));
      console.log("✅ Users merged into localStorage:", mergedUsers);
    })
    .catch((err) => console.error("Error loading users.json:", err));


document.getElementById("search").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
  renderProducts(filtered);
});


document.getElementById("logout").addEventListener("click",function(){
  localStorage.removeItem("currentUser"); 
         alert("You have been logged out.");
         window.location.href = "../../sign/login/login.html"; 
})
});

// use the code below if you want to use either of them somewhere else:
//const products = JSON.parse(localStorage.getItem("products"));
//const users = JSON.parse(localStorage.getItem("users"));
