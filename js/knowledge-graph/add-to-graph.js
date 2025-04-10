// filter to avoid storing irrelevant searches
function isLearningRelatedSearch(query, url) {
  if (!query || !url) return false;

  const queryLower = query.toLowerCase();
  const urlLower = url.toLowerCase();

  // add to this list as we see fit
  const learningDomains = [
    "wikipedia.org",
    "medium.com",
    "stackexchange.com",
    "stackoverflow.com",
    "quora.com",
    "khanacademy.org",
    "edx.org",
    "coursera.org",
    "github.com", // useful for code-related queries
    "docs.google.com", // docs people read
    "youtube.com/watch", // tutorial videos
    "reddit.com/r/explainlikeimfive",
    "cs50.harvard.edu"
  ];

  // stronger keyword filtering
  const learningKeywords = [
    // General questions
    "how to", "how do", "how does", "how can i", "how would", "how should", "how is", "how does one",
    "what is", "what are", "what does", "what's the difference", "what happens if", "what happens when",
    "why does", "why do", "why is", "why would", "why should", "why can't", "why isn't",
    "when does", "when should", "when is it okay", "when will", "when can i", "when to", "when is the best time",
    "where is", "where can i", "where do", "where should", "where does", "where can you", "where are",
    "who is", "who are", "who should", "who does", "who can", "who invented", "who discovered",
  
    // Action-based learning
    "how i learned", "how i fixed", "how i solved", "how i built", "how i made", "how to build", "how to make", "how to fix",
    "step by step", "step-by-step", "how it works", "how this works", "how works", "how they work", "how does it work",
    "how do i know", "how can you tell", "how to know", "how to tell", "how to check", "how to test",
  
    // Opinion + decision support
    "should i", "is it okay", "is it better", "is it safe", "do i need to", "do you need to", "am i supposed to", "can i use",
    "best way to", "easiest way to", "fastest way to", "most efficient way to", "whats the best", "whats a good",
  
    // Conceptual/deep dive
    "difference between", "versus", "vs", "vs.", "compare", "comparison between", "pros and cons of", "advantages of", "disadvantages of",
    "explanation of", "explain", "explained", "explaining", "deep dive", "walkthrough", "rundown", "in detail",
  
    // Educational / technical
    "tutorial", "tutorials", "beginner's guide", "beginner guide", "guide", "cheat sheet", "cheatsheet", "reference sheet",
    "manual", "documentation", "docs", "docs for", "api reference", "intro to", "introduction to", "learning", "learn", "learned", "learns", "course",
    "class", "lecture", "study", "studying", "research paper", "white paper", "thesis", "case study",
  
    // Examples / use cases
    "example of", "examples of", "use case", "use cases", "how it's used", "how to use", "how people use",
  
    // Specific tech keywords
    "syntax", "semantics", "runtime", "compile", "code example", "code snippet", "debug", "debugging", "fix", "resolve", "issue", "error",
    "stack trace", "exception", "segfault", "null pointer", "timeout", "latency", "throughput", "bandwidth",
  
    // Generic catch-alls (less precise, but signal intent)
    "how", "why", "what", "when", "where", "who", "explain", "understanding", "understand", "intro", "beginner"
  ];
  

  // filter out obvious non-learning noise
  const nonLearningKeywords = [
    "facebook", "instagram", "twitter", "pinterest", "netflix", "espn", "spotify", "tiktok",
    "login", "sign in", "buy", "amazon.com", "nike.com", "weather", "map", "ubereats"
  ];

  // URL/domain match
  const matchesDomain = learningDomains.some(domain => urlLower.includes(domain));

  // Keyword match
  const matchesQuery = learningKeywords.some(keyword => queryLower.includes(keyword));

  // Filter out common distractions / noise
  const isNoise = nonLearningKeywords.some(keyword => urlLower.includes(keyword) || queryLower.includes(keyword));

  return (matchesDomain || matchesQuery) && !isNoise;
}

// utility to extract query from URL
function extractQueryFromURL(url) {
    try {
        const u = new URL(url);
        const queryParam = u.searchParams.get('q') || u.searchParams.get('query') || '';
        return decodeURIComponent(queryParam.replace(/\+/g, ' '));
    } catch (e) {
        return '';
    }
}

async function getHistoryEntries(options) {
    return new Promise((resolve, reject) => {
        chrome.history.search(options, results => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(results);
        });
    });
}

async function fetchCategoryFromAPI(queryText) {
    try {
      const res = await fetch("https://ey1pypm4f7.execute-api.us-east-1.amazonaws.com/classifyQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
  
      const data = await res.json();
      return data.category || "Uncategorized";
    } catch (err) {
      console.error("Failed to fetch category", err);
      return "Uncategorized";
    }
}  

async function syncHistoryQueries() {
    const startTime = await getLastSyncTime();
  
    try {
      const results = await getHistoryEntries({ text: "", maxResults: 10, startTime });
      const filteredSearches = results
        .map(entry => ({ title: entry.title, url: entry.url }))
        .filter(search => isLearningRelatedSearch(search.title, search.url));
  
      for (const search of filteredSearches) {
        const hash = await hashString(normalizeQueryForHash(search));
  
        const newQuery = {
          id: crypto.randomUUID(),
          query: search,
          hash,
          timestamp: Date.now(),
          lastTimeAsked: null
        };
  
        const category = await fetchCategoryFromAPI(search.title);
  
        // Save to category if not already present
        await saveQueryToCategory(category, newQuery);
      }
  
      await updateLastSyncTime();
    } catch (error) {
      console.error("Error syncing history entries:", error);
    }
}  


async function getLastSyncTime() {
    const TWO_DAYS_AGO = Date.now() - 2 * 24 * 60 * 60 * 1000;
    return new Promise(resolve => {
      chrome.storage.local.get(['lastHistorySync'], result => {
        resolve(result.lastHistorySync || TWO_DAYS_AGO); // fallback to two days ago
      });
    });
}

async function updateLastSyncTime() {
    const now = Date.now();
    chrome.storage.local.set({ lastHistorySync: now });
}


function normalizeQueryForHash(query) {
    const title = query.title.trim().toLowerCase();
    const url = new URL(query.url);
    url.search = ''; // Remove query params (UTM tracking, etc.)
    return `${title}::${url.origin}${url.pathname}`;
}

async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}
globalThis.syncHistoryQueries = syncHistoryQueries;