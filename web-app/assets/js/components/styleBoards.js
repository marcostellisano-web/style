import { saveRefineList, saveStyleBoards } from "../state.js";
import { profilePromptLine } from "./profile.js";
import { uploadPhoto, supabase } from "../supabase.js";

const API_KEY_STORE = "curato_claude_key";

const STOP_WORDS = new Set([
  "https", "http", "www", "com", "net", "org", "jpg", "jpeg", "png", "webp", "gif",
  "image", "images", "img", "photo", "photos", "board", "style", "upload", "cdn", "fit", "crop", "auto", "format", "q", "w",
  "storage", "v1", "object", "public", "supabase"
]);

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Encode each path segment so filenames with spaces/+ work as src attributes
function encodeSrc(path) {
  return String(path).split("/").map(seg => encodeURIComponent(seg)).join("/");
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function parseImageList(raw) {
  return String(raw || "")
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function deriveKeywords(images) {
  const frequency = new Map();
  images.forEach(url => {
    const clean = decodeURIComponent(url)
      .toLowerCase()
      .replace(/\?.*$/, "")
      .replace(/[#].*$/, "")
      .replace(/[^a-z0-9]+/g, " ");

    clean
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word) && Number.isNaN(Number(word)) && !/^[0-9a-f]{8,}$/.test(word))
      .forEach(word => frequency.set(word, (frequency.get(word) || 0) + 1));
  });

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function buildBoard({ title, description, images }) {
  const tags = deriveKeywords(images);
  const generatedTitle = titleCase(
    title ||
    (tags.length >= 2
      ? `${tags[0]} ${tags[1]}`
      : tags[0]
        ? `${tags[0]} essentials`
        : "Untitled board")
  );

  return {
    id: createId(),
    title: generatedTitle,
    description: description || "",
    tags,
    images
  };
}

function normalizeBoard(board) {
  if (Array.isArray(board.images)) {
    return {
      id: board.id || createId(),
      title: board.title || "Untitled board",
      description: board.description || "",
      tags: Array.isArray(board.tags)
        ? board.tags.filter(Boolean)
        : String(board.theme || "").split(",").map(tag => tag.trim()).filter(Boolean),
      images: board.images.filter(Boolean)
    };
  }

  return {
    id: board.id || createId(),
    title: board.title || "Untitled board",
    description: board.description || "",
    tags: String(board.theme || "").split(",").map(tag => tag.trim()).filter(Boolean),
    images: board.image ? [board.image] : []
  };
}

export function renderStyleBoards() {
  return `
    <section class="tab-panel app-section" id="style-boards">

      <!-- Hero -->
      <div class="style-boards-hero">
        <p class="wardrobe-kicker">Inspiration</p>
        <h1 class="wardrobe-title">Style <em>Boards</em></h1>
        <p class="wardrobe-subtitle" style="font-size:18px;margin-top:4px;">The aesthetic behind the wardrobe</p>
      </div>

      <!-- Controls -->
      <div class="style-boards-controls">
        <button type="button" class="new-board-btn" id="style-board-toggle">+ New Board</button>
      </div>

      <form id="style-board-form" class="style-board-form hidden" autocomplete="off">
        <input name="title" placeholder="Board title" />
        <textarea name="description" placeholder="Description — what is the vibe of this board?" rows="2"></textarea>
        <div class="board-upload-zone" id="board-upload-zone">
          <input type="file" id="board-photo-input" accept="image/*" multiple />
          <label for="board-photo-input" class="board-upload-label">Click to choose photos</label>
          <div id="board-upload-preview" class="board-upload-preview"></div>
        </div>
        <p id="board-upload-status" class="board-upload-status"></p>
        <div class="style-board-form-actions">
          <button type="button" id="style-board-cancel">Cancel</button>
          <button type="submit">Create board</button>
        </div>
      </form>

      <div id="style-boards-grid" class="style-boards-grid" aria-live="polite"></div>

      <!-- Fill the Gaps -->
      <div class="fill-gaps-section">
        <div class="fill-gaps-top">
          <div class="fill-gaps-left">
            <p class="fill-gaps-kicker">Wardrobe Intelligence</p>
            <h2 class="fill-gaps-headline">Fill the <em>Gaps</em></h2>
            <p class="fill-gaps-desc">AI analyses your current wardrobe and style boards to suggest pieces you don't own yet — sent straight to your Shopping List.</p>
          </div>
          <div class="fill-gaps-right">
            <div id="fill-gaps-key-row" class="refine-key-row hidden">
              <input type="password" id="fill-gaps-api-key" placeholder="Enter Claude API key" />
              <button type="button" id="fill-gaps-key-save">Go</button>
            </div>
          </div>
        </div>
        <div class="fill-gaps-cats">
          <button type="button" id="fill-gaps-btn" class="fill-gaps-btn">→ Suggest Pieces</button>
          <span class="fill-gaps-cats-divider" aria-hidden="true"></span>
          <span class="fill-gaps-cats-label">Suggest from</span>
          <div class="fill-gaps-cat-pills" id="fill-gaps-cat-pills">
            <button class="fill-gaps-cat-pill is-active" data-cat="Tops">Tops</button>
            <button class="fill-gaps-cat-pill is-active" data-cat="Bottoms">Bottoms</button>
            <button class="fill-gaps-cat-pill is-active" data-cat="Outerwear">Outerwear</button>
            <button class="fill-gaps-cat-pill is-active" data-cat="Footwear">Footwear</button>
            <button class="fill-gaps-cat-pill is-active" data-cat="Accessories">Accessories</button>
            <button class="fill-gaps-cat-pill is-active" data-cat="Statement">Statement</button>
          </div>
        </div>
      </div>
      <div id="fill-gaps-status" class="fill-gaps-status"></div>

    </section>
  `;
}

export function initStyleBoards(state, { onSuggest } = {}) {
  const form = document.querySelector("#style-board-form");
  const toggleBtn = document.querySelector("#style-board-toggle");
  const cancelBtn = document.querySelector("#style-board-cancel");
  const grid = document.querySelector("#style-boards-grid");

  state.styleBoards = state.styleBoards.map(normalizeBoard);

  function render() {
    if (!grid) return;

    if (!state.styleBoards.length) {
      grid.innerHTML = '<p class="empty-state">No boards yet. Create one with + New Board.</p>';
      return;
    }

    grid.innerHTML = state.styleBoards.map(board => {
      const tagLine = board.tags.length ? board.tags.join(" · ") : "";
      const extraCount = board.images.length > 6 ? board.images.length - 6 : 0;

      const cells = Array.from({ length: 6 }, (_, index) => {
        const image = board.images[index];
        if (!image) return `<div class="board-tile placeholder" aria-hidden="true"></div>`;
        return `<div class="board-tile">${
          index === 5 && extraCount > 0
            ? `<div class="board-tile-more">+${extraCount}<img src="${encodeSrc(image)}" alt="" loading="lazy" /></div>`
            : `<img src="${encodeSrc(image)}" alt="${escapeHtml(board.title)} ${index + 1}" loading="lazy" />`
        }</div>`;
      }).join("");

      return `
        <article class="board-card" data-board-id="${escapeHtml(board.id)}">
          <div class="board-tiles">${cells}</div>
          <div class="board-info">
            <h3 class="board-title">${escapeHtml(board.title)}</h3>
            ${tagLine ? `<p class="board-tags-line">${escapeHtml(tagLine)}</p>` : ""}
            <div class="board-actions-inline">
              <button type="button" class="board-action" data-action="edit">Edit</button>
              <button type="button" class="board-action remove" data-action="remove">Remove</button>
            </div>
          </div>
          <form class="board-edit-form hidden" data-edit-form>
            <input name="title" value="${escapeHtml(board.title)}" placeholder="Board title" required />
            <textarea name="description" rows="2">${escapeHtml(board.description || "")}</textarea>
            <textarea name="images">${escapeHtml(board.images.join("\n"))}</textarea>
            <label class="board-edit-upload">
              <input type="file" class="board-edit-photo-input" accept="image/*" multiple />
              <span class="board-edit-upload-label">+ Upload more photos</span>
            </label>
            <div class="board-edit-actions">
              <button type="button" data-action="cancel-edit">Cancel</button>
              <button type="submit">Save</button>
            </div>
          </form>
        </article>
      `;
    }).join("");
  }

  toggleBtn?.addEventListener("click", () => {
    form?.classList.remove("hidden");
    form?.querySelector("textarea")?.focus();
  });

  cancelBtn?.addEventListener("click", () => {
    form?.reset();
    form?.classList.add("hidden");
  });

  // Wire up file preview for the create form
  const photoInput  = document.querySelector("#board-photo-input");
  const previewEl   = document.querySelector("#board-upload-preview");
  const uploadZone  = document.querySelector("#board-upload-zone");

  photoInput?.addEventListener("change", () => {
    const files = [...(photoInput.files ?? [])];
    if (previewEl) {
      previewEl.innerHTML = files.map(f => {
        const url = URL.createObjectURL(f);
        return `<img src="${url}" alt="${escapeHtml(f.name)}" class="board-upload-thumb" />`;
      }).join("");
    }
    uploadZone?.classList.toggle("is-active", files.length > 0);
  });

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    const statusEl  = document.querySelector("#board-upload-status");
    const submitBtn = form.querySelector('[type="submit"]');
    const files     = [...(photoInput?.files ?? [])];

    if (!files.length) {
      if (statusEl) statusEl.textContent = "Please choose at least one photo.";
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = "Uploading…";
    if (statusEl) statusEl.textContent = `Uploading ${files.length} photo${files.length > 1 ? "s" : ""}…`;

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        if (statusEl) statusEl.textContent = "Sign in to upload photos.";
        submitBtn.disabled    = false;
        submitBtn.textContent = "Create board";
        return;
      }

      const images = [];
      for (const file of files) {
        const url = await uploadPhoto(file, "style-boards", authData.user.id);
        images.push(url);
      }

      const data  = new FormData(form);
      const board = buildBoard({
        title:       String(data.get("title") || "").trim(),
        description: String(data.get("description") || "").trim(),
        images
      });

      state.styleBoards.unshift(board);
      saveStyleBoards(state.styleBoards);
      form.reset();
      if (previewEl) previewEl.innerHTML = "";
      if (statusEl)  statusEl.textContent = "";
      uploadZone?.classList.remove("is-active");
      form.classList.add("hidden");
      render();
    } catch (err) {
      if (statusEl) statusEl.textContent = err.message || "Upload failed.";
      submitBtn.disabled    = false;
      submitBtn.textContent = "Create board";
    }
  });

  grid?.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const card = target.closest(".board-card");
    if (!card) return;

    const boardId = card.getAttribute("data-board-id");
    if (!boardId) return;

    // Explicit action buttons take priority
    const action = target.closest("[data-action]")?.getAttribute("data-action");

    if (action === "remove") {
      state.styleBoards = state.styleBoards.filter(board => board.id !== boardId);
      saveStyleBoards(state.styleBoards);
      render();
      return;
    }

    if (action === "edit") {
      card.querySelector("[data-edit-form]")?.classList.remove("hidden");
      return;
    }

    if (action === "cancel-edit") {
      card.querySelector("[data-edit-form]")?.classList.add("hidden");
      return;
    }

    // Don't open modal when interacting with the edit form
    if (target.closest("[data-edit-form]")) return;

    // Anywhere else on the card → open modal
    const board = state.styleBoards.find(b => b.id === boardId);
    if (board) openModal(board);
  });

  grid?.addEventListener("submit", async event => {
    const formElement = event.target;
    if (!(formElement instanceof HTMLFormElement) || !formElement.matches("[data-edit-form]")) return;
    event.preventDefault();

    const card = formElement.closest(".board-card");
    const boardId = card?.getAttribute("data-board-id");
    if (!boardId) return;

    const data           = new FormData(formElement);
    const existingImages = parseImageList(data.get("images"));
    const editPhotoInput = formElement.querySelector(".board-edit-photo-input");
    const newFiles       = [...(editPhotoInput?.files ?? [])];
    const saveBtn        = formElement.querySelector('[type="submit"]');

    let uploadedImages = [];
    if (newFiles.length) {
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Uploading…"; }
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          globalThis.alert?.("Sign in to upload photos.");
          if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save"; }
          return;
        }
        for (const file of newFiles) {
          const url = await uploadPhoto(file, "style-boards", authData.user.id);
          uploadedImages.push(url);
        }
      } catch (err) {
        globalThis.alert?.(err.message || "Upload failed.");
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save"; }
        return;
      }
    }

    const images = [...existingImages, ...uploadedImages];
    if (!images.length) return;

    const board = state.styleBoards.find(item => item.id === boardId);
    if (!board) return;

    board.title       = String(data.get("title") || "").trim() || board.title;
    board.description = String(data.get("description") || "").trim();
    board.images      = images;
    board.tags        = deriveKeywords(images);
    saveStyleBoards(state.styleBoards);
    render();
  });

  // ── Board modal ────────────────────────────────────────────────────
  function openModal(board) {
    let overlay = document.querySelector("#board-modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "board-modal-overlay";
      overlay.className = "board-modal-overlay";
      document.body.appendChild(overlay);
    }

    const tagLine = board.tags?.length ? board.tags.join(" · ") : "";

    overlay.innerHTML = `
      <div class="board-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(board.title)}">
        <button class="board-modal-close" id="board-modal-close" aria-label="Close">✕</button>
        <div class="board-modal-header">
          <p class="board-modal-kicker">Style Board</p>
          <h2 class="board-modal-title">${escapeHtml(board.title)}</h2>
          ${board.description ? `<p class="board-modal-desc">${escapeHtml(board.description)}</p>` : ""}
          ${tagLine ? `<p class="board-modal-tags">${escapeHtml(tagLine)}</p>` : ""}
        </div>
        <div class="board-modal-grid">
          ${board.images.map((img, i) => `
            <div class="board-modal-cell">
              <img src="${encodeSrc(img)}" alt="${escapeHtml(board.title)} ${i + 1}" loading="lazy" />
            </div>`).join("")}
        </div>
      </div>
    `;

    overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");

    const close = () => {
      overlay.classList.add("hidden");
      document.body.classList.remove("modal-open");
    };

    overlay.querySelector("#board-modal-close")?.addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

    const onKey = e => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); } };
    document.addEventListener("keydown", onKey);
  }

  render();

  // ── Fill the Gaps ──────────────────────────────────────────────────
  const fillGapsBtn    = document.querySelector("#fill-gaps-btn");
  const fillGapsKeyRow = document.querySelector("#fill-gaps-key-row");
  const fillGapsKeyIn  = document.querySelector("#fill-gaps-api-key");
  const fillGapsKeySave= document.querySelector("#fill-gaps-key-save");
  const fillGapsStatus = document.querySelector("#fill-gaps-status");
  const catPillsEl     = document.querySelector("#fill-gaps-cat-pills");

  // Track which categories are selected (all active by default)
  let selectedCategories = ["Tops", "Bottoms", "Outerwear", "Footwear", "Accessories", "Statement"];

  catPillsEl?.addEventListener("click", event => {
    const pill = event.target.closest(".fill-gaps-cat-pill");
    if (!pill) return;
    const cat = pill.getAttribute("data-cat");
    if (!cat) return;
    const isActive = pill.classList.toggle("is-active");
    if (isActive) {
      selectedCategories.push(cat);
    } else {
      selectedCategories = selectedCategories.filter(c => c !== cat);
    }
  });

  function getApiKey() { return localStorage.getItem(API_KEY_STORE) || ""; }
  function storeApiKey(k) { localStorage.setItem(API_KEY_STORE, k); }

  // Fetch pre-generated image descriptions from the repo
  async function fetchImageDescriptions() {
    try {
      const res = await fetch("/assets/data/board-image-descriptions.json");
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  }

  // Fetch an image, resize to max 512px via canvas, return { base64, mediaType } or null
  async function fetchImageBase64(path) {
    try {
      const res = await fetch(encodeSrc(path));
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise(resolve => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const MAX = 512;
          let { naturalWidth: w, naturalHeight: h } = img;
          if (w > MAX || h > MAX) {
            const scale = Math.min(MAX / w, MAX / h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
      });
    } catch {
      return null;
    }
  }

  async function callFillGaps(apiKey) {
    const imageDescriptions = await fetchImageDescriptions();

    const wardrobeSummary = (state.wardrobe || []).map(item =>
      `- ${item.name} (${item.category}${item.brand ? `, ${item.brand}` : ""}, ${item.color})`
    ).join("\n");

    const boardsSummary = (state.styleBoards || []).map(b => {
      const desc = b.description ? ` — "${b.description}"` : "";
      const tags = b.tags?.length ? ` (keywords: ${b.tags.join(", ")})` : "";
      return `- "${b.title}"${desc}${tags}`;
    }).join("\n");

    const alreadySuggested = (state.refineList || []).map(i => `- ${i.item}`).join("\n") || "None";

    // Sample up to 3 images spread evenly across all boards
    const allImages = (state.styleBoards || []).flatMap(b => b.images || []);
    const step = Math.max(1, Math.floor(allImages.length / 3));
    const sampled = [0, step, step * 2]
      .map(i => allImages[i])
      .filter(Boolean)
      .slice(0, 3);

    // Use cached text descriptions where available; fall back to vision only for uncached images
    const imageBlocks = [];
    const cachedDescLines = [];

    for (const imgPath of sampled) {
      const cached = imageDescriptions[imgPath]?.description;
      if (cached) {
        cachedDescLines.push(cached);
      } else {
        const img = await fetchImageBase64(imgPath);
        if (img) {
          imageBlocks.push({
            type: "image",
            source: { type: "base64", media_type: img.mediaType, data: img.base64 }
          });
        }
      }
    }

    const visualContext = cachedDescLines.length
      ? `\n\nStyle board photo descriptions (outfit details and vibe):\n${cachedDescLines.map(d => `---\n${d}`).join("\n")}`
      : "";

    const usingVision = imageBlocks.length > 0;

    const prompt = `You are a high-end personal stylist. A user has shared their wardrobe and their style boards (mood boards showing the aesthetic they aspire to).${usingVision ? " I am also sharing photos from their style boards so you can see the actual visual aesthetic." : ""}
${profilePromptLine(state.profile)}
Your job: identify exactly 2 specific pieces they do NOT yet own that would bridge the gap between their current wardrobe and their style board aesthetic.

Only suggest pieces from these categories: ${selectedCategories.length ? selectedCategories.join(", ") : "any category"}.

Already on their shopping list — do NOT suggest these again:
${alreadySuggested}

Rules:
- Do not suggest anything already in the wardrobe
- Be specific: name the exact item, a real brand, and a realistic price range
- Explain why each piece fills a gap between what they own and what their boards suggest
- Each piece should unlock new outfits or elevate existing ones
- Lean toward investment pieces that are versatile, not trendy
- Base your suggestions on the actual visual aesthetic in the style board photos

Return ONLY valid JSON, no other text:
{
  "suggestions": [
    {
      "item": "specific item name",
      "category": "Tops|Bottoms|Outerwear|Footwear|Accessories|Statement",
      "brand": "brand name",
      "price_range": "£X–£Y",
      "why": "why this fills a gap",
      "pairs_with": "what it works with in the wardrobe"
    }
  ]
}

Current wardrobe:
${wardrobeSummary}

Style boards (the aesthetic they aspire to):
${boardsSummary}${visualContext}`;

    const messageContent = [
      { type: "text", text: prompt },
      ...imageBlocks
    ];

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
        max_tokens: 4096,
        messages: [{ role: "user", content: messageContent }]
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

  async function runFillGaps(apiKey) {
    if (fillGapsStatus) fillGapsStatus.innerHTML = `<p class="fill-gaps-loading">Analysing your wardrobe and style boards…</p>`;
    fillGapsBtn.disabled = true;
    try {
      const result = await callFillGaps(apiKey);
      const suggestions = result.suggestions || [];

      const newItems = suggestions.map(s => ({
        item:        s.item,
        category:    s.category || "Other",
        brand:       s.brand || "",
        price_range: s.price_range || "",
        why:         s.why || "",
        pairs_with:  s.pairs_with || "",
        searchUrl:   `https://www.google.com/search?q=${encodeURIComponent(`${s.item} ${s.brand || ""}`.trim())}&tbm=shop`
      }));

      const existing = new Set((state.refineList || []).map(i => i.item.toLowerCase()));
      newItems.forEach(item => {
        if (!existing.has(item.item.toLowerCase())) state.refineList.push(item);
      });
      saveRefineList(state.refineList);
      onSuggest?.();

      if (fillGapsStatus) {
        if (!suggestions.length) {
          fillGapsStatus.innerHTML = `<p class="fill-gaps-loading">No suggestions returned — try again.</p>`;
          return;
        }
        fillGapsStatus.innerHTML = `
          <div class="fill-gaps-results">
            <p class="fill-gaps-confirm">✓ Added to your Shopping List</p>
            <div class="fill-gaps-cards">
              ${newItems.map(s => `
                <div class="fill-gaps-card">
                  <div class="fill-gaps-card-head">
                    <h3 class="fill-gaps-card-name">${s.item}</h3>
                    <span class="fill-gaps-card-meta">${[s.brand, s.price_range].filter(Boolean).join(" · ")}</span>
                  </div>
                  <p class="fill-gaps-card-why">${s.why}</p>
                  ${s.pairs_with ? `<p class="fill-gaps-card-pairs">${s.pairs_with}</p>` : ""}
                </div>`).join("")}
            </div>
          </div>`;
      }
    } catch (err) {
      if (fillGapsStatus) fillGapsStatus.innerHTML = `<p class="fill-gaps-loading">${err.message}</p>`;
    } finally {
      fillGapsBtn.disabled = false;
    }
  }

  fillGapsBtn?.addEventListener("click", () => {
    const key = getApiKey();
    if (!key) {
      fillGapsKeyRow?.classList.remove("hidden");
      fillGapsKeyIn?.focus();
      return;
    }
    fillGapsKeyRow?.classList.add("hidden");
    runFillGaps(key);
  });

  fillGapsKeySave?.addEventListener("click", () => {
    const key = fillGapsKeyIn?.value.trim();
    if (!key) return;
    storeApiKey(key);
    fillGapsKeyRow?.classList.add("hidden");
    runFillGaps(key);
  });
}
