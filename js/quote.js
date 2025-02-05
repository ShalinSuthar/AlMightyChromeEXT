// quote widget renders quotes
const quoteWidget = {
  id: "quote",
  name: "Quotes",
  render: function() {
    this.loadAndDisplayQuote();
    // Listen for theme changes in storage
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.preferredTheme) {
        // Do a hard refresh of the page. This might affect other components in our extension. 
        // TODO: How can we call loadAndDisplayQuote() again and have the div "re-build" itself?
        location.reload();
      }
    });
  },
  loadAndDisplayQuote: function() {
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
            const quoteContainer = document.getElementById("quote-text");
            quoteContainer.textContent = randomQuote;
            
            // modulo makes sure we don't hit an out of bounds error, and loops us back to the first quote
            // once customer has seen all the quotes for this category

            // Very simple example of what we want to acheive
            // If the theme is being passed from the backend 
            // then pick it from there
            const quoteTheme = data.text?.theme;

            // If not then we can define a list of predefined themes and pick one randomly
            let themes = ["happy", "melancholic", "inspirational", "thoughtful", "motivational"];
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];

            // Clear previous content and apply theme
            quoteContainer.textContent = "";
            quoteContainer.className = quoteTheme ?? randomTheme;

            // Apply typewriter effect
            typeWriterEffect(randomQuote, quoteContainer);

            let nextIndex = (index + 1) % data.totalQuotes;
            chrome.storage.sync.set({ [indexKey]: nextIndex });
          })
          .catch(error => console.error('Error fetching quote:', error));
      });
    });
    function typeWriterEffect(text, element) {
      let index = 0;
      function type() {
        if (index < text.length) {
          element.innerHTML += text.charAt(index);
          index++;
          setTimeout(type, 100); // We can adjust speed here
        }
      }
      type();
    }
  }
}

window.quoteWidget = quoteWidget;