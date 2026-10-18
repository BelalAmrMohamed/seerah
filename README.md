# رحلة في السيرة
Next.js (static export) · Tailwind v4 · GSAP + Lenis · motion · Three.js (R3F)

    npm install
    npm run dev          # http://localhost:3000
    npm run build        # static site in ./out
    npm run dots         # regenerate public/data/arabia-dots.json

- Data: `src/data/stations.json` (30 stations) · coordinates: `src/data/geo.ts`
- Scroll choreography per station: `src/config/scenes.ts` (assignment) and `src/lib/effects.ts` (10 effects)
- 3D stage (particles + dot-matrix map + route): `src/components/three/Stage.tsx`
Deploy: `npx vercel` (static export; no server needed).
