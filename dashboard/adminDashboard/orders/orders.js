
let orders = JSON.parse(localStorage.getItem("orders")) || [];
const tbody = document.getElementById("ordersTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");

function renderOrders(list) {
  tbody.innerHTML = ""; // مسح المحتوى القديم أولاً
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">No Orders Found</td></tr>`;
    return;
  }

function getUserNameById(userId) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find(u => u.id === userId);
  return user ? user.name : "Unknown User";
}


  list.forEach(order => {
    // تجاهل أي order مفيهوش منتجات
    if (!order.items || order.items.length === 0) return;

    // المنتجات مع الكمية لكل منتج
    const itemsText = order.items.map(item => `${item.name || "No product"} (x${item.quantity || 0})`).join(", ");
    // المجموع الكلي للكمية لكل الطلب
    const totalQuantity = order.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    // السعر الإجمالي
    const totalPrice = order.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

    let statusClass = "";
    switch (order.status) {
      case "Pending": statusClass = "bg-secondary"; break;
      case "Processing": statusClass = "bg-primary"; break;
      case "Delivered": statusClass = "bg-success"; break;
      case "Cancelled": statusClass = "bg-danger"; break;
    }

    tbody.innerHTML += `
        <tr data-id="${order.id}">
            <td>${getUserNameById(order.customer?.id)}</td>
            <td>${itemsText}</td>
            <td>${totalQuantity}</td>
            <td>${totalPrice} ${order.items[0]?.currency || "EGP"}</td>
            <td>${order.paymentMethod || "cash"}</td>
            <td>${order.date || ""}</td>
            <td>
                <div class="status-cell badge ${statusClass} rounded-2 text-center p-1 text-white" 
                     style="width: fit-content; min-width: 80px;" 
                     contenteditable="false" 
                     onblur="updateStatus(${order.id}, this.innerText)">
                     ${order.status || ""}
                </div>
            </td>
            <td>
                  <button class="btn btn-sm btn-outline-warning edit" onclick="enableEditStatus(${order.id})">
             <i class="fa-solid fa-pen-to-square me-1"></i>
            </button>     
            <button class="btn btn-sm btn-outline-danger delete" onclick="deleteOrder(${order.id})">
              <i class="fa-solid fa-trash me-1"></i>
            </button>
            </td>
        </tr>
        `;
  });
}

function deleteOrder(orderId) {
  if (!confirm("Are you sure to delete this order?")) return;

  // دور على الـ order
  orders = orders.filter(o => o.id !== orderId); // حذف الـ order بالكامل
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders(orders);
}


function enableEditStatus(id) {
  const td = document.querySelector(`tr[data-id="${id}"] .status-cell`);
  if (!td) return;

  const order = orders.find(o => o.id === id);
  if (!order) return;

  // إنشاء select بدل contentEditable
  const select = document.createElement("select");
  select.className = "form-select form-select-sm";

  ["Pending", "Processing", "Delivered", "Cancelled"].forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    if (status === order.status) option.selected = true;
    select.appendChild(option);
  });

  // زر حفظ للتأكيد
  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-sm btn-success ms-1";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    updateStatus(id, select.value);
  });

  // مسح محتوى td وإضافة select + save button
  td.innerHTML = "";
  td.appendChild(select);
  td.appendChild(saveBtn);
  select.focus();
}



function updateStatus(id, newStatus) {
  let order = orders.find(o => o.id === id);
  if (!order) return;

  order.status = newStatus.trim();
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders(orders);
}





// Filters
// Filters
function applyFilters() {
  let searchVal = searchInput.value.toLowerCase().trim();
  let statusVal = statusFilter.value;
  let priceVal = parseInt(priceFilter.value) || 0;

  let filtered = orders.filter(order => {
    if (!order.items || order.items.length === 0) return false;

    // البحث
    let matchSearch =
      order.id.toString().includes(searchVal) ||
      (order.customer?.name || "").toLowerCase().includes(searchVal);

    // الحالة
    let matchStatus = statusVal ? order.status === statusVal : true;

    // إجمالي السعر
    const total = order.items.reduce((sum, it) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 0;
      return sum + price * qty;
    }, 0);
    let matchPrice = total >= priceVal;

    return matchSearch && matchStatus && matchPrice;
  });

  renderOrders(filtered);
}

// تحديث السعر المعروض مع السلايدر
searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("input", () => {
  priceValue.textContent = `${priceFilter.value}+ EGP`;
  applyFilters();
});

renderOrders(orders);
// Active menu management
function setActiveMenuItem(clickedElement) {
  document.querySelectorAll('.sidebar ul li').forEach(li => {
    li.classList.remove('active');
  });
  clickedElement.parentElement.classList.add('active');
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}


const logout = document.getElementById("logOut")
logout.addEventListener("click", function () {
  const confirmLogout = confirm("Are you sure you want to log out?");

  if (confirmLogout) {
    localStorage.removeItem("currentUser");
    alert("You have been logged out successfully.");
    window.location.href = "../../../sign/login/login.html";
  }
});
