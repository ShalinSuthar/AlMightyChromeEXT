function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SearchDB', 2); // bump version to 2 for schema change

    request.onupgradeneeded = event => {
      const db = event.target.result;

      // Remove old 'queries' store
      if (db.objectStoreNames.contains('queries')) {
        db.deleteObjectStore('queries');
      }

      if (!db.objectStoreNames.contains('queriesByCategory')) {
        db.createObjectStore('queriesByCategory'); // key is category, value is array of query objects
      }
    };

    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => {
      console.error("Error opening IndexedDB:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function getQueriesByCategory(category) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queriesByCategory', 'readonly');
    const store = tx.objectStore('queriesByCategory');
    const request = store.get(category);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => {
      console.error("Failed to get category queries:", request.error);
      reject(request.error);
    };
  });
}

async function saveQueryToCategory(category, queryObj) {
  const db = await getDB();
  return new Promise(async (resolve, reject) => {
    const tx = db.transaction('queriesByCategory', 'readwrite');
    const store = tx.objectStore('queriesByCategory');

    // fetch existing query "bucket"
    const existing = await new Promise((resolve, reject) => {
      const request = store.get(category);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    const exists = existing.some(q => q.hash === queryObj.hash);

    if (!exists) {
      existing.push(queryObj);
      const request = store.put(existing, category);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error("Failed to save query to category:", request.error);
        reject(request.error);
      };
    } else {
      resolve(); // no-op if already exists
    }
  });
}

async function getAllCategories() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queriesByCategory', 'readonly');
    const store = tx.objectStore('queriesByCategory');
    const request = store.getAllKeys();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error("Failed to get all category keys:", request.error);
      reject(request.error);
    };
  });
}

globalThis.getDB = getDB;
globalThis.getQueriesByCategory = getQueriesByCategory;
globalThis.saveQueryToCategory = saveQueryToCategory;
globalThis.getAllCategories = getAllCategories;