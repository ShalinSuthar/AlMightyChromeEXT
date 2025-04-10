// filter to avoid storing irrelevant searches
function isLearningRelatedSearch(query, url) {
    const learningDomains = ["wikipedia", "medium.com", "stackexchange", "stackoverflow", "blog"];
    const learningKeywords = ["how", "why", "what", "tutorial", "guide", "explained", "when", "where", "who"];

    return learningDomains.some(domain => url.includes(domain)) ||
           learningKeywords.some(word => query.toLowerCase().includes(word));
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