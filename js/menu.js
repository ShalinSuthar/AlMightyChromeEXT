document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu-toggle");
  const settingsBtn = document.getElementById("settingsBtn");
  const widgetPanel = document.getElementById("widget-settings");

  // Expand menu
  menu.addEventListener("click", (e) => {
    if (!e.target.closest('#settingsBtn')) {
      e.stopPropagation();
      menu.classList.toggle("expanded");
    }
  });

  // Toggle widget panel
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (widgetPanel.classList.contains("hidden")) {
      widgetPanel.classList.remove("hidden");
    } else {
      widgetPanel.classList.add("hidden");
    }
    
  });

  // Collapse everything on outside click
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) {
      menu.classList.remove("expanded");
      widgetPanel.classList.add("hidden");  
    }
  });
});