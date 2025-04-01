const wotdWidget = {
    id: "wotd",
    name: "Word Of The Day",
    render: function() {
        this.loadWordOfTheDay();
    },
    hide: function() {
        const wotdElement = document.getElementById('wotd-widget-container');
        if (wotdElement) {
            wotdElement.style.display = "none";
        }
    },
    loadWordOfTheDay: async function() {
        try {
            const res = await fetch('https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/getWordOfTheDay');
            const data = await res.json();
            if (data && data.word && data.definitions && data.definitions.text) {
                const word = data.word;
                let definition = data.definitions.text;
                definition = definition.replace(/<[^>]+>/g, '');
                this.populateWordAndDefinition(word, definition, data.definitions.attributionText);
            } else {
                console.warn("No valid word or definition found in backend response.");
            }
        } catch (error) {
            console.error("Error fetching word of the day:", error);
        }
    },
    populateWordAndDefinition: function(word, definition, attributionText) {
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
        widgetContainer.classList.add("wotd-loaded");
    }
};

window.wotdWidget = wotdWidget;
