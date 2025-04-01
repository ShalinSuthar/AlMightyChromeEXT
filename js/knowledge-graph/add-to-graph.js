function tokenize(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
}
  
function buildVocabAndIDF(allTokenizedQueries) {
    const vocab = new Set();
    const idf = {};
    const N = allTokenizedQueries.length;

    allTokenizedQueries.forEach(tokens => {
        tokens.forEach(t => vocab.add(t));
    });

    const vocabArray = Array.from(vocab);
    vocabArray.forEach(term => {
        let docCount = 0;
        allTokenizedQueries.forEach(tokens => {
            if (tokens.includes(term)) docCount++;
        });
        idf[term] = Math.log(N / (1 + docCount));
    });

    return { vocab: vocabArray, idf };
}

function tfidfVector(tokens, vocab, idf) {
    const tf = {};
    tokens.forEach(t => tf[t] = (tf[t] || 0) + 1);
    return vocab.map(term => (tf[term] || 0) * (idf[term] || 0));
}
  

/**
 * This method adds a processed search query to a data structure stored on our user's browser
 * @param {*} query query search string
 */
async function groupBySimilarity(existingQueries, queryObject) {
    let mostSimilar = null;
    let maxSimilarity = 0.0;
  
    for (const existingQuery of existingQueries) {
      const similarityToQuery = cosineSimilarity(queryObject._vector, existingQuery._vector);
      if ((similarityToQuery > maxSimilarity) && queryObject.hash != existingQuery.hash) {
        maxSimilarity = similarityToQuery;
        mostSimilar = existingQuery;
      }
    }
    console.log("MAX sim: ", maxSimilarity);
    const SIMILARITY_THRESHOLD = 0.7;
    if (maxSimilarity >= SIMILARITY_THRESHOLD && mostSimilar) {
      const similarQueryObject = { similarQuery: queryObject.id, similarity: maxSimilarity };
      mostSimilar.relatedQueries.push(similarQueryObject);
      await saveQuery(mostSimilar);
    }
  }  

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

/**
 * Embed sentences for search query comparisons
 * @param {*} text 
 * @returns an embedding vector
 */
// async function computeSentenceEmbedding(text) {
//     try {
//       const response = await fetch("https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/getQueryEmbedding", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ text: text })
//       });
  
//       const embedding = await response.json();
//       return embedding;
//     } catch (error) {
//         console.error("Error fetching embedding from backend:", error);
//         return [];
//     }
// }

// find similarity
function cosineSimilarity(vecA, vecB) {
    // if something went wrong calculating embeddings, we'll default to a low-ish similarity
    console.log(vecA, vecB);
    if (!Array.isArray(vecA) || !Array.isArray(vecB) || !vecA || !vecB) {
        console.warn("Invalid vectors:", vecA, vecB);
        return 0.4;
    }
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitude = v => Math.sqrt(v.reduce((sum, a) => sum + a * a, 0));
    return dotProduct / (magnitude(vecA) * magnitude(vecB));
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

async function syncHistoryQueries() {
  const startTime = await getLastSyncTime();

  try {
      const results = await getHistoryEntries({ text: "", maxResults: 10, startTime });
      const filteredSearches = results
          .map(entry => ({ title: entry.title, url: entry.url }))
          .filter(search => isLearningRelatedSearch(search.title, search.url));

      const existingQueries = await getAllQueries();
      const existingHashes = new Set(existingQueries.map(q => q.hash));

      const newQueries = [];

      for (const search of filteredSearches) {
          const hash = await hashString(normalizeQueryForHash(search));
          if (existingHashes.has(hash)) {
              console.log("Ignoring duplicate:", search.title);
              continue;
          }

          const newQuery = {
              id: crypto.randomUUID(),
              query: search,
              hash,
              timestamp: Date.now(),
              lastTimeAsked: null,
              relatedQueries: []
          };

          newQueries.push(newQuery);
          existingQueries.push(newQuery);
          existingHashes.add(hash);
      }

      // Rebuild vocab + IDF from all query tokens
      const allTokenized = existingQueries.map(q => tokenize(q.query.title));
      const { vocab, idf } = buildVocabAndIDF(allTokenized);

      // Recompute all vectors
      const allVectors = allTokenized.map(tokens => tfidfVector(tokens, vocab, idf));
      existingQueries.forEach((q, i) => q._vector = allVectors[i]); // _vector is temporary, not saved

      // Group and save only new queries
      for (const newQuery of newQueries) {
          await groupBySimilarity(existingQueries, newQuery);
          await saveQuery(newQuery); // Save metadata only
      }

      await updateLastSyncTime();
      return existingQueries;

  } catch (error) {
      console.error("Error syncing history entries:", error);
      return [];
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
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  