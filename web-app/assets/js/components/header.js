const navItems = [
  { href: "#wardrobe", label: "Wardrobe", active: true },
  { href: "#generate", label: "Generate" },
  { href: "#style-boards", label: "Most Worn" },
  { href: "#saved-looks", label: "Saved Looks" },
  { href: "#shopping-list", label: "Shopping List", outlined: true }
];

export function renderHeader() {
  const links = navItems.map((item, index) => {
    const active = index === 0 ? "is-active" : "";
    return `<a class="top-nav-link ${active}" href="${item.href}">${item.label}</a>`;
  });

  return `
    <header class="site-header">
      <div class="header-inner">
        <div class="brand">FORMA</div>
        <nav class="top-nav" aria-label="Primary">${links.join("")}</nav>
      </div>
    </header>
  `;
}
