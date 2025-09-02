// ====================== CURRENT USER ======================
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

function setCurrentUser(userData) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
        console.error('Error setting current user:', error);
    }
}

// ====================== DATA LOADING ======================
function loadUsersData() {
    try {
        return JSON.parse(localStorage.getItem('users') || '{}');
    } catch {
        return {};
    }
}

function loadProductsData() {
    try {
        return JSON.parse(localStorage.getItem('products') || '{}');
    } catch {
        return {};
    }
}

function loadOrdersData() {
    try {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    } catch {
        return [];
    }
}

// ====================== SELLER DATA ======================
function loadSellerData() {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return null;

    const usersData = loadUsersData();
    const sellerData = Object.values(usersData).find(u => u.id == currentUser.id);

    if (!sellerData) return null;
    if (sellerData.role?.toLowerCase() !== 'seller') return null;

    return calculateSellerMetrics(sellerData);
}

function calculateSellerMetrics(seller) {
    let totalRevenue = 0, totalUnitsSold = 0;
    const monthlySalesMap = {};
    const productSalesMap = {};

    const productsData = loadProductsData();
    const ordersData = loadOrdersData();

    const sellerProductIds = (seller.products || []).map(String); // كل الـ product IDs كسلسلة
    const sellerOrders = ordersData.filter(order =>
        order.items.some(item => sellerProductIds.includes(String(item.id)))
    );

    sellerOrders.forEach(order => {
        order.items.forEach(item => {
            if (!sellerProductIds.includes(String(item.id))) return;

            const product = productsData[item.id] || Object.values(productsData).find(p => String(p.id) === String(item.id));
            if (!product || !product.price) return;

            const orderValue = parseFloat(product.price);
            totalRevenue += orderValue;
            totalUnitsSold += item.quantity || 1;

            const productName = product.name || product.title || `Product ${item.id}`;
            if (!productSalesMap[productName]) productSalesMap[productName] = { total: 0, units: 0, color: generateProductColor(productName) };
            productSalesMap[productName].total += orderValue;
            productSalesMap[productName].units += 1;

            const orderDate = new Date(order.date || order.created_at || Date.now());
            const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
            if (!monthlySalesMap[monthKey]) monthlySalesMap[monthKey] = 0;
            monthlySalesMap[monthKey] += orderValue;
        });
    });

    const avgOrderValue = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0;

    const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlySales = Object.entries(monthlySalesMap)
        .sort(([a],[b]) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
        .map(([month, sales]) => ({ month, sales: Math.round(sales) }));

    const topProducts = Object.entries(productSalesMap)
        .map(([name, data]) => ({
            name,
            units: data.units,
            revenue: data.total,
            color: data.color
        }))
        .sort((a,b) => b.revenue - a.revenue)
        .slice(0,4);

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

// ====================== GROWTH ======================
function calculateGrowth(type, currentValue) {
    const previousData = getPreviousPeriodData(type);
    if (previousData && previousData > 0) return ((currentValue - previousData) / previousData) * 100;
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
        if (dates.length > 1) return userHistorical[dates[1]][type] || null;
        return null;
    } catch { return null; }
}

function storeHistoricalMetrics(currentMetrics) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        const historical = JSON.parse(localStorage.getItem('historicalMetrics') || '{}');
        if (!historical[currentUser.id]) historical[currentUser.id] = {};

        const currentDate = new Date().toISOString().split('T')[0];
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

// ====================== DASHBOARD ======================
function initializeDashboard() {
    const currentUser = getCurrentUser();
    if (!currentUser) { showLoginRequired(); return; }

    const sellerData = loadSellerData();
    if (!sellerData) {
        updateStatsCards(emptyDashboardData());
        createSalesChart(emptyDashboardData());
        createProductsChart(emptyDashboardData());
        return;
    }

    storeHistoricalMetrics(sellerData);
    updateStatsCards(sellerData);
    createSalesChart(sellerData);
    createProductsChart(sellerData);
}

function emptyDashboardData() {
    return {
        totalRevenue: 0,
        revenueGrowth: 0,
        unitsSold: 0,
        unitsGrowth: 0,
        avgOrderValue: 0,
        avgOrderGrowth: 0,
        monthlySales: [],
        topProducts: []
    };
}

function showLoginRequired() {
    const container = document.querySelector('.dashboard-container') || document.body;
    container.innerHTML = '<div style="text-align:center; margin-top:50px;"><h2>Please log in to view your seller dashboard</h2></div>';
}

// ====================== UI UPDATES ======================
function formatNumber(num) { return new Intl.NumberFormat().format(num); }

function updateStatsCards(data) {
    document.getElementById('totalRevenue').innerHTML = `<span class="currency">EGP</span> ${formatNumber(data.totalRevenue)}`;
    document.getElementById('unitsSold').textContent = formatNumber(data.unitsSold);
    document.getElementById('avgOrderValue').innerHTML = `<span class="currency">EGP</span> ${data.avgOrderValue}`;
    updateGrowth('revenueGrowth', data.revenueGrowth);
    updateGrowth('unitsGrowth', data.unitsGrowth);
    updateGrowth('avgOrderGrowth', data.avgOrderGrowth);
}

function updateGrowth(elementId, growth) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = `${Math.abs(growth)}%`;
    el.className = `stat-growth ${growth >= 0 ? 'positive' : 'negative'}`;
}

function generateProductColor(productName) {
    const colors = ['#bb9457','#6f1d1b','#414833','#b07d62','#8b5a3c','#4a5d23','#9c6644','#5d4037'];
    let hash=0; for(let i=0;i<productName.length;i++){ hash=((hash<<5)-hash+productName.charCodeAt(i))&0xffffffff; }
    return colors[Math.abs(hash)%colors.length];
}

// ====================== MENU / LOGOUT ======================
function setActiveMenuItem(clickedElement){
    document.querySelectorAll('.sidebar ul li').forEach(li=>li.classList.remove('active'));
    clickedElement.parentElement.classList.add('active');
}

function toggleSidebar(){ document.getElementById("sidebar").classList.toggle("active"); }

const logout = document.getElementById("logOut");
if(logout) logout.addEventListener("click",()=> {
    if(confirm("Are you sure you want to log out?")){
        localStorage.removeItem("currentUser");
        window.location.href = "../../../sign/login/login.html";
    }
});

// ====================== CHARTS ======================
function createSalesChart(data){
    const ctx=document.getElementById('salesChart'); if(!ctx) return;
    new Chart(ctx,{ type:'line', data:{
        labels:data.monthlySales.map(m=>m.month),
        datasets:[{ label:'Monthly Sales (EGP)', data:data.monthlySales.map(m=>m.sales),
                    borderColor:'#bb9457', backgroundColor:'rgba(187,148,87,0.2)', fill:true, tension:0.3, borderWidth:2 }]
    }, options:{ responsive:true, plugins:{ legend:{ display:false }}}});
}

function createProductsChart(data){
    const ctx=document.getElementById('productsChart'); if(!ctx) return;
    new Chart(ctx,{ type:'doughnut', data:{ datasets:[{ label:'Top Products', data:data.topProducts.map(p=>p.revenue), backgroundColor:data.topProducts.map(p=>p.color), hoverOffset:4 }]}, options:{ responsive:true, plugins:{ legend:{ position:'bottom' }}}});

    const legendContainer=document.getElementById('productsLegend'); if(!legendContainer) return;
    legendContainer.innerHTML='';
    data.topProducts.forEach(p=>{
        const item=document.createElement('div');
        item.className='legend-item';
        item.innerHTML=`<div class="legend-color" style="background-color:${p.color};"></div><span>${p.name}</span>`;
        legendContainer.appendChild(item);
    });
}

// ====================== INIT ======================
document.addEventListener('DOMContentLoaded', initializeDashboard);
