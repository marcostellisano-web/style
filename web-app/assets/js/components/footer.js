export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container">
        <small>&copy; ${year} Your App</small>
      </div>
    </footer>
  `;
}
