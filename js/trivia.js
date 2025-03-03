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
    loadAndDisplayTriviaQuestion: function() {
        // Fetch user theme preference from the browser
        chrome.storage.sync.get(['triviaScore', 'triviaX', 'triviaY'], (browserData) => {
            let triviaScore = browserData.triviaScore || 0;

            // Fetch trivia from our backend API with one query param: user's current trivia score
            fetch(`https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/trivia?score=${triviaScore}`)
            .then(response => response.json())
            .then(apiData => {
                this.displayTriviaQuestion(apiData, browserData, triviaScore);
            })
            .catch(error => console.error('Error fetching trivia:', error));
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
