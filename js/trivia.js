const triviaWidget = {
    id: "trivia",
    name: "Trivia",
    render: function() {
        this.loadAndDisplayTriviaQuestion();
    },
    hide: function() {
        const widgetElement = document.getElementById('trivia-container');
        if (widgetElement) {
            widgetElement.style.display = "none";
        }
    },
    mapScoreToDifficulty: function(score) {
        if (score <= 30) return "easy";
        if (score <= 60) return "medium";
        if (score <= 100) return "hard";
        if (score <= 150) return "challenging";
        if (score <= 200) return "preposterous";
        if (score <= 250) return "impossible";
        if (score <= 300) return "genius";
        return "easy";
    },
    loadAndDisplayTriviaQuestion: function() {
        chrome.storage.sync.get(['triviaScore', 'triviaX', 'triviaY'], (browserData) => {
            const triviaScore = browserData.triviaScore || 0;
            const difficulty = this.mapScoreToDifficulty(triviaScore);
    
            fetch('https://doa508wm14jjw.cloudfront.net/trivia.json')
                .then(response => response.json())
                .then(allTrivia => {
                    let filteredTrivia = difficulty
                        ? allTrivia.filter(t => t.difficulty.toLowerCase() === difficulty.toLowerCase())
                        : allTrivia;
    
                    if (filteredTrivia.length === 0) {
                        console.warn(`No trivia found for difficulty: ${difficulty}, falling back to "easy"`);
                        filteredTrivia = allTrivia.filter(t => t.difficulty.toLowerCase() === "easy");
                    }
    
                    const randomQuestion = filteredTrivia[Math.floor(Math.random() * filteredTrivia.length)];
                    this.displayTriviaQuestion(randomQuestion, browserData, triviaScore);
                })
                .catch(error => {
                    console.error('Error fetching trivia:', error);
                    const container = document.getElementById('trivia-options-container');
                    if (container) {
                        container.innerHTML = "<p>Unable to load trivia. Try again later.</p>";
                    }
                });
        });
    },
    displayTriviaQuestion: function(apiData, browserData, triviaScore) {
        const widgetElement = document.getElementById('trivia-container');
        const questionElement = document.getElementById('trivia-question');
        const optionsContainer = document.getElementById('trivia-options-container');
        const scoreElement = document.getElementById('trivia-score');
        const difficultyElement = document.getElementById('trivia-difficulty');

        let triviaX = browserData.triviaX;
        let triviaY = browserData.triviaY;
        widgetElement.style.left = `${triviaX}px`;
        widgetElement.style.top = `${triviaY}px`;

        questionElement.textContent = apiData.question;
        optionsContainer.innerHTML = "";

        // Set Score and Difficulty
        scoreElement.textContent = `Score: ${triviaScore}`;
        difficultyElement.textContent = `Current Difficulty: ${apiData.difficulty}`;
        widgetElement.className = `${apiData.difficulty.toLowerCase()}`;

        widgetElement.style.display = "block";

        Object.entries(apiData.options).forEach(([key, value]) => {
            const optionButton = document.createElement('button');
            optionButton.textContent = `${key}. ${value}`;
            optionButton.classList.add('trivia-button');
            optionButton.addEventListener("click", () => {
                this.handleAnswer(key, apiData.answer, triviaScore, optionButton);
            });
            optionsContainer.appendChild(optionButton);
        });
    },
    handleAnswer: function(selectedOption, correctAnswer, triviaScore, optionButton) {
        const isCorrect = selectedOption === correctAnswer;
        optionButton.classList.add(isCorrect ? 'correct' : 'wrong');
        triviaScore = isCorrect ? triviaScore + 1 : triviaScore - 1;

        const allButtons = document.querySelectorAll('.trivia-button');
        allButtons.forEach(btn => btn.disabled = true);

        setTimeout(() => {
            chrome.storage.sync.set({ triviaScore: triviaScore }, () => {
                this.loadAndDisplayTriviaQuestion();
            });
        }, 250);
    }
};

window.triviaWidget = triviaWidget;
