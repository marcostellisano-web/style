export function renderGenerate() {
  return `
    <section class="tab-panel app-section" id="generate">
      <div class="section-head">
        <h2>AI Outfit Generator</h2>
        <p>Generate combinations from your real wardrobe items. Includes headline, stylist note, rating, and upgrade suggestions.</p>
      </div>
      <div id="generate-anchor-banner" class="anchor-banner hidden">
        Building around <strong id="generate-anchor-name"></strong>
      </div>
      <div class="generate-controls">
        <input id="claude-key" placeholder="Claude API key (optional in demo)" />
        <button id="generate-outfits" type="button">Generate outfits</button>
      </div>
      <div id="outfit-results" class="outfit-results"></div>
    </section>
  `;
}

export function initGenerate(state, { onSaveLook }) {
  const generateBtn         = document.querySelector("#generate-outfits");
  const outfitResults       = document.querySelector("#outfit-results");
  const generateAnchorBanner = document.querySelector("#generate-anchor-banner");
  const generateAnchorName   = document.querySelector("#generate-anchor-name");

  function refreshAnchorBanner() {
    if (state.anchoredItem) {
      generateAnchorName.textContent = state.anchoredItem.name;
      generateAnchorBanner.classList.remove("hidden");
    } else {
      generateAnchorBanner.classList.add("hidden");
    }
  }

  // Refresh banner whenever the generate tab becomes visible
  document.querySelectorAll(".top-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.tab === "generate") refreshAnchorBanner();
    });
  });

  refreshAnchorBanner();

  const createId = () =>
    globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function render() {
    outfitResults.innerHTML = state.generated.map(outfit => `
      <article class="outfit-card">
        <header>
          <h3>${outfit.headline}</h3>
          <span>${outfit.rating}/10</span>
        </header>
        <p>${outfit.note}</p>
        <div class="outfit-items">
          ${outfit.items.map(item => `
            <div class="outfit-item">
              ${item.photo
                ? `<img src="${item.photo}" alt="${item.name}" loading="lazy" />`
                : `<div class="silhouette"></div>`}
              <small>${item.name}</small>
            </div>`).join("")}
        </div>
        <p class="upgrade"><strong>Upgrade to 10/10:</strong> ${outfit.upgrade.item} · ${outfit.upgrade.store} · ${outfit.upgrade.price}</p>
        <button class="save-look" data-id="${outfit.id}" type="button">Save look</button>
      </article>`
    ).join("");
  }

  generateBtn?.addEventListener("click", () => {
    if (state.wardrobe.length < 3) {
      outfitResults.innerHTML = "<p class='empty-state'>Add at least 3 pieces to generate outfits.</p>";
      return;
    }
    const anchor = state.anchoredItem;
    const rest   = [...state.wardrobe]
      .filter(i => !anchor || i.id !== anchor.id)
      .sort(() => Math.random() - 0.5);

    state.generated = [0, 1, 2].map(index => {
      const pool = anchor
        ? [anchor, ...rest.slice(index * 2, index * 2 + 2)]
        : rest.slice(index * 3, index * 3 + 3);
      const items = pool.slice(0, 3);
      const avg   = items.reduce((s, i) => s + i.rating, 0) / items.length;
      const headline = anchor
        ? `Look ${index + 1}: Built around ${anchor.name}`
        : `Look ${index + 1}: ${items[0]?.category || "Wardrobe"} focus`;
      return {
        id: createId(),
        headline,
        note: "Balanced layers with tonal contrast. Roll sleeves and add texture via accessories.",
        rating: Math.min(10, Math.round(avg * 10) / 10),
        items,
        upgrade: { item: "Structured wool overcoat", store: "Nordstrom", price: "$220" }
      };
    });
    render();
  });

  outfitResults?.addEventListener("click", e => {
    if (!(e.target instanceof HTMLElement) || !e.target.classList.contains("save-look")) return;
    const match = state.generated.find(i => i.id === e.target.dataset.id);
    if (match) onSaveLook(match);
  });
}
