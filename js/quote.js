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
      let indexKey = `${selectedTheme}Index`;

      chrome.storage.sync.get(indexKey, (indexData) => {
        let index = indexData[indexKey] || 0;

        // fetch quotes from our backend API with two query params: index and category
        fetch(`https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/quote?category=${selectedTheme}&index=${index}`)
          .then(response => response.json())
          .then(data => {
            const randomQuote = data.text.text;
            // render quote
            quoteContainer.textContent = randomQuote;
            
            // modulo makes sure we don't hit an out of bounds error, and loops us back to the first quote
            // once customer has seen all the quotes for this category
            let nextIndex = (index + 1) % data.totalQuotes;
            console.log()
            // update index in browser storage
            // for storage limits, see: https://developer.chrome.com/docs/extensions/reference/api/storage
            chrome.storage.sync.set({ [indexKey]: nextIndex });
          })
          .catch(error => console.error('Error fetching quote:', error));
      });
    });
  }
});