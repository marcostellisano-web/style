const navItems = [
  { id: "wardrobe", label: "Wardrobe" },
  { id: "generate", label: "Generate" },
  { id: "style-boards", label: "Style Boards" },
  { id: "saved-looks", label: "Saved Looks" },
  { id: "shopping-list", label: "Shopping List" },
];

export function renderHeader() {
  const links = navItems
    .map((item, i) =>
      `<button class="top-nav-btn${i === 0 ? " is-active" : ""}" data-tab="${item.id}">${item.label.toUpperCase()}</button>`
    )
    .join("");

  return `
    <header class="site-header">
      <div class="header-inner">
        <div class="brand">Cur<span class="brand-accent">a</span>to</div>
        <nav class="top-nav" aria-label="Primary">${links}</nav>
        <div class="status-dot" aria-hidden="true"></div>
      </div>
    </header>
  `;
}
