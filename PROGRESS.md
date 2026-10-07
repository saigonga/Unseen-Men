# PROGRESS

## Phase 1 — Rebuild the prototype in Next.js · BUILT, waiting for your confirmation

**Done**
- Next.js 16 + TypeScript app. Same screens, copy, look and logic as `face-scan.html` (kept as the reference).
- Face-shape logic ported to `lib/faceShape.ts`; all tunable numbers (NORM, shape offsets, thresholds) in `lib/faceShape.config.ts`.
- `npm run test:logic` runs the prototype's own code and the new code on 2,000 synthetic faces → identical results (shape, %, lean, cuts, avoid, beard tweaks).
- Content (shapes, cuts, beard, skin areas, routines) in `lib/content.ts` for barber/derm review.
- face-api 68-point model served from `/public/models` (extracted from the HTML by `npm run models`), runs on device.
- Photo quality checks + blocking rules (head turned / mouth open) unchanged.
- Story card (1080×1920) and PDF work; on phones they open the share sheet, on desktop they download.
- `?ref=CODE` is captured and stored in localStorage (not sent anywhere yet).
- `.gitignore` covers `.env.local`; `.env.example` lists future keys.
- Small fix: compare bars never say "top 0%" (now min 1%).

**Placeholders**
- Waitlist position (random 400–489), referral count (0), reward text, Nordman product slots.
- Unlock form validates but saves/sends nothing.
- Skin read shows "Coming soon" (phase 4).
- Capture is a single "Open camera" button using the phone's camera/file picker (phase 2 adds live camera + upload).

**Known issues / notes**
- Google renamed "Big Shoulders Display" to "Big Shoulders"; we use the new family (same design).
- First face detection after load takes a few seconds (WebGL warm-up).
- `next dev` appends a Next.js notes block to the end of AGENTS.md; harmless.

## Next
Phase 2 — Camera capture with two options (live camera + upload), HTTPS tunnel for phone testing.
