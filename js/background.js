importScripts('./knowledge-graph/add-to-graph.js', './knowledge-graph/db-operations.js');

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed!');
    syncHistoryQueries().then(res => {
      console.log("Synced queries:", res);
    });
});

/**
 * Update storage every day
 */
// chrome.alarms.create('updateSearchDB', {
//   periodInMinutes: 120 
// });

// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === 'updateSearchDB') {
//     try {
//       syncHistoryQueries();
//     } catch (e) {
//       console.error("Failed during async store:", e);
//     }
//   }
// });
// syncHistoryQueries();
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   if (msg === "runHistoryUpdate") {
//     syncHistoryQueries().then(() => {
//       sendResponse("Done");
//     });
//     return true; // Required to allow async sendResponse
//   }
// });

