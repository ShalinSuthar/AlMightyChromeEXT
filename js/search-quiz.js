const searchQuizWidget = {
    id: "search-quiz",
    name: "Search Quiz",
    
    render: function() {
        console.log("Rendering");
        this.displaySearchQuizQuestion();
    },

    hide: function() {
        const widgetElement = document.getElementById('search-quiz-container');
        if (widgetElement) {
            widgetElement.style.display = "none";
        }
    },

    displaySearchQuizQuestion: function() {
        const widgetElement = document.getElementById('search-quiz-container');
        const optionsContainer = document.getElementById('search-quiz-options-container');
        const questionElement = document.getElementById('search-quiz-question');
        if (!widgetElement) return;
        
        this.fetchSearchQuizQuestion().then(quiz => {
            console.log();
            if (!quiz) {
                widgetElement.innerText = "<p>No quiz available.</p>";
                return;
            }
            
            // Display question
            questionElement.innerText = quiz.question;
            
            quiz.options.forEach(option => {
                console.log(option);
                const button = document.createElement("button");
                button.innerText = option;
                button.onclick = () => this.handleSearchQuizQuestionAnswer(option, quiz.answer);
                button.classList.add("search-quiz-button");
                optionsContainer.appendChild(button);
            });

            widgetElement.style.display = "block";
        });
    },
    fetchSearchQuizQuestion: async function() {
        try {
            const searchQuery = await this.getMostRelevantSearch();
            console.log(searchQuery);
            if (!searchQuery) return null;
    
            console.log("Sending search query to backend:", searchQuery);
    
            const response = await fetch(`https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/getSearchQuiz?searchQuery=${encodeURIComponent(searchQuery)}`, {
                method: "GET",
            });
    
            if (!response.ok) {
                console.error("Lambda request failed:", response.statusText);
                return null;
            }
    
            const quiz = await response.json();
            return quiz; // Structured JSON: { question, options, answer }
        } catch (error) {
            console.error("Error fetching quiz from Lambda:", error);
            return null;
        }
    },
    getMostRelevantSearch: async function() {
        return new Promise(resolve => {
            const oneHourAgo = Date.now() - 1000 * 60 * 60;

            chrome.history.search({ text: "", maxResults: 5, startTime: oneHourAgo }, results => {
                const searches = results.map(entry => entry.title);
                console.log("Recent Searches:", searches);
                const learningKeywords = ["how to", "what is", "guide", "tutorial", "explain", "learning", "science", "history"];
                const relevantSearch = searches.find(search =>
                    learningKeywords.some(keyword => search.toLowerCase().includes(keyword))
                ) || searches[0];
                console.log("Selected search:", relevantSearch);
                resolve(relevantSearch);
            });
        });
    },
    handleSearchQuizQuestionAnswer: function(selectedOption, correctAnswer) {
        if (selectedOption === correctAnswer) {
            alert("Correct!");
        } else {
            alert("Wrong. Try again.");
        }
    }
};

window.searchQuizWidget = searchQuizWidget;