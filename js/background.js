import { addToJSONStructureAsync, extractQueryFromURL, isLearningRelatedSearch } from './knowledge-graph/add-to-graph.js';

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed!');
});

/**
 * On every user search, process their search and store it locally
 */
chrome.webNavigation.onCompleted.addListener(async ({ url }) => {
    const query = extractQueryFromURL(url);
    if (isLearningRelatedSearch(query, url)) {
        // setTimeout queues an additional event, extending the worker’s life for another cycle.
        // not needed necessarily, but makes sure that our async events aren't killed
        setTimeout(async () => {
            try {
              await addToJSONStructureAsync(query);
            } catch (e) {
              console.error("Failed during async store:", e);
            }
        }, 0);
    }
});
