document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('bgColorPicker');
    const colorBtn = document.getElementById('colorPickerBtn');
    const currentColor = document.getElementById('currentColor');

    // Load saved color
    chrome.storage.local.get(['backgroundColor'], function(result) {
        if (result.backgroundColor) {
            document.body.style.backgroundColor = result.backgroundColor;
            colorPicker.value = result.backgroundColor;
            currentColor.style.backgroundColor = result.backgroundColor;
        }
    });

    // Open color picker when button is clicked
    colorBtn.addEventListener('click', () => {
        colorPicker.click();
    });

    // Handle color selection
    colorPicker.addEventListener('change', (e) => {
        const newColor = e.target.value;
        document.body.style.backgroundColor = newColor;
        currentColor.style.backgroundColor = newColor;
        currentColor.style.borderColor = '#aaa';
        
        // Save the selected color
        chrome.storage.local.set({
            backgroundColor: newColor
        });
    });
});
