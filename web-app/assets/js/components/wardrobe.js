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
    <section class="app-section wardrobe-section" id="wardrobe">
      <p class="eyebrow">Your Collection</p>
      <h1 class="display-title">The Wardrobe</h1>
      <p class="display-subtitle">Every piece, rated</p>
      <p class="lede">List every item you own that you'd actually wear. Add photos so generated outfits use the real pieces from your closet.</p>

      <form id="item-form" class="item-form" autocomplete="off">
        <input id="item-name" name="name" placeholder="Item name (e.g. Navy slim chinos)" required />
        <input id="item-color" name="color" placeholder="Colour" required />
        <input id="item-brand" name="brand" placeholder="Brand" />
        <input id="item-category" name="category" placeholder="Category (tops, jeans, shoes...)" required />
        <input id="item-photo" name="photo" placeholder="Photo URL (optional)" />
        <button type="submit">Add to wardrobe</button>
      </form>

      <div id="wardrobe-grid" class="wardrobe-grid" aria-live="polite"></div>
    </section>
  `;
}
