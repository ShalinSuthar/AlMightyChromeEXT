document.addEventListener('DOMContentLoaded', () => {
  const quoteContainer = document.getElementById("quote-text");

  loadAndDisplayQuote();

  // Listen for theme changes in storage
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.preferredTheme) {
      // Do a hard refresh of the page. This might affect other components in our extension. 
      // TODO: How can we call loadAndDisplayQuote() again and have the div "re-build" itself?
      location.reload();
    }
  });

  function loadAndDisplayQuote() {
    // fetch user theme preference
    chrome.storage.sync.get('preferredTheme', (data) => {
      let selectedTheme = data.preferredTheme || 'default';

      // fetch quotes from our backend API
      fetch(`https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/quote?category=${selectedTheme}`)
        .then(response => response.json())
        .then(data => {
            const randomQuote = data.text;
            quoteContainer.textContent = randomQuote;
        })
        .catch(error => console.error('Error fetching quote:', error));
    });
  }
});