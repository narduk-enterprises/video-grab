# Role and Objective

You are an expert Nuxt 4, Cloudflare Workers, and Vue developer. You have been dropped into a newly cloned monorepo based on `video-grab`.

**You have a dual mission:**

1. **Build "Video Grab"**: A simple tool where users paste a video link (starting with X/Twitter) and download the video. Using Nuxt 4, Cloudflare Workers, and Nuxt UI 4.
2. **Template Audit**: Report any friction, broken types, or tooling failures.

---

## Step 0: Project Setup

Run the setup script (the script is NOT interactive):

```
pnpm run setup -- --name="video-grab" --display="Video Grab" --url="https://video-grab.nard.uk"
```

Then read `AGENTS.md` and `tools/BUILD_TEST_APP.md` if they exist.

---

## Mission 1: Build Video Grab

Build the app inside `apps/web`. **Start with X (Twitter) only**; we will add YouTube and other sources later.

### 1. Core flow

- **One main page**: A single input where the user pastes a video URL (e.g. `https://x.com/...` or `https://twitter.com/...`).
- **Validate** the URL is an X/Twitter link; show a clear error if not.
- **Download**: On submit, the server fetches the video from X and returns it (or a direct download link). The user gets the video file (or a “Download” link that triggers the file download).

### 2. API (Nitro / Cloudflare Workers)

- **POST `/api/download`** (or similar): Accepts `{ url: string }`. Validate URL is X/Twitter. Fetch the video (use a strategy that works on Workers: e.g. a server-side library that can extract X video URLs, or a small proxy to a public API; avoid Node-only deps — Cloudflare Workers are edge). Return the video file (stream or redirect) or a JSON error.
- **Optional GET `/api/info`**: Accepts `?url=...`, returns minimal metadata (title, thumbnail) if useful for UI. Can be added in a follow-up.
- Use **rate limiting** on the download endpoint (layer provides `enforceRateLimit`).
- Validate body with **Zod**; never trust raw `readBody()` without validation.

### 3. Frontend (Nuxt UI 4)

- **Home page** (`app/pages/index.vue`): Centered card with:
  - A text input (or textarea) for pasting the video URL.
  - A primary button: “Grab video” (or “Download”).
  - Loading state while the request is in progress.
  - Success: show a download link or trigger file download (e.g. open blob URL or redirect to a signed URL that streams the file).
  - Error: show inline message (e.g. “Not an X/Twitter link” or “Could not fetch video”).
- Use **Nuxt UI 4** components (`UForm`, `UButton`, `UInput` or `UTextarea`, `UAlert` for errors), design tokens, and Tailwind v4. Keep the layout clean and minimal.
- **SEO**: Call `useSeo()` and `useWebPageSchema()` on the page (required by the template).

### 4. Database (optional for v1)

- For the first version, **no database is required**. If you want a simple “history” later, you can add a `downloads` table (e.g. `url`, `created_at`, `status`). Start without D1 if that’s simpler; we can add it when we enhance with more sources.

### 5. Constraints

- **Cloudflare Workers**: No Node.js modules (`fs`, `path`, `crypto` from Node). Use Web Crypto API if needed.
- **X only for now**: Reject non-X/non-Twitter URLs with a clear message. We’ll add YouTube and others in a later iteration.
- **No raw `$fetch` in frontend**: Use `useFetch` or `useAsyncData` for data fetching.

---

## Mission 1b: Brand Identity

Once the app is built and functional, follow the **/generate-brand-identity** workflow (`.agents/workflows/generate-brand-identity.md`) end-to-end. **Do not ask any questions** — you are the creative director. Analyze the app, make all creative decisions yourself, and execute the full pipeline: theme colors, typography, visual assets (logo, hero imagery), favicons, and holistic design polish. The app should feel like a real product — not a template.

---

## Mission 2: Template Audit & Issue Reporting

Create `audit_report.md` answering:

1. Did `pnpm run setup` complete smoothly?
2. Did Drizzle migration and `nitro-cloudflare-dev` work out of the box (if you used D1)?
3. Did Nuxt layer inheritance work seamlessly?
4. Any pre-existing TypeScript errors from `pnpm run typecheck`?
5. Did documentation accurately guide you?
6. Any HMR port collisions, Tailwind issues, or Doppler errors?

### Final deliverable

- Working code for **Video Grab** with **zero errors and zero warnings** (TypeScript, ESLint, build).
- `audit_report.md` with honest feedback.

**CRITICAL RULE:** If you encounter errors or warnings, fix them properly. Do **not** use `@ts-expect-error`, eslint-disable, or suppressions. Solve the root cause.
