import { renderWardrobe } from "./wardrobe.js";
import { renderGenerate } from "./generate.js";

// Backward-compatible shim for branches that still import renderHero.
export function renderHero() {
  return `${renderWardrobe()}${renderGenerate()}`;
}
