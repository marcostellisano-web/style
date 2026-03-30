const CATEGORIES = ["All Pieces", "Tops", "Bottoms", "Statement", "Outerwear", "Footwear", "Accessories"];

const UPLOAD_ICON = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;

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

export function renderWardrobe() {
  const pills = CATEGORIES.map((cat, i) =>
    `<button type="button" class="filter-pill${i === 0 ? " is-active" : ""}" data-filter="${i === 0 ? "all" : cat}">${cat.toUpperCase()}</button>`
  ).join("");

  return `
    <section class="tab-panel" id="wardrobe">
      <div class="wardrobe-controls">
        <div class="filter-bar" id="filter-bar" role="group" aria-label="Filter by category">${pills}</div>
        <button type="button" class="add-piece-btn" id="add-piece-toggle">+ Add piece</button>
      </div>

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
            <input name="color" placeholder="Colour *" required />
            <input name="brand" placeholder="Brand (optional)" />
            <select name="category" required>
              <option value="">Category *</option>
              <option>Tops</option>
              <option>Bottoms</option>
              <option>Statement</option>
              <option>Outerwear</option>
              <option>Footwear</option>
              <option>Accessories</option>
            </select>
            <input name="rating" type="number" min="1" max="10" step="0.5" placeholder="Rating out of 10 (optional)" />
            <textarea name="description" placeholder="Styling note (optional)" rows="2"></textarea>
            <div class="form-actions">
              <button type="submit">Add to wardrobe</button>
              <button type="button" id="cancel-add-piece">Cancel</button>
            </div>
          </div>
        </form>
      </div>

      <div id="wardrobe-grid" class="wardrobe-grid" aria-live="polite"></div>
    </section>
  `;
}

export function initWardrobe(state) {
  const grid       = document.querySelector("#wardrobe-grid");
  const form       = document.querySelector("#item-form");
  const addToggle  = document.querySelector("#add-piece-toggle");
  const addPanel   = document.querySelector("#add-piece-panel");
  const cancelBtn  = document.querySelector("#cancel-add-piece");
  const filterBar  = document.querySelector("#filter-bar");
  const photoInput = document.querySelector("#item-photo-file");
  const photoPreview = document.querySelector("#photo-preview");

  let pendingPhoto = "";

  function resetForm() {
    form.reset();
    pendingPhoto = "";
    photoPreview.innerHTML = `${UPLOAD_ICON}<span>Upload photo</span>`;
    addPanel.classList.add("hidden");
    addToggle.textContent = "+ Add piece";
  }

  addToggle.addEventListener("click", () => {
    if (!addPanel.classList.contains("hidden")) { resetForm(); return; }
    addPanel.classList.remove("hidden");
    addToggle.textContent = "✕ Close";
  });

  cancelBtn.addEventListener("click", resetForm);

  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      pendingPhoto = e.target.result;
      photoPreview.innerHTML = `<img src="${pendingPhoto}" alt="Preview" />`;
    };
    reader.readAsDataURL(file);
  });

  filterBar.addEventListener("click", e => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;
    filterBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("is-active"));
    pill.classList.add("is-active");
    state.activeFilter = pill.dataset.filter;
    render();
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(form);
    const entry = {
      id: globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`,
      name:        String(data.get("name")        || "").trim(),
      color:       String(data.get("color")       || "").trim(),
      brand:       String(data.get("brand")       || "").trim(),
      category:    String(data.get("category")    || "").trim(),
      rating:      parseFloat(data.get("rating")) || 7,
      photo:       pendingPhoto,
      description: String(data.get("description") || "").trim()
    };
    if (!entry.name || !entry.color || !entry.category) return;
    state.wardrobe.unshift(entry);
    resetForm();
    render();
  });

  function render() {
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
    ).join("");
  }

  render();
}
