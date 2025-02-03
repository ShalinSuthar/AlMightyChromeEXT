document.addEventListener('DOMContentLoaded', () => {
    const labelElement = document.getElementById('theme-label');
    const selectedElement = document.getElementById('theme-select');

    // On load, get previously saved user preference
    chrome.storage.sync.get('preferredTheme', (data) => {
        if (data.preferredTheme) {
            // Update the dropdown
            selectedElement.value = data.preferredTheme;
            // Update the label text
            updateLabelText(data.preferredTheme);
        }
    });

    // When the user picks a new option
    selectedElement.addEventListener('change', () => {
        const selectedValue = selectedElement.value;
        // Save it to storage
        chrome.storage.sync.set({ preferredTheme: selectedValue }, () => {
            console.log('Theme preference saved:', selectedValue);
        });
        // Update the label text
        updateLabelText(selectedValue);
    });

    // Helper function to set "I’m a" or "I’m an"
    function updateLabelText(selection) {
        const startsWithVowel = /^[AEIOUaeiou]/;
        // E.g., if the user picks "Engineer," say "I'm an"; otherwise, "I'm a"
        if (startsWithVowel.test(selection)) {
            labelElement.textContent = "i'm an";
        } else {
            labelElement.textContent = "i'm a";
        }
    }
});