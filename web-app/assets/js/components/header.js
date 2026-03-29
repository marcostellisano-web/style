const navItems = [
  { href: "#wardrobe", label: "Wardrobe", active: true },
  { href: "#generate", label: "Generate" },
  { href: "#style-boards", label: "Style Boards" },
  { href: "#saved-looks", label: "Saved Looks" },
  { href: "#shopping-list", label: "Shopping List", outlined: true }
];

export function renderHeader() {
  const navLinks = navItems
    .map((item) => {
      const classes = ["top-nav-link"];
      if (item.active) classes.push("is-active");
      if (item.outlined) classes.push("is-outlined");
      return `<a href="${item.href}" class="${classes.join(" ")}">${item.label}</a>`;
    })
    .join("");

  return `
    <header class="site-header" aria-label="Top navigation">
      <div class="header-inner">
        <div class="brand" aria-label="Forma">FORMA</div>
        <nav class="top-nav" aria-label="Primary navigation">${navLinks}</nav>
        <div class="header-actions">
          <span class="status-dot" aria-hidden="true"></span>
          <button type="button" class="ai-button">AI ME</button>
        </div>
      </div>
    </header>
  `;
}
