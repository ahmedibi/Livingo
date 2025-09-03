
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

  
  const itemsList = sellerItems.map(item => 
    `${item.name} (x${item.quantity || 1})`
  ).join("<br>");

  const totalQuantity = sellerItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const total = sellerItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  let statusClass = "";
  switch (order.status) {
    case "Pending": statusClass = "bg-secondary"; break;
    case "Delivered": statusClass = "bg-success"; break;
    case "Processing": statusClass = "bg-primary"; break;
    case "Cancelled": statusClass = "bg-danger"; break;
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
      <td class="status-cell"><span class="badge ${statusClass}">${order.status}</span></td>
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

function enableEditStatus(orderId) {
  const td = document.querySelector(`tr[data-id="${orderId}"] .status-cell`);
  if (!td) return;

  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const select = document.createElement("select");
  select.className = "form-select form-select-sm";
  ["Pending", "Processing", "Delivered", "Cancelled"].forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    if (status === order.status) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    updateStatus(orderId, this.value);
  });

  select.addEventListener("blur", function () {
    renderOrders();
  });

  td.innerHTML = "";
  td.appendChild(select);
  select.focus();
}

function updateStatus(id, newStatus) {
  let order = orders.find(o => o.id === id);
  if (!order) return;
  order.status = newStatus.trim();
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders();
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


