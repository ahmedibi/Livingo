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
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('nav-link')) {
    document.querySelectorAll('.nav-link').forEach(item => {
      item.classList.remove('active');
    });
    e.target.classList.add('active');
  }
});
////////////////////////////////////////////////