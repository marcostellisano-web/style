import { signIn, signOut, onAuthChange } from "./supabase.js";

export function renderLoginScreen() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-brand">Modo</div>
        <p class="login-tagline">Your wardrobe, considered.</p>
        <form id="login-form" class="login-form" autocomplete="off" novalidate>
          <input
            type="email"
            id="login-email"
            class="login-input"
            placeholder="Email"
            required
            autocomplete="email"
          />
          <input
            type="password"
            id="login-password"
            class="login-input"
            placeholder="Password"
            required
            autocomplete="current-password"
          />
          <button type="submit" class="login-btn">Sign in</button>
          <p id="login-error" class="login-error hidden"></p>
        </form>
      </div>
    </div>
  `;
}

export function initLoginForm() {
  const form  = document.querySelector("#login-form");
  const error = document.querySelector("#login-error");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const email    = document.querySelector("#login-email")?.value.trim();
    const password = document.querySelector("#login-password")?.value;
    if (!email || !password) return;

    const submitBtn = form.querySelector("[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";
    error.classList.add("hidden");

    const { error: authError } = await signIn(email, password);

    if (authError) {
      error.textContent = authError.message;
      error.classList.remove("hidden");
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign in";
    }
    // On success, onAuthChange fires automatically → main.js handles the rest
  });
}

export function initAuth(onLogin, onLogout) {
  const { data: { subscription } } = onAuthChange(user => {
    if (user) onLogin(user);
    else onLogout();
  });
  return subscription; // caller can call subscription.unsubscribe() if needed
}

export async function handleSignOut() {
  await signOut();
  // onAuthChange fires → main.js re-renders login screen
}
