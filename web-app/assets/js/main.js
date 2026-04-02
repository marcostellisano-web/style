import { state, DEFAULT_WARDROBE, DEFAULT_STYLE_BOARDS, DEFAULT_PROFILE } from "./state.js";
import { renderHeader } from "./components/header.js";
import { renderWardrobe, initWardrobe } from "./components/wardrobe.js";
import { renderGenerate, initGenerate } from "./components/generate.js";
import { renderStyleBoards, initStyleBoards } from "./components/styleBoards.js";
import { renderSavedLooks, initSavedLooks } from "./components/savedLooks.js";
import { renderShoppingList, initShoppingList } from "./components/shoppingList.js";
import { renderFooter } from "./components/footer.js";
import { initProfile } from "./components/profile.js";
import { loadUserData, seedDefaultData } from "./supabase.js";
import { renderLoginScreen, initLoginForm, initAuth } from "./auth.js";

const app = document.querySelector("#app");
if (!app) throw new Error("#app mount element not found");

// Show login screen immediately while auth state resolves
app.innerHTML = renderLoginScreen();
initLoginForm();

initAuth(
  // ── Logged in ────────────────────────────────────────────────────
  async (user) => {
    state.currentUser = user;

    // Load this user's data from Supabase
    let data = await loadUserData(user.id);

    // First-time login: seed defaults so the app isn't empty
    if (!data.wardrobe.length && !data.styleBoards.length) {
      await seedDefaultData(user.id, DEFAULT_WARDROBE, DEFAULT_STYLE_BOARDS, DEFAULT_PROFILE);
      data = await loadUserData(user.id);
    }

    // Populate state from Supabase (overrides any localStorage cache)
    state.wardrobe     = data.wardrobe;
    state.styleBoards  = data.styleBoards;
    state.profile      = data.profile;
    state.refineList   = data.refineList;
    state.savedLooks   = data.savedLooks;

    // Render the full app
    app.innerHTML = `
      ${renderHeader()}
      <main id="main-content" class="app-main">
        ${renderWardrobe()}
        ${renderGenerate()}
        ${renderStyleBoards()}
        ${renderSavedLooks()}
        ${renderShoppingList()}
      </main>
      ${renderFooter()}
    `;

    // Tab switching
    function activateTab(tabId) {
      document.querySelectorAll(".top-nav-btn").forEach(btn =>
        btn.classList.toggle("is-active", btn.dataset.tab === tabId)
      );
      document.querySelectorAll(".tab-panel").forEach(panel =>
        panel.classList.toggle("tab-visible", panel.id === tabId)
      );
    }
    document.querySelectorAll(".top-nav-btn").forEach(btn =>
      btn.addEventListener("click", () => activateTab(btn.dataset.tab))
    );
    activateTab("wardrobe");

    // Init modules
    initProfile(state);
    const { update: updateSavedLooks }    = initSavedLooks(state);
    const { refresh: refreshShoppingList } = initShoppingList(state);
    initStyleBoards(state, { onSuggest: () => refreshShoppingList() });
    initWardrobe(state, { onRefine: () => refreshShoppingList() });
    initGenerate(state, { onSaveLook: () => updateSavedLooks() });
  },

  // ── Logged out ───────────────────────────────────────────────────
  () => {
    state.currentUser = null;
    app.innerHTML = renderLoginScreen();
    initLoginForm();
  }
);
