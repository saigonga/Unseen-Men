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

## Phase 5 — Supabase Waitlist, Member Numbers, Referral Engine & Photo Storage · BUILT & VERIFIED
- **Database integration via `@supabase/supabase-js`:**
  - Table: `waitlist` (id, created_at, name, contact, age_bracket, face_shape, skin_concern, referral_code, referred_by, member_number, referral_count, photo_url).
  - PostgreSQL indexes on `referral_code` and `referred_by` for low-latency queries.
  - Stored Procedure `increment_referral_count(ref_code)` for atomic referral tracking without race conditions.
  - Supabase Storage bucket `scans`: automatically stores compressed client-captured selfies (`.jpg`), linking `photo_url` in each user's record.
  - Secrets stored strictly in `.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), `.env.example` kept clean and `.env.local` gitignored.
- **API Routes (`app/api/waitlist/route.ts`):**
  - `POST /api/waitlist`:
    - Validates name, age bracket, face shape, skin concern, and contact (Indian mobile via `checkIndianMobile` or email).
    - Checks for existing user (idempotent re-entry returns existing member number, waitlist position, and referral stats).
    - Generates unique 4-char referral code (`UM-XXXX`).
    - Assigns Founding Member number.
    - Compresses and uploads user photo to `scans/${code}_${timestamp}.jpg` and stores public `photo_url`.
    - Atomically increments referrer's count when a visitor signs up via `?ref=CODE`.
    - Returns real waitlist position and member status.
  - `GET /api/waitlist?code=UM-XXXX`:
    - Retrieves live waitlist standing, confirmed referrals, and remaining referrals until launch reward.

## Update 4 — DPDP Compliance, Pure Facial Architecture Focus, Mobile UX & Instant Database Sync · BUILT & DEPLOYED
- **DPDP Act Compliant Consent:**
  - Starts completely unticked by default (pre-ticked consent violates DPDP Rules).
  - Two mandatory checkboxes required before capture:
    1. 18+ and photo analysis consent for personalised style recommendations.
    2. Results and style recommendations delivery on WhatsApp with STOP opt-out.
  - Short notice under checkboxes specifying retention until 31 January 2027 and link to "How we use your data".
  - Dedicated `/how-we-use-your-data` page and in-app modal detailing what is collected, purpose, photo handling, storage on Vercel/Supabase, deletion timeline, and withdrawal options (`care@noddmen.com`).
- **Streamlined Report: Pure Facial Architecture:**
  - Removed all extraneous styling sections (`02 Frames`, `03 Hair`, `04 Grooming`, `05 Colour`, `Routine`).
  - Report is 100% focused on face shape, match %, facial thirds, gonial angle, jawline architecture, landmark overlay, and population comparison metrics.
  - Removed redundant `UnlockForm` from the results page (user details are collected upfront and unlocked from frame 1).
- **Mobile UX & Capture Unblocked:**
  - Fixed issue where users saw only "Retake photo" and "Pick another" without being able to proceed: `canAnalyse` is always enabled when a face is detected, with an active "Analyse anyway" button for any quality warnings.
  - Auto-advances smoothly to analysis on clean live camera captures.
  - Replaced hardcoded off-center SVG face in scanning screen with user's real captured photo and mapped 68-point landmarks in real time.
- **Database & Storage Instant Synchronization:**
  - Added dual-stage sync: upfront details save immediately to Supabase waitlist on registration, and client photo base64 is immediately uploaded upon capture completion and updated on results.
  - Reliable cross-platform `getPhotoDataUrl` helper in `lib/photoData.ts` supporting image elements, canvas scaling, and asynchronous blob URLs.
- **Identified Vercel Deployment Action Required:**
  - Root cause for Vercel not saving to database: Vercel environment variables need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` added in Vercel Dashboard > Project Settings > Environment Variables.

    - Retrieves real-time member number, referral count, and waitlist position.
- **Frontend Integration:**
  - `UnlockForm.tsx`: Submits real lead data + compressed selfie image, handles loading spinner, displays server errors, and falls back gracefully if offline.
  - `Results.tsx`: Receives true waitlist position, referral code, and member number from Supabase.
  - `Rewards.tsx`: Displays live Founding Member number, live launch waitlist spot, real referral code, and progress towards 3 referrals.
- **Verification:**
  - Direct database insertion, referral lookup, RPC increment, photo storage upload, and duplicate prevention tested and verified live with 100% pass rate. Test records cleaned up.

## Phase 5.5 — Compulsory Upfront Registration, Full Styling Lookbook & n8n / WhatsApp Automation · BUILT & VERIFIED
- **Compulsory Upfront Registration (`RegisterLead.tsx`):**
  - When user clicks "Start facial analysis", they are immediately prompted for:
    1. **Full Name** (compulsory, min 2 characters)
    2. **WhatsApp Mobile Number** (compulsory, validated with Indian mobile regex)
    3. **Email Address** (compulsory, validated with email regex)
    4. **18+ and Style Recommendations Consent** (compulsory checkbox)
  - Offers clear options: "Take a photo (Live camera)" or "Upload a photo instead".
  - Persisted to local storage and passed directly into analysis and report.
- **Auto-Registration & Seamless Unlock (`Results.tsx`):**
  - As soon as the analysis completes, the user is automatically registered in Supabase `waitlist` with their photo in bucket `scans`.
  - The results page instantly renders their unlocked, personalized lookbook without asking them to re-enter information.
- **5-Pillar Styling Architecture (based on "THE EDIT by Sloosh"):**
  - **01 The Face (`FacialThirdsSection.tsx`)**: Face Shape match %, Facial Thirds proportions (Upper / Mid / Lower % with visual stacked bar), Direction Objective ("Lift, not width"), and structural highlights.
  - **02 The Frames (`EyewearSection.tsx`)**: Curated Optical Glasses (Defined D-Frame, Modern Browline, Slim Geometric) + Sunglasses (Flat-Top Square, Angular Navigator, Tapered Rectangular) + Frames to avoid with specific reasons.
  - **03 The Hair (`BarberGuideSection.tsx`)**: Curated cuts + **Barber Instruction Card** (Exact clipper guards e.g. #3 guard, top cm length e.g. 5.5–7.0 cm, taper type, finishing product, and copyable barber dialogue note).
  - **04 The Grooming (`BeardSection.tsx`)**: Facial hair contouring advice, beard styles suited to facial width, and tweaks.
  - **05 The Colour (`ColorPaletteSection.tsx`)**: Skin undertone analysis, 8 Base Neutrals with hex swatches (Ivory, Camel, Deep Navy, Espresso, Olive, etc.), 12 Matching Shirt/Apparel shades, and 4 Colors to avoid with explanations.
- **WhatsApp Concierge & Automation (`WhatsAppConcierge.tsx` & `n8n-workflow-unseen-men.json`):**
  - **Inbound 1-Click Concierge**: Direct `wa.me` button pre-filled with user's name, member number, and face shape, establishing an instant private WhatsApp thread with the brand.
  - **n8n Automation Workflow**: Complete importable `n8n-workflow-unseen-men.json` with Webhook trigger, luxury HTML email formatter, and WhatsApp dispatch node via Evolution API / Web Gateway.
  - **Detailed Setup Guide**: `N8N_AND_WHATSAPP_GUIDE.md` explaining zero-cost WhatsApp automation without Meta API approval.

## Phase 5.6 — Mobile UI Overhaul & Streamlined Facial Architecture Focus · BUILT & VERIFIED
- **Mobile UI Overhaul (Tested on iPhone Viewports):**
  - **Header Cleanup**: Verbose desktop navigation and domain links hidden on mobile; compact "NODD MEN" and "Start" button preserved with ample margin and zero clipping.
  - **Fluid Responsive Grids**: Sample report transformed from fixed 240px desktop sidebar into swipeable category tabs; privacy comparison changed to stacked 1-column layout; attribute cards use fluid `minmax(min(100%, 300px), 1fr)`.
  - **iOS Viewport Protection**: Enforced `font-size: 16px !important` on all mobile form inputs to permanently eliminate involuntary iOS Safari auto-zoom.
  - **Floating Sticky Action Pill**: Pinned bottom bar with frosted backdrop and one-tap "Start facial analysis →".
  - **Typography & Layout**: Fluid clamp headings with `wordBreak: normal` and `overflowWrap: break-word` eliminating mid-word line breaks.
- **Streamlined Facial Architecture & Grooming Specs (Colour & Eyewear Removed):**
  - Removed added colour/wardrobe palettes (`ColorPaletteSection`) and eyewear/frames (`EyewearSection`) per request.
  - Streamlined Report Navigation Tabs into 4 dedicated grooming pillars: `01 Face`, `02 Hair`, `03 Grooming`, `04 Routine`.
  - Retained all facial architecture analysis: Face Shape match % and traits, Facial Thirds & Ratios, Nine Structural Proportions vs Population Norms, Landmark Canvas, Curated Haircuts, Barber Guide Specifications (guard lengths, taper, clipper blend), Haircuts to Avoid, Beard verdict & tweaks, Age-bracket routine, WhatsApp Concierge, PDF report, and Story Card.
  - Cleaned Landing Page copy to align strictly with haircuts, barber specs, beard guide, and daily grooming routine.

## Phase 5.7 — Exact Facial Analysis Page Mockup Alignment (Photographic Face Hero & Attribute Overhauls) · BUILT & VERIFIED
- **Photographic Hero Showcase Card (`hero-desktop-card` & `hero-mobile-card`):**
  - Replaced the abstract vector head wireframe with the real high-resolution photograph of an Indian man (`hero-face.jpg`).
  - Added SVG landmark measurement lines: vertical dashed midline, cheekbone width line (`409.6` to `726.4`), and jaw width line (`442.2` to `695.8`).
  - Integrated 10 concentric target circles marking key facial landmarks (forehead, pupils, nose, lips/chin, cheekbones, and jaw corners).
  - Overlayed 4 frosted glass telemetry HUD cards with backdrop blur:
    - **Top-Left**: `01 Face shape: Oval`, `02 Jawline: Defined`, `03 Facial thirds: Balanced`.
    - **Top-Right**: `Widths · relative to cheekbones` (Forehead `0.85`, Cheekbones `1.00`, Jaw `0.80`).
    - **Bottom-Left**: `Length to width` large `1.27` display with interactive range marker `Rounder 1.10 --- 1.27 (You) --- Longer 1.60`.
    - **Bottom-Right**: `Gonial angle · jaw` large `132°` display with interactive range marker `Sharper 110° --- 132° (You) --- Softer 145°`.
    - **Bottom Center**: `AI-GENERATED SAMPLE FACE · NOT A REAL PERSON`.
  - Added the 4-column summary bar below:
    - `Face shape: Oval` (CONFIDENCE 0.93)
    - `Length to width: 1.27` (HAIRLINE TO CHIN ÷ CHEEKBONES)
    - `Jaw definition: Defined` (BIGONIAL 0.80 OF CHEEKS)
    - `Undertone: Warm` (MEDIUM CONTRAST)
- **Attribute Visuals in Section 2 ("The Analysis"):**
  - **Card 1 (Jawline)**: Cropped lower jaw photographic preview with measured jaw contour bezier curve, Gonial angle `132°` and Jaw ÷ cheeks `0.80` badges, plus Soft/Average/Defined slider.
  - **Card 2 (Facial Thirds)**: Profile photo crop with horizontal dashed lines, Upper (`0.26`), Middle (`0.37`), Lower (`0.37`) sliders, and `Typical range 0.30 to 0.36 · You` legend.
  - **Card 3 (Face Shape)**: 6 real photographic previews (`Round`, `Oval`, `Square`, `Oblong`, `Heart`, `Diamond`) with SVG contour overlay paths, interactive selection, Length-to-width `1.27`, and Confidence `0.93`.
- **Sample Report Enhancements:**
  - Updated Width Profile chart to Forehead `0.83`, Cheekbones `1.00`, Jaw `0.80`, and matching explanation text.
  - Updated actions to Textured Crop, Rectangular Frames, and Short Boxed Beard.
- **Verification:**
  - Tested on both desktop (1440px) and mobile (390px) viewports with headless Chrome screenshots matching `new_wireframe_desktop.png` and `new_wireframe_mobile.png`.

## Phase 5.8 — Vercel CI Deployment Fix & Live Verification · READY & DEPLOYED
- **Vercel Account & Project Verification**:
  - Authenticated and verified Vercel team project `prj_7CSufnSB2XGLKKn7SSyIeqrawZQu` (`unseen-men`).
  - Confirmed production environment variables (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) are properly configured.
- **Turbopack Font Build Failure Resolved**:
  - Issue: Turbopack in CI failed with `next/font/google queries have exactly one entry` on variable fonts (`Sora`, `Space Grotesk`, `JetBrains Mono`) with weight arrays.
  - Fix: Replaced `next/font/google` in `app/layout.tsx` with preconnected Google Fonts stylesheets and updated `globals.css` with font fallbacks.
  - Local build passed (`Compiled successfully`, `Generating static pages (9/9)`).
- **Live Production Deployment**:
  - Pushed to `main` branch (commit `81fc37c`).
  - Vercel automatically built and deployed `dpl_C8VMDrPdtja9UpL5vZPoq19HhQGf` to `READY` state.
  - Verified live URL `https://unseen-men.vercel.app` (HTTP 200, PRERENDER cache).
  - Verified high-res photographic assets (`hero-face.jpg`, `shape-*.jpg`) serving with HTTP 200 on `https://unseen-men.vercel.app`.

## Phase 5.9 — Higgsfield AI Creative Studio Setup · BUILT & INTEGRATED
- **Server Route (`app/api/creative/route.ts`)**:
  - Connects to Higgsfield AI (`https://api.higgsfield.ai/higgsfield-ai/soul/standard`).
  - Supports flexible API key configuration via `HIGGSFIELD_API_KEY` (format: `key_id:key_secret`) or individual `HF_API_KEY_ID` + `HF_API_KEY_SECRET`.
  - Also accepts `x-higgsfield-key` header for instant in-browser test generation before setting server environment variables.
  - Generates 2K luxury editorial campaign portraits styled to the user's face shape and haircut, with server-side polling and status feedback.
- **Client Component (`components/results/CreativeStudio.tsx`)**:
  - Embedded in `components/screens/Results.tsx` directly above Share/Download.
  - Offers 3 editorial visual styles: Nordman Luxury, GQ Magazine Cover, and Cinematic 35mm.
  - Shows real-time generation progress, interactive API key input for instant testing, 2K image preview, and 1-click download.
- **Configuration**:
  - Updated `.env.example` and `.env.local` with `HIGGSFIELD_API_KEY` placeholders.

## Phase 5.10 — Results UI Cleanup & Story Card Simplification · BUILT & VERIFIED
- **Results UI Cleanup (`components/screens/Results.tsx`)**:
  - Removed the `WhatsAppConcierge` section from the results view.
  - Removed the `CreativeStudio` (Higgsfield AI UI and API key input) from the user-facing UI and deleted `components/results/CreativeStudio.tsx`.
  - Kept Higgsfield AI strictly server-side only in `app/api/creative/route.ts` (reading credentials exclusively from server environment variables; removed client header key acceptance).
- **Story Card (`lib/storyCard.ts` & `components/results/ShareSection.tsx`)**:
  - Removed `MY CUT` and `MY BEARD` panels from the 9:16 Instagram story card.
  - Expanded the scanned photo / face glyph hero area (`PH = 1220`) to balance the card proportions cleanly around the user's face, face shape, match %, and referral code.

## Next
- Phase 4: Claude API skin read server route.
- Phase 6: Privacy policy & terms pages, analytics, rate limiting.
- Phase 7: Calibration with 50+ labelled Indian male selfies.
