document.addEventListener("DOMContentLoaded", () => {
    const settingsBtn = document.getElementById("settingsBtn");
    const widgetSettings = document.getElementById("widget-settings");
    const widgetList = document.getElementById("widget-list");
    const iamSelector = document.getElementById("iamSelector");

    settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        widgetSettings.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!widgetSettings.contains(e.target) && !settingsBtn.contains(e.target)) {
            widgetSettings.classList.remove("show");
        }
    });

    // Load saved widget preferences
    chrome.storage.sync.get("enabledWidgets", (data) => {
        let enabledWidgets = data.enabledWidgets || [];

        widgets.forEach(widget => {
            const widgetItem = document.createElement("div");
            widgetItem.className = "widget-item";

            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = enabledWidgets.includes(widget.id);

            const text = document.createTextNode(widget.name);

            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    enabledWidgets.push(widget.id);
                } else {
                    enabledWidgets = enabledWidgets.filter(id => id !== widget.id);
                }
                chrome.storage.sync.set({ enabledWidgets }, () => {
                    updateWidgets();
                    toggleThemeSelection(); // Ensure correct visibility when widget changes
                });
            });

            label.appendChild(checkbox);
            label.appendChild(text);
            widgetItem.appendChild(label);
            widgetList.appendChild(widgetItem);
        });

        toggleThemeSelection(); // Ensure correct visibility on page load
    });

    function updateWidgets() {
        chrome.storage.sync.get("enabledWidgets", (data) => {
            const enabled = data.enabledWidgets || [];
            toggleThemeSelection();
    
            widgets.forEach(widget => {
                if (enabled.includes(widget.id)) {
                    widget.render();
                } else {
                    try {
                        widget.hide();
                    } catch (e) {
                        console.log(`Failed to hide widget ${widget.id}:`, e);
                    }
                }
            });
        })};

    function toggleThemeSelection() {
        chrome.storage.sync.get("enabledWidgets", (data) => {
            const enabledWidgets = data.enabledWidgets || [];
            if (enabledWidgets.includes("quote")) {
                iamSelector.style.display = "block";
            } else {
                iamSelector.style.display = "none";
            }
        });
    }

    // Ensure correct display of iamSelector if widget settings change
    document.getElementById("widget-list").addEventListener("change", toggleThemeSelection);
});
