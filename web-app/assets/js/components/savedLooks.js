export function renderSavedLooks() {
  return `
    <section class="tab-panel app-section" id="saved-looks">
      <div class="section-head">
        <h2>Saved Looks</h2>
        <p>Keep your favourite outfits and re-open them any time.</p>
      </div>
      <div id="saved-looks-list" class="saved-looks-list"></div>
    </section>
  `;
}

export function initSavedLooks(state) {
  const list = document.querySelector("#saved-looks-list");

  function update() {
    if (!state.savedLooks.length) {
      list.innerHTML = "<p class='empty-state'>No looks saved yet.</p>";
      return;
    }
    list.innerHTML = state.savedLooks.map(look => `
      <article class="saved-look">
        <h3>${look.headline}</h3>
        <p>${look.rating}/10 · ${look.items.map(i => i.name).join(", ")}</p>
      </article>`
    ).join("");
  }

  update();
  return { update };
}
