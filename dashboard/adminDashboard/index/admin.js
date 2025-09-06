// ====================== AUTH CHECK ======================
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.href = "../../../sign/login/login.html";
    return;
  }

  if (currentUser.role) {
    const role = currentUser.role.toLowerCase();

    if (role === "admin") {
      console.log("Welcome Admin");
    } else if (role === "customer") {
      window.location.href = "../../../index.html";
    } else if (role === "seller") {
      window.location.href = "../../sellerDashboard/index/index.html";
    } else {
      window.location.href = "../../../sign/login/login.html";
    }
  } else {
    window.location.href = "../../../sign/login/login.html";
  }
});

// ====================== DATA MANAGER ======================
class DashboardDataManager {
  constructor() {
    this.charts = {};
    this.init();
  }

  init() {
    this.initializeCharts();
    this.loadDashboardData();
    setInterval(() => { this.loadDashboardData(); }, 30000);
  }

  loadDashboardData() {
    try {
      const usersData = JSON.parse(localStorage.getItem('users') || '[]');
      const productsData = JSON.parse(localStorage.getItem('products') || '{}');
      const ordersData = JSON.parse(localStorage.getItem('orders') || '[]');

      const users = Array.isArray(usersData) ? usersData : Object.values(usersData);
      const products = Array.isArray(productsData) ? productsData : Object.values(productsData);
      const orders = Array.isArray(ordersData) ? ordersData : Object.values(ordersData);

      const userCounts = this.countUsersByRole(users);
      const counts = {
        users: users.length,
        sellers: userCounts.sellers,
        customers: userCounts.customers,
        products: products.length,
        orders: orders.length
      };

      // 🔹 Generate dynamic chart data
      const chartData = this.generateChartData(counts, userCounts, products, orders, users);
      this.updateDisplay(counts, chartData);
      this.hideNoDataMessage();

    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      this.showError();
    }
  }

  countUsersByRole(users) {
    let customers = 0, sellers = 0, others = 0;
    users.forEach(user => {
      if (user?.role) {
        if (user.role.toLowerCase() === 'customer') customers++;
        else if (user.role.toLowerCase() === 'seller') sellers++;
        else others++;
      } else customers++;
    });
    return { customers, sellers, others };
  }

  generateChartData(data, userCounts, products, orders, users) {
    const { users: totalUsers = 0 } = data;
    if (totalUsers === 0) {
      return {
        ordersByStatus: [{ status: 'No Data', count: 1 }],
        topOrders: [{ name: 'No Data', revenue: 0 }],
        monthlyOrders: [{ month: 'Current', sales: 0 }]
      };
    }

    // 🔹 Role distribution
    const roleDistribution = [];
    if (userCounts.customers > 0) roleDistribution.push({ status: 'Customer', count: userCounts.customers });
    if (userCounts.sellers > 0) roleDistribution.push({ status: 'Seller', count: userCounts.sellers });
    if (userCounts.others > 0) roleDistribution.push({ status: 'Other', count: userCounts.others });
    if (roleDistribution.length === 0) roleDistribution.push({ status: 'Users', count: totalUsers });

    // 🔹 Monthly sales
    const monthlySalesMap = {};
    orders.forEach(order => {
      const orderDate = new Date(order.date || Date.now());
      const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
      if (!monthlySalesMap[monthKey]) monthlySalesMap[monthKey] = 0;

      order.items?.forEach(item => {
        if (item?.price) {
          monthlySalesMap[monthKey] += parseFloat(item.price) * (item.quantity || 1);
        }
      });
    });

    const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyOrders = Object.entries(monthlySalesMap)
      .sort(([a],[b]) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
      .map(([month, sales]) => ({ month, sales: Math.round(sales) }));

    // 🔹 Revenue per product (instead of per order)
    const productRevenueMap = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productRevenueMap[item.name]) productRevenueMap[item.name] = 0;
        productRevenueMap[item.name] += (parseFloat(item.price) || 0) * (item.quantity || 1);
      });
    });

    // Convert map → array of { name, revenue }
    const productRevenues = Object.entries(productRevenueMap).map(([name, revenue]) => ({
      name,
      revenue
    }));

    // Pick top 4 products
    const topOrders = productRevenues
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    return { ordersByStatus: roleDistribution, topOrders, monthlyOrders };
  }

  // ================= UI Helpers =================
  showNoDataMessage() {
    const existingMessage = document.querySelector('.no-data-message');
    if (!existingMessage) {
      const message = document.createElement('div');
      message.className = 'no-data-message';
      message.innerHTML = `<h5>📊 No Data Available</h5>`;
      const container = document.querySelector('.container');
      const cardsRow = document.querySelector('.row.text-center.mb-4');
      container.insertBefore(message, cardsRow);
    }
  }

  hideNoDataMessage() {
    const message = document.querySelector('.no-data-message');
    if (message) message.remove();
  }

  updateDisplay(counts, chartData) {
    this.animateCounter('userCount', counts.users || 0);
    this.animateCounter('sellerCount', counts.sellers || 0);
    this.animateCounter('orderCount', counts.orders || 0);
    this.animateCounter('productCount', counts.products || 0);
    this.updateCharts(chartData);
  }

  resetDisplay() {
    document.getElementById('userCount').textContent = '0';
    document.getElementById('sellerCount').textContent = '0';
    document.getElementById('orderCount').textContent = '0';
    document.getElementById('productCount').textContent = '0';
  }

  showError() {
    document.getElementById('userCount').innerHTML = '<span style="color:#ff6b6b; font-size:0.8em;">Error</span>';
    document.getElementById('sellerCount').textContent = '0';
    document.getElementById('orderCount').textContent = '0';
    document.getElementById('productCount').textContent = '0';
  }

  animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const startValue = parseInt(element.textContent) || 0;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * (targetValue - startValue) + startValue);
      element.textContent = currentValue.toLocaleString();
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  initializeCharts() {
    this.charts.pieChart = new Chart(document.getElementById('pieChart'), {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: ['#b07d62', '#414833', '#deab90', '#a4ac86'] }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    this.charts.barChart = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Total Price (EGP)', data: [], backgroundColor: ['#6f1d1b', '#bb9457', '#432818', '#ffe6a7'] }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    this.charts.lineChart = new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Monthly Sales (EGP)', data: [], borderColor: '#bb9457', backgroundColor: 'rgba(187, 148, 87, 0.1)', tension: 0.4, fill: true }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }

  updateCharts(chartData) {
    if (!chartData) return;

    this.charts.pieChart.data.labels = chartData.ordersByStatus.map(item => item.status);
    this.charts.pieChart.data.datasets[0].data = chartData.ordersByStatus.map(item => item.count);
    this.charts.pieChart.update();

    // 🔹 Top Products chart (each product is its own column)
    this.charts.barChart.data.labels = chartData.topOrders.map(item => item.name);
    this.charts.barChart.data.datasets[0].data = chartData.topOrders.map(item => item.revenue);
    this.charts.barChart.update();

    this.charts.lineChart.data.labels = chartData.monthlyOrders.map(item => item.month);
    this.charts.lineChart.data.datasets[0].data = chartData.monthlyOrders.map(item => item.sales);
    this.charts.lineChart.update();
  }
}

// ====================== INIT ======================
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new DashboardDataManager();
});

// ====================== MENU / LOGOUT ======================
function setActiveMenuItem(clickedElement) {
  document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
  clickedElement.parentElement.classList.add('active');
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

const logout = document.getElementById("logOut");
if (logout) logout.addEventListener("click", function () {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "../../../sign/login/login.html";
  }
});
