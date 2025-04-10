chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  syncHistoryQueries().then(res => {
  });
});

chrome.tabs.onCreated.addListener(() => {
  syncHistoryQueries().then(res => {
  });
});