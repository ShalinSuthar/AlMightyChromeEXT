document.addEventListener("DOMContentLoaded", () => {
    const settingsBtn = document.getElementById("settingsBtn");
    const widgetSettings = document.getElementById("widget-settings");
    const widgetList = document.getElementById("widget-list");
    const iamSelector = document.getElementById("iamSelector");
    const addShortcutBtn = document.getElementById("addShortcutBtn");
    const infoButton = document.getElementById("info-button");
    const infoPopup = document.getElementById("info-popup");

    let currentProfile = "default"; // fallback

    infoButton.addEventListener("click", (event) => {
        event.stopPropagation();
        infoPopup.classList.toggle("hidden");
        infoPopup.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
        if (!infoButton.contains(event.target) && !infoPopup.contains(event.target)) {
            infoPopup.classList.remove("show");
            infoPopup.classList.add("hidden");
        }
    });

    // --- Widget settings toggle ---
    settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        widgetSettings.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!widgetSettings.contains(e.target) && !settingsBtn.contains(e.target)) {
            widgetSettings.classList.remove("show");
        }
    });

    // --- Get current profile and load widgets ---
    chrome.storage.sync.get(["currentProfile"], (res) => {
        currentProfile = res.currentProfile || "default";
        loadWidgetsForProfile(currentProfile);
    });

    function loadWidgetsForProfile(profileName) {
        const widgetKey = `enabledWidgets_${profileName}`;

        chrome.storage.sync.get([widgetKey], (data) => {
            let enabledWidgets = data[widgetKey];

            // First time default
            if (!enabledWidgets) {
                enabledWidgets = widgets.map(widget => widget.id);
                chrome.storage.sync.set({ [widgetKey]: enabledWidgets });
            }

            // Render widget checkboxes
            widgetList.innerHTML = "";

            widgets.forEach(widget => {
                const widgetItem = document.createElement("div");
                widgetItem.className = "widget-item";

                const label = document.createElement("label");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = enabledWidgets.includes(widget.id);

                const text = document.createTextNode(widget.name);

                checkbox.addEventListener("change", () => {
                    handleWidgetToggle(widget.id, checkbox.checked, profileName);
                });

                label.appendChild(checkbox);
                label.appendChild(text);
                widgetItem.appendChild(label);
                widgetList.appendChild(widgetItem);
            });

            updateWidgets(profileName);
        });
    }

    function handleWidgetToggle(widgetId, isChecked, profileName) {
        const widgetKey = `enabledWidgets_${profileName}`;
        chrome.storage.sync.get(widgetKey, (data) => {
            let updatedWidgets = data[widgetKey] || [];

            if (isChecked && !updatedWidgets.includes(widgetId)) {
                updatedWidgets.push(widgetId);
            } else if (!isChecked) {
                updatedWidgets = updatedWidgets.filter(id => id !== widgetId);
            }

            chrome.storage.sync.set({ [widgetKey]: updatedWidgets }, () => {
                updateWidgets(profileName);
            });
        });
    }

    function updateWidgets(profileName) {
        const widgetKey = `enabledWidgets_${profileName}`;
        chrome.storage.sync.get(widgetKey, (data) => {
            const enabledWidgets = data[widgetKey] || [];

            widgets.forEach(widget => {
                const widgetElement = document.getElementById(`${widget.id}-container`);
                if (enabledWidgets.includes(widget.id)) {
                    if (!widgetElement || widgetElement.style.display === "none") {
                        widget.render();
                    }
                } else {
                    try {
                        widget.hide();
                    } catch (e) {
                        console.log(`Failed to hide widget ${widget.id}:`, e);
                    }
                }
            });

            toggleWidgetVisibility(enabledWidgets);
        });
    }

    function toggleWidgetVisibility(enabledWidgets) {
        iamSelector.style.display = enabledWidgets.includes("quote") ? "block" : "none";
        addShortcutBtn.style.display = enabledWidgets.includes("shortcuts") ? "block" : "none";
    }

    // Auto toggle extras when widget state changes
    widgetList.addEventListener("change", () => {
        const widgetKey = `enabledWidgets_${currentProfile}`;
        chrome.storage.sync.get(widgetKey, (data) => {
            toggleWidgetVisibility(data[widgetKey] || []);
        });
    });

    window.switchProfile = function (newProfileName) {
        chrome.storage.sync.set({ currentProfile: newProfileName }, () => {
            currentProfile = newProfileName;
            loadWidgetsForProfile(currentProfile);
        });
    };

    const profileDropdown = document.getElementById("profileDropdown");
const profileToast = document.getElementById("profile-toast");

// Load dropdown with last selected profile
chrome.storage.sync.get(["currentProfile"], (res) => {
    const saved = res.currentProfile || "default";
    profileDropdown.value = saved;
});


profileDropdown.addEventListener("change", (e) => {
    const selected = e.target.value;
    switchProfile(selected);
    showToast("Switched to " + selected);
});


function showToast(message) {
    profileToast.textContent = message;
    profileToast.classList.add("show");

    setTimeout(() => {
        profileToast.classList.remove("show");
    }, 2000);
}

});
