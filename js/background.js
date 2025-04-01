importScripts('./knowledge-graph/add-to-graph.js', './knowledge-graph/db-operations.js');

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  syncHistoryQueries().then(res => {
    console.log("Synced queries");
  });
});

chrome.tabs.onCreated.addListener(() => {
  syncHistoryQueries().then(res => {
    console.log("Synced queries");
  });
});