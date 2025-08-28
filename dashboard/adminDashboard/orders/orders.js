document.addEventListener("DOMContentLoaded", () => {
  fetch("../sidebar/sidebar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("sideBar").innerHTML = data; 
       const script = document.createElement("script");
      script.src = "../sidebar/sidebar.js";
      document.body.appendChild(script);  
    })
    .catch(err => console.error("Error loading sidebar:", err));
});


let orders = JSON.parse(localStorage.getItem("orders")) || [];
const tbody = document.getElementById("ordersTableBody");
 const searchInput = document.getElementById("searchInput");
 const statusFilter = document.getElementById("statusFilter");
 const priceFilter = document.getElementById("priceFilter");
 const priceValue = document.getElementById("priceValue");

 function renderOrders(list) {
     tbody.innerHTML = "";
     if (list.length === 0) {
         tbody.innerHTML = `<tr><td colspan="6" class="text-center">No Orders Found</td></tr>`;
         return;
     }

   list.forEach(order => {
    order.items.forEach(item => {

   let statusClass = "";
         switch (order.status) {
             case "Pending":
                 statusClass = "bg-secondary"; 
                 break;
             case "Delivered":
                 statusClass= "bg-success"     
         }

    tbody.innerHTML += `
        <tr data-id="${order.id}">
          <td>${order.customer?.name || "Unknown"}</td>
          <td>${item.name || "No product"}</td>
          <td>${item.quantity || 0}</td>
          <td>${(item.price * item.quantity) || 0} ${item.currency || "EGP"}</td>
          <td>${order.paymentMethod || "cash"}</td>
          <td>${order.date || ""}</td>
          <td> 
            <div 
              class="status-cell badge ${statusClass} rounded-2 text-center p-1 text-white" 
              style="width: fit-content; min-width: 80px;"
              contenteditable="false"
              onblur="updateStatus(${order.id}, this.innerText)">
              ${order.status || ""}
            </div>
          </td>         
          <td>
            <button class="btn btn-sm btn-outline-warning me-1" onclick="enableEditStatus(${order.id})">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
                </g>
              </svg>
            </button>     
            <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${order.id}, '${item.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="m9.4 16.5l2.6-2.6l2.6 2.6l1.4-1.4l-2.6-2.6L16 9.9l-1.4-1.4l-2.6 2.6l-2.6-2.6L8 9.9l2.6 2.6L8 15.1zM7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM7 6v13z"/>
              </svg>
            </button>     
          </td>
        </tr>
      `;
    });
  });
}

function enableEditStatus(id) {
  const row = document.querySelector(`tr[data-id="${id}"] .status-cell`);
  if (row) {
    row.contentEditable = "true";
    row.focus();
  }
}

 
function updateStatus(id, newStatus) {
    let order = orders.find(o => o.id === id);
    if (!order) return;

    order.status = newStatus.trim();
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders(orders);
}


 function deleteOrder(orderId,itemId) {
     if (confirm("Are you sure to delete this order?")) {
  // دور على الـ order
  let order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.items = order.items.filter(it => it.id !== itemId);
  if (order.items.length === 0) {
    orders = orders.filter(o => o.id !== orderId);
  }

  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders(orders);
  }
 }
 

 // Filters
 function applyFilters() {
     let searchVal = searchInput.value.toLowerCase();
     let statusVal = statusFilter.value;
     let priceVal = parseInt(priceFilter.value);

     let filtered = orders.filter(order => {
         
         let matchSearch = order.id.toString().includes(searchVal) || (order.customer?.name || "")
             .toLowerCase().includes(searchVal);
         let matchStatus = statusVal ? order.status === statusVal : true;
         
         const total = (order.items || []).reduce((sum, it) => {
           const price = Number(it.price) || 0;
           const qty   = Number(it.quantity) || 0;
           return sum + price * qty;
           }, 0);
         const matchPrice = total >= priceVal;

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
