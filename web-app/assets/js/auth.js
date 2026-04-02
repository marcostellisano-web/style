import { signIn, signOut, updatePassword, onAuthChange } from "./supabase.js";

function friendlyError(err) {
  if (!err) return "";
  const msg = err.message ?? "";
  if (msg.includes("Invalid login credentials")) return "Incorrect email or password.";
  if (msg.includes("Email not confirmed"))        return "Please confirm your email before signing in.";
  return msg;
}

export function renderLoginScreen() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-brand">Modo</div>
        <p class="login-tagline">Your wardrobe, considered.</p>
        <p id="login-error" class="login-error hidden"></p>
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
        </form>
      </div>
    </div>
  `;
}

export function initLoginForm() {
  const form    = document.querySelector("#login-form");
  const errorEl = document.querySelector("#login-error");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const email    = document.querySelector("#login-email")?.value.trim();
    const password = document.querySelector("#login-password")?.value;
    if (!email || !password) return;

    const btn = form.querySelector("[type=submit]");
    btn.disabled    = true;
    btn.textContent = "Signing in…";
    errorEl.classList.add("hidden");

    const { error } = await signIn(email, password);
    if (error) {
      errorEl.textContent = friendlyError(error);
      errorEl.classList.remove("hidden");
      btn.disabled    = false;
      btn.textContent = "Sign in";
    }
  });
}

export function renderSetPasswordScreen() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-brand">Modo</div>
        <p class="login-tagline">Welcome — set your password to continue.</p>
        <p id="setpw-error" class="login-error hidden"></p>
        <form id="setpw-form" class="login-form" autocomplete="off" novalidate>
          <input
            type="password"
            id="setpw-password"
            class="login-input"
            placeholder="Choose a password"
            required
            minlength="8"
            autocomplete="new-password"
          />
          <input
            type="password"
            id="setpw-confirm"
            class="login-input"
            placeholder="Confirm password"
            required
            autocomplete="new-password"
          />
          <button type="submit" class="login-btn">Set password &amp; continue</button>
        </form>
      </div>
    </div>
  `;
}

export function initSetPasswordForm(onSuccess) {
  const form    = document.querySelector("#setpw-form");
  const errorEl = document.querySelector("#setpw-error");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const pw      = document.querySelector("#setpw-password")?.value;
    const confirm = document.querySelector("#setpw-confirm")?.value;
    const btn     = form.querySelector("[type=submit]");

    if (!pw || pw.length < 8) {
      errorEl.textContent = "Password must be at least 8 characters.";
      errorEl.classList.remove("hidden");
      return;
    }
    if (pw !== confirm) {
      errorEl.textContent = "Passwords don't match.";
      errorEl.classList.remove("hidden");
      return;
    }

    btn.disabled    = true;
    btn.textContent = "Saving…";
    errorEl.classList.add("hidden");

    const { error } = await updatePassword(pw);
    if (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove("hidden");
      btn.disabled    = false;
      btn.textContent = "Set password & continue";
      return;
    }

    history.replaceState(null, "", window.location.pathname);
    onSuccess();
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
