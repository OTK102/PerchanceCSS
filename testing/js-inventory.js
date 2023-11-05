var inv = {
  // (A) INITIALIZE APP
  init : async () => {
    // (A1) CHECK - INDEXED DATABASE SUPPORT
    if (!IDB) {
      alert("INDEXED DB IS NOT SUPPORTED ON THIS BROWSER!");
      return;
    }

    // (A2) CHECK - SERVICE WORKER SUPPORT
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("js-inventory-worker.js");
    } else {
      alert("SERVICE WORKER IS NOT SUPPORTED ON THIS BROWSER!");
      return;
    }

    // (A3) DATABASE + INTERFACE SETUP
    if (await invDB.init()) { items.list(true); }
    else {
      alert("ERROR OPENING INDEXED DB!");
      return;
    }
  },

  // (B) TOGGLE PAGE
  pg : p => { for (let i of ["A", "B", "C"]) {
    if (p==i) {
      document.getElementById("pg" + i).classList.remove("ninja");
    } else {
      document.getElementById("pg" + i).classList.add("ninja");
    }
  }},

  // (X) RUN THIS IF YOU WANT DUMMY DEMO DATA
  dummy : () => {
    invDB.tx("put", "Items", { sku: "ABC123", name: "Foo Bar", qty: 123 });
    invDB.tx("put", "Items", { sku: "BCD234", name: "Goo Bar", qty: 321 });
    invDB.tx("put", "Items", { sku: "CDE345", name: "Hoo Bar", qty: 231 });
    invDB.tx("put", "Items", { sku: "DEF456", name: "Joo Bar", qty: 213 });
    invDB.tx("put", "Items", { sku: "EFG567", name: "Koo Bar", qty: 312 });
    invDB.tx("put", "Movement", { sku: "ABC123", date: Date.now()-30000, direction: "T", qty: 123 });
    invDB.tx("put", "Movement", { sku: "ABC123", date: Date.now()-20000, direction: "O", qty: 23 });
    invDB.tx("put", "Movement", { sku: "ABC123", date: Date.now()-10000, direction: "O", qty: 32 });
    invDB.tx("put", "Movement", { sku: "ABC123", date: Date.now(), direction: "I", qty: 55 });
  }
};
window.addEventListener("DOMContentLoaded", inv.init);