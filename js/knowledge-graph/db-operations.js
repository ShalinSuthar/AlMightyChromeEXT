// db.js
function getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SearchDB', 1);
  
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('queries')) {
          db.createObjectStore('queries', { keyPath: 'id' });
        }
      };
  
      request.onsuccess = event => {
        resolve(event.target.result);
      };
  
      request.onerror = event => {
        console.error("Error opening IndexedDB:", event.target.error);
        reject(event.target.error);
      };
    });
}
  

async function saveQuery(queryObj) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('queries', 'readwrite');
      const store = tx.objectStore('queries');
      const request = store.put(queryObj);
  
      request.onsuccess = () => {
        resolve();
      };
  
      request.onerror = () => {
        console.error("Failed to save query:", request.error);
        reject(request.error);
      };
    });
  }
  
async function getAllQueries() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('queries', 'readonly');
      const store = tx.objectStore('queries');
      const request = store.getAll();
  
      request.onsuccess = () => {
        resolve(request.result);
      };
  
      request.onerror = () => {
        console.error("Failed to get queries:", request.error);
        reject(request.error);
      };
    });
  }  