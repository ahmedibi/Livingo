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


    // Dashboard Data Manager
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
      // Load dashboard data from localStorage
      loadDashboardData() {
        try {
          const usersData = localStorage.getItem('users');
          const productsData = localStorage.getItem('products');
          const ordersData = localStorage.getItem('orders');
          if (usersData || productsData || ordersData) {
            const users = usersData ? JSON.parse(usersData) : [];
            const products = productsData ? JSON.parse(productsData) : [];
            const orders = ordersData ? JSON.parse(ordersData) : [];

            // Count users by role
            const userCounts = this.countUsersByRole(users);
            const userCount = Array.isArray(users) ? users.length : (typeof users === 'object' ? Object.keys(users).length : 1);
            const productCount = Array.isArray(products) ? products.length : (typeof products === 'object' ? Object.keys(products).length : 1);
            const orderCount = Array.isArray(orders) ? orders.length : (typeof orders === 'object' ? object.keys(orders).length : 1);
            const counts = {
              users: userCount,
              sellers: userCounts.sellers,
              customers: userCounts.customers,
              orders: 0,
              products: productCount,
              orders: orderCount,
            };

            const chartData = this.generateChartData(counts, userCounts);
            this.updateDisplay(counts, chartData);
            this.hideNoDataMessage();

            console.log(`Found ${userCount} users (${userCounts.customers} customers, ${userCounts.sellers} sellers) and ${productCount} products in localStorage`);
          } else {
            this.showNoDataMessage();
            this.resetDisplay();
          }

        } catch (error) {
          console.error('Error loading data from localStorage:', error);
          this.showError();
        }
      }

      // Count users by role
      countUsersByRole(users) {
        let customers = 0;
        let sellers = 0;
        let others = 0;

        if (Array.isArray(users)) {
          users.forEach(user => {
            if (user && user.role) {
              if (user.role.toLowerCase() === 'customer') {
                customers++;
              } else if (user.role.toLowerCase() === 'seller') {
                sellers++;
              } else {
                others++;
              }
            } else {
              // If no role specified, assume customer
              customers++;
            }
          });
        } else if (typeof users === 'object' && users !== null) {
          // If users is an object with user IDs as keys
          Object.values(users).forEach(user => {
            if (user && user.role) {
              if (user.role.toLowerCase() === 'customer') {
                customers++;
              } else if (user.role.toLowerCase() === 'seller') {
                sellers++;
              } else {
                others++;
              }
            } else {
              customers++;
            }
          });
        }

        return { customers, sellers, others };
      }

      // Generate chart data
      generateChartData(data, userCounts) {
        const { users = 0 } = data;
        if (users === 0) {
          return {
            ordersByStatus: [{ status: 'No Data', count: 1 }],
            topProducts: [{ name: 'No Data', orders: 0 }],
            monthlyOrders: [{ month: 'Current', count: 0 }]
          };
        }

        // Create role distribution based on actual data
        const roleDistribution = [];
        if (userCounts.customers > 0) {
          roleDistribution.push({ status: 'Customer', count: userCounts.customers });
        }
        if (userCounts.sellers > 0) {
          roleDistribution.push({ status: 'Seller', count: userCounts.sellers });
        }
        if (userCounts.others > 0) {
          roleDistribution.push({ status: 'Other', count: userCounts.others });
        }

        // If no roles found, show total users
        if (roleDistribution.length === 0) {
          roleDistribution.push({ status: 'Users', count: users });
        }

        return {
          ordersByStatus: roleDistribution,
          topProducts: [
            { name: 'Soft Beige L-Shaped Sofa', orders: Math.floor(users * 0.35) || 1 },
            { name: 'Square Wooden Table', orders: Math.floor(users * 0.25) || 1 },
            { name: 'Elegant Light Wood TV Unit', orders: Math.floor(users * 0.20) || 1 },
            { name: 'Modern Wooden Bed', orders: Math.floor(users * 0.20) || 1 }
          ],
          monthlyOrders: [
            { month: 'January', count: Math.floor(users * 0.15) || 0 },
            { month: 'February', count: Math.floor(users * 0.18) || 0 },
            { month: 'March', count: Math.floor(users * 0.22) || 0 },
            { month: 'April', count: Math.floor(users * 0.20) || 0 },
            { month: 'May', count: Math.floor(users * 0.12) || 0 },
            { month: 'June', count: Math.floor(users * 0.13) || 0 }
          ]
        };
      }

      // Show message when no data
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

      // Update counts
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

      // Charts setup
      initializeCharts() {
        this.charts.pieChart = new Chart(document.getElementById('pieChart'), {
          type: 'doughnut',
          data: { labels: [], datasets: [{ data: [], backgroundColor: ['#b07d62', '#414833', '#deab90', '#a4ac86'] }] },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });

        this.charts.barChart = new Chart(document.getElementById('barChart'), {
          type: 'bar',
          data: { labels: [], datasets: [{ label: 'Count', data: [], backgroundColor: ['#6f1d1b', '#bb9457', '#432818', '#ffe6a7'] }] },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });

        this.charts.lineChart = new Chart(document.getElementById('lineChart'), {
          type: 'line',
          data: { labels: [], datasets: [{ label: 'Monthly Users', data: [], borderColor: '#bb9457', backgroundColor: 'rgba(187, 148, 87, 0.1)', tension: 0.4, fill: true }] },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }

      updateCharts(chartData) {
        if (!chartData) return;
        this.charts.pieChart.data.labels = chartData.ordersByStatus.map(item => item.status);
        this.charts.pieChart.data.datasets[0].data = chartData.ordersByStatus.map(item => item.count);
        this.charts.pieChart.update();

        this.charts.barChart.data.labels = chartData.topProducts.map(item => item.name);
        this.charts.barChart.data.datasets[0].data = chartData.topProducts.map(item => item.orders);
        this.charts.barChart.update();

        this.charts.lineChart.data.labels = chartData.monthlyOrders.map(item => item.month);
        this.charts.lineChart.data.datasets[0].data = chartData.monthlyOrders.map(item => item.count);
        this.charts.lineChart.update();
      }
    }

    // Global
    let dashboard;
    document.addEventListener('DOMContentLoaded', () => {
      dashboard = new DashboardDataManager();
    });


