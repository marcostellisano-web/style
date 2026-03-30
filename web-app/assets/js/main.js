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

const createId = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const state = {
  wardrobe: [
    { id: createId(), name: "Navy slim chinos", color: "Navy", brand: "H&M", category: "Trousers", rating: 9, photo: "" },
    { id: createId(), name: "White oxford shirt", color: "White", brand: "Uniqlo", category: "Shirts", rating: 8, photo: "" },
    { id: createId(), name: "Grey merino knit", color: "Grey", brand: "COS", category: "Knitwear", rating: 9, photo: "" },
    { id: createId(), name: "Black derby shoes", color: "Black", brand: "Clarks", category: "Shoes", rating: 8, photo: "" }
  ],
  generated: [],
  savedLooks: [],
  shoppingList: [],
  styleBoards: [
    { id: createId(), title: "Quiet Luxury", theme: "neutral layers", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80" },
    { id: createId(), title: "Weekend Minimal", theme: "denim, knitwear", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80" }
  ]
};

const form = document.querySelector("#item-form");
const wardrobeGrid = document.querySelector("#wardrobe-grid");
const generateBtn = document.querySelector("#generate-outfits");
const outfitResults = document.querySelector("#outfit-results");
const savedLooksList = document.querySelector("#saved-looks-list");
const shoppingListEl = document.querySelector("#shopping-list-items");
const shoppingExport = document.querySelector("#shopping-export");
const styleBoardForm = document.querySelector("#style-board-form");
const styleBoardsGrid = document.querySelector("#style-boards-grid");

function silhouetteOrImage(item) {
  if (item.photo) {
    return `<img src="${item.photo}" alt="${item.name}" loading="lazy" />`;
  }
  return `<div class="silhouette"></div>`;
}

function renderWardrobeGrid() {
  wardrobeGrid.innerHTML = state.wardrobe
    .map(
      (item) => `
      <article class="wardrobe-card">
        <div class="wardrobe-photo">${silhouetteOrImage(item)}</div>
        <div class="wardrobe-meta">
          <h3>${item.name}</h3>
          <p>${item.color}${item.brand ? ` · ${item.brand}` : ""}</p>
          <p>${item.category}</p>
          <strong>${item.rating}/10 stylist rating</strong>
        </div>
      </article>
    `
    )
    .join("");
}

function generateOutfitSet() {
  if (state.wardrobe.length < 3) {
    outfitResults.innerHTML = "<p class='empty-state'>Add at least 3 pieces to generate outfits.</p>";
    return;
  }

  const picks = [...state.wardrobe].sort(() => Math.random() - 0.5);
  state.generated = [0, 1, 2].map((index) => {
    const items = picks.slice(index, index + 3);
    const rating = Math.min(10, Math.round((items.reduce((sum, item) => sum + item.rating, 0) / items.length) * 10) / 10);
    return {
      id: createId(),
      headline: `Look ${index + 1}: ${items[0]?.category || "Wardrobe"} focus`,
      note: "Balanced layers with tonal contrast. Roll sleeves and add texture via accessories.",
      rating,
      items,
      upgrade: {
        item: "Structured wool overcoat",
        store: "Nordstrom",
        price: "$220"
      }
    };
  });

  renderGenerated();
}

function renderGenerated() {
  outfitResults.innerHTML = state.generated
    .map(
      (outfit) => `
      <article class="outfit-card">
        <header>
          <h3>${outfit.headline}</h3>
          <span>${outfit.rating}/10</span>
        </header>
        <p>${outfit.note}</p>
        <div class="outfit-items">
          ${outfit.items
            .map(
              (item) => `
                <div class="outfit-item">
                  ${silhouetteOrImage(item)}
                  <small>${item.name}</small>
                </div>`
            )
            .join("")}
        </div>
        <p class="upgrade"><strong>Upgrade to 10/10:</strong> ${outfit.upgrade.item} · ${outfit.upgrade.store} · ${outfit.upgrade.price}</p>
        <button class="save-look" data-id="${outfit.id}" type="button">Save look</button>
      </article>
    `
    )
    .join("");
}

function renderSavedLooks() {
  if (!state.savedLooks.length) {
    savedLooksList.innerHTML = "<p class='empty-state'>No looks saved yet.</p>";
    return;
  }

  savedLooksList.innerHTML = state.savedLooks
    .map((look) => `<article class="saved-look"><h3>${look.headline}</h3><p>${look.rating}/10 · ${look.items.map((i) => i.name).join(", ")}</p></article>`)
    .join("");
}

function refreshShoppingList() {
  const suggestions = state.savedLooks.map((look) => look.upgrade);
  const unique = [];
  const seen = new Set();
  suggestions.forEach((entry) => {
    const key = `${entry.item}-${entry.store}-${entry.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(entry);
    }
  });
  state.shoppingList = unique;

  shoppingListEl.innerHTML = state.shoppingList.length
    ? state.shoppingList.map((s) => `<div class="shop-row"><strong>${s.item}</strong><span>${s.store}</span><span>${s.price}</span></div>`).join("")
    : "<p class='empty-state'>No upgrades collected yet.</p>";

  shoppingExport.value = state.shoppingList.map((s) => `${s.item} — ${s.store} — ${s.price}`).join("\n");
}

function renderStyleBoards() {
  styleBoardsGrid.innerHTML = state.styleBoards
    .map((board) => `
      <article class="board-card">
        <img src="${board.image}" alt="${board.title}" loading="lazy" />
        <div class="board-meta">
          <h3>${board.title}</h3>
          <p>${board.theme || "No theme tags yet"}</p>
        </div>
      </article>
    `)
    .join("");
}

styleBoardForm?.addEventListener("submit", (event) => {
  event.preventDefault();
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

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const entry = {
    id: createId(),
    name: String(data.get("name") || "").trim(),
    color: String(data.get("color") || "").trim(),
    brand: String(data.get("brand") || "").trim(),
    category: String(data.get("category") || "").trim(),
    photo: String(data.get("photo") || "").trim(),
    rating: 8
  };

  if (!entry.name || !entry.color || !entry.category) return;

  state.wardrobe.unshift(entry);
  form.reset();
  renderWardrobeGrid();
});

generateBtn?.addEventListener("click", generateOutfitSet);

outfitResults?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("save-look")) return;

  const lookId = target.dataset.id;
  const match = state.generated.find((item) => item.id === lookId);
  if (!match) return;

  state.savedLooks.unshift(match);
  renderSavedLooks();
  refreshShoppingList();
});

renderWardrobeGrid();
renderSavedLooks();
refreshShoppingList();
renderStyleBoards();
