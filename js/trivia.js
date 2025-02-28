// trivia widget renders trivia questions
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
      // fetch user theme preference from the browser
      chrome.storage.sync.get(['triviaScore', 'triviaX', 'triviaY'], (browserData) => {
        let triviaScore = browserData.triviaScore || 0;
        // fetch trivia from our backend API with one query param: user's current trivia score
        fetch(`https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/trivia?score=${triviaScore}`)
        .then(response => response.json())
        .then(apiData => {
            this.displayTriviaQuestion(apiData, browserData, triviaScore);

        })
        .catch(error => console.error('Error fetching trivia:', error));
      });
    },
    displayTriviaQuestion: function(apiData, browserData, triviaScore) {
        // get elements from HTML
        const widgetElement = document.getElementById('trivia-container');
        const questionElement = document.getElementById('trivia-question');
        const optionsContainer = document.getElementById('trivia-options-container');
        const scoreElement = document.getElementById('trivia-score');
        const triviaContainer = document.getElementById('trivia-container');

        // render widget according to its last saved position
        let triviaX = browserData.triviaX;
        let triviaY = browserData.triviaY;
        triviaContainer.style.left = `${triviaX}px`;
        triviaContainer.style.top = `${triviaY}px`;
    
        questionElement.textContent = apiData.question;
        // clear any previous options appended to the container
        optionsContainer.innerHTML = "";

        // display user score
        scoreElement.textContent = `Score: ${triviaScore}`;

        // change color based on difficulty
        triviaContainer.className = '';
        triviaContainer.classList.add(apiData.difficulty);

        // iterate through options JSON object
        Object.entries(apiData.options).forEach(([key, value]) => {
            const optionButton = document.createElement('button');
            optionButton.textContent = `${key}. ${value}`;
            optionButton.classList.add('trivia-button');
            optionButton.addEventListener("click", () => {
                // e.g., if "b" equals "b", then correct
                this.handleAnswer(key, apiData.answer, triviaScore, optionButton);
                optionButton.classList.add(selectedOption === correctAnswer ? 'correct' : 'wrong');
            });
            optionsContainer.appendChild(optionButton);
        });
        widgetElement.style.display = "block";
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
}
  
window.triviaWidget = triviaWidget;