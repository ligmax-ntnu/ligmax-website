# Ligmax — Team Website

Official website for **Team Ligmax**, an autonomous surface vessel team from the NTNU
Department of Electronic Systems, competing at [Njord — The Autonomous Ship
Challenge](https://www.njordchallenge.com/) 2026. Live at [ligmax.no](https://ligmax.no).
Ligmax is one of the machines built by [Dialga](https://dialga.no), the student engineering
organisation behind the project.

Built with [Astro](https://astro.build) — fully static output, no server required.

## Commands

| Command           | Action                                            |
| ----------------- | ------------------------------------------------- |
| `npm install`     | Install dependencies                              |
| `npm run dev`     | Local dev server at `localhost:4321`              |
| `npm run build`   | Production build to `./dist/`                     |
| `npm run preview` | Preview the production build locally              |
| `npm run deploy`  | Build and deploy to Cloudflare Pages via Wrangler |

## Deploying to Cloudflare (ligmax.no)

### Option A — Git integration (recommended)

1. Push this repo to GitHub/GitLab.
2. In the [Cloudflare dashboard](https://dash.cloudflare.com): **Workers & Pages → Create → Pages → Connect to Git**.
3. Settings: framework preset **Astro**, build command `npm run build`, output directory `dist`.
4. After the first deploy: **Custom domains → Add** `ligmax.no` (and `www.ligmax.no`).
   Since the domain's DNS is on Cloudflare, the records are created automatically.

Every push to the main branch then deploys automatically.

### Option B — Direct upload from this machine

```sh
npx wrangler login          # once
npm run deploy              # builds and uploads ./dist
```

Then add the custom domain in the Pages project settings as above.

## Updating content

- **Copy & sections** — components live in `src/components/` (one per page section).
- **Specs** — edit the `specs` array in `src/components/Vessel.astro`.
- **Team** — edit `src/components/Team.astro` (members are listed in alphabetical order).
- **Contact email** — set in `src/components/Sponsor.astro` and `src/components/Footer.astro`
  (currently `andreas.e.lindeman@gmail.com`).
- **3D explorer part descriptions** — edit `src/data/part-info.json`. Every mesh in the model has
  an entry keyed by its node name in the GLB; fill in `title` (display name) and `description`.
  Untitled parts fall back to a hull-region label or "Structural component" when clicked. The
  "Highlight a system" groups are defined in the `SYSTEMS` object in
  `src/components/VesselExplorer.astro`.
- **Images** — drop files in `src/assets/` and import them; Astro optimises them at build time.
  Downscale very large originals to ~2000 px first — Astro emits a full-size variant as the
  `src` fallback, so a 7952 px photo ships a needless 2 MB file.
- **Competition clips** — `public/videos/`, one `.mp4` plus a same-named `.jpg` poster per clip,
  wired up through `src/components/VideoFigure.astro`. Encode from the originals in
  `competition_images/` (gitignored) with `-display_rotation:v:0 0` — the iPhone `.MOV` files
  carry a stale rotation flag that turns landscape footage sideways — and always finish with
  `-movflags +faststart`. Keep every file under Cloudflare Pages' 25 MiB per-file limit.
- **3D model** — `public/models/ligmax.glb`, Draco-compressed from the CAD export via
  `npx @gltf-transform/cli optimize <in.glb> public/models/ligmax.glb --compress draco --texture-compress webp`.
- **Technical report PDF** — `public/docs/ligmax-technical-report-2026.pdf`.
- **Social preview image** — regenerate with `node scripts/generate-og.mjs` after changing the render.

Source material (original renders, PDFs, CAD export) is kept in `source-material/` and is not
part of the build.
