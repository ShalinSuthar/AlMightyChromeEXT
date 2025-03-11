document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("sub").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        let query = document.getElementById("search-input").value;
        
        if (query) {
            chrome.search.query({ text: query, disposition: "CURRENT_TAB" });
        }
    });
});