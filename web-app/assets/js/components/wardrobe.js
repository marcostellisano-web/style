import { saveWardrobe } from "../state.js";

const CATEGORIES = ["All Pieces", "Tops", "Bottoms", "Statement", "Outerwear", "Footwear", "Accessories"];
const ITEM_CATEGORIES = CATEGORIES.slice(1); // excludes "All Pieces"

const UPLOAD_ICON = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;
const EDIT_ICON   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

// Best-effort hex lookup so the colour swatch is pre-filled when editing
const COLOR_HEX = {
  black:"#000000", white:"#ffffff", grey:"#808080", gray:"#808080",
  navy:"#001f5b", blue:"#2563eb", lightblue:"#93c5fd", skyblue:"#38bdf8",
  red:"#dc2626", pink:"#f472b6", burgundy:"#7f1d1d", maroon:"#4a0f0f",
  green:"#16a34a", olive:"#4d7c0f", khaki:"#a3a380", sage:"#84a98c",
  yellow:"#facc15", orange:"#ea580c", brown:"#78350f", tan:"#d2b48c",
  camel:"#c19a6b", beige:"#f5f0e8", cream:"#fffdd0", ivory:"#fffff0",
  purple:"#7c3aed", lavender:"#c4b5fd", silver:"#9ca3af", gold:"#ca8a04",
};

function nameToHex(name) {
  return COLOR_HEX[name.toLowerCase().replace(/\s/g, "")] ?? "#888888";
}

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

function categoryOptions(selected = "") {
  return ITEM_CATEGORIES.map(cat =>
    `<option${cat === selected ? " selected" : ""}>${cat}</option>`
  ).join("");
}

// ── Templates ──────────────────────────────────────────────────────

export function renderWardrobe() {
  const pills = CATEGORIES.map((cat, i) =>
    `<button type="button" class="filter-pill${i === 0 ? " is-active" : ""}" data-filter="${i === 0 ? "all" : cat}">${cat.toUpperCase()}</button>`
  ).join("");

  return `
    <section class="tab-panel" id="wardrobe">

      <!-- Controls bar -->
      <div class="wardrobe-controls">
        <div class="filter-bar" id="filter-bar" role="group" aria-label="Filter by category">${pills}</div>
        <button type="button" class="add-piece-btn" id="add-piece-toggle">+ Add piece</button>
      </div>

      <!-- Add panel -->
      <div class="add-piece-panel hidden" id="add-piece-panel">
        <form id="item-form" class="item-form" autocomplete="off">
          <label class="photo-upload-label" for="item-photo-file" aria-label="Upload photo">
            <div class="photo-upload-preview" id="photo-preview">
              ${UPLOAD_ICON}<span>Upload photo</span>
            </div>
            <input id="item-photo-file" name="photo" type="file" accept="image/*" class="visually-hidden" />
          </label>
          <div class="item-form-fields">
            <input name="name" placeholder="Item name *" required />
            <div class="colour-input-wrap">
              <label class="colour-swatch-btn" for="add-color-picker" title="Pick colour">
                <span class="colour-swatch" id="add-colour-swatch" style="background:#888"></span>
              </label>
              <input type="color" id="add-color-picker" class="visually-hidden" value="#888888" />
              <input type="text" name="color" id="add-color-name" placeholder="Colour name *" required />
            </div>
            <input name="brand" placeholder="Brand (optional)" />
            <select name="category" required>
              <option value="">Category *</option>
              ${categoryOptions()}
            </select>
            <input name="rating" type="number" min="1" max="10" step="0.5" placeholder="Rating /10 (optional)" />
            <textarea name="description" placeholder="Styling note (optional)" rows="2"></textarea>
            <div class="form-actions">
              <button type="submit">Add to wardrobe</button>
              <button type="button" id="cancel-add-piece">Cancel</button>
            </div>
          </div>
        </form>
      </div>

      <!-- Grid -->
      <div id="wardrobe-grid" class="wardrobe-grid" aria-live="polite"></div>

    </section>

    <!-- Edit modal (outside section flow so it can overlay everything) -->
    <div class="edit-overlay hidden" id="edit-overlay" role="dialog" aria-modal="true" aria-label="Edit piece">
      <div class="edit-modal">
        <div class="edit-modal-header">
          <div>
            <h2 class="edit-title">Edit Piece</h2>
            <p class="edit-subtitle">Update details or swap the photo.</p>
          </div>
        </div>

        <form id="edit-form" class="edit-form" autocomplete="off">
          <input type="hidden" id="edit-id" />

          <div class="edit-field-group">
            <span class="field-label">PHOTO</span>
            <div class="edit-photo-area">
              <div class="edit-photo-preview" id="edit-photo-preview"></div>
              <div class="edit-photo-bar">
                <span class="edit-photo-filename" id="edit-photo-filename">No photo</span>
                <label for="edit-photo-file" class="edit-change-btn">CHANGE</label>
                <input type="file" id="edit-photo-file" accept="image/*" class="visually-hidden" />
              </div>
              <div class="edit-photo-folder-row">
                <span class="edit-folder-label">Or filename from wardrobe-photos/</span>
                <input type="text" id="edit-photo-filename-input" placeholder="e.g. navy-chinos.jpg" spellcheck="false" />
              </div>
            </div>
          </div>

          <div class="edit-field-group">
            <label class="field-label" for="edit-name">NAME</label>
            <input type="text" id="edit-name" name="name" required />
          </div>

          <div class="edit-field-row">
            <div class="edit-field-group">
              <label class="field-label" for="edit-category">CATEGORY</label>
              <select id="edit-category" name="category" required>
                ${categoryOptions()}
              </select>
            </div>
            <div class="edit-field-group">
              <label class="field-label" for="edit-brand">BRAND</label>
              <input type="text" id="edit-brand" name="brand" />
            </div>
          </div>

          <div class="edit-field-group">
            <span class="field-label">COLOUR</span>
            <div class="colour-input-wrap">
              <label class="colour-swatch-btn" for="edit-color-picker" title="Pick colour">
                <span class="colour-swatch" id="edit-colour-swatch"></span>
              </label>
              <input type="color" id="edit-color-picker" class="visually-hidden" />
              <input type="text" id="edit-color-name" name="color" placeholder="e.g. Black, Navy…" required />
            </div>
          </div>

          <div class="edit-field-group">
            <label class="field-label" for="edit-rating">RATING</label>
            <input type="number" id="edit-rating" name="rating" min="1" max="10" step="0.5" />
          </div>

          <div class="edit-field-group">
            <label class="field-label" for="edit-description">STYLING NOTE</label>
            <textarea id="edit-description" name="description" rows="3"></textarea>
          </div>

          <div class="edit-actions">
            <button type="button" id="edit-cancel">CANCEL</button>
            <button type="submit">SAVE PIECE</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ── Init ───────────────────────────────────────────────────────────

export function initWardrobe(state) {

  // ── Add panel ────────────────────────────────────────────────────
  const grid        = document.querySelector("#wardrobe-grid");
  const addForm     = document.querySelector("#item-form");
  const addToggle   = document.querySelector("#add-piece-toggle");
  const addPanel    = document.querySelector("#add-piece-panel");
  const cancelAdd   = document.querySelector("#cancel-add-piece");
  const filterBar   = document.querySelector("#filter-bar");
  const addPhotoIn  = document.querySelector("#item-photo-file");
  const addPreview  = document.querySelector("#photo-preview");
  const addSwatch   = document.querySelector("#add-colour-swatch");
  const addColorPkr = document.querySelector("#add-color-picker");
  const addColorName= document.querySelector("#add-color-name");

  let addPendingPhoto = "";

  function resetAddForm() {
    addForm.reset();
    addPendingPhoto = "";
    addPreview.innerHTML = `${UPLOAD_ICON}<span>Upload photo</span>`;
    addSwatch.style.background = "#888";
    addColorPkr.value = "#888888";
    addPanel.classList.add("hidden");
    addToggle.textContent = "+ Add piece";
  }

  addToggle.addEventListener("click", () => {
    if (!addPanel.classList.contains("hidden")) { resetAddForm(); return; }
    addPanel.classList.remove("hidden");
    addToggle.textContent = "✕ Close";
  });

  cancelAdd.addEventListener("click", resetAddForm);

  addColorPkr.addEventListener("input", e => {
    addSwatch.style.background = e.target.value;
  });

  // Keep swatch in sync when user types a colour name
  addColorName.addEventListener("input", e => {
    const hex = nameToHex(e.target.value);
    addSwatch.style.background = hex;
    addColorPkr.value = hex;
  });

  addPhotoIn.addEventListener("change", () => {
    const file = addPhotoIn.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      addPendingPhoto = e.target.result;
      addPreview.innerHTML = `<img src="${addPendingPhoto}" alt="Preview" />`;
    };
    reader.readAsDataURL(file);
  });

  filterBar.addEventListener("click", e => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;
    filterBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("is-active"));
    pill.classList.add("is-active");
    state.activeFilter = pill.dataset.filter;
    renderGrid();
  });

  addForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(addForm);
    const entry = {
      id:          globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`,
      name:        String(data.get("name")        || "").trim(),
      color:       String(data.get("color")       || "").trim(),
      colorHex:    addColorPkr.value,
      brand:       String(data.get("brand")       || "").trim(),
      category:    String(data.get("category")    || "").trim(),
      rating:      parseFloat(data.get("rating")) || 7,
      photo:       addPendingPhoto,
      description: String(data.get("description") || "").trim()
    };
    if (!entry.name || !entry.color || !entry.category) return;
    state.wardrobe.unshift(entry);
    saveWardrobe(state.wardrobe);
    resetAddForm();
    renderGrid();
  });

  // ── Edit modal ───────────────────────────────────────────────────
  const overlay      = document.querySelector("#edit-overlay");
  const editForm     = document.querySelector("#edit-form");
  const editCancel   = document.querySelector("#edit-cancel");
  const editPhotoIn       = document.querySelector("#edit-photo-file");
  const editPhotoEl       = document.querySelector("#edit-photo-preview");
  const editFilename      = document.querySelector("#edit-photo-filename");
  const editFolderInput   = document.querySelector("#edit-photo-filename-input");
  const editSwatch   = document.querySelector("#edit-colour-swatch");
  const editColorPkr = document.querySelector("#edit-color-picker");
  const editColorName= document.querySelector("#edit-color-name");

  let editPendingPhoto = null; // null = unchanged, string = new data URL

  function openEditModal(item) {
    editPendingPhoto = null;
    editFolderInput.value = "";
    document.querySelector("#edit-id").value = item.id;
    document.querySelector("#edit-name").value = item.name;
    document.querySelector("#edit-category").value = item.category;
    document.querySelector("#edit-brand").value = item.brand || "";
    document.querySelector("#edit-rating").value = item.rating;
    document.querySelector("#edit-description").value = item.description || "";

    // Colour
    const hex = item.colorHex || nameToHex(item.color);
    editColorPkr.value = hex;
    editSwatch.style.background = hex;
    editColorName.value = item.color;

    // Photo
    if (item.photo) {
      editPhotoEl.innerHTML = `<img src="${item.photo}" alt="${item.name}" />`;
      editFilename.textContent = "Current photo";
    } else {
      editPhotoEl.innerHTML = `<div class="edit-photo-placeholder">${UPLOAD_ICON}</div>`;
      editFilename.textContent = "No photo";
    }

    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeEditModal() {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
    editPendingPhoto = null;
    editForm.reset();
  }

  editCancel.addEventListener("click", closeEditModal);

  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeEditModal();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !overlay.classList.contains("hidden")) closeEditModal();
  });

  editColorPkr.addEventListener("input", e => {
    editSwatch.style.background = e.target.value;
  });

  editColorName.addEventListener("input", e => {
    const hex = nameToHex(e.target.value);
    editSwatch.style.background = hex;
    editColorPkr.value = hex;
  });

  editPhotoIn.addEventListener("change", () => {
    const file = editPhotoIn.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      editPendingPhoto = e.target.result;
      editFolderInput.value = "";
      editPhotoEl.innerHTML = `<img src="${editPendingPhoto}" alt="Preview" />`;
      editFilename.textContent = file.name;
    };
    reader.readAsDataURL(file);
  });

  // Preview photo from wardrobe-photos/ folder as user types
  editFolderInput.addEventListener("input", () => {
    const filename = editFolderInput.value.trim();
    if (!filename) return;
    const url = `/wardrobe-photos/${filename}`;
    editPendingPhoto = url;
    editPhotoEl.innerHTML = `<img src="${url}" alt="Preview" onerror="this.style.opacity='.3'" />`;
    editFilename.textContent = filename;
  });

  editForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(editForm);
    const id = document.querySelector("#edit-id").value;
    const idx = state.wardrobe.findIndex(i => i.id === id);
    if (idx === -1) return;

    const existing = state.wardrobe[idx];
    state.wardrobe[idx] = {
      ...existing,
      name:        String(data.get("name")        || "").trim(),
      color:       String(data.get("color")       || "").trim(),
      colorHex:    editColorPkr.value,
      brand:       String(data.get("brand")       || "").trim(),
      category:    String(data.get("category")    || "").trim(),
      rating:      parseFloat(data.get("rating")) || existing.rating,
      description: String(data.get("description") || "").trim(),
      photo:       editPendingPhoto !== null ? editPendingPhoto : existing.photo
    };

    saveWardrobe(state.wardrobe);
    closeEditModal();
    renderGrid();
  });

  // ── Grid ─────────────────────────────────────────────────────────
  grid.addEventListener("click", e => {
    const btn = e.target.closest(".card-edit-btn");
    if (!btn) return;
    const item = state.wardrobe.find(i => i.id === btn.dataset.id);
    if (item) openEditModal(item);
  });

  function renderGrid() {
    const items = state.activeFilter === "all"
      ? state.wardrobe
      : state.wardrobe.filter(i => i.category === state.activeFilter);

    if (!items.length) {
      const label = state.activeFilter === "all" ? "items" : state.activeFilter.toLowerCase();
      grid.innerHTML = `<p class="empty-state">No ${label} in your wardrobe yet.</p>`;
      return;
    }

    grid.innerHTML = items.map(item => `
      <article class="wardrobe-card">
        <div class="wardrobe-photo">
          ${item.photo
            ? `<img src="${item.photo}" alt="${item.name}" loading="lazy" />`
            : `<div class="silhouette"></div>`}
          <button class="card-edit-btn" data-id="${item.id}" type="button" aria-label="Edit ${item.name}">
            ${EDIT_ICON}
          </button>
          <div class="wardrobe-meta">
            <h3 class="item-name">${item.name}</h3>
            <div class="item-rating-row">
              <span class="rating-badge ${ratingClass(item.rating)}">${item.rating}/10</span>
              <span class="rating-label">${ratingLabel(item.rating)}</span>
            </div>
            ${item.description ? `<p class="item-desc">${item.description}</p>` : ""}
          </div>
        </div>
      </article>`
    ).join("");
  }

  renderGrid();
}
