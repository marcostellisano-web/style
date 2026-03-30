export function renderStyleBoards() {
  return `
    <section class="tab-panel app-section" id="style-boards">
      <div class="section-head">
        <h2>Style Boards</h2>
        <p>Create themed mood boards (like Pinterest) with images to guide outfit direction and future buys.</p>
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
