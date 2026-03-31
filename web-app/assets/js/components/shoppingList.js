const CATEGORY_ORDER = ["Tops", "Bottoms", "Outerwear", "Footwear", "Accessories", "Statement", "Other"];

import { saveRefineList } from "../state.js";

export function renderShoppingList() {
  return `
    <section class="tab-panel app-section" id="shopping-list">
      <div class="section-head">
        <h2>Shopping List</h2>
        <p>Stylist picks from Refine, organised by category.</p>
      </div>
      <div id="shopping-list-items" class="shopping-list-items"></div>
    </section>
  `;
}

export function initShoppingList(state) {
  const listEl = document.querySelector("#shopping-list-items");

  function refresh() {
    const items = state.refineList || [];

    if (!items.length) {
      listEl.innerHTML = "<p class='empty-state'>Run Refine to populate your shopping list.</p>";
      return;
    }

    // Group by category in canonical order
    const groups = {};
    CATEGORY_ORDER.forEach(cat => { groups[cat] = []; });
    items.forEach(item => {
      const cat = CATEGORY_ORDER.includes(item.category) ? item.category : "Other";
      groups[cat].push(item);
    });

    listEl.innerHTML = CATEGORY_ORDER
      .filter(cat => groups[cat].length)
      .map(cat => `
        <div class="shop-category">
          <h3 class="shop-category-label">${cat}</h3>
          ${groups[cat].map((s, i) => `
            <div class="shop-item" data-category="${cat}" data-index="${items.indexOf(s)}">
              <div class="shop-item-main">
                <div class="shop-item-left">
                  <span class="shop-item-name">${s.item}</span>
                  <span class="shop-item-meta">${[s.brand, s.price_range].filter(Boolean).join(" · ")}</span>
                </div>
                <div class="shop-item-actions">
                  <a class="shop-link" href="${s.searchUrl}" target="_blank" rel="noopener">Shop →</a>
                  <button class="shop-expand-btn" data-idx="${items.indexOf(s)}" type="button" aria-label="Show description">Details</button>
                  <button class="shop-delete-btn" data-idx="${items.indexOf(s)}" type="button" aria-label="Remove">✕</button>
                </div>
              </div>
              <div class="shop-item-desc">
                ${s.why ? `<p><span class="shop-desc-label">Why it matters</span>${s.why}</p>` : ""}
                ${s.pairs_with ? `<p><span class="shop-desc-label">Pairs with</span>${s.pairs_with}</p>` : ""}
              </div>
            </div>`).join("")}
        </div>`).join("");
  }

  listEl.addEventListener("click", e => {
    const deleteBtn = e.target.closest(".shop-delete-btn");
    if (deleteBtn) {
      const idx = parseInt(deleteBtn.dataset.idx, 10);
      state.refineList.splice(idx, 1);
      saveRefineList(state.refineList);
      refresh();
      return;
    }

    const expandBtn = e.target.closest(".shop-expand-btn");
    if (expandBtn) {
      const item = expandBtn.closest(".shop-item");
      item.classList.toggle("is-open");
    }
  });

  refresh();
  return { refresh };
}
