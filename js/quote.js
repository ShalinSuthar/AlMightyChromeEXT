const quoteWidget = {
  id: "quote",
  name: "Quotes",

  render: function () {
    chrome.storage.sync.get("currentProfile", ({ currentProfile }) => {
      const profile = currentProfile || "storyteller";
      const widgetKey = `enabledWidgets_${profile}`;

      chrome.storage.sync.get(widgetKey, (data) => {
        const enabledWidgets = data[widgetKey] || [];

        if (enabledWidgets.includes("quote")) {
          this.loadAndDisplayQuote();
        } else {
          this.hide();
        }
      });
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.currentProfile) {
        this.render(); 
      }
    });
  },

  hide: function () {
    const quoteContainer = document.getElementById("quote-text");
    if (quoteContainer) {
      quoteContainer.textContent = "";
      quoteContainer.classList.remove("typing");
    }

    const widgetElement = document.getElementById("quote-container");
    if (widgetElement) {
      widgetElement.style.display = "none";
    }
  },

  loadAndDisplayQuote: function () {
    const quoteContainer = document.getElementById("quote-text");
    const widgetElement = document.getElementById("quote-container");
    quoteContainer.textContent = "";

    chrome.storage.sync.get(['quoteX', 'quoteY'], (pos) => {
      widgetElement.style.left = `${pos.quoteX || 0}px`;
      widgetElement.style.top = `${pos.quoteY || 0}px`;
    });

    chrome.storage.sync.get("currentProfile", ({ currentProfile }) => {
      const profile = currentProfile || "storyteller";
      const indexKey = `${profile}Index`;

      chrome.storage.sync.get(indexKey, (indexData) => {
        const index = indexData[indexKey] || 0;

        fetch(`https://doa508wm14jjw.cloudfront.net/${profile}_quotes.json`)
          .then(res => res.json())
          .then(quotes => {
            const filtered = quotes.filter(q =>
              q.category?.toLowerCase() === profile.toLowerCase()
            );
            const usable = filtered.length > 0 ? filtered : quotes;
            const quoteObj = usable[index % usable.length];

            widgetElement.style.display = "block";
            quoteContainer.textContent = quoteObj.text;

            const themes = ["happy", "melancholic", "inspirational", "thoughtful", "motivational"];
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            widgetElement.classList.add(quoteObj.theme || randomTheme);

            const nextIndex = (index + 1) % usable.length;
            chrome.storage.sync.set({ [indexKey]: nextIndex });
          })
          .catch(err => {
            console.error("Error fetching quote:", err);
            quoteContainer.textContent = "Could not load quote.";
          });
      });
    });
  }
};

window.quoteWidget = quoteWidget;
