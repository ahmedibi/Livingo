// Get current user from localStorage (assuming it's stored when user logs in)
function getCurrentUser() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        console.log('Current user:', currentUser);
        return currentUser;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Handle window resize
window.addEventListener('resize', function () {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('Content');
    const overlay = document.getElementById('overlay');
});

// Load seller data for the current authenticated user only
function loadSellerData() {
    try {
        console.log('Loading seller data for current user...');
        
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            console.log('No current user found or user ID missing');
            return null;
        }

        const usersData = JSON.parse(localStorage.getItem('users') || '{}');
        console.log('Raw users data:', usersData);

        let currentUserData = null;
        
        for (const [userKey, userData] of Object.entries(usersData)) {
            if (userKey === currentUser.id || 
                userData.id === currentUser.id || 
                userKey === currentUser.id.toString()) {
                currentUserData = userData;
                break;
            }
        }

        if (!currentUserData) {
            console.log('Current user not found in users data');
            return null;
        }

        if (!currentUserData.role || currentUserData.role.toLowerCase() !== 'seller') {
            console.log('Current user is not a seller:', currentUserData.role);
            return null;
        }

        console.log('Current user is a seller, calculating metrics...');
        const aggregatedData = calculateSellerMetrics([currentUserData]);
        return aggregatedData;

    } catch (error) {
        console.error('Error loading seller data from localStorage:', error);
        return null;
    }
}

// Enhanced function to calculate metrics from seller data with proper product details
function calculateSellerMetrics(sellers) {
    let totalRevenue = 0;
    let totalUnitsSold = 0;
    let monthlySalesMap = {};
    let productSalesMap = {};

    const productsData = loadProductsData();
    const ordersData = loadOrdersData();

    sellers.forEach((seller) => {
        const sellerProducts = seller.products || [];

        const sellerOrders = ordersData.filter(order =>
            order.sellerId === seller.id || 
            order.seller_id === seller.id ||
            order.userId === seller.id || 
            order.user_id === seller.id ||
            order.items.some(item => sellerProducts.includes(item.id))
        );

        sellerOrders.forEach(order => {
            order.items.forEach(item => {
                const product = findProductById(item.id, productsData);

                if (product && product.price) {
                    const orderValue = parseFloat(product.price);
                    totalRevenue += orderValue;
                    totalUnitsSold += 1;

                    const productName = product.name || product.title || `Product ${item.id}`;
                    if (!productSalesMap[productName]) {
                        productSalesMap[productName] = { total: 0, units: 0, price: product.price, details: product };
                    }
                    productSalesMap[productName].total += orderValue;
                    productSalesMap[productName].units += 1;

                    const orderDate = new Date(order.date || order.created_at || Date.now());
                    const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
                    if (!monthlySalesMap[monthKey]) monthlySalesMap[monthKey] = 0;
                    monthlySalesMap[monthKey] += orderValue;
                }
            });
        });
    });

    const avgOrderValue = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0;

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales = Object.entries(monthlySalesMap)
        .sort(([a], [b]) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
        .map(([month, sales]) => ({ month, sales: Math.round(sales) }));

    const topProducts = Object.entries(productSalesMap).map(([name, data]) => ({
        name,
        value: data.units,
        revenue: data.total,
        units: data.units,
        color: generateProductColor(name)
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

    return {
        totalRevenue: Math.round(totalRevenue),
        revenueGrowth: calculateGrowth('revenue', totalRevenue),
        unitsSold: totalUnitsSold,
        unitsGrowth: calculateGrowth('units', totalUnitsSold),
        avgOrderValue: Math.round(avgOrderValue),
        avgOrderGrowth: calculateGrowth('avgOrder', avgOrderValue),
        monthlySales,
        topProducts
    };
}

// Helper function to find product by ID
function findProductById(productId, productsData) {
    if (!productId || !productsData) return null;
    if (productsData[productId]) return productsData[productId];
    
    for (const [key, productData] of Object.entries(productsData)) {
        if (key === productId || productData.id === productId) {
            return productData;
        }
    }
    return null;
}

function calculateGrowth(type, currentValue) {
    const previousData = getPreviousPeriodData(type);
    if (previousData && previousData > 0) {
        return ((currentValue - previousData) / previousData) * 100;
    }
    return 0;
}

function getPreviousPeriodData(type) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return null;
        
        const historicalData = JSON.parse(localStorage.getItem('historicalMetrics') || '{}');
        const userHistorical = historicalData[currentUser.id];
        
        if (!userHistorical) return null;
        
        const dates = Object.keys(userHistorical).sort().reverse();
        if (dates.length > 1) {
            const previousDate = dates[1];
            return userHistorical[previousDate][type] || null;
        }
        return null;
    } catch (error) {
        return null;
    }
}

function storeHistoricalMetrics(currentMetrics) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const historical = JSON.parse(localStorage.getItem('historicalMetrics') || '{}');
        const currentDate = new Date().toISOString().split('T')[0];
        
        if (!historical[currentUser.id]) {
            historical[currentUser.id] = {};
        }
        
        historical[currentUser.id][currentDate] = {
            revenue: currentMetrics.totalRevenue,
            units: currentMetrics.unitsSold,
            avgOrder: currentMetrics.avgOrderValue
        };
        
        localStorage.setItem('historicalMetrics', JSON.stringify(historical));
    } catch (error) {
        console.error('Error storing historical metrics:', error);
    }
}

function loadProductsData() {
    try {
        return JSON.parse(localStorage.getItem('products') || '{}');
    } catch (error) {
        return {};
    }
}

function loadOrdersData() {
    try {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    } catch (error) {
        return [];
    }
}

function setCurrentUser(userData) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
        console.error('Error setting current user:', error);
    }
}

function initializeDashboard() {
    console.log('=== INITIALIZING SELLER DASHBOARD ===');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('No authenticated user found');
        showLoginRequired();
        return;
    }
    
    const sellerData = loadSellerData();
    console.log('Seller data for current user:', sellerData);

    //  Default to zeros instead of message
    if (!sellerData) {
        const emptyData = {
            totalRevenue: 0,
            revenueGrowth: 0,
            unitsSold: 0,
            unitsGrowth: 0,
            avgOrderValue: 0,
            avgOrderGrowth: 0,
            monthlySales: [],
            topProducts: []
        };
        updateStatsCards(emptyData);
        createSalesChart(emptyData);
        createProductsChart(emptyData);
        return;
    }

    storeHistoricalMetrics(sellerData);
    updateStatsCards(sellerData);
    createSalesChart(sellerData);
    createProductsChart(sellerData);
}

function showLoginRequired() {
    const container = document.querySelector('.dashboard-container') || document.body;
    container.innerHTML = '<div style="text-align: center; margin-top: 50px;"><h2>Please log in to view your seller dashboard</h2></div>';
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function updateStatsCards(data) {
    document.getElementById('totalRevenue').innerHTML = `<span class="currency">EGP</span> ${formatNumber(data.totalRevenue)}`;
    document.getElementById('unitsSold').textContent = formatNumber(data.unitsSold);
    document.getElementById('avgOrderValue').innerHTML = `<span class="currency">EGP</span> ${data.avgOrderValue}`;

    updateGrowth('revenueGrowth', data.revenueGrowth);
    updateGrowth('unitsGrowth', data.unitsGrowth);
    updateGrowth('avgOrderGrowth', data.avgOrderGrowth);
}

function updateGrowth(elementId, growth) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `${Math.abs(growth)}%`;
        element.className = `stat-growth ${growth >= 0 ? 'positive' : 'negative'}`;
    }
}

function generateProductColor(productName) {
    const colors = ['#bb9457', '#6f1d1b', '#414833', '#b07d62', '#8b5a3c', '#4a5d23', '#9c6644', '#5d4037'];
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
        hash = ((hash << 5) - hash + productName.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
}

document.addEventListener('DOMContentLoaded', initializeDashboard);

function setActiveMenuItem(clickedElement) {
    document.querySelectorAll('.sidebar ul li').forEach(li => {
        li.classList.remove('active');
    });
    clickedElement.parentElement.classList.add('active');
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
}

const logout = document.getElementById("logOut");
logout.addEventListener("click", function () {
  const confirmLogout = confirm("Are you sure you want to log out?");

  if (confirmLogout) {
    localStorage.removeItem("currentUser");
    alert("You have been logged out successfully.");
    window.location.href = "../../../sign/login/login.html";
  }
});

// Monthly Sales Chart (Line)
function createSalesChart(data) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.monthlySales.map(m => m.month),
            datasets: [{
                label: 'Monthly Sales (EGP)',
                data: data.monthlySales.map(m => m.sales),
                borderColor: '#bb9457',
                backgroundColor: 'rgba(187, 148, 87, 0.2)',
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

// Top Products Chart (Doughnut)
function createProductsChart(data) {
    const ctx = document.getElementById('productsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                label: 'Top Products',
                data: data.topProducts.map(p => p.revenue),
                backgroundColor: data.topProducts.map(p => p.color),
                hoverOffset: 4
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    const legendContainer = document.getElementById('productsLegend');
    legendContainer.innerHTML = '';
    data.topProducts.forEach((p) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color:${p.color};"></div>
            <span>${p.name}</span>
        `;
        legendContainer.appendChild(item);
    });
}
