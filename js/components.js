// ========== Back to top (safe) ==========
window.addEventListener("scroll", () => {
  const backToTop = document.querySelector(".back-to-top");
  if (!backToTop) return;
  if (window.scrollY > 200) backToTop.classList.add("show");
  else backToTop.classList.remove("show");
});

// ========== Global click handlers ==========
document.addEventListener("click", (e) => {
  // 1) تفعيل/إلغاء تفعيل اللينكات في النافبار
  const navLink = e.target.closest(".nav-link");
  if (navLink) {
    document.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.remove("active");
    });
    navLink.classList.add("active");
  }

  // 2) Logout يعمل حتى لو الـnavbar اتحملت بعد DOMContentLoaded
  const logoutEl = e.target.closest("#logout");
  if (logoutEl) {
    e.preventDefault();
    try {
      localStorage.removeItem("currentUser");
    } catch {}
    alert("You have been logged out.");

    // نفس المسار اللي عندك (بيتحل كـمسار جذري من الصفحة الرئيسية برضه)
    window.location.assign("../../sign/login/login.html");
  }
});

// ========== بحث المنتجات (safe) ==========
document.addEventListener("input", (e) => {
  if (e.target && e.target.id === "search") {
    const q = e.target.value.toLowerCase();
    const list = Array.isArray(window.allProducts) ? window.allProducts : [];
    const filtered = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );

    if (typeof window.renderProducts === "function") {
      window.renderProducts(filtered);
    }
  }
});

// (لو هتحتاج تحميل JSON للـlocalStorage اعمله هنا بعد ما تتأكد من وجوده)
