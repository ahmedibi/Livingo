
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
        links.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                
                links.forEach(l => l.classList.remove("active"));
                this.classList.add("active");
                
                if (window.innerWidth <= 991) {
                    sidebar.classList.remove("open");
                }

                
            });
        });

        // Handle window resize
        window.addEventListener("resize", () => {
            if (window.innerWidth > 991) {
                sidebar.classList.remove("open");
            }
        });
  