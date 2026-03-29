const filters = [
  "All Pieces",
  "Tops",
  "Bottoms",
  "Statement",
  "Outerwear",
  "Footwear",
  "Accessories"
];

const cards = ["Classic Trousers", "Relaxed Pants", "Dark Denim", "Blue Shirt", "White Tee"];

export function renderWardrobe() {
  const filterButtons = filters
    .map(
      (name, index) => `<button type="button" class="filter-pill ${index === 0 ? "is-active" : ""}">${name}</button>`
    )
    .join("");

  const itemCards = cards
    .map(
      (name) => `
        <article class="wardrobe-card" aria-label="${name}">
          <div class="item-silhouette" role="img" aria-label="${name}"></div>
        </article>
      `
    )
    .join("");

  return `
    <section class="wardrobe-section" id="wardrobe" aria-labelledby="wardrobe-title">
      <div class="wardrobe-shell">
        <p class="eyebrow">Your Collection</p>
        <h1 id="wardrobe-title" class="wardrobe-title">The Wardrobe</h1>
        <p class="wardrobe-subtitle">Every piece, rated</p>
        <p class="wardrobe-description">
          Click any item to anchor an outfit around it, then head to Generate. Hover a card and click ✎ to edit or add a
          photo. Photos live in the <code>wardrobe-photos/</code> folder next to this file — just drop an image there and
          enter its filename when editing.
        </p>

        <div class="filters" role="toolbar" aria-label="Wardrobe category filters">${filterButtons}</div>

        <div class="wardrobe-grid">${itemCards}</div>
      </div>
    </section>
  `;
}
