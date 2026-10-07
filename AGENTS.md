# AGENTS.md — UNSEEN MEN Face Scan

Project instructions for the coding agent. OpenCode loads this file automatically from the project root at the start of every session.

You are building a production web app from a working prototype. The reference prototype is `face-scan.html` in this folder: a single self-contained HTML file. Keep its content, face-shape logic, results layout, share card and PDF. Rebuild it as a proper app.

## Working rules
- Work in the phases in section 10, one at a time. Don't start the next phase until I confirm the current one works.
- Before writing code for a phase, give me a short plan (files you'll create or change). Then build it.
- At the end of each phase, tell me exactly how to test it on my phone and what is still a placeholder.
- Keep a short progress log in `PROGRESS.md` (phase, what's done, what's next, known issues). Read it at the start of every session.
- Secrets (Claude API key, Supabase keys) go in `.env.local` only. Never commit them, never print them, never put them in client-side code. Add `.env.local` to `.gitignore` in phase 1.
- The Claude API key for the skin-read feature is called only from a server route. It is separate from the key this coding tool uses.
- Never store, log or upload user photos anywhere except the one skin-read call in section 5.
- If something in this brief is unclear or a decision in section 11 is needed, ask me instead of guessing.

---

## 1. What this is and why

**Brand context.** UNSEEN MEN is the community page for **Nordman**, a men's grooming brand that has not launched yet. This app is the pre-launch traction tool.

**The idea.** A man opens a link, takes a selfie, and the app tells him:
- his **face shape** (Oval, Round, Square, Rectangle, Heart, Diamond)
- which **haircuts** suit his face, and which to avoid
- whether a **beard** suits him, and which beard styles
- what's visible on his **skin** (texture, breakouts, uneven tone, oiliness, dryness, under-eye), which **ingredients** help, and which **Nordman product** fits
- a simple **grooming routine** for his age bracket

Most men don't know their face shape, so they don't know which cut or beard works for them. That is the hook.

**The business goal.**
1. Get people to scan, share the result on social media, and invite friends.
2. Collect waitlist sign-ups for the Nordman launch.
3. Lower customer acquisition cost through word of mouth.

**Outputs the user gets:**
- A results page in the app
- A **PDF report** (full, private)
- A **9:16 story card** for Instagram (fun part only: face shape and best cut, never skin issues)
- A personal **referral code**: "Get 3 friends to scan with your code → 20% off at launch" (reward is a placeholder, see open decisions)

---

## 2. User flow (screen by screen)

1. **Entry.** From a reel, story or a friend's link. If the link has a referral code, store who referred them.
2. **Landing.** Hook: "Know your face. Get the cut." Six face-shape icons, Start button, privacy line: "Your face is measured on your own phone. Your photo is never saved."
3. **Quick questions.** Age bracket (18–24, 25–34, 35–44, 45+). Beard right now? (clean shave, stubble, full beard). Main skin concern (optional). 18+ confirmation and consent checkbox.
4. **Tips.** Glasses off, hair off forehead, face a window, straight on with a neutral face.
5. **Capture — two options (NEW, see section 3).** "Take a photo" or "Upload a photo".
6. **Photo quality checks.** Distance, centred, head straight, head level, lighting, neutral expression.
7. **Scanning animation.** About 3–5 seconds.
8. **Results, free part.** Face shape with match %, "leaning X" when between two shapes, a "How your face compares" panel, top 3 cuts for this specific face.
9. **Unlock full report.** First name plus WhatsApp number or email = joins the Nordman waitlist.
10. **Full report.** Cuts to avoid, beard verdict with face-specific tweaks, skin read, routine, story card, PDF.
11. **Rewards.** Waitlist position, referral code, progress toward 3 referrals.

---

## 3. NEW: Camera capture with two options

Right now the prototype only lets the user upload a photo (on phones this opens the camera app, then comes back). I want **two clear options** on the capture screen:

- **Take a photo** (primary button) — opens the live front camera inside the page
- **Upload a photo** (secondary button) — picks an existing photo from the gallery/files

Both lead into the same quality checks and analysis.

### "Take a photo" requirements
- Use `getUserMedia` with the **front camera** (`facingMode: "user"`), ask for permission with a one-line explanation shown before the browser prompt.
- Show the live video **mirrored** (like a selfie), with an **oval face guide** on top.
- Run face tracking on the live video and show **one instruction at a time**, in this priority order:
  1. No face → "Fit your face in the oval"
  2. Too far / too close → "Move closer" / "Move back a little"
  3. Off-centre → "Move to the centre"
  4. Head turned → "Look straight at the camera"
  5. Head tilted → "Keep your head level"
  6. Chin up/down → "Chin down slightly" / "Chin up slightly"
  7. Too dark → "Find more light, face a window"
  8. Mouth open / smiling → "Relax your face, mouth closed"
- When every check passes, the oval turns **green**, a short countdown runs, and the app **auto-captures** after the face holds steady for about 1 second. Also show a manual shutter button as a fallback.
- Capture **8–10 frames** and **average the landmark measurements** across them. This is the biggest accuracy gain.
- Then a quick **"turn slowly left… now right"** sweep (about 3 seconds) with a scan-line animation. It's mostly for the experience and reels; use it for jaw/chin confidence if possible.
- Save the **un-mirrored** best frame for analysis and display.
- Stop the camera stream as soon as capture is done.

### Fallbacks
- Permission denied, no camera, or unsupported browser → show a friendly message and switch to **Upload a photo**.
- In-app browsers (Instagram, Facebook) often block the camera. Detect them and show "Open in Chrome/Safari for the live camera, or upload a photo".
- Camera only works on **HTTPS**. For phone testing during development, set up an HTTPS tunnel.

### Upload path
- Keep the current behaviour: run the same 6 quality checks on the uploaded photo.
- **Block** analysis if the head is turned or the mouth is open (these change the measurements). Other failed checks show a warning with "Analyse anyway".

---

## 4. Face-shape logic (keep from prototype, then improve)

### Bug we already fixed (don't reintroduce it)
The first version said **Oval for almost everyone** and gave **identical advice** to everyone with the same shape. Two causes:
1. The face-landmark model pulls every face toward an average shape, so real differences are tiny in raw numbers (jaw width varies only about 2% between people). Fixed cut-offs put most faces in the middle bucket = Oval.
2. Advice was fixed per shape, so two different men with the same shape saw the same report.

### How it works now (in the prototype)
- Measure five things from the landmarks:
  - **R** face length ÷ cheekbone width (brow-to-chin × 1.5 ÷ cheekbone width)
  - **J** jaw width ÷ cheekbones
  - **F** brow span (forehead proxy) ÷ cheekbones
  - **K** chin width ÷ cheekbones
  - **G** jaw-corner angle (smaller = sharper jaw)
- Convert each to a **z-score** against population norms (`NORM` in the prototype). A full beard halves the weight of jaw, chin and angle, since a beard hides the jawline.
- Score all six shapes from the z-scores, softmax into match %, show "Leaning X" when the second shape is close.
- **Traits**: any measurement beyond ±0.75 SD becomes a trait (longer face, wide jaw, pointed chin, sharp jaw angle, etc.).
- **Cuts library** (14 cuts): each cut lists the shapes it suits, the traits it helps and the traits it hurts. Cuts are ranked per person, so two Ovals with different jaws get different cuts, each with a "Suits your …" reason.
- **Cuts to avoid** and **beard advice** also react to the person's traits.
- "How your face compares" panel shows 5 sliders, e.g. "Jaw width: wider, top 8%".

Tested on 23 straight-on sample faces: Oval 8, Heart 5, Round 4, Diamond 3, Rectangle 2, Square 1, with different cut lists even within the same shape.

### Improvements for the real build
- **Switch to MediaPipe Face Landmarker** (478 points, gives head pose directly) instead of the prototype's face-api 68-point model. Recompute the five measurements from equivalent MediaPipe points.
- **Recalibrate the norms for our audience.** Current norms come from 28 sample portraits, mostly not Indian men. Build a small calibration script: collect **50+ straight-on selfies of Indian men**, have a **barber label each face shape**, compute new `NORM` values, and tune the shape score offsets so the app agrees with the barber. Keep the norms and offsets in one config file so they're easy to replace.
- Add a hidden **debug view** (e.g. `?debug`) that shows raw measurements, z-scores and all six shape scores, so we can check results while calibrating.
- Results must be **stable**: scanning the same person twice in similar light should give the same shape.

---

## 5. Skin read

- Runs on the **server** via the **Claude API** (vision). Send only a cropped, compressed face image. **Delete it immediately** after the call. Never log it.
- Prompt rules (from prototype): describe only what's visible; no medical diagnosis; never guess age, ethnicity or identity; **never comment on skin colour or suggest lightening**; talk about evenness and spots, not shade; flag poor photo quality.
- Return strict JSON: `quality`, `quality_note`, and one observation for each of the six areas with `level` (none/mild/moderate/noticeable) and a short note, plus `see_dermatologist` true/false.
- Map each area to ingredients and a **Nordman product slot** (placeholders until the SKU list is final).
- If `see_dermatologist` is true, show a clear "worth showing a dermatologist" message.
- Label the section "Grooming guidance, not medical advice".

---

## 6. Waitlist, referrals and delivery

- **Supabase** for: waitlist entries (name, contact, age bracket, face shape, skin concern, referral code, referred_by, timestamp). **No photos, ever.**
- Unique referral code per user (format like `UM-7K3P`), referral link `?ref=CODE`.
- Live waitlist position and referral count; unlock the reward at 3 successful referrals (a referral counts when the friend completes a scan and joins the waitlist).
- Send the PDF by **email** first. WhatsApp delivery later via a WhatsApp Business API provider.
- Basic abuse protection: rate-limit scans and sign-ups per device/IP; don't count self-referrals.

---

## 7. Privacy and legal (India, DPDP Act)

- Consent screen before the camera, 18+ gate.
- Face shape is computed **on the phone**. Only the cropped face goes to the server for the skin read, and it's deleted right after.
- Privacy policy page and terms page.
- Photo deletion must be enforced in code, not just promised in the policy.

---

## 8. Analytics

Track every step of the funnel to find drop-offs: landing → start → questions → camera permission granted/denied → capture success → analysis → unlock (lead) → PDF download → story card download → invite copied → referral converted. Also track take-photo vs upload split and how often quality checks fail.

---

## 9. Tech stack

- **Next.js** (mobile-first), deployed on **Vercel**
- **MediaPipe Face Landmarker** in the browser
- **Claude API** for the skin read (server route)
- **Supabase** for waitlist and referrals
- PDF generation (jsPDF or server-side), story card on canvas (1080×1920 PNG)
- Fonts and look: keep the prototype's style (dark-first, brass accent, Big Shoulders Display / Instrument Sans / JetBrains Mono)

---

## 10. Build phases (do them in this order)

1. **Rebuild the prototype in Next.js.** Same screens, content and logic. Runs on localhost.
2. **Camera capture** with the two options (section 3). Test on a real phone via an HTTPS tunnel.
3. **Switch to MediaPipe** and add the debug view. Confirm results vary properly across different faces.
4. **Skin read** server route with the Claude API.
5. **Supabase** waitlist, referral codes, position, email delivery of the PDF.
6. **Privacy pages, analytics, rate limiting.**
7. **Calibration** with 50+ labelled Indian male selfies; update norms.
8. **Deploy** to Vercel on our subdomain.

After each phase: tell me what to test on my phone, and what's still a placeholder.

---

## 11. Open decisions (ask me before building these parts)

- Final **Nordman product list** (SKUs) for the recommendation slots
- **Reward**: discount %, free product, or early access
- **Domain/subdomain** for hosting
- Who reviews the content (barber for cuts/beard, dermatologist for skin wording)
- WhatsApp provider for PDF delivery

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
