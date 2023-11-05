var items = {
  // (A) HTML ITEMS LIST
  list : async (toggle) => {
    // (A1) GET ALL ITEMS
    let all = await invDB.tx("getAll", "Items"),
        hList = document.getElementById("itemList");

    // (A2) DRAW HTML LIST
    hList.innerHTML = "";
    if (all.length==0) {
      hList.innerHTML = "<div class='row'><div class='grow'>No items found</div></div>";
    } else { for (let i of all) {
      let row = document.createElement("div");
      row.className = "row flex";
      row.innerHTML =
      `<div class="grow">
        <div class="bold">[${i["sku"]}] ${i["name"]}</div>
        Qty: ${i["qty"]}
      </div>
      <input type="button" value="&#x2716;" onclick="items.del('${i["sku"]}')">
      <input type="button" value="&#x270E;" onclick="items.addEdit('${i["sku"]}')">
      <input type="button" value="&#8634;" onclick="move.list('${i["sku"]}')">`;
      hList.appendChild(row);
    }}
    if (toggle) { inv.pg("A"); }
  },

  // (B) DELETE ITEM
  del : async (sku) => { if (confirm("Delete item?")) {
    await invDB.tx("del", "Movement", IDBKeyRange.bound([sku, 0], [sku, Date.now()]));
    await invDB.tx("del", "Items", sku);
    items.list(true);
  }},

  // (C) ADD/EDIT ITEM
  addEdit : async (sku) => {
    // (C1) RESET FORM
    document.getElementById("pgB").reset();
    document.getElementById("itemOSKU").value = "";

    // (C2) EDIT MODE
    if (typeof sku == "string") {
      let item = await invDB.tx("get", "Items", sku);
      document.getElementById("itemOSKU").value = sku;
      document.getElementById("itemSKU").value = item.sku;
      document.getElementById("itemName").value = item.name;
    }

    // (C3) SWITCH PAGE
    inv.pg("B");
  },

  // (D) SAVE ITEM
  save : async () => {
    // (D1) GET DATA FROM HTML FORM
    let osku = document.getElementById("itemOSKU").value,
    data = {
      sku : document.getElementById("itemSKU").value,
      name : document.getElementById("itemName").value,
      qty : 0
    };

    // (D2) ADD NEW ITEM
    if (osku=="") {
      // (D2-1) CHECK IF ALREADY EXIST
      if (await invDB.tx("get", "Items", data["sku"]) !== undefined) {
        alert(`${data["sku"]} is already registered!`);
        return;
      }

      // (D2-2) SAVE
      await invDB.tx("put", "Items", data);
      items.list(true);
    }

    // (D3) UPDATE ITEM
    else {
      // (D3-1) GET ITEM
      let item = await invDB.tx("get", "Items", osku);
      data["qty"] = item["qty"];

      // (D3-2) JUST SAVE IF NOT CHANGING SKU
      if (osku==data["sku"]) {
        await invDB.tx("put", "Items", data);
        items.list(true);
      }

      // (D3-3) HEADACHE IF CHANGING SKU
      else {
        // (D3-3-1) CHECK IF NEW SKU ALREADY REGISTERED
        if (await invDB.tx("get", "Items", data["sku"]) !== undefined) {
          alert(`${data["sku"]} is already registered!`);
          return;
        }

        // (D3-3-2) ADD NEW SKU + DELETE OLD SKU
        invDB.tx("put", "Items", data);
        invDB.tx("del", "Items", osku);

        // (D3-3-3) "UPDATE" SKU OF ALL MOVEMENT WITH PUT-DEL
        let req = await invDB.tx("cursor", "Movement", IDBKeyRange.bound([osku, 0], [osku, Date.now()]));
        req.onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) {
            // ERROR - CANNOT DIRECTLY CHANGE KEY. THUS THE "DUMB" PUT-DELETE WAY.
            // cursor.update({ sku: NEW SKU }); 
            let entry = cursor.value;
            entry.sku = data["sku"];
            invDB.tx("put", "Movement", entry);
            cursor.delete();
            cursor.continue();
          } else { items.list(true); }
        };
      }
    }
  }
};