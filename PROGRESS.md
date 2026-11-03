# PROGRESS

## Phase 1 — Rebuild the prototype in Next.js · DONE
Next.js 16 + TypeScript rebuild of `face-scan.html`. Logic check (`npm run test:logic`) matches the prototype on 2,000 synthetic faces.

## Update 1 (requested changes; covers most of phase 2) · BUILT, waiting for phone test
**Done**
- **Capture has two options:** "Take a photo" (live front camera in the page) and "Upload a photo" (gallery).
  - Live camera: mirrored preview, oval guide, one instruction at a time (section 3 order), oval turns green, countdown, auto-capture after holding still, manual shutter, 9 frames averaged, "turn left… now right" sweep, un-mirrored frame saved, camera stopped right after.
  - Fallbacks: permission denied / no camera / unsupported / http (insecure) / Instagram & Facebook in-app browser → message + upload.
- **Men-only gate:** on-device face-structure gender model (face-api age/gender net; age output ignored). Blocks when female probability ≥ `FEMALE_BLOCK_P` (0.8, in `lib/capture.config.ts`). Applies to camera and upload. Test set: women 0.89–0.98, men 0.02–0.13. Never shown, stored or sent.
- **Beard advice depends on current beard:** clean-shaven → which beards would suit; stubble/full → how to shape it + best styles (`keep` text per shape in `lib/content.ts`).
- **Visual haircuts and beards:** line-art illustrations for every cut and beard (`lib/illustrations.ts`), used in the app, story card and PDF.
- **AI try-on on his own photo:** `app/api/tryon/route.ts` (OpenAI image edit, `gpt-image-2`). Opt-in tick box + button; photo held in memory for that one call, never logged or stored. Off until `OPENAI_API_KEY` is set in `.env.local`. Rate limit 6/hour per IP (in-memory).
- **Story card redesigned:** his photo with brass jawline scan, face shape, match %, cut + beard panels with illustrations, code. Toggles: "Hide my photo", "Use my new-look preview".
- **Unlock form:** first name + Indian WhatsApp mobile (required; 10 digits starting 6–9, +91/0 allowed; rejects fakes like 9999999999 / 9876543210) + optional email.
- **PDF redesigned:** branded header with name + mobile, photo, shape, compare bars, illustrated cut/avoid/beard cards, try-on image, routine, invite code. Clear "saved to Downloads/Files" message after saving.
- **Bug fixes:** `img.decode()` could hang in some browsers → replaced with onload loader; compare bars never "top 0%".
- **HTTPS tunnel for phone testing:** `npm run tunnel` (cloudflared quick tunnel; the URL changes every run).

**Placeholders**
- Waitlist position, referral count, reward, Nordman product slots; unlock form saves nothing.
- Skin read "coming soon" (phase 4). Illustrations are placeholder art (barber to review).
- AI try-on needs `OPENAI_API_KEY`; the rate limit isn't shared across servers yet.

**Known issues / decisions to confirm**
- AGENTS.md says photos are never uploaded except for the skin read. The try-on is a second, opt-in upload that the owner requested; update AGENTS.md section 7 and the privacy policy.
- Gender detection can misread some men (soft features, long hair) and has only been tested on 14 faces; tune `FEMALE_BLOCK_P` with real Indian selfies during calibration.
- Chin-up/down and smile thresholds are rough; calibrate in phase 7.
- Head-turn sweep doesn't feed jaw confidence yet.

## Update 2 — stable face shape + try-on per suggestion · BUILT
- **Bug: the same face gave different shapes.** Cause: one landmark pass is about as noisy as the real difference between faces (jaw width varies ~2% between people). Fix: `lib/robust.ts` measures each photo 8 times (4 detector sizes × mirrored) and, for the camera, also every captured frame, then uses the median.
- Stability lab (dev only): `/dev/stability` re-scans test photos in `/public/_test` with 6 framings. Result on 12 test photos: old method changed shape on 5/12 (one flipped oval → diamond → rectangle); new method on 2/12 (borderline faces).
- Different photos of the same person can still give different shapes → the 68-point model is the limit. Phase 3 (MediaPipe, 478 points) + phase 7 calibration are the real fix.
- "Leaning X" now reads "85% Square match · with some Rectangle features".
- **AI try-on per suggestion:** each top cut and beard style has "See it on me" (hair only / beard only), plus "Show my full new look" (both). One consent tick box. The best available preview feeds the story card and PDF. Needs `OPENAI_API_KEY` in `.env.local` (file created, empty).

## Phase 3 — MediaPipe 478-point + debug view · BUILT
- **MediaPipe Face Landmarker** (478 points) is now the primary detector for still photos. face-api 68-point is the automatic fallback (old browsers, no WASM). Gender gate stays on face-api's ageGenderNet.
- `lib/landmarkMap.ts`: verified 478→68 index mapping (source: Real3DPortrait on HuggingFace).
- `lib/mediapipe.ts`: FaceLandmarker wrapper (IMAGE + VIDEO modes), native head pose from facial transformation matrix.
- `lib/detector.ts`: MediaPipe primary + face-api fallback. `Detection` interface extended with `P478` and `pose`.
- `lib/robust.ts`: MediaPipe path uses 2 passes (original + mirrored) vs face-api's 8 passes. Steadier model = fewer passes needed.
- `lib/quality.ts`: uses native MediaPipe head pose (yaw/pitch/roll) when available, landmark-based fallback otherwise.
- `lib/overlay.ts`: optional 478-mesh rendering for debug view.
- `components/DebugPanel.tsx`: hidden `?debug` panel showing engine, head pose, raw measurements, z-scores, shape scores, all 6 probabilities, 478 mesh toggle.
- `public/mediapipe/`: WASM runtime + `face_landmarker.task` model (3.7MB). Cache headers set to immutable.
- `@mediapipe/tasks-vision@1.1.0` installed.
- Build passes clean.

## Update 3 — Facial Analysis Page (Vercel, Desktop) Exact Match & Camera Fix · BUILT
- Switched UI to the exact **"Facial analysis page (Vercel, desktop)"** artboard from the downloaded wireframe:
  - Clean white `#FFFFFF` aesthetic with `#ECECEA` borders, `#111111` deep black buttons with 8px radius, `#4F2C1D` espresso brand accents, and `#8A8A85` metadata labels.
  - Hero with `Free for Founding Members until 13 December 2026` gold pill.
  - Front-view 13-landmark + 6-ratio facial architecture diagram with exact coordinate callouts.
  - "The analysis" section featuring 3 detailed cards (Jawline with 124° gonial angle, Facial thirds, Face shape switcher) plus the 6 attribute codes (A03–A09).
  - "Sample report" section with left navigation sidebar and interactive width profile SVG chart.
  - "How it works" 3-step section, Privacy table, FAQ accordion, closing CTA, and footer.
- **Fixed Live Camera Error ("This browser can't open the live camera"):**
  - Resolved constraint incompatibility: Changed strict `facingMode: "user"` to `facingMode: { ideal: "user" }` with an automatic fallback to `{ video: true, audio: false }` for macOS built-in FaceTime HD cameras and desktop webcams.
  - Avoided early-abort on mount in `Capture.tsx` so user camera requests are properly initiated.
  - Added localhost/127.0.0.1 bypass in secure-context checks.
  - Configured `Permissions-Policy: camera=*` in `next.config.ts`.
- **Fixed MediaPipe TFLite XNNPACK Delegate Console Error:**
  - Resolved `INFO: Created TensorFlow Lite XNNPACK delegate for CPU.` which Next.js Turbopack dev overlay intercepted as an unhandled console error during `mpDetect` at `landmarker.detect(input)`.
  - Added multi-layered filtering (`silenceTFLite` and `silenceTFLiteAsync`) around `mpDetect`, `mpDetectVideo`, and `init` in `lib/mediapipe.ts`.
  - Added `<ConsoleSilencer />` client component in `app/layout.tsx` to safely redirect WebAssembly/TFLite information and OpenGL logs from `console.error` to `console.info`.
  - Patched Emscripten `err` handler across `public/mediapipe/*.js` and `node_modules/@mediapipe/tasks-vision/wasm/*.js`.
- **Removed Dummy Eyewear & Colour Sections / Integrated Founding Member Surprise Number:**
  - Removed dummy Eyewear and Colour tabs from results and sample report (`Results.tsx`, `LandingPage.tsx`).
  - Removed placeholder `Hair texture` / `Undertone` and the generic text from the unlock gate (`UnlockForm.tsx`).
  - Integrated the surprise Founding Member reservation number into `UnlockForm.tsx` (`You've unlocked Founding Member #...` and `The first 1,000 men to complete the analysis receive a permanent member number and priority access to the product pre-order`).
  - Synced the reserved member number so it seamlessly flows into the unlocked report, header, story card, and PDF export.
- **Removed Founding Member Text from Public FAQ & Restored All Grooming Sections:**
  - Removed "The first 1,000 men to complete the analysis receive a permanent member number..." from the public landing page FAQ so it remains an un-spoiled surprise revealed upon completion of the scan.
  - Restored wireframe question: "When does Nodd Men launch? The store opens to everyone at 10 am on Sunday 13 December 2026."
  - Ensured **Haircuts**, **Beard verdict**, and **Grooming routine** are fully present, active, and interactive with dedicated views across both the landing page sample report and the results screen.
- **Refined Sample Report Sidebar & Founding Members FAQ:**
  - In `Rohan's Report` sample preview card on the landing page, removed Haircuts, Beard verdict, and Grooming routine so the sidebar cleanly presents `Overview` and `Face structure` with the width profile analysis.
  - Kept the "What are Founding Members?" FAQ question with all benefits retained (*"Men who complete the analysis receive a permanent member number and priority access to the product pre-order."*) while hiding the specific count so the member number remains a true surprise.
- Build compiles cleanly (`node node_modules/next/dist/bin/next build`) and test logic matches prototype 100%.

## Phase 5 — Supabase Waitlist, Member Numbers & Referral Engine · BUILT & VERIFIED
- **Database integration via `@supabase/supabase-js`:**
  - Table: `waitlist` (id, created_at, name, contact, age_bracket, face_shape, skin_concern, referral_code, referred_by, member_number, referral_count).
  - PostgreSQL indexes on `referral_code` and `referred_by` for low-latency queries.
  - Stored Procedure `increment_referral_count(ref_code)` for atomic referral tracking without race conditions.
  - Secrets stored strictly in `.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), `.env.example` kept clean and `.env.local` gitignored.
- **API Routes (`app/api/waitlist/route.ts`):**
  - `POST /api/waitlist`:
    - Validates name, age bracket, face shape, skin concern, and contact (Indian mobile via `checkIndianMobile` or email).
    - Checks for existing user (idempotent re-entry returns existing member number, waitlist position, and referral stats).
    - Generates unique 4-char referral code (`UM-XXXX`).
    - Assigns Founding Member number.
    - Atomically increments referrer's count when a visitor signs up via `?ref=CODE`.
    - Returns real waitlist position and member status.
  - `GET /api/waitlist?code=UM-XXXX`:
    - Retrieves real-time member number, referral count, and waitlist position.
- **Frontend Integration:**
  - `UnlockForm.tsx`: Submits real lead data, handles loading spinner, displays server errors, and falls back gracefully if offline.
  - `Results.tsx`: Receives true waitlist position, referral code, and member number from Supabase.
  - `Rewards.tsx`: Displays live Founding Member number, live launch waitlist spot, real referral code, and progress towards 3 referrals.
- **Verification:**
  - Direct database insertion, referral lookup, RPC increment, and duplicate prevention tested and verified live with 100% pass rate. Test records cleaned up.

## Next
- Phase 4: Claude API skin read server route.
- Phase 6: Privacy policy & terms pages, analytics, rate limiting.
- Phase 7: Calibration with 50+ labelled Indian male selfies.
- Phase 8: Deploy to Vercel.
