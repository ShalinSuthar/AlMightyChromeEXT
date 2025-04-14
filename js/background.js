// this will fail when trying to minify. If we want to fix this during deployment,
// we need to port all dependent code into here. and also create a minified bundle with service worker code
// and a minified bundle with all other UI code
importScripts('knowledge-graph/add-to-graph.js', 'knowledge-graph/db-operations.js');

let lastSyncTimestamp = 0;
const SYNC_INTERVAL = 30000;

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  syncHistoryQueries().then(res => {
  });
});

chrome.tabs.onCreated.addListener(() => {
  const now = Date.now();
  if (now - lastSyncTimestamp >= SYNC_INTERVAL) {
    lastSyncTimestamp = now;
    syncHistoryQueries().catch(console.error);
  }
});