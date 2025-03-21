// quote widget renders quotes
const quoteWidget = {
  id: "quote",
  name: "Quotes",
  render: function () {
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
  hide: function () {
    const quoteContainer = document.getElementById("quote-text");
    if (quoteContainer) {
      quoteContainer.textContent = "";
      quoteContainer.classList.remove('typing');
    }
    const widgetElement = document.getElementById('quote-container');
    if (widgetElement) {
      widgetElement.style.display = "none";
    }
  },
  loadAndDisplayQuote: function () {
    const quoteContainer = document.getElementById("quote-text");
    quoteContainer.textContent = "";
    // fetch user theme preference
    chrome.storage.sync.get('preferredTheme', (data) => {
      let selectedTheme = data.preferredTheme || 'default';
      let indexKey = `${selectedTheme}Index`;

      chrome.storage.sync.get(indexKey, (indexData) => {
        let index = indexData[indexKey] || 0;
        // this is a possibility for us (i.e., using CDN). The only issue here is we're exposing our s3 bucket data, which
        // might defeat the purpose of our "curation" strategy. Anyone can replicate our content in this case.
        // Latency for this call is 1ms though, which is WAY faster than before (200-400ms) with Lambda.
          fetch(`https://doa508wm14jjw.cloudfront.net/${selectedTheme}_quotes.json`)
          .then(response =>response.json())
          .then(quotes => {

          // Filter quotes based on category (or fallback to all)
          const filteredQuotes = quotes.filter(q => q.category.toLowerCase() === selectedTheme.toLowerCase());

          if (filteredQuotes.length === 0) {
              throw new Error(`No quotes found for category: ${selectedTheme}`);
          }

          // Get the specific quote at the given index
          const randomQuote = filteredQuotes[index];

          // **Render quote**
          const widgetElement = document.getElementById('quote-container');
          widgetElement.style.display = "block";
          quoteContainer.textContent = randomQuote.text;

          // **Pick a theme**
          let themes = ["happy", "melancholic", "inspirational", "thoughtful", "motivational"];
          const randomTheme = themes[Math.floor(Math.random() * themes.length)];
          widgetElement.classList.add(randomQuote.theme ?? randomTheme);

          // **Typewriter effect**
          typeWriterEffect(randomQuote.text, quoteContainer);

          // **Update index in storage**
          let nextIndex = (index + 1) % filteredQuotes.length;
          chrome.storage.sync.set({ [indexKey]: nextIndex });
        })
        .catch(error => {
          console.error("Error fetching quote:", error);
        });
      });
    });
    function typeWriterEffect(text, element) {
      element.classList.add('typing');
      element.innerHTML = "";
      let index = 0;

      let typingActive = true;

      function type() {
        if (!typingActive) return;
        if (index < text.length) {
          element.innerHTML += text.charAt(index);
          index++;
          setTimeout(type, 100);
        } else {
          element.classList.remove('typing');
        }
      }

      type();

      quoteWidget.hide = function () {
        typingActive = false;
        if (element) {
          element.textContent = "";
          element.innerHTML = "";
          element.classList.remove('typing');
        }
        const widgetElement = document.getElementById('quote-container');
        if (widgetElement) {
          widgetElement.style.display = "none";
        }
      };
    }


  }
}

window.quoteWidget = quoteWidget;