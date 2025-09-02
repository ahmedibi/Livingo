document.addEventListener("DOMContentLoaded", () => {
  // Load sidebar


  const sellersTable = document.getElementById("sellersTable");
  const searchInput = document.getElementById("searchInput");

  // إنشاء بيانات تجريبية إذا لم تكن موجودة
  function initializeSampleData() {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem("users")) || [];
    } catch (e) {
      users = [];
    }

    // إذا لم توجد بيانات، أنشئ بيانات تجريبية
    if (users.length === 0) {

      alert("there is no sellers")
    }

    return users;
  }

  
  let users = initializeSampleData();

  // فلترة sellers فقط
  let sellers = users.filter(u => u.role === "seller");

  function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
  }

  function renderSellers(list) {
    sellersTable.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
      sellersTable.innerHTML = `
        <tr>
          <td colspan="5" class="text-center p-4" style="color: #666;">
            <i class="fa-solid fa-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
            <div> no sellers found</div>
          </td>
        </tr>`;
      return;
    }

    list.forEach(({ id, name, email, password, storeName }) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 500;">${name || ""}</td>
        <td>${email || " ]"}</td>
        <td style="color: #999;">${"*".repeat(Math.min(password?.length || 3, 8))}</td>
        <td style="color: #a0804d; font-weight: 500;">${storeName || " "}</td>
        <td>
        
            <button class="action-btn1 btn btn-sm edit-btn" data-id="${id}" title="تعديل">
              <i class="fa-solid fa-pen-to-square m-1"></i>
            </button>
        
          <button class="action-btn2 btn btn-sm delete-btn" data-id="${id}" title="حذف">
            <i class="fa-solid fa-trash m-1"></i>
          </button>
        </td>
      `;
      sellersTable.appendChild(tr);
    });

    attachEventListeners();
  }

  function attachEventListeners() {
    // أزرار الحذف
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const seller = sellers.find((s) => s.id === id);

        if (!seller) {
          alert(" no seller found");
          return;
        }

        if (confirm(`are you sure you want to delete "${seller.name}"`)) {
          // حذف من جميع المستخدمين
          users = users.filter((u) => u.id !== id);
          // تحديث قائمة البائعين
          sellers = users.filter((u) => u.role === "seller");
          saveUsers();
          renderSellers(sellers);

          
          showToast(` "${seller.name}" deleted successfully`, "success");
        }
      });
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;

        // خزّن الـ id في localStorage عشان نجيبه في صفحة التعديل
        localStorage.setItem("editingUserId", id);

        // وجّه لصفحة التعديل
        window.location.href = "selleredit.html";
      });
    });
  }

  
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query === "") {
      renderSellers(sellers);
      return;
    }

    const filtered = sellers.filter(({ name, email, storeName }) => {
      const searchFields = [
        name || "",
        email || "",
        storeName || ""
      ].map(field => field.toLowerCase());

      return searchFields.some(field => field.includes(query));
    });

    renderSellers(filtered);
  });

  // وظيفة لإظهار رسائل التوست
  function showToast(message, type = "info") {
    
    const toast = document.createElement("div");
    toast.className = `toast-message toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === "success" ? "#A0804D" : "#17a2b8"};
      color: white;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-weight: 500;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    // إظهار التوست
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 100);

    // إخفاء التوست بعد 3 ثواني
    setTimeout(() => {
      toast.style.transform = "translateX(400px)";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // تحديث العداد في الصفحة
  function updateStats() {
    const statsElement = document.querySelector(".stats-count");
    if (statsElement) {
      statsElement.textContent = sellers.length;
    }
  }

  // الرندر الأولي
  console.log("عدد البائعين الموجودين:", sellers.length);
  renderSellers(sellers);
  updateStats();

  
  const headerSection = document.querySelector(".header-section");
  if (headerSection) {
    const statsDiv = document.createElement("div");
    statsDiv.innerHTML = `
      <div class="fromjs" style="background: white; padding: 15px 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1) ; margin-bottom: 20px; display: flex;  ">
        <p style="color: #666;"> Total Sellers : </p>
        <p class="stats-count" style="color: #a0804d; font-weight: bold; font-size: 1.2em; margin-left:5px">${sellers.length}</p>
      </div>
    `;
    headerSection.appendChild(statsDiv);
  }
});


function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}


const logout = document.getElementById("logOut")
logout.addEventListener("click", function () {
  const confirmLogout = confirm("Are you sure you want to log out?");

  if (confirmLogout) {
    localStorage.removeItem("currentUser");
    window.location.href = "../../../sign/login/login.html";
  }
});