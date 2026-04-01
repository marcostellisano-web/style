import { saveSavedLooks } from "../state.js";
import { profilePromptLine } from "./profile.js";

const API_KEY_STORE = "curato_claude_key";
const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function renderGenerate() {
  return `
    <section class="tab-panel app-section" id="generate">

      <!-- Hero -->
      <div class="generate-hero">
        <p class="wardrobe-kicker">AI Styling</p>
        <h1 class="wardrobe-title">Generate</h1>
        <p class="wardrobe-subtitle">Up to two looks, from your wardrobe</p>
        <p class="wardrobe-desc" id="generate-desc">Choose a vibe and season, then hit Generate. Anchor a piece first to build every look around it.</p>
      </div>

      <!-- Anchor banner -->
      <div id="generate-anchor-banner" class="anchor-banner hidden">
        Building every look around <strong id="generate-anchor-name"></strong>
      </div>

      <!-- Key prompt -->
      <div id="generate-key-row" class="refine-key-row hidden">
        <input type="password" id="generate-api-key" placeholder="Enter Claude API key to continue" />
        <button type="button" id="generate-key-save">Go</button>
      </div>

      <!-- Options -->
      <div class="generate-options">

        <div class="generate-option-group">
          <span class="generate-option-label">Number of looks</span>
          <div class="generate-pills" id="generate-count-pills">
            <button class="generate-pill" data-count="1">1</button>
            <button class="generate-pill is-active" data-count="2">2</button>
          </div>
        </div>

        <div class="generate-option-group">
          <span class="generate-option-label">Vibe</span>
          <div class="generate-pills" id="generate-vibe-pills">
            <button class="generate-pill is-active" data-vibe="Casual">Casual</button>
            <button class="generate-pill" data-vibe="Smart Casual">Smart Casual</button>
            <button class="generate-pill" data-vibe="Formal">Formal</button>
            <button class="generate-pill" data-vibe="Editorial">Editorial</button>
            <button class="generate-pill" data-vibe="Streetwear">Streetwear</button>
            <button class="generate-pill" data-vibe="Business">Business</button>
          </div>
        </div>

        <div class="generate-option-group">
          <span class="generate-option-label">Season</span>
          <div class="generate-pills" id="generate-season-pills">
            <button class="generate-pill is-active" data-season="Spring">Spring</button>
            <button class="generate-pill" data-season="Summer">Summer</button>
            <button class="generate-pill" data-season="Autumn">Autumn</button>
            <button class="generate-pill" data-season="Winter">Winter</button>
          </div>
        </div>

        <div class="generate-option-group generate-option-group--temp">
          <span class="generate-option-label">Temperature <span class="generate-temp-value" id="generate-temp-display">15°C</span></span>
          <div class="generate-temp-row">
            <span class="generate-temp-bound">−10°</span>
            <input type="range" id="generate-temp" min="-10" max="40" value="15" step="1" />
            <span class="generate-temp-bound">40°</span>
          </div>
        </div>

      </div>

      <!-- Style board reference -->
      <div class="generate-board-section">
        <span class="generate-option-label">
          Reference a style board
          <em class="generate-board-optional">— optional, click to select</em>
        </span>
        <div id="generate-board-picker" class="generate-board-picker"></div>
      </div>

      <!-- Controls -->
      <div class="generate-controls">
        <button id="generate-outfits" type="button">Generate outfits</button>
      </div>

      <!-- Results -->
      <div id="outfit-results" class="outfit-results"></div>

    </section>
  `;
}

export function initGenerate(state, { onSaveLook }) {
  const generateBtn          = document.querySelector("#generate-outfits");
  const outfitResults        = document.querySelector("#outfit-results");
  const generateAnchorBanner = document.querySelector("#generate-anchor-banner");
  const generateAnchorName   = document.querySelector("#generate-anchor-name");
  const keyRow               = document.querySelector("#generate-key-row");
  const keyInput             = document.querySelector("#generate-api-key");
  const keySave              = document.querySelector("#generate-key-save");
  const tempSlider           = document.querySelector("#generate-temp");
  const tempDisplay          = document.querySelector("#generate-temp-display");

  // ── Local option state ────────────────────────────────────────────
  let selectedCount   = 2;
  let selectedVibe    = "Casual";
  let selectedSeason  = "Spring";
  let selectedTemp    = 15;
  let selectedBoardId = null;

  // ── Pill selectors ────────────────────────────────────────────────
  document.querySelector("#generate-count-pills")?.addEventListener("click", e => {
    const btn = e.target.closest(".generate-pill[data-count]");
    if (!btn) return;
    document.querySelectorAll("#generate-count-pills .generate-pill").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    selectedCount = Number(btn.dataset.count);
  });

  document.querySelector("#generate-vibe-pills")?.addEventListener("click", e => {
    const btn = e.target.closest(".generate-pill[data-vibe]");
    if (!btn) return;
    document.querySelectorAll("#generate-vibe-pills .generate-pill").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    selectedVibe = btn.dataset.vibe;
  });

  document.querySelector("#generate-season-pills")?.addEventListener("click", e => {
    const btn = e.target.closest(".generate-pill[data-season]");
    if (!btn) return;
    document.querySelectorAll("#generate-season-pills .generate-pill").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    selectedSeason = btn.dataset.season;
  });

  tempSlider?.addEventListener("input", () => {
    selectedTemp = Number(tempSlider.value);
    if (tempDisplay) tempDisplay.textContent = `${selectedTemp}°C`;
  });

  // ── Board picker ──────────────────────────────────────────────────
  function renderBoardPicker() {
    const picker = document.querySelector("#generate-board-picker");
    if (!picker) return;

    if (!state.styleBoards?.length) {
      picker.innerHTML = '<p class="generate-no-boards">No style boards yet — create one in the Style Boards tab.</p>';
      return;
    }

    picker.innerHTML = state.styleBoards.map(board => {
      const thumb = board.images?.[0] || null;
      const isSelected = board.id === selectedBoardId;
      return `
        <button type="button" class="generate-board-card${isSelected ? " is-selected" : ""}" data-board-id="${board.id}">
          <div class="generate-board-thumb">
            ${thumb
              ? `<img src="${thumb}" alt="${board.title}" loading="lazy" />`
              : `<div class="generate-board-thumb-empty"></div>`}
          </div>
          <span class="generate-board-name">${board.title}</span>
          ${board.tags?.length ? `<span class="generate-board-tags">${board.tags.slice(0, 3).join(", ")}</span>` : ""}
        </button>
      `;
    }).join("");

    picker.addEventListener("click", e => {
      const card = e.target.closest(".generate-board-card[data-board-id]");
      if (!card) return;
      const id = card.dataset.boardId;
      selectedBoardId = selectedBoardId === id ? null : id;
      renderBoardPicker();
    });
  }

  // ── Anchor banner ─────────────────────────────────────────────────
  function getApiKey() { return localStorage.getItem(API_KEY_STORE) || ""; }
  function storeApiKey(k) { localStorage.setItem(API_KEY_STORE, k); }

  function refreshAnchorBanner() {
    if (state.anchoredItem) {
      generateAnchorName.textContent = state.anchoredItem.name;
      generateAnchorBanner.classList.remove("hidden");
    } else {
      generateAnchorBanner.classList.add("hidden");
    }
  }

  document.querySelectorAll(".top-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.tab === "generate") {
        refreshAnchorBanner();
        renderBoardPicker();
      }
    });
  });
  refreshAnchorBanner();
  renderBoardPicker();

  // ── API call ──────────────────────────────────────────────────────
  async function callGenerate(apiKey) {
    const anchor = state.anchoredItem;
    const wardrobeSummary = state.wardrobe.map(item =>
      `- ${item.name} (${item.category}, ${item.color}${item.brand ? `, ${item.brand}` : ""}, rated ${item.rating}/10)${item.description ? `: ${item.description}` : ""}`
    ).join("\n");

    const anchorLine = anchor
      ? `\nIMPORTANT: Every outfit MUST include "${anchor.name}". Build all three looks around this piece.`
      : "";

    const board = selectedBoardId
      ? state.styleBoards?.find(b => b.id === selectedBoardId)
      : null;

    const boardLine = board
      ? `\nStyle reference: The user loves the aesthetic of a board called "${board.title}" with these vibe keywords: ${board.tags?.join(", ") || "minimal, curated"}. Let this inform the mood of the looks.`
      : "";

    const prompt = `You are a high-end personal stylist. Create ${selectedCount} complete, intentional outfit combination${selectedCount > 1 ? "s" : ""} using only pieces from this wardrobe.${anchorLine}${boardLine}
${profilePromptLine(state.profile)}
Context:
- Vibe / occasion: ${selectedVibe}
- Season: ${selectedSeason}
- Temperature: approximately ${selectedTemp}°C — consider warmth, layering, and fabric weight accordingly

Rules:
- Use only items listed in the wardrobe below
- Each outfit should use 3–4 pieces
- Each look should feel distinct (different mood, silhouette, or occasion)
- Write a short, specific stylist note for each (1–2 sentences, editorial tone)
- Give each look a creative headline that captures the vibe
- Rate each outfit out of 10 based on cohesion and versatility
- Suggest one specific upgrade piece that would elevate the look to a 10 (can be something NOT in the wardrobe)

Return ONLY valid JSON, no other text:
{
  "outfits": [
    {
      "headline": "Look name",
      "note": "Stylist note",
      "rating": 8.5,
      "items": ["exact item name from wardrobe", "exact item name", "exact item name"],
      "upgrade": { "item": "specific piece", "why": "one sentence on why" }
    }
  ]
}

The wardrobe:
${wardrobeSummary}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }
    const data = await res.json();
    const raw  = data.content[0]?.text || "";
    const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
    return JSON.parse(raw.slice(start, end + 1));
  }

  // ── Render ────────────────────────────────────────────────────────
  function resolveItems(names) {
    return names.map(name => {
      const match = state.wardrobe.find(w =>
        w.name.toLowerCase() === name.toLowerCase() ||
        w.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(w.name.toLowerCase())
      );
      return match || { name, photo: null };
    });
  }

  function render(outfits) {
    state.generated = outfits.map(o => ({
      ...o,
      id: createId(),
      resolvedItems: resolveItems(o.items)
    }));

    // Auto-save all generated looks (prepend, avoid duplicates by headline)
    const existingHeadlines = new Set(state.savedLooks.map(l => l.headline));
    state.generated.forEach(outfit => {
      if (!existingHeadlines.has(outfit.headline)) {
        state.savedLooks.unshift({
          id:       outfit.id,
          headline: outfit.headline,
          note:     outfit.note,
          rating:   outfit.rating,
          items:    outfit.items,
          upgrade:  outfit.upgrade
        });
      }
    });
    saveSavedLooks(state.savedLooks);
    onSaveLook?.();

    outfitResults.innerHTML = state.generated.map(outfit => `
      <article class="outfit-card">
        <div class="outfit-card-header">
          <h3 class="outfit-headline">${outfit.headline}</h3>
          <span class="outfit-rating">${outfit.rating}/10</span>
        </div>
        <p class="outfit-note">${outfit.note}</p>
        <div class="outfit-items">
          ${outfit.resolvedItems.map(item => `
            <div class="outfit-item">
              <div class="outfit-item-photo">
                ${item.photo
                  ? `<img src="${item.photo}" alt="${item.name}" loading="lazy" />`
                  : `<div class="silhouette"></div>`}
              </div>
              <small>${item.name}</small>
            </div>`).join("")}
        </div>
        <div class="outfit-upgrade">
          <span class="outfit-upgrade-label">Upgrade to 10</span>
          <span>${outfit.upgrade.item} — ${outfit.upgrade.why}</span>
        </div>
      </article>`
    ).join("");
  }

  // ── Run ───────────────────────────────────────────────────────────
  async function runGenerate(apiKey) {
    outfitResults.innerHTML = `<p class="generate-loading">Building your looks…</p>`;
    try {
      const result = await callGenerate(apiKey);
      render(result.outfits);
    } catch (err) {
      outfitResults.innerHTML = `<p class="generate-error">${err.message}</p>`;
    }
  }

  function updateGenerateBtn() {
    if (generateBtn) {
      generateBtn.textContent = `Generate ${selectedCount === 1 ? "outfit" : `${selectedCount} outfits`}`;
    }
  }

  document.querySelector("#generate-count-pills")?.addEventListener("click", () => {
    updateGenerateBtn();
  });

  updateGenerateBtn();

  generateBtn?.addEventListener("click", () => {
    if (state.wardrobe.length < 3) {
      outfitResults.innerHTML = "<p class='empty-state'>Add at least 3 pieces to generate outfits.</p>";
      return;
    }
    const key = getApiKey();
    if (!key) {
      keyRow.classList.remove("hidden");
      keyInput.focus();
      return;
    }
    keyRow.classList.add("hidden");
    runGenerate(key);
  });

  keySave?.addEventListener("click", () => {
    const key = keyInput.value.trim();
    if (!key) return;
    storeApiKey(key);
    keyRow.classList.add("hidden");
    runGenerate(key);
  });

}
