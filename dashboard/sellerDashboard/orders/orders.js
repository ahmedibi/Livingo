
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

const container = document.getElementById("orderTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");
const sortSelect = document.getElementById("sortSelect");

function renderOrders(data = orders) {
  const seller = users.find(u => u.id === currentUser?.id && u.role === "seller");
  if (!currentUser || !seller || !seller.products) {
    container.innerHTML = `<tr><td colspan="7"> no orders found</td></tr>`;
    return;
  }

  let sellerProductIds = seller.products;
  let html = "";

  function getUserNameById(userId) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  }

  data.forEach(order => {
    const sellerItems = order.items.filter(item => sellerProductIds.includes(item.id));
    if (sellerItems.length === 0) return;

    // قائمة المنتجات
    const itemsList = sellerItems.map(item =>
      `${item.name} (x${item.quantity || 1})`
    ).join("<br>");

    const totalQuantity = sellerItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const total = sellerItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    // حساب حالة المنتجات الخاصة بالـ seller
    const uniqueStatuses = [...new Set(sellerItems.map(i => i.status || "Pending"))];
    let displayStatus = uniqueStatuses.length === 1 ? uniqueStatuses[0] : "Mixed";

    let statusClass = "";
    switch (displayStatus) {
      case "Pending": statusClass = "bg-secondary"; break;
      case "Delivered": statusClass = "bg-success"; break;
      case "Processing": statusClass = "bg-primary"; break;
      case "Cancelled": statusClass = "bg-danger"; break;
      case "Mixed": statusClass = "bg-warning"; break;
      default: statusClass = "bg-dark";
    }

    html += `
      <tr data-id="${order.id}" style="text-align:center;">
        <td>${order.id}</td>
        <td>${getUserNameById(order.customer?.id)}</td>
        <td>${itemsList}</td>
        <td>${totalQuantity}</td>
        <td>${total} ${sellerItems[0].currency}</td>
        <td>${order.date}</td>
        <td class="status-cell"><span class="badge ${statusClass}">${displayStatus}</span></td>
        <td>
          <div class="d-flex">
            <button class="btn btn-sm btn-outline-warning me-1 edit" onclick="enableEditStatus(${order.id})">
              <i class="fa-solid fa-pen-to-square m-1"></i>           
            </button>
            <button class="btn btn-sm btn-outline-danger delete" onclick="deleteOrder(${order.id}, '${sellerItems[0].id}')">
              <i class="fa-solid fa-trash m-1"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  container.innerHTML = html || `<tr><td colspan="7">no orders found</td></tr>`;
}

// تعديل حالة items بتاعة seller
function enableEditStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const seller = users.find(u => u.id === currentUser?.id && u.role === "seller");
  if (!seller) return;

  const sellerItems = order.items.filter(i => seller.products.includes(i.id));
  if (sellerItems.length === 0) return;

  const td = document.querySelector(`tr[data-id="${orderId}"] .status-cell`);
  if (!td) return;

  const select = document.createElement("select");
  select.className = "form-select form-select-sm";
  ["Pending", "Processing", "Delivered", "Cancelled"].forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    sellerItems.forEach(it => {
      updateItemStatus(orderId, it.id, this.value);
    });
  });

  select.addEventListener("blur", function () {
    renderOrders();
  });

  td.innerHTML = "";
  td.appendChild(select);
  select.focus();
}



function recalcOrderStatus(order) {
  if (!order.items || order.items.length === 0) {
    order.status = "Pending";
    return;
  }

  const uniqueStatuses = [...new Set(order.items.map(it => it.status))];

  if (uniqueStatuses.length === 1) {
    // كل الـ items ليها نفس الـ status
    order.status = uniqueStatuses[0];
  } else {
    // statuses مختلفة
    order.status = "Pending";
  }
}


function updateItemStatus(orderId, itemId, newStatus) {
  let order = orders.find(o => o.id === orderId);
  if (!order) return;

  let item = order.items.find(it => it.id === itemId);
  if (!item) return;

  item.status = newStatus.trim();

  // أعد حساب حالة الأوردر
  recalcOrderStatus(order);

  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders(); // أو renderOrders(filtered) حسب الكود عندك
}




function deleteOrder(orderId, itemId) {
  if (!confirm("Are you sure to delete this order?")) return;

  let order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.items = order.items.filter(it => it.id !== itemId);
  if (order.items.length === 0) {
    orders = orders.filter(o => o.id !== orderId);
  }

  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders();
}


function applyFilters() {
  let searchVal = searchInput.value.toLowerCase();
  let statusVal = statusFilter.value;
  let dateVal = dateFilter.value;
  let filtered = orders.filter(order => {
    let matchSearch = order.id.toString().includes(searchVal) || (order.customer?.name || "").toLowerCase().includes(searchVal);
    let matchStatus = statusVal ? order.status === statusVal : true;
    let matchDate = dateVal ? order.date === dateVal : true;
    return matchSearch && matchStatus && matchDate;
  });

  
  const sortVal = sortSelect.value;
  if (sortVal) {
    filtered.sort((a, b) => {
      if (sortVal === "date") return new Date(a.date) - new Date(b.date);
      if (sortVal === "total") {
        const totalA = a.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        const totalB = b.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        return totalA - totalB;
      }
      if (sortVal === "status") return a.status.localeCompare(b.status);
    });
  }

  renderOrders(filtered);
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
dateFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);


renderOrders();


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
    window.location.href = "../../../sign/login/login.html";
  }
});


