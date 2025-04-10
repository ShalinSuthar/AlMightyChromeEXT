const wotdWidget = {
    id: "wotd",
    name: "Words",
    render: function() {
        this.loadWordOfTheDay();
    },
    hide: function() {
        const wotdElement = document.getElementById('wotd-widget-container');
        if (wotdElement) {
            wotdElement.style.display = "none";
        }
    },
    loadWordOfTheDay: async function () {
        const CACHE_LIMIT = 5;
    
        chrome.storage.sync.get(['cachedWotd', 'cachedDefinition', 'cachedAttribution', 'cachedWotdViews'], async (data) => {
            let { cachedWotd, cachedDefinition, cachedAttribution, cachedWotdViews } = data;
            
            const usingCachedWord = cachedWotd && cachedDefinition && cachedWotdViews < CACHE_LIMIT;
            if (usingCachedWord) {
                // Use cached word
                chrome.storage.sync.set({ cachedWotdViews: cachedWotdViews + 1 });
                this.populateWordAndDefinition(cachedWotd, cachedDefinition, cachedAttribution, usingCachedWord);
            } else {
                // Fetch new word
                try {
                    const res = await fetch('https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/getWordOfTheDay');
                    const apiData = await res.json();
    
                    if (apiData && apiData.word && apiData.definitions && apiData.definitions.text) {
                        const word = apiData.word;
                        let definition = apiData.definitions.text.replace(/<[^>]+>/g, '');
                        const attribution = apiData.definitions.attributionText || '';
    
                        // Cache new word
                        chrome.storage.sync.set({
                            cachedWotd: word,
                            cachedDefinition: definition,
                            cachedAttribution: attribution,
                            cachedWotdViews: 1
                        });
    
                        this.populateWordAndDefinition(word, definition, attribution, false);
                    } else {
                        console.warn("No valid word or definition found in backend response.");
                    }
                } catch (error) {
                    console.error("Error fetching word of the day:", error);
                }
            }
        });
    },    
    populateWordAndDefinition: function(word, definition, attributionText, usingCachedWord) {
        const wordContainer = document.getElementById("wotd-word-container");
        const definitionContainer = document.getElementById("wotd-definition-container");
        const widgetContainer = document.getElementById("wotd-widget-container");
        const attributionContainer = document.getElementById("wotd-attribution-container");
        if (wordContainer) {
            wordContainer.innerText = word;
        }
        if (definitionContainer) {
            definitionContainer.innerText = definition;
        }
        if (attributionContainer && attributionText) {
            attributionContainer.innerText = attributionText;
        }
        chrome.storage.sync.get(['wotdX', 'wotdY'], (browserData) => {
            widgetContainer.style.left = `${browserData.wotdX}px`;
            widgetContainer.style.top = `${browserData.wotdY}px`;
        });
        widgetContainer.style.display = "block";
        if (!usingCachedWord) {
            widgetContainer.classList.add("wotd-loaded");
        } else {
            widgetContainer.style.transition = "none"; // skip fade in
            widgetContainer.style.opacity = "1"; // show immediately
        }
    }
};

window.wotdWidget = wotdWidget;
