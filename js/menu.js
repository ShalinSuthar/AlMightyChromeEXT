document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("menu-toggle");
    const dropdown = document.getElementById("dropdown-menu");
    const settingsBtn = document.getElementById("settingsBtn");
    const widgetPanel = document.getElementById("widget-settings");
  
    // Toggle dropdown menu
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
    });
  
    // Toggle widget panel without closing the menu
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent closing dropdown
      widgetPanel.classList.toggle("hidden");
    });
  
    // Close both menus if clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
  
      if (!widgetPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
        widgetPanel.classList.add("hidden");
      }
    });
  });  