import { renderHeader } from "./components/header.js";
import { renderWardrobe } from "./components/wardrobe.js";
import { renderGenerate } from "./components/generate.js";
import { renderStyleBoards as renderStyleBoardsSection } from "./components/styleBoards.js";
import { renderSavedLooks } from "./components/savedLooks.js";
import { renderShoppingList } from "./components/shoppingList.js";
import { renderFooter } from "./components/footer.js";

const app = document.querySelector("#app");
if (!app) throw new Error("#app mount element not found");

app.innerHTML = `
  ${renderHeader()}
  <main id="main-content" class="app-main">
    ${renderWardrobe()}
    ${renderGenerate()}
    ${renderStyleBoardsSection()}
    ${renderSavedLooks()}
    ${renderShoppingList()}
  </main>
  ${renderFooter()}
`;

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// ── State ──────────────────────────────────────────────────────────
const state = {
  wardrobe: [
    {
      id: createId(), name: "Navy Slim Chinos", color: "Navy", brand: "H&M", category: "Bottoms", rating: 8, photo: "",
      description: "A reliable everyday bottom. The slim cut works with most tops and keeps the silhouette clean without effort."
    },
    {
      id: createId(), name: "White Oxford Shirt", color: "White", brand: "Uniqlo", category: "Tops", rating: 8.5, photo: "",
      description: "The foundational layer. Keep it slightly open at the collar and half-tucked for an effortless editorial look."
    },
    {
      id: createId(), name: "Grey Merino Knit", color: "Grey", brand: "COS", category: "Tops", rating: 9, photo: "",
      description: "Elevated basics at their best. The fine gauge merino reads luxurious while staying incredibly versatile across all seasons."
    },
    {
      id: createId(), name: "Black Derby Shoes", color: "Black", brand: "Clarks", category: "Footwear", rating: 8, photo: "",
      description: "The most versatile formal shoe you can own. Pairs equally well with tailoring or with a relaxed jean for contrast."
    }
  ],
  generated: [],
  savedLooks: [],
  shoppingList: [],
  styleBoards: [
    { id: createId(), title: "Quiet Luxury", theme: "neutral layers", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80" },
    { id: createId(), title: "Weekend Minimal", theme: "denim, knitwear", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80" }
  ],
  activeFilter: "all"
};

// ── Tab switching ──────────────────────────────────────────────────
function activateTab(tabId) {
  document.querySelectorAll(".top-nav-btn").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("tab-visible", panel.id === tabId);
  });
}

document.querySelectorAll(".top-nav-btn").forEach(btn => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

activateTab("wardrobe");

// ── Wardrobe ───────────────────────────────────────────────────────
const wardrobeGrid = document.querySelector("#wardrobe-grid");
const itemForm = document.querySelector("#item-form");
const addToggle = document.querySelector("#add-piece-toggle");
const addPanel = document.querySelector("#add-piece-panel");
const cancelAdd = document.querySelector("#cancel-add-piece");
const filterBar = document.querySelector("#filter-bar");
const photoFileInput = document.querySelector("#item-photo-file");
const photoPreview = document.querySelector("#photo-preview");

let pendingPhotoDataUrl = "";

function closeAddPanel() {
  addPanel.classList.add("hidden");
  addToggle.textContent = "+ Add piece";
  itemForm.reset();
  pendingPhotoDataUrl = "";
  photoPreview.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
    <span>Upload photo</span>`;
}

addToggle?.addEventListener("click", () => {
  const isOpen = !addPanel.classList.contains("hidden");
  if (isOpen) { closeAddPanel(); return; }
  addPanel.classList.remove("hidden");
  addToggle.textContent = "✕ Close";
});

cancelAdd?.addEventListener("click", closeAddPanel);

photoFileInput?.addEventListener("change", () => {
  const file = photoFileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingPhotoDataUrl = e.target.result;
    photoPreview.innerHTML = `<img src="${pendingPhotoDataUrl}" alt="Preview" />`;
  };
  reader.readAsDataURL(file);
});

function ratingLabel(r) {
  if (r >= 9) return "Excellent";
  if (r >= 7) return "Great";
  if (r >= 5) return "Good";
  return "Fair";
}

function ratingClass(r) {
  if (r >= 9) return "rating--excellent";
  if (r >= 7) return "rating--great";
  return "rating--good";
}

function renderWardrobeGrid() {
  const items =
    state.activeFilter === "all"
      ? state.wardrobe
      : state.wardrobe.filter(item => item.category === state.activeFilter);

  if (!items.length) {
    const label = state.activeFilter === "all" ? "items" : state.activeFilter.toLowerCase();
    wardrobeGrid.innerHTML = `<p class="empty-state">No ${label} in your wardrobe yet.</p>`;
    return;
  }

  wardrobeGrid.innerHTML = items
    .map(
      item => `
      <article class="wardrobe-card">
        <div class="wardrobe-photo">
          ${item.photo
            ? `<img src="${item.photo}" alt="${item.name}" loading="lazy" />`
            : `<div class="silhouette"></div>`}
        </div>
        <div class="wardrobe-meta">
          <p class="item-category">${item.category.toUpperCase()}</p>
          <h3 class="item-name">${item.name}</h3>
          <p class="item-brand">${[item.brand, item.color].filter(Boolean).join(" · ")}</p>
          <div class="item-rating-row">
            <span class="rating-badge ${ratingClass(item.rating)}">${item.rating}/10</span>
            <span class="rating-label">${ratingLabel(item.rating)}</span>
          </div>
          ${item.description ? `<p class="item-desc">${item.description}</p>` : ""}
        </div>
      </article>`
    )
    .join("");
}

filterBar?.addEventListener("click", e => {
  const pill = e.target.closest(".filter-pill");
  if (!pill) return;
  filterBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("is-active"));
  pill.classList.add("is-active");
  state.activeFilter = pill.dataset.filter;
  renderWardrobeGrid();
});

itemForm?.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(itemForm);
  const entry = {
    id: createId(),
    name: String(data.get("name") || "").trim(),
    color: String(data.get("color") || "").trim(),
    brand: String(data.get("brand") || "").trim(),
    category: String(data.get("category") || "").trim(),
    rating: parseFloat(data.get("rating")) || 7,
    photo: pendingPhotoDataUrl,
    description: String(data.get("description") || "").trim()
  };
  if (!entry.name || !entry.color || !entry.category) return;
  state.wardrobe.unshift(entry);
  closeAddPanel();
  renderWardrobeGrid();
});

// ── Generate ───────────────────────────────────────────────────────
const generateBtn = document.querySelector("#generate-outfits");
const outfitResults = document.querySelector("#outfit-results");

function generateOutfitSet() {
  if (state.wardrobe.length < 3) {
    outfitResults.innerHTML = "<p class='empty-state'>Add at least 3 pieces to generate outfits.</p>";
    return;
  }
  const picks = [...state.wardrobe].sort(() => Math.random() - 0.5);
  state.generated = [0, 1, 2].map(index => {
    const items = picks.slice(index, index + 3);
    const avg = items.reduce((s, i) => s + i.rating, 0) / items.length;
    return {
      id: createId(),
      headline: `Look ${index + 1}: ${items[0]?.category || "Wardrobe"} focus`,
      note: "Balanced layers with tonal contrast. Roll sleeves and add texture via accessories.",
      rating: Math.min(10, Math.round(avg * 10) / 10),
      items,
      upgrade: { item: "Structured wool overcoat", store: "Nordstrom", price: "$220" }
    };
  });
  renderGenerated();
}

function renderGenerated() {
  outfitResults.innerHTML = state.generated
    .map(
      outfit => `
      <article class="outfit-card">
        <header>
          <h3>${outfit.headline}</h3>
          <span>${outfit.rating}/10</span>
        </header>
        <p>${outfit.note}</p>
        <div class="outfit-items">
          ${outfit.items
            .map(
              item => `
              <div class="outfit-item">
                ${item.photo ? `<img src="${item.photo}" alt="${item.name}" loading="lazy" />` : `<div class="silhouette"></div>`}
                <small>${item.name}</small>
              </div>`
            )
            .join("")}
        </div>
        <p class="upgrade"><strong>Upgrade to 10/10:</strong> ${outfit.upgrade.item} · ${outfit.upgrade.store} · ${outfit.upgrade.price}</p>
        <button class="save-look" data-id="${outfit.id}" type="button">Save look</button>
      </article>`
    )
    .join("");
}

generateBtn?.addEventListener("click", generateOutfitSet);

outfitResults?.addEventListener("click", e => {
  const target = e.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("save-look")) return;
  const match = state.generated.find(item => item.id === target.dataset.id);
  if (!match) return;
  state.savedLooks.unshift(match);
  updateSavedLooksUI();
  refreshShoppingList();
});

// ── Style Boards ───────────────────────────────────────────────────
const styleBoardForm = document.querySelector("#style-board-form");
const styleBoardsGrid = document.querySelector("#style-boards-grid");

function renderStyleBoards() {
  styleBoardsGrid.innerHTML = state.styleBoards
    .map(
      board => `
      <article class="board-card">
        <img src="${board.image}" alt="${board.title}" loading="lazy" />
        <div class="board-meta">
          <h3>${board.title}</h3>
          <p>${board.theme || "No theme tags yet"}</p>
        </div>
      </article>`
    )
    .join("");
}

styleBoardForm?.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(styleBoardForm);
  const board = {
    id: createId(),
    title: String(data.get("title") || "").trim(),
    theme: String(data.get("theme") || "").trim(),
    image: String(data.get("image") || "").trim()
  };
  if (!board.title || !board.image) return;
  state.styleBoards.unshift(board);
  styleBoardForm.reset();
  renderStyleBoards();
});

// ── Saved Looks ────────────────────────────────────────────────────
const savedLooksList = document.querySelector("#saved-looks-list");

function updateSavedLooksUI() {
  if (!state.savedLooks.length) {
    savedLooksList.innerHTML = "<p class='empty-state'>No looks saved yet.</p>";
    return;
  }
  savedLooksList.innerHTML = state.savedLooks
    .map(
      look => `
      <article class="saved-look">
        <h3>${look.headline}</h3>
        <p>${look.rating}/10 · ${look.items.map(i => i.name).join(", ")}</p>
      </article>`
    )
    .join("");
}

// ── Shopping List ──────────────────────────────────────────────────
const shoppingListEl = document.querySelector("#shopping-list-items");
const shoppingExport = document.querySelector("#shopping-export");

function refreshShoppingList() {
  const seen = new Set();
  state.shoppingList = state.savedLooks
    .map(look => look.upgrade)
    .filter(entry => {
      const key = `${entry.item}-${entry.store}-${entry.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  shoppingListEl.innerHTML = state.shoppingList.length
    ? state.shoppingList
        .map(s => `<div class="shop-row"><strong>${s.item}</strong><span>${s.store}</span><span>${s.price}</span></div>`)
        .join("")
    : "<p class='empty-state'>No upgrades collected yet.</p>";

  shoppingExport.value = state.shoppingList.map(s => `${s.item} — ${s.store} — ${s.price}`).join("\n");
}

// ── Initial render ─────────────────────────────────────────────────
renderWardrobeGrid();
updateSavedLooksUI();
refreshShoppingList();
renderStyleBoards();
