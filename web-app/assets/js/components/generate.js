export function renderGenerate() {
  return `
    <section class="tab-panel app-section" id="generate">
      <div class="section-head">
        <h2>AI Outfit Generator</h2>
        <p>Generate combinations from your real wardrobe items. Includes headline, stylist note, rating, and upgrade suggestions.</p>
      </div>
      <div class="generate-controls">
        <input id="claude-key" placeholder="Claude API key (optional in demo)" />
        <button id="generate-outfits" type="button">Generate outfits</button>
      </div>
      <div id="outfit-results" class="outfit-results"></div>
    </section>
  `;
}
