import { saveProfile } from "../state.js";

const FIELDS = [
  { key: "name",     label: "Name",      placeholder: "Your name" },
  { key: "age",      label: "Age",       placeholder: "34" },
  { key: "location", label: "Location",  placeholder: "City" },
  { key: "build",    label: "Build",     placeholder: "e.g. Slim athletic" },
  { key: "height",   label: "Height",    placeholder: "e.g. 5'8\"" },
  { key: "weight",   label: "Weight",    placeholder: "e.g. 138 lbs" },
  { key: "skin",     label: "Skin tone", placeholder: "e.g. Light olive" },
  { key: "hair",     label: "Hair",      placeholder: "e.g. Dark curly" },
  { key: "notes",    label: "Vibe / notes", placeholder: "e.g. Italian-Canadian runner" },
];

function renderPanel(profile) {
  return `
    <div class="profile-panel-inner">
      <div class="profile-panel-head">
        <p class="profile-panel-kicker">Your Profile</p>
        <p class="profile-panel-desc">Used by AI to personalise outfit and shopping suggestions.</p>
      </div>
      <form id="profile-form" class="profile-form" autocomplete="off">
        <div class="profile-fields">
          ${FIELDS.map(f => `
            <div class="profile-field">
              <label class="profile-field-label">${f.label}</label>
              <input
                name="${f.key}"
                value="${(profile[f.key] || "").replace(/"/g, "&quot;")}"
                placeholder="${f.placeholder}"
                class="profile-field-input"
              />
            </div>`).join("")}
        </div>
        <div class="profile-form-actions">
          <button type="button" id="profile-cancel">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  `;
}

export function initProfile(state) {
  const trigger = document.querySelector("#profile-trigger");
  const panel   = document.querySelector("#profile-panel");
  if (!trigger || !panel) return;

  function open() {
    panel.innerHTML = renderPanel(state.profile);
    panel.classList.remove("hidden");
    trigger.classList.add("is-active");

    document.querySelector("#profile-cancel")?.addEventListener("click", close);

    document.querySelector("#profile-form")?.addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      FIELDS.forEach(f => { state.profile[f.key] = fd.get(f.key)?.trim() || ""; });
      saveProfile(state.profile);
      // Update trigger label
      if (state.profile.name) trigger.textContent = state.profile.name.split(" ")[0];
      close();
    });
  }

  function close() {
    panel.classList.add("hidden");
    trigger.classList.remove("is-active");
  }

  trigger.addEventListener("click", () => {
    panel.classList.contains("hidden") ? open() : close();
  });

  // Set trigger label to first name
  if (state.profile.name) trigger.textContent = state.profile.name.split(" ")[0];
}

export function profilePromptLine(profile) {
  if (!profile?.name) return "";
  const parts = [
    `${profile.name}${profile.age ? `, ${profile.age}` : ""}${profile.location ? ` — ${profile.location}` : ""}`,
    profile.build || profile.height || profile.weight
      ? `Build: ${[profile.build, profile.height, profile.weight].filter(Boolean).join(", ")}`
      : "",
    profile.skin ? `Skin tone: ${profile.skin}` : "",
    profile.hair ? `Hair: ${profile.hair}` : "",
    profile.notes ? `Personal vibe: ${profile.notes}` : "",
  ].filter(Boolean).join(". ");

  return `\nThe person you're styling: ${parts}. Account for their physicality, proportions, and personal vibe when selecting pieces and styling.\n`;
}
