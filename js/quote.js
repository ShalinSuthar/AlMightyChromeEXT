document.addEventListener('DOMContentLoaded', () => {
  const quoteContainer = document.getElementById("quote-text");

  loadAndDisplayQuote();

  // Listen for theme changes in storage
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.preferredTheme) {
      // Do a hard refresh of the page. This might affect other components in our extension. 
      // TODO: How can we call loadAndDisplayQuote() again and have the div "re-build" itself?
      location.reload();
    }
  });

  function loadAndDisplayQuote() {
    // fetch user theme preference
    chrome.storage.sync.get('preferredTheme', (data) => {
      let selectedTheme = data.preferredTheme || 'default';

      const default_quotes = [
        "The best way to predict the future is to invent it.",
        "Do what you love, and you'll never work a day in your life.",
        "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "This is all a matrix. So relax and sleep!"
      ];
    
      const writer_quotes = [
        "Start writing, no matter what. The water does not flow until the faucet is turned on.",
        "Get it down. Take chances. It may be bad, but it's the only way you can do anything really good.",
        "You don't start out writing good stuff. You start out writing crap and thinking it's good stuff, and then gradually you get better at it.",
        "Start before you're ready."
      ];
    
      const engineer_quotes = [
        "The way to succeed is to double your failure rate.",
        "I don't care that they stole my idea… I care that they don't have any of their own.",
        "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
        "When something is important enough, you do it even if the odds are not in your favor."
      ];
    
      const wanderer_quotes = [
        "I did not write half of what I saw, for I knew I would not be believed.",
        "To awaken quite alone in a strange town, is one of the pleasantest sensations in the world.",
        "I am doing this for many reasons, some of which I don't fully understand. That there is an inner urge is undeniable",
        "I will go anywhere, provided it be forward."
      ];
      
      let quotes = [];
      // Switch quote displayed based on user theme
      switch (selectedTheme) {
        case 'wanderer':
          quotes = wanderer_quotes;
          break;
        case 'writer':
          quotes = writer_quotes;
          break;
        case 'engineer':
          quotes = engineer_quotes;
          break;
        default:
          quotes = default_quotes;
          break;
      }
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      quoteContainer.textContent = randomQuote;
    });
  }
});