document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu-toggle");

  // Expand menu
  menu.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("expanded");
  });

  // Collapse everything on outside click
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) {
      menu.classList.remove("expanded");
    }
  });
});