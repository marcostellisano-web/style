/**
 * Supabase client + all DB/storage helpers.
 * Credentials are injected at build time via build.js → env.js.
 * See /supabase/schema.sql to set up your database.
 */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";

// Capture BEFORE createClient runs — Supabase clears the hash asynchronously
// during initialisation, so by the time onAuthStateChange fires it's already gone.
export const isInviteFlow = window.location.hash.includes("type=invite");

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Public storage URL for a given path inside the "photos" bucket
export function photoPublicUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${storagePath}`;
}

// ── Auth ─────────────────────────────────────────────────────────────

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function updatePassword(password) {
  return supabase.auth.updateUser({ password });
}

export function onAuthChange(callback) {
  // Fires immediately with current session, then on every change
  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user ?? null);
  });
}

// ── Photo upload ──────────────────────────────────────────────────────

async function resizeImage(file, maxPx = 1200) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w <= maxPx && h <= maxPx) { resolve(file); return; }
      const scale = Math.min(maxPx / w, maxPx / h);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg", 0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

/**
 * Upload a photo to Supabase Storage.
 * Returns the full public URL (can be used directly as <img src>).
 * @param {File} file
 * @param {"wardrobe"|"style-boards"} folder
 * @param {string} [userId] — omit for anonymous uploads (style-boards only)
 */
export async function uploadPhoto(file, folder, userId) {
  const ext  = file.name.split(".").pop().toLowerCase() || "jpg";
  const base = file.name.slice(0, file.name.lastIndexOf("."))
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  const filename    = `${base}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}.${ext}`;
  const storagePath = userId ? `${userId}/${folder}/${filename}` : `${folder}/${filename}`;

  const resized = await resizeImage(file);

  const { error } = await supabase.storage.from("photos").upload(storagePath, resized, {
    contentType: "image/jpeg",
    upsert: false
  });
  if (error) throw new Error(error.message);

  return photoPublicUrl(storagePath);
}

// ── Data loading ──────────────────────────────────────────────────────

export async function loadUserData(userId) {
  const [wardrobe, boards, profileRes, refineList, savedLooks] = await Promise.all([
    supabase.from("wardrobe_items").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("style_boards").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("refine_list").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("saved_looks").select("*").eq("user_id", userId).order("created_at", { ascending: false })
  ]);

  return {
    wardrobe:    (wardrobe.data   || []).map(normaliseItem),
    styleBoards: (boards.data     || []).map(normaliseBoard),
    profile:     profileRes.data  || {},
    refineList:  (refineList.data || []).map(normaliseRefine),
    savedLooks:  savedLooks.data  || []
  };
}

// Map DB row → JS object (handles snake_case → camelCase and legacy fields)
function normaliseItem(row) {
  return {
    id:          row.id,
    name:        row.name,
    color:       row.color,
    colorHex:    row.colorhex ?? row.colorHex ?? "",
    brand:       row.brand       ?? "",
    category:    row.category    ?? "",
    rating:      row.rating      ?? 7,
    photo:       row.photo       ?? "",
    description: row.description ?? ""
  };
}

function normaliseBoard(row) {
  return {
    id:          row.id,
    title:       row.title,
    description: row.description ?? "",
    tags:        row.tags        ?? [],
    images:      row.images      ?? []
  };
}

function normaliseRefine(row) {
  return {
    id:          row.id,
    item:        row.item        ?? "",
    category:    row.category    ?? "",
    brand:       row.brand       ?? "",
    price_range: row.price_range ?? "",
    why:         row.why         ?? "",
    pairs_with:  row.pairs_with  ?? "",
    searchUrl:   row.search_url  ?? ""
  };
}

// ── Default data seeding (first login) ───────────────────────────────

export async function seedDefaultData(userId, defaultWardrobe, defaultBoards, defaultProfile) {
  await Promise.all([
    supabase.from("wardrobe_items").insert(
      defaultWardrobe.map((item, i) => ({
        id:          item.id,
        user_id:     userId,
        name:        item.name,
        color:       item.color,
        colorhex:    item.colorHex,
        brand:       item.brand       ?? "",
        category:    item.category,
        rating:      item.rating,
        photo:       item.photo       ?? "",
        description: item.description ?? "",
        sort_order:  i
      }))
    ),
    supabase.from("style_boards").insert(
      defaultBoards.map((board, i) => ({
        id:          board.id,
        user_id:     userId,
        title:       board.title,
        description: board.description ?? "",
        tags:        board.tags        ?? [],
        images:      board.images      ?? [],
        sort_order:  i
      }))
    ),
    supabase.from("profiles").upsert({
      user_id:  userId,
      ...defaultProfile
    })
  ]);
}

// ── Wardrobe ──────────────────────────────────────────────────────────

export async function upsertWardrobeItem(item, userId) {
  return supabase.from("wardrobe_items").upsert({
    id:          item.id,
    user_id:     userId,
    name:        item.name,
    color:       item.color,
    colorhex:    item.colorHex,
    brand:       item.brand       ?? "",
    category:    item.category,
    rating:      item.rating,
    photo:       item.photo       ?? "",
    description: item.description ?? ""
  });
}

// ── Style boards ──────────────────────────────────────────────────────

export async function upsertStyleBoard(board, userId) {
  return supabase.from("style_boards").upsert({
    id:          board.id,
    user_id:     userId,
    title:       board.title,
    description: board.description ?? "",
    tags:        board.tags        ?? [],
    images:      board.images      ?? []
  });
}

export async function deleteStyleBoard(id) {
  return supabase.from("style_boards").delete().eq("id", id);
}

// ── Profile ───────────────────────────────────────────────────────────

export async function upsertProfile(profile, userId) {
  return supabase.from("profiles").upsert({ user_id: userId, ...profile });
}

// ── Refine list ───────────────────────────────────────────────────────

export async function syncRefineList(list, userId) {
  // Replace the full list: delete all, then re-insert
  await supabase.from("refine_list").delete().eq("user_id", userId);
  if (!list.length) return;
  return supabase.from("refine_list").insert(
    list.map((item, i) => ({
      id:          item.id ?? globalThis.crypto?.randomUUID?.() ?? `r-${Date.now()}-${i}`,
      user_id:     userId,
      item:        item.item        ?? "",
      category:    item.category    ?? "",
      brand:       item.brand       ?? "",
      price_range: item.price_range ?? "",
      why:         item.why         ?? "",
      pairs_with:  item.pairs_with  ?? "",
      search_url:  item.searchUrl   ?? "",
      sort_order:  i
    }))
  );
}

// ── Saved looks ───────────────────────────────────────────────────────

export async function syncSavedLooks(looks, userId) {
  await supabase.from("saved_looks").delete().eq("user_id", userId);
  if (!looks.length) return;
  return supabase.from("saved_looks").insert(
    looks.map(look => ({
      id:       look.id ?? globalThis.crypto?.randomUUID?.(),
      user_id:  userId,
      headline: look.headline ?? "",
      note:     look.note     ?? "",
      rating:   look.rating   ?? 0,
      items:    look.items    ?? [],
      upgrade:  look.upgrade  ?? null
    }))
  );
}
