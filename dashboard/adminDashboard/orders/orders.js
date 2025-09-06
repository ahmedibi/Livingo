
let orders = JSON.parse(localStorage.getItem("orders")) || [];
const tbody = document.getElementById("ordersTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");


function getUserNameById(userId) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find(u => u.id === userId);
  return user ? user.name : "Unknown User";
}

function renderOrders(list) {
  tbody.innerHTML = ""; 
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
    
    if (!order.items || order.items.length === 0) return;

    
    const itemsText = order.items.map(item => `${item.name || "No product"} (x${item.quantity || 0})`).join(", ");
    
    const totalQuantity = order.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    
    const totalPrice = order.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

    let statusClass = "";
    switch (order.status) {
      case "Pending": statusClass = "bg-secondary"; break;
      case "Processing": statusClass = "bg-primary"; break;
      case "Delivered": statusClass = "bg-success"; break;
      case "Cancelled": statusClass = "bg-danger"; break;
    }

    tbody.innerHTML += `
        <tr data-id="${order.id}" style="vertical-align:middle;">
            <td >${order.id}</td>
            <td >${getUserNameById(order.customer?.id)}</td>
            <td class="small">${itemsText}</td>
            <td class="small" style="text-align:center;">${totalQuantity}</td>
            <td class="small" style="text-align:center;">${totalPrice} ${order.items[0]?.currency || "EGP"}</td>
            <td class="small" style="text-align:center;">${order.paymentMethod || "cash"}</td>
            <td class="small">${order.date || ""}</td>
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

  let order = orders.find(o => o.id === orderId);
  if (!order) return;

  let products = JSON.parse(localStorage.getItem("products")) || [];

  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      products = products.map(prod => {
        if (prod.id === item.id) {
          return {
            ...prod,
            stock: (prod.stock || 0) + (item.quantity || 0)
          };
        }
        return prod;
      });
    });
  }

  localStorage.setItem("products", JSON.stringify(products));

  orders = orders.filter(o => o.id !== orderId); 
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders(orders);
}


function enableEditStatus(id) {
  const td = document.querySelector(`tr[data-id="${id}"] .status-cell`);
  if (!td) return;

  const order = orders.find(o => o.id === id);
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

  
  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-sm btn-success ms-1";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    updateStatus(id, select.value);
  });

  
  td.innerHTML = "";
  td.appendChild(select);
  td.appendChild(saveBtn);
  select.focus();
}

function recalcOrderStatus(order) {
  if (!order.items || order.items.length === 0) return "Pending";

  const statuses = order.items.map(it => it.status);

  if (statuses.every(s => s === "Delivered")) return "Delivered";
  if (statuses.every(s => s === "Cancelled")) return "Cancelled";
  if (statuses.includes("Processing")) return "Processing";
  return "Pending";
}


function updateStatus(id, newStatus) {
  let order = orders.find(o => o.id === id);
  if (!order) return;

 
  order.status = newStatus.trim();


  if (order.items && order.items.length > 0) {
    order.items = order.items.map(it => ({
      ...it,
      status: newStatus.trim()
    }));
  }

  order.status = recalcOrderStatus(order);

  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders(orders);
}







function applyFilters() {
  let searchVal = searchInput.value.toLowerCase().trim();
  let statusVal = statusFilter.value;
  let priceVal = parseInt(priceFilter.value) || 0;

  let filtered = orders.filter(order => {
    if (!order.items || order.items.length === 0) return false;

    
     let matchSearch =
      order.id.toString().includes(searchVal) ||
      (getUserNameById(order.customer?.id) || "").toLowerCase().includes(searchVal) ||
      order.items.some(item =>
        (item.name || "").toLowerCase().includes(searchVal)
      );

    
    let matchStatus = statusVal ? order.status === statusVal : true;

    
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


searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("input", () => {
  priceValue.textContent = `${priceFilter.value}+ EGP`;
  applyFilters();
});

renderOrders(orders);

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


document.addEventListener("DOMContentLoaded",function(){
  const currentUser= JSON.parse(localStorage.getItem("currentUser"));
   if(!currentUser){
    window.location.href="../../../sign/login/login.html"
   }

   if(currentUser.role){
     const role = currentUser.role.toLowerCase();
     if(role=="admin"){
      console.log("welcom admin")
     } else if (role=="customer"){
      window.location.href="../../../index.html"
     } else if (role=="seller"){
      window.location.href="../../sellerDashboard/index/index.html"
     } else{
      window.location.href="../../../sign/login/login.html"
     }
   } else{
    window.location.href="../../../sign/login/login.html"
   }
})



