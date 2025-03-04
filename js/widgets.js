// array of widgets as global variables
const widgets = [window.quoteWidget, window.triviaWidget, window.shortcutsWidget];

// parent function to render widgets
function loadWidgets() {
    chrome.storage.sync.get(["enabledWidgets", "firstTimeInstall"], (data) => {
        let enabledWidgets = data.enabledWidgets;
        let firstTime = data.firstTimeInstall;

        if (firstTime === undefined) {
            // First time setup: Enable all widgets by default
            enabledWidgets = widgets.map(widget => widget.id);
            chrome.storage.sync.set({ enabledWidgets, firstTimeInstall: false });
        }

        widgets.forEach(widget => {
            if (enabledWidgets.includes(widget.id)) {
                widget.render();
            } else {
                widget.hide();
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", loadWidgets);