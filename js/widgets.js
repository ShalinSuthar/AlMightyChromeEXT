const widgets = [
    window.quoteWidget,
    window.triviaWidget,
    window.shortcutsWidget,
    window.wotdWidget,
    window.searchQuizWidget,
  ];
  
  function loadWidgetsForCurrentProfile() {
    chrome.storage.sync.get("currentProfile", (res) => {
      const profileName = res.currentProfile || "storyteller";
      const widgetKey = `enabledWidgets_${profileName}`;
  
      chrome.storage.sync.get(widgetKey, (data) => {
        let enabledWidgets = data[widgetKey];
  
        // First time for this profile: enable all widgets by default
        if (!enabledWidgets) {
          enabledWidgets = widgets.map(widget => widget.id);
          chrome.storage.sync.set({ [widgetKey]: enabledWidgets });
        }
  
        widgets.forEach(widget => {
          if (enabledWidgets.includes(widget.id)) {
            widget.render();
          } else {
            try {
              widget.hide();
            } catch (e) {
              console.log(`Failed to hide widget ${widget.id}:`, e);
            }
          }
        });
      });
    });
  }
  
  document.addEventListener("DOMContentLoaded", loadWidgetsForCurrentProfile);
  