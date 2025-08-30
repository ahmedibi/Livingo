// ====================================================
// components.js - robust version with debugging & fallbacks
// ====================================================
async function loadDataIntoLocalStorage() {
  try {
    // Only load if not already in localStorage
    if (!localStorage.getItem("products") || !localStorage.getItem("users")) {
      const productsRes = await fetch("../json/products.json");
      const products = await productsRes.json();
      localStorage.setItem("products", JSON.stringify(products));

      const usersRes = await fetch("../json/users.json");
      const users = await usersRes.json();
      localStorage.setItem("users", JSON.stringify(users));

      console.log("✅ Products and Users loaded into localStorage!");
    } else {
      console.log("ℹ Data already exists in localStorage, skipping load.");
    }
  } catch (err) {
    console.error("❌ Error loading data into localStorage:", err);
  }
}

// async function loadDataIntoLocalStorage() {
//   try {
//     // Only load if not already in localStorage
//     if (!localStorage.getItem("products") || !localStorage.getItem("users")) {
//       const productsRes = await fetch("../json/products.json");
//       const products = await productsRes.json();
//       localStorage.setItem("products", JSON.stringify(products));

//       const usersRes = await fetch("../json/users.json");
//       const users = await usersRes.json();
//       localStorage.setItem("users", JSON.stringify(users));

//       console.log("✅ Products and Users loaded into localStorage!");
//     } else {
//       console.log("ℹ Data already exists in localStorage, skipping load.");
//     }
//   } catch (err) {
//     console.error("❌ Error loading data into localStorage:", err);
//   }
// }

// document.addEventListener("DOMContentLoaded", loadDataIntoLocalStorage);

if (window.__components_init) {
  console.debug("components.js: already initialized — skipping re-init.");
} else {
  window.__components_init = true;
  (function () {
    console.debug("components.js: init");

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
        document
          .querySelectorAll(".nav-link")
          .forEach((item) => item.classList.remove("active"));
        navLink.classList.add("active");
      }

      // 2) Logout
      const logoutEl = e.target.closest("#logout");
      if (logoutEl) {
        e.preventDefault();
        try {
          localStorage.removeItem("currentUser");
          console.debug("components.js: removed currentUser (logout)");
        } catch (err) {
          console.warn("components.js: error removing currentUser", err);
        }

        // حدّث الواجهة فوراً قبل التحويل
        try {
          toggleAuthLinks();
          updateCounters();
        } catch (err) {
          console.warn("components.js: error updating UI after logout", err);
        }

        // ثم اعمل redirect
        setTimeout(() => {
          window.location.assign("../../sign/login/login.html");
        }, 120);
      }
    });

    // ========== بحث المنتجات ==========
    // ========== بحث المنتجات من localStorage ==========
    function getProductsFromStorage() {
      try {
        return JSON.parse(localStorage.getItem("products")) || [];
      } catch {
        return [];
      }
    }

    document.addEventListener("keydown", (e) => {
      if (e.target && e.target.id === "search" && e.key === "Enter") {
        e.preventDefault();

        const q = e.target.value.toLowerCase().trim();
        if (!q) return;

        const list = getProductsFromStorage();
        const found = list.find(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );

        if (found && found.id) {
          // روح لصفحة المنتج
          window.location.assign(`../../product.html?id=${found.id}`);
        } else {
          alert("Product not found!");
        }
      }
    });

    // زرار السيرش
    document.addEventListener("click", (e) => {
      if (e.target.closest("#searchButton")) {
        const input = document.getElementById("search");
        const q = input.value.toLowerCase().trim();
        if (!q) return;

        const list = getProductsFromStorage();
        const found = list.find(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );

        if (found && found.id) {
          window.location.assign(`../../product.html?id=${found.id}`);
        } else {
          alert("Product not found!");
        }
      }
    });

    // ========== مساعدة آمنة لقراءة JSON ==========
    function safeParse(key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw);
      } catch (err) {
        console.warn("components.js: safeParse failed for key", key, err);
        return null;
      }
    }

    // ========== عدّاد عناصر (array/object/number/string) ==========
    function countItems(data) {
      if (data == null) return 0;
      if (Array.isArray(data)) return data.length;
      if (typeof data === "object") return Object.keys(data).length;
      if (typeof data === "number") return data;
      if (typeof data === "string") {
        // لو string يحتوي على JSON لعدد، حاول parse
        try {
          const parsed = JSON.parse(data);
          return countItems(parsed);
        } catch {
          return data.length || 0;
        }
      }
      return 0;
    }

    // ========== تحديث العدادات بتاعة ال wishlist و cart ==========
    function updateCounters() {
      const favEls = document.querySelectorAll(".count-favourite");
      const cartEls = document.querySelectorAll(".count-product");

      const favData = safeParse("wishlist");
      const cartData = safeParse("cart");

      const favCount = countItems(favData);
      const cartCount = countItems(cartData);

      if (favEls && favEls.length) {
        favEls.forEach((el) => {
          el.textContent = favCount;
        });
        console.debug("components.js: updated wishlist counter ->", favCount);
      } else {
        console.debug("components.js: no .count-favourite elements found yet");
      }

      if (cartEls && cartEls.length) {
        cartEls.forEach((el) => {
          el.textContent = cartCount;
        });
        console.debug("components.js: updated cart counter ->", cartCount);
      } else {
        console.debug("components.js: no .count-product elements found yet");
      }
    }

    // ========== إظهار/إخفاء اللينكات ==========
    function toggleAuthLinks() {
      const signUpLink = document.getElementById("signupLink");
      const userIcon = document.getElementById("userIcon");
      const userDropdown = userIcon ? userIcon.parentElement : null; // div.dropdown

      const currentUserRaw = localStorage.getItem("currentUser");
      const isLoggedIn = !!currentUserRaw;

      if (isLoggedIn) {
        if (signUpLink) signUpLink.style.display = "none";
        if (userDropdown) userDropdown.style.display = "block";
        console.debug(
          "components.js: user IS logged in -> showing dropdown, hiding signup"
        );
      } else {
        if (signUpLink) signUpLink.style.display = "block";
        if (userDropdown) userDropdown.style.display = "none";
        console.debug(
          "components.js: user NOT logged in -> hiding dropdown, showing signup"
        );
      }
    }

    // ========== ensureElements fallback (polling) ==========
    let ensureInterval = null;
    function ensureElements(timeoutMs = 8000) {
      if (ensureInterval) return; // already running
      const start = Date.now();

      ensureInterval = setInterval(() => {
        const found =
          document.getElementById("signupLink") ||
          document.querySelector(".count-favourite") ||
          document.querySelector(".count-product") ||
          document.getElementById("userIcon");

        if (found) {
          console.debug(
            "components.js: ensureElements -> elements found, updating UI"
          );
          try {
            toggleAuthLinks();
            updateCounters();
          } catch (err) {
            console.warn(
              "components.js: error updating after ensureElements",
              err
            );
          }
          clearInterval(ensureInterval);
          ensureInterval = null;
        } else if (Date.now() - start > timeoutMs) {
          // بعد مهلة قصيرة نبطل البولينج عشان مايسبمش موارد
          console.debug(
            "components.js: ensureElements -> timeout, stopping polling"
          );
          clearInterval(ensureInterval);
          ensureInterval = null;
        } else {
          // لا لوج هنا عشان مايزعج
        }
      }, 250);
    }

    // ========== MutationObserver لمراقبة إضافة الـnavbar ديناميك ==========
    const observer = new MutationObserver((mutations) => {
      // مجرد أي تغيير نستدعي ensureElements
      ensureElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ========== تشغيل مبدئي عند التحميل ==========
    document.addEventListener("DOMContentLoaded", () => {
      console.debug(
        "components.js: DOMContentLoaded -> running initial checks"
      );
      toggleAuthLinks();
      updateCounters();
      ensureElements();
    });

    // ========== Storage event (يتحرّك بين التابات) ==========
    window.addEventListener("storage", (e) => {
      if (
        !e.key ||
        e.key === "cart" ||
        e.key === "wishlist" ||
        e.key === "currentUser"
      ) {
        console.debug("components.js: storage event for key", e.key);
        toggleAuthLinks();
        updateCounters();
      }
    });

    // كشف الأخطاء البسيطة
    window.updateCounters = updateCounters;
    window.toggleAuthLinks = toggleAuthLinks;
    window.__components_debug = true;
  })();
}

async function loadDataIntoLocalStorage() {
  try {
    // Only load if not already in localStorage
    if (!localStorage.getItem("products") || !localStorage.getItem("users")) {
      const productsRes = await fetch("../json/products.json");
      const products = await productsRes.json();
      localStorage.setItem("products", JSON.stringify(products));

      const usersRes = await fetch("../json/users.json");
      const users = await usersRes.json();
      localStorage.setItem("users", JSON.stringify(users));

      console.log("✅ Products and Users loaded into localStorage!");
    } else {
      console.log("ℹ️ Data already exists in localStorage, skipping load.");
    }
  } catch (err) {
    console.error("❌ Error loading data into localStorage:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadDataIntoLocalStorage);
