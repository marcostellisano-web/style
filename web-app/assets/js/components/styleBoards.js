const STOP_WORDS = new Set([
  "https", "http", "www", "com", "net", "org", "jpg", "jpeg", "png", "webp", "gif",
  "image", "images", "img", "photo", "photos", "board", "style", "upload", "cdn", "fit", "crop", "auto", "format", "q", "w"
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
      .filter(word => word.length > 2 && !STOP_WORDS.has(word) && Number.isNaN(Number(word)))
      .forEach(word => frequency.set(word, (frequency.get(word) || 0) + 1));
  });

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function buildBoard({ title, images }) {
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
    tags,
    images
  };
}

function normalizeBoard(board) {
  if (Array.isArray(board.images)) {
    return {
      id: board.id || createId(),
      title: board.title || "Untitled board",
      tags: Array.isArray(board.tags)
        ? board.tags.filter(Boolean)
        : String(board.theme || "").split(",").map(tag => tag.trim()).filter(Boolean),
      images: board.images.filter(Boolean)
    };
  }

  return {
    id: board.id || createId(),
    title: board.title || "Untitled board",
    tags: String(board.theme || "").split(",").map(tag => tag.trim()).filter(Boolean),
    images: board.image ? [board.image] : []
  };
}

export function renderStyleBoards() {
  return `
    <section class="tab-panel app-section" id="style-boards">
      <div class="style-boards-head">
        <div>
          <p class="style-boards-kicker">Inspiration</p>
          <h2>Style <em>Boards</em></h2>
          <p class="style-boards-subhead">Paste image URLs and keywords. AI-generated board tags and titles can be edited anytime.</p>
        </div>
        <button type="button" class="new-board-btn" id="style-board-toggle">+ New Board</button>
      </div>

      <form id="style-board-form" class="style-board-form hidden" autocomplete="off">
        <input name="title" placeholder="Optional custom title" />
        <textarea name="images" placeholder="Paste image URLs (one per line)" required></textarea>
        <div class="style-board-form-actions">
          <button type="button" id="style-board-cancel">Cancel</button>
          <button type="submit">Create board</button>
        </div>
      </form>

      <div id="style-boards-grid" class="style-boards-grid" aria-live="polite"></div>
    </section>
  `;
}

export function initStyleBoards(state) {
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
      const topTags = board.tags.length ? board.tags.join(", ") : "No tags yet";
      const tagPills = board.tags.length
        ? board.tags.map(tag => `<span class="board-tag">${escapeHtml(tag)}</span>`).join("")
        : '<span class="board-tag">untagged</span>';

      const cells = Array.from({ length: 6 }, (_, index) => {
        const image = board.images[index];
        if (!image) return `<div class="board-tile placeholder" aria-hidden="true"></div>`;
        return `<div class="board-tile"><img src="${escapeHtml(image)}" alt="${escapeHtml(board.title)} reference ${index + 1}" loading="lazy" /></div>`;
      }).join("");

      return `
        <article class="board-card" data-board-id="${escapeHtml(board.id)}">
          <header class="board-header">
            <h3>${escapeHtml(board.title)}</h3>
            <p>${escapeHtml(topTags)}</p>
          </header>
          <div class="board-tiles">${cells}</div>
          <footer class="board-footer">
            <div class="board-tags">${tagPills}</div>
            <div class="board-actions-inline">
              <button type="button" class="board-action" data-action="edit">Edit</button>
              <button type="button" class="board-action remove" data-action="remove">Remove</button>
            </div>
          </footer>
          <form class="board-edit-form hidden" data-edit-form>
            <input name="title" value="${escapeHtml(board.title)}" placeholder="Board title" required />
            <textarea name="images" required>${escapeHtml(board.images.join("\n"))}</textarea>
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

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const images = parseImageList(data.get("images"));
    if (!images.length) return;

    const board = buildBoard({
      title: String(data.get("title") || "").trim(),
      images
    });

    state.styleBoards.unshift(board);
    form.reset();
    form.classList.add("hidden");
    render();
  });

  grid?.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const card = target.closest(".board-card");
    if (!card) return;

    const boardId = card.getAttribute("data-board-id");
    const action = target.getAttribute("data-action");
    if (!boardId || !action) return;

    if (action === "remove") {
      state.styleBoards = state.styleBoards.filter(board => board.id !== boardId);
      render();
      return;
    }

    const editForm = card.querySelector("[data-edit-form]");
    if (!(editForm instanceof HTMLElement)) return;

    if (action === "edit") {
      editForm.classList.remove("hidden");
    }

    if (action === "cancel-edit") {
      editForm.classList.add("hidden");
    }
  });

  grid?.addEventListener("submit", event => {
    const formElement = event.target;
    if (!(formElement instanceof HTMLFormElement) || !formElement.matches("[data-edit-form]")) return;
    event.preventDefault();

    const card = formElement.closest(".board-card");
    const boardId = card?.getAttribute("data-board-id");
    if (!boardId) return;

    const data = new FormData(formElement);
    const images = parseImageList(data.get("images"));
    if (!images.length) return;

    const board = state.styleBoards.find(item => item.id === boardId);
    if (!board) return;

    board.title = String(data.get("title") || "").trim() || board.title;
    board.images = images;
    board.tags = deriveKeywords(images);
    render();
  });

  render();
}
