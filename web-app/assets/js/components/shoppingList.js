export function renderShoppingList() {
  return `
    <section class="tab-panel app-section" id="shopping-list">
      <div class="section-head">
        <h2>Shopping List</h2>
        <p>Upgrade suggestions collected from generated outfits. Export-ready plain list included.</p>
      </div>
      <div id="shopping-list-items" class="shopping-list-items"></div>
      <textarea id="shopping-export" readonly placeholder="Your export list will appear here"></textarea>
    </section>
  `;
}

export function initShoppingList(state) {
  const listEl   = document.querySelector("#shopping-list-items");
  const exportEl = document.querySelector("#shopping-export");

  function refresh() {
    const seen = new Set();
    state.shoppingList = state.savedLooks
      .map(look => look.upgrade)
      .filter(entry => {
        const key = `${entry.item}-${entry.store}-${entry.price}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    listEl.innerHTML = state.shoppingList.length
      ? state.shoppingList.map(s =>
          `<div class="shop-row"><strong>${s.item}</strong><span>${s.store}</span><span>${s.price}</span></div>`
        ).join("")
      : "<p class='empty-state'>No upgrades collected yet.</p>";

    exportEl.value = state.shoppingList.map(s => `${s.item} — ${s.store} — ${s.price}`).join("\n");
  }

  refresh();
  return { refresh };
}
