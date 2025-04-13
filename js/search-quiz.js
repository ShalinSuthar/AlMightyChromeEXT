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

        if(questionElement){
            questionElement.innerHTML = `
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text skeleton-short"></div>
        `;
        }
        
        
        chrome.storage.sync.get(['cachedQuiz', 'cachedQuizCount'], (data) => {
            const count = data.cachedQuizCount || 0;
            const cached = data.cachedQuiz;
        
            if (cached && count < 1) {
                chrome.storage.sync.set({ cachedQuizCount: count + 1 });
                this.displayQuiz(cached);
            } else {
                this.fetchSearchQuizQuestion().then(quiz => {
                    if (!quiz) {
                        if(questionElement){
                          questionElement.innerHTML = '';
                          widgetElement.innerText = "No quiz available yet...";
                        }
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
    
        if(questionElement){
            questionElement.innerHTML = '';
            questionElement.innerText = quiz.question;
        }
        searchQuizInput.value = "";
        submitButton.onclick = () => this.displayFeedback(quiz.answer, searchQuizInput.value.trim(), searchQuizInput, submitButton);
    },
    displayFeedback: function(idealAnswer, userAnswer, searchQuizInput, submitButton) {
        const feedbackElement = document.getElementById('search-quiz-feedback');
        if (!userAnswer) {
            feedbackElement.innerText = "Please enter an answer.";
            return;
        }

        const truncated = idealAnswer.slice(0, 100);
        
        const needsToggle = idealAnswer.length > truncated.length;

        feedbackElement.innerHTML = `<div id="ideal-answer-text">${needsToggle ? truncated + '...' : idealAnswer}</div>
        ${needsToggle ? `<span id="toggle-answer-btn" class="toggle-answer-link">See more</span>` : ''}`;
    
        searchQuizInput.style.display = "none";
        submitButton.style.display = "none";

        if (needsToggle) {
            const toggleBtn = document.getElementById('toggle-answer-btn');
            let expanded = false;
            toggleBtn.onclick = () => {
                const answerText = document.getElementById('ideal-answer-text');
                expanded = !expanded;
                answerText.innerText = expanded ? idealAnswer : truncated + '...';
                toggleBtn.innerText = expanded ? "See less" : "See more";
            };
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
        const categories = await getAllCategories();
        if (categories.length === 0) return null;
    
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const queries = await getQueriesByCategory(randomCategory);
        if (!queries || queries.length === 0) return null;
    
        // Filter out very recently used queries
        const viable = queries.filter(q => {
            const hoursSince = q.lastTimeAsked
                ? (Date.now() - q.lastTimeAsked) / (1000 * 60 * 60)
                : Infinity;
            return hoursSince > 4;
        });
    
        const chosen = viable.length > 0
            ? viable[Math.floor(Math.random() * viable.length)]
            : queries[Math.floor(Math.random() * queries.length)];
    
        chosen.lastTimeAsked = Date.now();
        await saveQueryToCategory(randomCategory, chosen);
    
        return chosen.query.title;
    }
};    

window.searchQuizWidget = searchQuizWidget;