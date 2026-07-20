# AGENTS.md

## Project overview

React + Vite SPA ("QuickTimestamps") with Firebase Hosting, Firestore, Auth, Storage, and Cloud Functions. Generates YouTube video timestamps/chapters via DeepSeek API.

## Commands

### Frontend

```bash
npm run dev       # Vite dev server
npm run build     # Output to dist/
npm run lint      # ESLint (src only, ignores dist/ and functions/)
npm run preview   # Preview production build
```

### Cloud Functions (`functions/`)

```bash
cd functions && npm run deploy   # Deploy functions
cd functions && npm run serve    # Local emulator
```

### Firebase Emulators (all services)

```bash
firebase emulators:start
```

Emulator ports: Auth 9099, Firestore 8080, Functions 5001, Hosting 5000, Storage 9199.

## Environment variables

- **Root `.env`**: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- **`functions/.env.local`**: `DEEPSEEK_API_KEY` (used by `generateTimestamps` callable function)

## Architecture

- Entry: `index.html` → `src/main.jsx` → `src/App.jsx` → `src/unAuth/LandingPage.jsx`
- Components: `src/unAuth/components/` (Navbar, Timestamp, Bumpups, Footer)
- Firebase client init: `src/firebase.js` — auto-connects emulators on localhost
- Cloud Functions: `functions/index.js` — single callable `generateTimestamps`
- Functions use CommonJS; frontend uses ESM (`"type": "module"`)
- Functions runtime: Node 22

## Key details

- ESLint ignores `dist/` and `functions/` — lint only covers frontend JSX/JS
- No TypeScript, no test framework configured
- Storage rules (`storage.rules`) expire August 16, 2026 — plan to update before then
- Firebase project: `react-firebase-app-a9f9e`
- Hosting serves from `dist/` with SPA rewrite (`**` → `/index.html`)
