export function renderWardrobe() {
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
