# Modular style-app layout (GitHub + Vercel)

Your major product areas are now split into dedicated components so each can be edited independently:

- `web-app/assets/js/components/wardrobe.js`
- `web-app/assets/js/components/generate.js`
- `web-app/assets/js/components/styleBoards.js`
- `web-app/assets/js/components/savedLooks.js`
- `web-app/assets/js/components/shoppingList.js`

Shared shell components:

- `web-app/assets/js/components/header.js`
- `web-app/assets/js/components/footer.js`
- `web-app/assets/js/main.js` (composition order)
- `web-app/assets/styles/main.css` (shared styling)

## Why this is more efficient
- Feature-level edits are isolated to one file.
- Safer refactors: changing one area is less likely to break others.
- Easier collaboration and cleaner diffs in GitHub.

## Deploy to Vercel
1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Deploy (static setup, no build command required).
