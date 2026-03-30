const CATEGORIES = ["All Pieces", "Tops", "Bottoms", "Statement", "Outerwear", "Footwear", "Accessories"];

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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <span>Upload photo</span>
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
