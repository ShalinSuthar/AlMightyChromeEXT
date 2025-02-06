// trivia widget renders trivia questions
const triviaWidget = {
    id: "trivia",
    name: "Trivia",
    render: function() {
      this.loadAndDisplayTriviaQuestion();
    },
    loadAndDisplayTriviaQuestion: function() {
      // fetch user theme preference
      chrome.storage.sync.get('triviaScore', (data) => {
        let triviaScore = data.triviaScore || 0;
        // fetch trivia from our backend API with one query param: user's current trivia score
        fetch(`https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/trivia?score=${triviaScore}`)
        .then(response => response.json())
        .then(data => {
            this.displayTriviaQuestion(data, triviaScore);

        })
        .catch(error => console.error('Error fetching trivia:', error));
      });
    },
    displayTriviaQuestion: function(data, triviaScore) {
        // get elements from HTML
        const questionElement = document.getElementById('trivia-question');
        const optionsContainer = document.getElementById('trivia-options-container');

        questionElement.textContent = data.question;
        // clear any previous options appended to the container
        optionsContainer.innerHTML = "";

        // iterate through options JSON object
        Object.entries(data.options).forEach(([key, value]) => {
            const optionButton = document.createElement('button');
            optionButton.textContent = `${key}. ${value}`;
            optionButton.classList.add("trivia-button");
            optionButton.addEventListener("click", () => {
                // e.g., if "b" equals "b", then correct
                this.handleAnswer(key, data.answer, triviaScore);
            });
            optionsContainer.appendChild(optionButton);
        });
    },
    handleAnswer: function(selectedOption, correctAnswer, triviaScore) {
        triviaScore = (selectedOption === correctAnswer) ? triviaScore + 1 : triviaScore - 1;

        chrome.storage.sync.set({ triviaScore: triviaScore }, () => {
            this.loadAndDisplayTriviaQuestion();
        });
    }
}
  
window.triviaWidget = triviaWidget;