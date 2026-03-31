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

    const refineItems = state.refineList || [];
    const hasUpgrades = state.shoppingList.length > 0;
    const hasRefine   = refineItems.length > 0;

    if (!hasUpgrades && !hasRefine) {
      listEl.innerHTML = "<p class='empty-state'>No upgrades collected yet.</p>";
      exportEl.value = "";
      return;
    }

    listEl.innerHTML = [
      hasRefine ? `
        <p class="shop-section-label">Stylist Picks</p>
        ${refineItems.map(s => `
          <div class="shop-row">
            <strong>${s.item}</strong>
            <span class="shop-brand">${s.brand}</span>
            <span class="shop-price">${s.price_range}</span>
            <a class="shop-link" href="${s.searchUrl}" target="_blank" rel="noopener">Shop →</a>
          </div>`).join("")}` : "",
      hasUpgrades ? `
        <p class="shop-section-label">Outfit Upgrades</p>
        ${state.shoppingList.map(s =>
          `<div class="shop-row"><strong>${s.item}</strong><span>${s.store}</span><span>${s.price}</span></div>`
        ).join("")}` : ""
    ].join("");

    exportEl.value = [
      ...refineItems.map(s => `${s.item} — ${s.brand} — ${s.price_range} — ${s.searchUrl}`),
      ...state.shoppingList.map(s => `${s.item} — ${s.store} — ${s.price}`)
    ].join("\n");
  }

  refresh();
  return { refresh };
}
