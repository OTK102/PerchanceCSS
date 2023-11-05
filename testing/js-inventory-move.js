var move = {
  // (A) HTML ITEM MOVEMENT LIST
  list : async (sku) => {
    // (A1) "PRESET" MOVEMENT FORM
    document.getElementById("moveSKU").value = sku;
    document.getElementById("moveDirection").value = "I";
    document.getElementById("moveQty").value = 1;

    // (A2) GET MOVEMENT
    let all = await invDB.tx("getAll", "Movement", IDBKeyRange.bound([sku, 0], [sku, Date.now()])),
        hList = document.getElementById("moveList"),
        d = { "I" : "In", "O" : "Out", "T" : "Stock Take" };

    // (A3) DRAW MOVEMENT
    hList.innerHTML = "";
    if (all.length == 0) {
      hList.innerHTML = "<div class='row'><div class='grow'>No movement found</div></div>";
    } else { for (let m of all) {
      let row = document.createElement("div"),
          date = new Date(m["date"]).toString();
      row.className = "row flex";
      row.innerHTML =
      `<div class="grow">
         <strong>${d[m["direction"]]}</strong><br>${date}
       </div>
       <div class="moveQty">${m["qty"]}</div>`;
       hList.appendChild(row);
    }}
    inv.pg("C");
  },

  // (B) SAVE MOVEMENT
  save : async () => {
    // (B1) GET HTML FORM DATA
    let data = {
      sku: document.getElementById("moveSKU").value,
      direction: document.getElementById("moveDirection").value,
      qty: +document.getElementById("moveQty").value,
      date: Date.now()
    };

    // (B2) GET ITEM
    let item = await invDB.tx("get", "Items", data["sku"]);

    // (B3) UPDATE QUANTITY
    if (data["direction"] == "T") { item["qty"] = data["qty"]; }
    else if (data["direction"] == "I") { item["qty"] += data["qty"]; }
    else { item["qty"] -= data["qty"]; }
    if (item["qty"] < 0) { data["qty"] = 0; }
    await invDB.tx("put", "Items", item);

    // (B4) ADD MOVEMENT
    await invDB.tx("put", "Movement", data);

    // (B5) DONE
    move.list(data["sku"]);
    items.list()
  }
};