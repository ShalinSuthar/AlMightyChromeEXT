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
        const questionElement = document.getElementById('search-quiz-question');
        const searchQuizInput = document.getElementById('search-quiz-input');
        const submitButton = document.getElementById("search-quiz-submit-button");

        if (!widgetElement) return;
        
        this.fetchSearchQuizQuestion().then(quiz => {
            if (!quiz) {
                widgetElement.innerText = "<p>No quiz available.</p>";
                return;
            }
            
            // Display question
            questionElement.innerText = quiz.question;

            // Reset input and feedback
            searchQuizInput.value = "";

            submitButton.onclick = () => this.submitAnswerAndReceiveFeedback(quiz.question, searchQuizInput.value.trim());
            // display the widget
            widgetElement.style.display = "block";
        });
    },
    submitAnswerAndReceiveFeedback: async function(question, userAnswer) {
        if (!userAnswer) { return; }

        const feedbackElement = document.getElementById('search-quiz-feedback');
        feedbackElement.innerText = "Evaluating...";
        console.log(JSON.stringify({ "question": question, "answer": userAnswer }));
        if (!question || !userAnswer) {
            console.error("Missing question or userAnswer. Aborting request.");
            return;
        }
        
        try {
            const response = await fetch("https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/getSearchQuizAnswer", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: question, answer: userAnswer }),
            });

            if (!response.ok) {
                feedbackElement.innerText = "Error evaluating answer.";
                return;
            }

            const data = await response.json();
            console.log(data);
            feedbackElement.innerText = data.feedback;
        } catch (error) {
            console.error("Error fetching feedback:", error);
            feedbackElement.innerText = "Error fetching feedback.";
        }
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
            return quiz;
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
    }
};

window.searchQuizWidget = searchQuizWidget;