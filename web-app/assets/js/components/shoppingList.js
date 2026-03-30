export function renderShoppingList() {
  return `
    <section class="app-section" id="shopping-list">
      <div class="section-head">
        <h2>Shopping List</h2>
        <p>Upgrade suggestions collected from generated outfits. Export-ready plain list included.</p>
      </div>
      <div id="shopping-list-items" class="shopping-list-items"></div>
      <textarea id="shopping-export" readonly placeholder="Your export list will appear here"></textarea>
    </section>
  `;
}
