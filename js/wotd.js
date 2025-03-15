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
            // Get a random word
            const wordRes = await fetch('https://random-word-api.herokuapp.com/word');
            const [word] = await wordRes.json();
    
            // Fetch definition for the word
            const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = await dictRes.json();
    
            // Extract definition
            if (data && data.length > 0) {
                const definition = data[0].meanings[0].definitions[0].definition;
                console.log(`Word of the Day: ${word} - ${definition}`);
                this.populateWordAndDefinition(word, definition);
            } else {
                console.log("Definition not found. Trying again...");
                this.loadWordOfTheDay(); // Retry if no definition found
            }
        } catch (error) {
            console.error("Error fetching word of the day:", error);
            return null;
        }
    },
    populateWordAndDefinition: function(word, definition) {
        const wordContainer = document.getElementById("wotd-word-container");
        const definitionContainer = document.getElementById("wotd-definition-container");
        const widgetContainer = document.getElementById("wotd-widget-container");
        if (wordContainer) {
            wordContainer.innerText = word;
        }
        if (definitionContainer) {
            definitionContainer.innerText = definition;
        }
        widgetContainer.style.display = "block";
        widgetContainer.classList.add("wotd-loaded");
    }
};

window.wotdWidget = wotdWidget;
