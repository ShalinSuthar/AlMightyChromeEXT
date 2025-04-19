document.addEventListener("DOMContentLoaded", () => {
    const settingsBtn = document.getElementById("settingsBtn");
    const widgetSettings = document.getElementById("widget-settings");
    const widgetList = document.getElementById("widget-list");
    // const iamSelector = document.getElementById("iamSelector");
    const addShortcutBtn = document.getElementById("addShortcutBtn");
    const profileToast = document.getElementById("profile-toast");
    const profileTabs = document.querySelectorAll(".profile-tab");

    let currentProfile = "storyteller";

    widgetSettings.classList.toggle("show");
    // settingsBtn.addEventListener("click", (e) => {
    //     e.stopPropagation();
    //     
    // });

    document.addEventListener("click", (e) => {
        if (!widgetSettings.contains(e.target)) {
            // widgetSettings.classList.remove("show");
        }
    });

    profileTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const selected = tab.dataset.profile;
    
            chrome.storage.sync.set({ currentProfile: selected }, () => {
                currentProfile = selected;
                loadWidgetsForProfile(currentProfile);
                loadBackgroundForProfile(currentProfile);
                updateActiveTabUI(currentProfile);
                showToast("Switched to " + selected);
            });
        });
    });
    

    chrome.storage.sync.get(["currentProfile"], (res) => {
        currentProfile = res.currentProfile || "storyteller";
        loadWidgetsForProfile(currentProfile);
        loadBackgroundForProfile(currentProfile);
        updateActiveTabUI(currentProfile);
    });


    function loadWidgetsForProfile(profileName) {
        const widgetKey = `enabledWidgets_${profileName}`;

        chrome.storage.sync.get([widgetKey], (data) => {
            let enabledWidgets = data[widgetKey];

            if (!enabledWidgets) {
                enabledWidgets = widgets.map(widget => widget.id);
                if (JSON.stringify(data[widgetKey] || []) !== JSON.stringify(enabledWidgets)) {
                    chrome.storage.sync.set({ [widgetKey]: enabledWidgets });
                }
            }

            widgetList.innerHTML = "";

            widgets.forEach(widget => {
                const widgetItem = document.createElement("div");
    widgetItem.className = "widget-item";

    const label = document.createElement("label");
    label.className = "toggle-switch"; // important for styling

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = enabledWidgets.includes(widget.id);
    checkbox.className = "toggle-input";

    const slider = document.createElement("span");
    slider.className = "slider";

    const text = document.createElement("span");
    text.className = "toggle-label";
    text.textContent = widget.name;

    checkbox.addEventListener("change", () => {
        handleWidgetToggle(widget.id, checkbox.checked, profileName);
    });

    label.appendChild(checkbox);
    label.appendChild(slider);

    widgetItem.appendChild(text);
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
        //   if (iamSelector) {
        //     iamSelector.style.display = enabledWidgets.includes("quote") ? "block" : "none";
        //   }
        if (addShortcutBtn) {
            addShortcutBtn.style.display = enabledWidgets.includes("shortcuts") ? "block" : "none";
        }
    }


    function showToast(message) {
        if (!profileToast) return;
        profileToast.textContent = message;
        profileToast.classList.add("show");
        setTimeout(() => profileToast.classList.remove("show"), 2000);
    }


    function loadBackgroundForProfile(profileName) {
        chrome.storage.sync.get(profileName, (data) => {
            if (data[profileName] && 'bgColor' in data[profileName]) {
                const bgColor = data[profileName].bgColor;
                document.body.style.backgroundColor = bgColor;
                const colorPicker = document.getElementById('bgColorPicker');
                if (colorPicker) colorPicker.value = bgColor;
            }
        });
    }


    function updateActiveTabUI(profileName) {
        profileTabs.forEach(tab => {
            if (tab.dataset.profile === profileName) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });
    }

    widgetList.addEventListener("change", () => {
        const widgetKey = `enabledWidgets_${currentProfile}`;
        chrome.storage.sync.get(widgetKey, (data) => {
            toggleWidgetVisibility(data[widgetKey] || []);
        });
    });
});
