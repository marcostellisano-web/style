const navItems = [
  { href: "#wardrobe", label: "Wardrobe" },
  { href: "#generate", label: "Generate" },
  { href: "#style-boards", label: "Style Boards" },
  { href: "#saved-looks", label: "Saved Looks" },
  { href: "#shopping-list", label: "Shopping List" }
];

export function renderHeader() {
  const navLinks = navItems
    .map((item) => `<a href="${item.href}">${item.label}</a>`)
    .join("");

  return `
    <header class="site-header">
      <div class="container">
        <div class="brand">Style App</div>
        <nav class="main-nav" aria-label="Primary navigation">${navLinks}</nav>
      </div>
    </header>
  `;
}
