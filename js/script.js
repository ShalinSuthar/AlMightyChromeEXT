const quoteContainer = document.getElementById("quote-text");

const quotes = [
  "The best way to predict the future is to invent it.",
  "Do what you love, and you'll never work a day in your life.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "This is all a matrix. So relax and sleep!"
];

const writing_quotes = [
  "Start writing, no matter what. The water does not flow until the faucet is turned on.",
  "Get it down. Take chances. It may be bad, but it's the only way you can do anything really good.",
  "You don't start out writing good stuff. You start out writing crap and thinking it's good stuff, and then gradually you get better at it.",
  "Start before you're ready."
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
quoteContainer.textContent = randomQuote;