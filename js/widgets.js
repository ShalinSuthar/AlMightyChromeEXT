// array of widgets as global variables
const widgets = [window.quoteWidget, window.triviaWidget];

// parent function to render widgets
function loadWidgets() {
    chrome.storage.sync.get("enabledWidgets", (data) => {
        const enabled = data.enabledWidgets || [];
        widgets.forEach(widget => {
            if (enabled.includes(widget.id)) {
                widget.render();
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", loadWidgets);