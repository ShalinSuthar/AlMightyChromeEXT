document.addEventListener('DOMContentLoaded', function () {
    const colorPicker = document.getElementById('bgColorPicker');
    const colorBtn = document.getElementById('colorPickerBtn');
  
    function applyBackground(profile) {
      // chrome.storage.sync.get(profile, (data) => {
      //   if (data[profile] && 'bgColor' in data[profile]) {
      //     const bgColor = data[profile].bgColor;
      //     document.body.style.backgroundColor = bgColor;
      //     if (colorPicker) colorPicker.value = bgColor;
      //   } else {
      //     console.log(`No bgColor for '${profile}', keeping current background.`);
      //   }
      // });
    }
  
    chrome.storage.sync.get("currentProfile", ({ currentProfile }) => {
      const profile = currentProfile || "storyteller";
      applyBackground(profile);
    });
  
    // chrome.storage.onChanged.addListener((changes, area) => {
    //   if (area === "sync" && changes.currentProfile) {
    //     const newProfile = changes.currentProfile.newValue;
    //     applyBackground(newProfile);
    //   }
    // });
  
    colorBtn?.addEventListener("click", () => colorPicker?.click());
  
    colorPicker?.addEventListener("change", (e) => {
      const newColor = e.target.value;
  
      chrome.storage.sync.get("currentProfile", ({ currentProfile }) => {
        const profile = currentProfile || "storyteller";
        chrome.storage.sync.get(profile, (data) => {
          const updated = {
            ...data[profile],
            bgColor: newColor,
          };
          chrome.storage.sync.set({ [profile]: updated }, () => {
            document.body.style.backgroundColor = newColor;
          });
        });
      });
    });
  });
  