

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

        // Logout functionality
        


// Load seller data for the current authenticated user only
function loadSellerData() {
    try {
        console.log('Loading seller data for current user...');
        
        // Get current user
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            console.log('No current user found or user ID missing');
            return null;
        }

        // Get all users data
        const usersData = JSON.parse(localStorage.getItem('users') || '{}');
        console.log('Raw users data:', usersData);

        // Find the current user in users data by comparing IDs
        let currentUserData = null;
        
        // Check if current user ID matches any user key or user.id
        for (const [userKey, userData] of Object.entries(usersData)) {
            console.log(`Checking userKey: ${userKey}, userData.id: ${userData?.id}, currentUser.id: ${currentUser.id}`);
            
            // Compare current user ID with user key or user data ID
            if (userKey === currentUser.id || 
                userData.id === currentUser.id || 
                userKey === currentUser.id.toString()) {
                currentUserData = userData;
                console.log('Found matching user data:', currentUserData);
                break;
            }
        }

        if (!currentUserData) {
            console.log('Current user not found in users data');
            return null;
        }

        // Check if current user is a seller
        if (!currentUserData.role || currentUserData.role.toLowerCase() !== 'seller') {
            console.log('Current user is not a seller:', currentUserData.role);
            return null;
        }

        console.log('Current user is a seller, calculating metrics...');
        
        // Calculate metrics for this specific seller
        const aggregatedData = calculateSellerMetrics([currentUserData]);
        console.log('Final aggregated data for current seller:', aggregatedData);
        return aggregatedData;

    } catch (error) {
        console.error('Error loading seller data from localStorage:', error);
        return null;
    }
}

// Enhanced function to calculate metrics from seller data with proper product details
function calculateSellerMetrics(sellers) {
    console.log('=== CALCULATING METRICS FOR CURRENT SELLER ===');
    console.log('Input sellers:', sellers);

    let totalRevenue = 0;
    let totalUnitsSold = 0;
    let monthlySalesMap = {};
    let productSalesMap = {};

    // Load additional data
    const productsData = loadProductsData();
    const ordersData = loadOrdersData();

    sellers.forEach((seller, index) => {
        console.log(`Processing seller ${index + 1}:`, seller);

        // Get seller's product IDs
        const sellerProducts = seller.products || [];
        console.log('Seller products IDs:', sellerProducts);

        // Filter orders for this seller only
        const sellerOrders = ordersData.filter(order =>
            order.sellerId === seller.id || 
            order.seller_id === seller.id ||
            order.userId === seller.id || 
            order.user_id === seller.id ||
            order.items.some(item => sellerProducts.includes(item.id)) // fallback: check product ownership
        );

        console.log(`Found ${sellerOrders.length} orders for seller ${seller.id}`);

        sellerOrders.forEach(order => {
            order.items.forEach(item => {
                const product = findProductById(item.id, productsData);

                if (product && product.price) {
                    const orderValue = parseFloat(product.price);
                    totalRevenue += orderValue;
                    totalUnitsSold += 1;

                    // Track product sales
                    const productName = product.name || product.title || `Product ${item.id}`;
                    if (!productSalesMap[productName]) {
                        productSalesMap[productName] = { total: 0, units: 0, price: product.price, details: product };
                    }
                    productSalesMap[productName].total += orderValue;
                    productSalesMap[productName].units += 1;

                    // Track monthly sales
                    const orderDate = new Date(order.date || order.created_at || Date.now());
                    const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
                    if (!monthlySalesMap[monthKey]) monthlySalesMap[monthKey] = 0;
                    monthlySalesMap[monthKey] += orderValue;
                }
            });
        });
    });

    console.log('Final totals:', { totalRevenue, totalUnitsSold });

    // Average order value
    const avgOrderValue = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0;

    // Monthly sales
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales = Object.entries(monthlySalesMap)
        .sort(([a], [b]) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
        .map(([month, sales]) => ({ month, sales: Math.round(sales) }));

    // Top products
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
    
    // Try direct lookup first
    if (productsData[productId]) {
        return productsData[productId];
    }
    
    // Search through all products
    for (const [key, productData] of Object.entries(productsData)) {
        if (key === productId || productData.id === productId) {
            return productData;
        }
    }
    
    return null;
}

// Calculate actual growth from historical data in localStorage
function calculateGrowth(type, currentValue) {
    const previousData = getPreviousPeriodData(type);
    
    if (previousData && previousData > 0) {
        return ((currentValue - previousData) / previousData) * 100;
    }
    
    // Return 0 if no historical data available
    return 0;
}

// Helper function to get previous period data from localStorage
function getPreviousPeriodData(type) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return null;
        
        const historicalData = JSON.parse(localStorage.getItem('historicalMetrics') || '{}');
        const userHistorical = historicalData[currentUser.id];
        
        if (!userHistorical) return null;
        
        // Get the most recent previous entry
        const dates = Object.keys(userHistorical).sort().reverse();
        if (dates.length > 1) {
            const previousDate = dates[1]; // Second most recent
            return userHistorical[previousDate][type] || null;
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

// Store current metrics as historical data for the current user
function storeHistoricalMetrics(currentMetrics) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const historical = JSON.parse(localStorage.getItem('historicalMetrics') || '{}');
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Initialize user's historical data if it doesn't exist
        if (!historical[currentUser.id]) {
            historical[currentUser.id] = {};
        }
        
        historical[currentUser.id][currentDate] = {
            revenue: currentMetrics.totalRevenue,
            units: currentMetrics.unitsSold,
            avgOrder: currentMetrics.avgOrderValue
        };
        
        localStorage.setItem('historicalMetrics', JSON.stringify(historical));
        console.log('Historical metrics stored for user:', currentUser.id);
    } catch (error) {
        console.error('Error storing historical metrics:', error);
    }
}

// Enhanced helper function to load products data
function loadProductsData() {
    try {
        const productsData = JSON.parse(localStorage.getItem('products') || '{}');
        console.log('Loaded products data:', Object.keys(productsData).length, 'products');
        return productsData;
    } catch (error) {
        console.log('No products data found in localStorage');
        return {};
    }
}

// Enhanced helper function to load orders data
function loadOrdersData() {
    try {
        const ordersData = JSON.parse(localStorage.getItem('orders') || '[]');
        console.log('Loaded orders data:',ordersData.length, 'orders');
        return ordersData;
    } catch (error) {
        console.log('No orders data found in localStorage');
        return {};
    }
}

// Function to set current user (call this when user logs in)
function setCurrentUser(userData) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('Current user set:', userData);
    } catch (error) {
        console.error('Error setting current user:', error);
    }
}

// Enhanced initialization with user authentication
function initializeDashboard() {
    console.log('=== INITIALIZING SELLER DASHBOARD ===');
    
    // Check if user is authenticated
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('No authenticated user found');
        // Redirect to login page or show login prompt
        showLoginRequired();
        return;
    }
    
    console.log('Authenticated user:', currentUser);
    
    // Load seller data for current user
    const sellerData = loadSellerData();
    console.log('Seller data for current user:', sellerData);

    if (!sellerData) {
        console.log('No seller data available for current user');
        showNoDataMessage();
        return;
    }

    // Only show dashboard if there's actual data
    if (sellerData.totalRevenue === 0 && sellerData.unitsSold === 0) {
        showNoDataMessage();
        return;
    }

    // Store current metrics for future growth calculations
    storeHistoricalMetrics(sellerData);
    
    // Update dashboard
    updateStatsCards(sellerData);
    createSalesChart(sellerData);
    createProductsChart(sellerData);
}

// Helper functions for UI feedback
function showLoginRequired() {
    const container = document.querySelector('.dashboard-container') || document.body;
    container.innerHTML = '<div style="text-align: center; margin-top: 50px;"><h2>Please log in to view your seller dashboard</h2></div>';
}

function showNoDataMessage() {
    const container = document.querySelector('.dashboard-container') || document.body;
    container.innerHTML = '<div style="text-align: center; margin: 50px;"><h3>No seller data found</h3><p>You need to have products and orders to view dashboard metrics.</p></div>';
}

// Rest of your existing functions (updateStatsCards, createSalesChart, etc.) remain the same...
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function updateStatsCards(data) {
    // if (!data) return;

  document.getElementById('totalRevenue').innerHTML = `<span class="currency">EGP</span> ${formatNumber(data.totalRevenue)}`;
document.getElementById('unitsSold').textContent = formatNumber(data.unitsSold);
document.getElementById('avgOrderValue').innerHTML = `<span class="currency">EGP</span> ${data.avgOrderValue}`;

    // Update growth percentages
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

// Generate consistent colors for products based on name
function generateProductColor(productName) {
    const colors = ['#bb9457', '#6f1d1b', '#414833', '#b07d62', '#8b5a3c', '#4a5d23', '#9c6644', '#5d4037'];
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
        hash = ((hash << 5) - hash + productName.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

    // Active menu management
function setActiveMenuItem(clickedElement) {
  document.querySelectorAll('.sidebar ul li').forEach(li => {
    li.classList.remove('active');
  });
  clickedElement.parentElement.classList.add('active');
}


// // Monthly Sales Chart (Line)
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

// // Top Products Chart (Doughnut)
function createProductsChart(data) {
    const ctx = document.getElementById('productsChart');
    if (!ctx) return;
    console.log("hello",data)
 
new Chart(ctx, {
        type: 'doughnut',
 
        data :{
            //  labels: data.topProducts.map(p => p.name),

  datasets: [{
    label: 'My First Dataset',
   data: data.topProducts.map(p => p.revenue),
    backgroundColor:data.topProducts.map(p=>p.color),
    hoverOffset: 4,
   options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  }]
}

    });



    // Custom legend
    const legendContainer = document.getElementById('productsLegend');
    legendContainer.innerHTML = '';
    data.topProducts.forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color:${p.color};"></div>
            <span>${p.name} </span>
        `;
        legendContainer.appendChild(item);
    });
}


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
  localStorage.removeItem("currentUser");
  alert("You have been logged out.");
  window.location.href = "../../../sign/login/login.html";
})