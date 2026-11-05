# Sagar Avatar — scroll camera mapping (staged, not deployed)

This scene uses `web/public/models/sagar-avatar.glb` (the approved **nine-sticker GLB**) and the site's **existing résumé anchors** without changing any experience data or the sticker meshes.

| Existing résumé anchor | Experience | GLB sticker object | Camera yaw (front = 0°) | Distance | FOV |
|---|---|---|---:|---:|---:|
| `focus-1` | Independent — Social Media Content Strategist & Project Manager | `DECAL_06_SocialMediaCat_Career` | -69° (right profile) | 0.70 | 29° |
| `focus-2` | Freelance — Scriptwriter | `DECAL_01_WriterCat_LeftTemple` | +68° (left profile) | 0.71 | 29° |
| `focus-3` | Syngene International Ltd. — Research Professional | `DECAL_03_LabFlaskCat_Career` | +68° (left profile) | 0.74 | 29° |
| `focus-4` | Analytica Chemie Inc. — Synthetic Chemistry R&D | `DECAL_02_ScientistCat_RightTemple` | -69° (right profile) | 0.74 | 29° |

The camera looks slightly **to the right of the sticker**, so the relevant sticker stays on the **left side of the screen**, leaving the right résumé rail legible. The target point is determined from the real decal mesh bounds at runtime—not old-model camera animation data.

## Behavior

- First-screen hero: three-quarter/full avatar overview with room for the introduction.
- On resume scroll: camera holds at each career sticker when that block reaches the 30%-from-top reference line.
- Between work blocks: smoothly orbits **in front of the face**, preventing jumps or moving through the head.
- Reverse scroll moves back through the same path.
- On entering Selected Works: zooms back toward an overview while the original gallery remains untouched.
- Mobile: camera pulls back and reduces the horizontal framing offset.
- Sticker materials, positions, sizes, textures, and original GLB bytes remain untouched.
- No depth-of-field blur on the sticker, maintaining readability.

## Integration into the existing repo (AFTER approval)

1. Copy `web/src/scene/SagarScene.tsx` to the same path in the portfolio repo.
2. Copy `web/public/models/sagar-avatar.glb` to the same path in the repo.
3. Change **one line** in `web/src/App.tsx`:

   ```diff
   -import Scene from './scene/Scene'
   +import Scene from './scene/SagarScene'
   ```

4. Run the existing `npm ci` / `npm run build` in `web/`.
5. Preview locally before approving a GitHub Pages deployment.

**Rollback:** Restore that one import to `./scene/Scene`. Nothing else in the existing site changes.

## Testing status and limitations

- Verified that all four target decal objects are present in the exact GLB supplied.
- Four camera landings and a scroll-orbit demonstration were rendered using the actual GLB in a separate 3D renderer.
- TSX transpilation/syntax check passed.
- A real React/browser build and responsive behavior on the live website **have not been tested in this environment**, because the repository's npm dependencies and a local browser runtime are unavailable offline. Review visuals as a camera choreography demonstration, not a screenshot of a deployed website.
- Asset file size is approximately 85 MB: the file is deliberately not lossy-compressed and may need a loading performance strategy before production publishing.

**No code or GLB was pushed to GitHub.**
