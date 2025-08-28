const sidebar = document.getElementById("sideBar");
const toggler = document.querySelector(".sidebar-toggler");
const mainContent = document.getElementById("mainContent");
const links = document.querySelectorAll("#sideBar .menu a");

// Toggle sidebar functionality
toggler.addEventListener("click", () => {
  if (window.innerWidth <= 991) {
    sidebar.classList.toggle("open");
  } else {
    sidebar.classList.toggle("closed");
    mainContent.classList.toggle("sidebar-closed");
  }
});

// Handle menu links
links.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    links.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");

    if (window.innerWidth <= 991) {
      sidebar.classList.remove("open");
    }

    updateMainContent(this.textContent.trim());
  });
});

// Update main content function
function updateMainContent(section) {
  const contentHeader = document.querySelector(".content-header h1");
  const contentDescription = document.querySelector(".content-header p");

  switch (section) {
    case "Dashboard":
      contentHeader.textContent = "Dashboard Overview";
      contentDescription.textContent =
        "Welcome to your admin dashboard. Monitor your business metrics and manage your platform.";
      break;
    case "Products":
      contentHeader.textContent = "Products Management";
      contentDescription.textContent =
        "Manage your product catalog, inventory, and pricing.";
      break;
    case "Users":
      contentHeader.textContent = "User Management";
      contentDescription.textContent =
        "View and manage all registered users on your platform.";
      break;
    case "Seller":
      contentHeader.textContent = "Seller Management";
      contentDescription.textContent =
        "Manage seller accounts and their store information.";
      break;
    case "Orders":
      contentHeader.textContent = "Orders Management";
      contentDescription.textContent =
        "Track and manage all orders placed on your platform.";
      break;
    case "Logout":
      contentHeader.textContent = "Logout";
      contentDescription.textContent = "You are being logged out...";
      break;
  }
}

// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 991) {
    sidebar.classList.remove("open");
  }
});
