const CATEGORY_ORDER = ["Tops", "Bottoms", "Outerwear", "Footwear", "Accessories", "Statement", "Other"];

import { saveRefineList } from "../state.js";

export function renderShoppingList() {
  return `
    <section class="tab-panel app-section" id="shopping-list">
      <div class="wardrobe-hero">
        <p class="wardrobe-kicker">Wishlist</p>
        <h1 class="wardrobe-title">Shopping <em>List</em></h1>
        <p class="wardrobe-subtitle" style="font-size:18px;margin-top:4px;">Pieces to complete the picture</p>
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
          <p class="shop-category-label">${cat}</p>
          <div class="shop-tile-grid">
            ${groups[cat].map(s => `
              <article class="shop-tile">
                <button class="shop-tile-delete" data-idx="${items.indexOf(s)}" type="button" aria-label="Remove">✕</button>
                <h3 class="shop-tile-name">${s.item}</h3>
                <p class="shop-tile-meta">${[s.brand, s.price_range].filter(Boolean).join(" · ")}</p>
                <button class="shop-tile-expand" data-idx="${items.indexOf(s)}" type="button">Details</button>
                <a class="shop-link" href="${s.searchUrl}" target="_blank" rel="noopener">Shop →</a>
                <div class="shop-tile-desc">
                  ${s.why    ? `<p>${s.why}</p>`        : ""}
                  ${s.pairs_with ? `<p class="shop-tile-pairs">${s.pairs_with}</p>` : ""}
                </div>
              </article>`).join("")}
          </div>
        </div>`).join("");
  }

  listEl.addEventListener("click", e => {
    const deleteBtn = e.target.closest(".shop-tile-delete");
    if (deleteBtn) {
      const idx = parseInt(deleteBtn.dataset.idx, 10);
      state.refineList.splice(idx, 1);
      saveRefineList(state.refineList);
      refresh();
      return;
    }

    const expandBtn = e.target.closest(".shop-tile-expand");
    if (expandBtn) {
      expandBtn.closest(".shop-tile").classList.toggle("is-open");
    }
  });

  refresh();
  return { refresh };
}
