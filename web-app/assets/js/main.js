import { state } from "./state.js";
import { renderHeader } from "./components/header.js";
import { renderWardrobe, initWardrobe } from "./components/wardrobe.js";
import { renderGenerate, initGenerate } from "./components/generate.js";
import { renderStyleBoards, initStyleBoards } from "./components/styleBoards.js";
import { renderSavedLooks, initSavedLooks } from "./components/savedLooks.js";
import { renderShoppingList, initShoppingList } from "./components/shoppingList.js";
import { renderFooter } from "./components/footer.js";

// ── Mount ──────────────────────────────────────────────────────────
const app = document.querySelector("#app");
if (!app) throw new Error("#app mount element not found");

app.innerHTML = `
  ${renderHeader()}
  <main id="main-content" class="app-main">
    ${renderWardrobe()}
    ${renderGenerate()}
    ${renderStyleBoards()}
    ${renderSavedLooks()}
    ${renderShoppingList()}
  </main>
  ${renderFooter()}
`;

// ── Tab switching ──────────────────────────────────────────────────
function activateTab(tabId) {
  document.querySelectorAll(".top-nav-btn").forEach(btn =>
    btn.classList.toggle("is-active", btn.dataset.tab === tabId)
  );
  document.querySelectorAll(".tab-panel").forEach(panel =>
    panel.classList.toggle("tab-visible", panel.id === tabId)
  );
}

document.querySelectorAll(".top-nav-btn").forEach(btn =>
  btn.addEventListener("click", () => activateTab(btn.dataset.tab))
);

activateTab("wardrobe");

// ── Init modules ───────────────────────────────────────────────────
initWardrobe(state);
initStyleBoards(state);

const { update: updateSavedLooks } = initSavedLooks(state);
const { refresh: refreshShoppingList } = initShoppingList(state);

// Generate is wired to saved looks + shopping list via callback
initGenerate(state, {
  onSaveLook(look) {
    state.savedLooks.unshift(look);
    updateSavedLooks();
    refreshShoppingList();
  }
});
