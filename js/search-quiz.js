const searchQuizWidget = {
    id: "search-quiz",
    name: "Search History Quiz",
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
        // display the widget
        if (!widgetElement) return;

        chrome.storage.sync.get(['searchX', 'searchY'], (browserData) => {
            widgetElement.style.left = `${browserData.searchX}px`;
            widgetElement.style.top = `${browserData.searchY}px`;
            widgetElement.style.display = "block";
        });

        questionElement.innerHTML = `
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text skeleton-short"></div>
        `;
        
        chrome.storage.sync.get(['cachedQuiz', 'cachedQuizCount'], (data) => {
            const count = data.cachedQuizCount || 0;
            const cached = data.cachedQuiz;
        
            if (cached && count < 5) {
                chrome.storage.sync.set({ cachedQuizCount: count + 1 });
                this.displayQuiz(cached);
            } else {
                this.fetchSearchQuizQuestion().then(quiz => {
                    if (!quiz) {
                        questionElement.innerHTML = '';
                        widgetElement.innerText = "No quiz available.";
                        return;
                    }
                    chrome.storage.sync.set({ cachedQuiz: quiz, cachedQuizCount: 1 });
                    this.displayQuiz(quiz);
                });
            }
        });
    },
    displayQuiz: function(quiz) {
        const questionElement = document.getElementById('search-quiz-question');
        const searchQuizInput = document.getElementById('search-quiz-input');
        const submitButton = document.getElementById("search-quiz-submit-button");
    
        questionElement.innerHTML = '';
        questionElement.innerText = quiz.question;
        searchQuizInput.value = "";
        submitButton.onclick = () => this.submitAnswerAndReceiveFeedback(quiz.question, searchQuizInput.value.trim());
    },
    submitAnswerAndReceiveFeedback: async function(question, userAnswer) {
        if (!userAnswer) { return; }

        const feedbackElement = document.getElementById('search-quiz-feedback');
        //feedbackElement.innerText = "Evaluating...";
        feedbackElement.innerHTML = `<div class="skeleton skeleton-text skeleton-short"></div>`;
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
                feedbackElement.innerHTML = '';
                feedbackElement.innerText = "Error evaluating answer.";
                return;
            }

            const data = await response.json();
            feedbackElement.innerText = "> " + data.feedback;
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
        let maximumScore = -Infinity;
        let mostRelevantQuery = null;
        let relatedQueryId = null;
    
        for (let queryItem of allQueries) {
            const related = queryItem.relatedQueries || [];
            const relatedCount = related.length;
            const averageSimilarity = relatedCount === 0
                ? 0
                : related.reduce((sum, r) => sum + r.similarity, 0) / relatedCount;
    
            const popularityScore = Math.log(1 + relatedCount);
            const similarityScore = averageSimilarity;
    
            const lastTimeAsked = queryItem.lastTimeAsked || 0;
            const hoursSinceAsked = (Date.now() - lastTimeAsked) / (1000 * 60 * 60);
            const recencyScore = 1 / (1 + Math.exp(-0.1 * (hoursSinceAsked - 24))); // sigmoid around 24h
            const score =
                1.5 * popularityScore +
                3.0 * similarityScore +
                6.5 * recencyScore;
            if (score > maximumScore) {
                maximumScore = score;
                mostRelevantQuery = queryItem;
                if (relatedCount > 0) relatedQueryId = mostRelevantQuery.relatedQueries[0].similarQuery;
            }
        }
        if (!mostRelevantQuery) return null;

        mostRelevantQuery.lastTimeAsked = Date.now();
        await saveQuery(mostRelevantQuery);
        let appendRelatedQuery  = '';
        // lets append two queries together if they're somewhat similar
        if (relatedQueryId) {
            const relatedQueryObj = await getQueryById(relatedQueryId);
            appendRelatedQuery += " " + relatedQueryObj.query.title;
        }
        return mostRelevantQuery.query.title + appendRelatedQuery;
    }
};    

window.searchQuizWidget = searchQuizWidget;