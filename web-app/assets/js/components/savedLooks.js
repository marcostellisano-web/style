import { saveSavedLooks } from "../state.js";

export function renderSavedLooks() {
  return `
    <section class="tab-panel app-section" id="saved-looks">
      <div class="section-head">
        <h2>Saved Looks</h2>
        <p>Every generated outfit, saved automatically. Delete any you don't want to keep.</p>
      </div>
      <div id="saved-looks-list" class="saved-looks-list"></div>
    </section>
  `;
}

export function initSavedLooks(state) {
  const list = document.querySelector("#saved-looks-list");

  function resolveItems(itemNames) {
    return (itemNames || []).map(name => {
      const match = state.wardrobe.find(w =>
        w.name.toLowerCase() === name.toLowerCase() ||
        w.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(w.name.toLowerCase())
      );
      return match || { name, photo: null };
    });
  }

  function update() {
    if (!state.savedLooks.length) {
      list.innerHTML = "<p class='empty-state'>No looks saved yet — generate some outfits first.</p>";
      return;
    }

    list.innerHTML = `<div class="saved-looks-grid">${
      state.savedLooks.map((look, idx) => {
        const resolved = resolveItems(look.items);
        return `
          <article class="saved-look-card">
            <button class="saved-look-delete" data-idx="${idx}" type="button" aria-label="Delete">✕</button>
            <div class="saved-look-photos">
              ${resolved.slice(0, 3).map(item => `
                <div class="saved-look-photo">
                  ${item.photo
                    ? `<img src="${item.photo}" alt="${item.name}" loading="lazy" />`
                    : `<div class="silhouette"></div>`}
                </div>`).join("")}
            </div>
            <div class="saved-look-info">
              <div class="saved-look-header">
                <h3 class="saved-look-headline">${look.headline}</h3>
                <span class="saved-look-rating">${look.rating}/10</span>
              </div>
              <p class="saved-look-note">${look.note || ""}</p>
              <p class="saved-look-items">${(look.items || []).join(" · ")}</p>
            </div>
          </article>`;
      }).join("")
    }</div>`;
  }

  list.addEventListener("click", e => {
    const btn = e.target.closest(".saved-look-delete");
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    state.savedLooks.splice(idx, 1);
    saveSavedLooks(state.savedLooks);
    update();
  });

  update();
  return { update };
}
