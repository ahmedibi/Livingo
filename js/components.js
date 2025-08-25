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
  fetch("../json/users.json")
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("users", JSON.stringify(data));
      console.log("✅ Users loaded into localStorage");
    })
    .catch((err) => console.error("Error loading users.json:", err));
});

// use the code below if you want to use either of them somewhere else:
//const products = JSON.parse(localStorage.getItem("products"));
//const users = JSON.parse(localStorage.getItem("users"));
