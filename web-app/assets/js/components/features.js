import { renderStyleBoards } from "./styleBoards.js";
import { renderSavedLooks } from "./savedLooks.js";
import { renderShoppingList } from "./shoppingList.js";

// Backward-compatible shim for branches that still import renderFeatures.
export function renderFeatures() {
  return `${renderStyleBoards()}${renderSavedLooks()}${renderShoppingList()}`;
}
