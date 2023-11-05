// (A) INDEXED DB
const IDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var invDB = {
  // (B) INITIALIZE DATABASE
  db : null,
  init : () => new Promise((resolve, reject) => {
    // (B1) OPEN INVENTORY DATABASE
    invDB.db = IDB.open("JSINV", 1);

    // (B2) CREATE INVENTORY DATABASE
    invDB.db.onupgradeneeded = e => {
      // (B2-1) INVENTORY DATABASE
      invDB.db = e.target.result;

      // (B2-2) ITEMS STORE
      let store = invDB.db.createObjectStore("Items", { keyPath: "sku" });
      store.createIndex("name", "name");

      // (B2-3) MOVEMENT STORE
      store = invDB.db.createObjectStore("Movement", { keyPath: ["sku", "date"] }),
      store.createIndex("direction", "direction");
    };

    // (B3) ON IDB OPEN
    invDB.db.onsuccess = e => {
      invDB.db = e.target.result;
      resolve(true);
    };

    // (B4) ON IDB ERROR
    invDB.db.onerror = e => reject(e.target.error);
  }),

  // (C) TRANSACTION "MULTI-TOOL"
  tx : (action, store, data) => new Promise((resolve, reject) => {
    // (C1) GET OBJECT STORE
    let req, tx = invDB.db.transaction(store, "readwrite").objectStore(store);

    // (C2) PROCESS ACTION
    switch (action) {
      // (C2-1) NADA
      default: reject("Invalid database action"); break;

      // (C2-2) PUT
      case "put":
        req = tx.put(data);
        req.onsuccess = e => resolve(true);
        break;

      // (C2-3) DELETE
      case "del":
        req = tx.delete(data);
        req.onsuccess = e => resolve(true);
        break;

      // (C2-4) GET
      case "get":
        req = tx.get(data);
        req.onsuccess = e => resolve(e.target.result);
        break;

      // (C2-5) GET ALL
      case "getAll":
        req = tx.getAll(data);
        req.onsuccess = e => resolve(e.target.result);
        break;

      // (C2-6) CURSOR
      case "cursor":
        resolve(tx.openCursor(data));
        break;
    }
    req.onerror = e => reject(e.target.error);
  })
};