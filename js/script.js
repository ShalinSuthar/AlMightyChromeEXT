const quoteContainer = document.getElementById("quote-text");

const quotes = [
  "The best way to predict the future is to invent it.",
  "Do what you love, and you’ll never work a day in your life.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "This is all matrix. So relax and sleep!"
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
quoteContainer.textContent = randomQuote;