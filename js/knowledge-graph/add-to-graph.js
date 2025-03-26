/**
 * This method adds a processed search query to a data structure stored on our user's browser
 * @param {*} query query search string
 */
async function addToJSONStructureAsync(query) {
    const sentenceEmbedding = await computeSentenceEmbedding(query);
    const result = await getAllQueries();
    let searchQueries = result || [];

    let mostSimilar = null;
    let maxSimilarity = 0.0;
    for (const previousQuery of searchQueries) {
        const similarityToQuery = cosineSimilarity(sentenceEmbedding, previousQuery.sentenceEmbedding);
        if (similarityToQuery > maxSimilarity) {
            maxSimilarity = similarityToQuery;
            mostSimilar = previousQuery;
        }
    }

    // create a new query object
    const newQueryObject = {
        id: crypto.randomUUID(),
        query,
        timestamp: Date.now(),
        sentenceEmbedding,
        lastTimeAsked: null,
        relatedQueries: []
    };

    const SIMILARITY_THRESHOLD = 0.7;
    if (maxSimilarity >= SIMILARITY_THRESHOLD) {
        const similarQueryObject = { similarQuery: newQueryObject, similarity: maxSimilarity }
        mostSimilar.relatedQueries.push(similarQueryObject);
        await saveQuery(mostSimilar);
    }
    await saveQuery(newQueryObject);
}

// filter to avoid storing irrelevant searches
function isLearningRelatedSearch(query, url) {
    const learningDomains = ["wikipedia", "medium.com", "stackexchange", "stackoverflow"];
    const learningKeywords = ["how", "why", "what", "tutorial", "guide", "explained", "when"];

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
async function computeSentenceEmbedding(text) {
    try {
      const response = await fetch("https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/getQueryEmbedding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text })
      });
  
      const embedding = await response.json();
      return embedding;
    } catch (error) {
      console.error("Error fetching embedding from backend:", error);
      return [];
    }
}

// find similarity
function cosineSimilarity(vecA, vecB) {
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

// this doesn't work. need to fix (should probably only run this once per day)
async function syncHistoryQueries() {
    const oneWeekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const learningKeywords = ["how to", "what is", "guide", "tutorial", "explain", "learning", "science", "wiki"];

    try {
        const results = await getHistoryEntries({ text: "", maxResults: 20, startTime: oneWeekAgo });
        const existingQueries = await getAllQueries();
        // Extract the title for each history entry
        const searches = results.map(entry => entry.title);

        // Filter the searches to only include those with one of the learning keywords (case insensitive)
        const filteredSearches = searches.filter(search => 
            learningKeywords.some(keyword => search.toLowerCase().includes(keyword))
        );

        // Process each filtered search entry
        for (const search of filteredSearches) {
            for (const existingQuery of existingQueries) {
                // avoid duplicates
                if (search === existingQuery.query) break;
                const embedding = await computeSentenceEmbedding(search);
                const newQueryObject = {
                    id: crypto.randomUUID(),
                    search,
                    timestamp: Date.now(),
                    embedding,
                    lastTimeAsked: null,
                    relatedQueries: []
                };
                await saveQuery(newQueryObject);
            }
        }
    } catch (error) {
        console.error("Error fetching history entries:", error);
    }
}
  