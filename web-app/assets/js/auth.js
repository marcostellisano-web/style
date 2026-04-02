import { signIn, signOut, signInWithGoogle, onAuthChange } from "./supabase.js";

const GOOGLE_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
</svg>`;

export function renderLoginScreen() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-brand">Modo</div>
        <p class="login-tagline">Your wardrobe, considered.</p>

        <button type="button" id="google-signin-btn" class="google-btn">
          ${GOOGLE_ICON}
          <span>Continue with Google</span>
        </button>

        <div class="login-divider"><span>or</span></div>

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
          <button type="submit" class="login-btn">Sign in with email</button>
          <p id="login-error" class="login-error hidden"></p>
        </form>
      </div>
    </div>
  `;
}

export function initLoginForm() {
  const form    = document.querySelector("#login-form");
  const error   = document.querySelector("#login-error");
  const googleBtn = document.querySelector("#google-signin-btn");

  googleBtn?.addEventListener("click", async () => {
    googleBtn.disabled = true;
    googleBtn.querySelector("span").textContent = "Redirecting…";
    const { error: oauthError } = await signInWithGoogle();
    if (oauthError) {
      googleBtn.disabled = false;
      googleBtn.querySelector("span").textContent = "Continue with Google";
      if (error) {
        error.textContent = oauthError.message;
        error.classList.remove("hidden");
      }
    }
    // On success: browser redirects to Google → back to app → onAuthChange fires
  });

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
      submitBtn.textContent = "Sign in with email";
    }
  });
}

export function initAuth(onLogin, onLogout) {
  const { data: { subscription } } = onAuthChange(user => {
    if (user) onLogin(user);
    else onLogout();
  });
  return subscription;
}

export async function handleSignOut() {
  await signOut();
}
