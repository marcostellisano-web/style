import { renderHeader } from "./components/header.js";
import { renderWardrobe } from "./components/wardrobe.js";
import { renderGenerate } from "./components/generate.js";
import { renderStyleBoards } from "./components/styleBoards.js";
import { renderSavedLooks } from "./components/savedLooks.js";
import { renderShoppingList } from "./components/shoppingList.js";
import { renderFooter } from "./components/footer.js";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("#app mount element not found");
}

app.innerHTML = `
  ${renderHeader()}
  <main id="main-content">
    ${renderWardrobe()}
    ${renderGenerate()}
    ${renderStyleBoards()}
    ${renderSavedLooks()}
    ${renderShoppingList()}
  </main>
  ${renderFooter()}
`;
