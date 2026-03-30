export function renderStyleBoards() {
  return `
    <section class="tab-panel app-section" id="style-boards">
      <div class="section-head">
        <h2>Style Boards</h2>
        <p>Create themed mood boards with images to guide outfit direction and future buys.</p>
      </div>
      <form id="style-board-form" class="style-board-form" autocomplete="off">
        <input name="title" placeholder="Board title (e.g. Minimal Workwear)" required />
        <input name="theme" placeholder="Theme tags (e.g. monochrome, tailoring)" />
        <input name="image" placeholder="Cover image URL" required />
        <button type="submit">Create board</button>
      </form>
      <div id="style-boards-grid" class="style-boards-grid" aria-live="polite"></div>
    </section>
  `;
}

export function initStyleBoards(state) {
  const form = document.querySelector("#style-board-form");
  const grid = document.querySelector("#style-boards-grid");

  const createId = () =>
    globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function render() {
    grid.innerHTML = state.styleBoards.map(board => `
      <article class="board-card">
        <img src="${board.image}" alt="${board.title}" loading="lazy" />
        <div class="board-meta">
          <h3>${board.title}</h3>
          <p>${board.theme || "No theme tags yet"}</p>
        </div>
      </article>`
    ).join("");
  }

  form?.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(form);
    const board = {
      id:    createId(),
      title: String(data.get("title") || "").trim(),
      theme: String(data.get("theme") || "").trim(),
      image: String(data.get("image") || "").trim()
    };
    if (!board.title || !board.image) return;
    state.styleBoards.unshift(board);
    form.reset();
    render();
  });

  render();
}
