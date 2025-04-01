const searchQuizWidget = {
    id: "search-quiz",
    name: "Search Quiz",
    render: function() {
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
                widgetElement.innerText = "No quiz available.";
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
            feedbackElement.innerText = data.feedback;
        } catch (error) {
            console.error("Error fetching feedback:", error);
            feedbackElement.innerText = "Error fetching feedback.";
        }
    },
    fetchSearchQuizQuestion: async function() {
        try {
            const searchQuery = await this.getMostRelevantSearch();
            if (!searchQuery) return null;
        
            const response = await fetch(`https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/getSearchQuiz?searchQuery=${encodeURIComponent(searchQuery)}`, {
                method: "GET",
            });
    
            if (!response.ok) {
                console.error("Request failed:", response.statusText);
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
        const allQueries = await getAllQueries();
        /**
         * score = length of related array + avg(strength of similarities) + (Now - lastTimeAsked)
         */
        let maximumScore = 0.0;
        let mostRelevantQuery = null;
        for (let queryItem of allQueries) {
            const numberRelated = queryItem.relatedQueries.length;
            const averageStrength = queryItem.relatedQueries.reduce((sum, a) => sum + a, 0) / numberRelated;
            const lastTimeAsked = queryItem.lastTimeAsked || Date.now();
            const timeElapsedSinceLastAsked = Date.now() - lastTimeAsked;
            const queryScore = numberRelated + averageStrength + timeElapsedSinceLastAsked/10000;
            if (queryScore > maximumScore) {
                maximumScore = queryScore;
                mostRelevantQuery = queryItem;
            }
        }
        if (!mostRelevantQuery) return null;
        mostRelevantQuery.lastTimeAsked = Date.now();
        await saveQuery(mostRelevantQuery);
        return mostRelevantQuery.query;
    }
};

window.searchQuizWidget = searchQuizWidget;