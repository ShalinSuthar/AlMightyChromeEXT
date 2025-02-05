document.addEventListener("DOMContentLoaded", () => {
    const widgetSettings = document.getElementById("widget-settings");

    // Load saved widget preferences
    chrome.storage.sync.get("enabledWidgets", (data) => {
        let enabledWidgets = data.enabledWidgets || [];

        widgets.forEach(widget => {
            const label = document.createElement("label");
            label.textContent = widget.name;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = enabledWidgets.includes(widget.id);
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    enabledWidgets.push(widget.id);
                } else {
                    enabledWidgets = enabledWidgets.filter(id => id !== widget.id);
                }
                chrome.storage.sync.set({ enabledWidgets }, () => {
                    // Do a hard refresh of the page. This might affect other components in our extension. 
                    // TODO: How can we call updateWidgets() again and have the quote div "re-build" itself?
                    location.reload();
                });
            });

            label.appendChild(checkbox);
            widgetSettings.appendChild(label);
        });
    });
});

// Function to update widgets dynamically
function updateWidgets() {
    chrome.storage.sync.get("enabledWidgets", (data) => {
        const enabled = data.enabledWidgets || [];

        widgets.forEach(widget => {
            if (enabled.includes(widget.id)) {
                widget.render();
            }
        });
    });
}
