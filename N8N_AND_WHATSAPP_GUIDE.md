# UNSEEN MEN · Email & WhatsApp Automation Guide

This guide explains how to set up automated emails and WhatsApp messages for everyone who scans their face on **UNSEEN MEN**.

---

## 1. How It Works (The Complete Funnel)

1. **User Scans:**
   - User enters **Name**, **WhatsApp Number**, and **Email** upfront before the camera opens.
   - After the scan completes, the app computes:
     - **01 Face**: Facial proportions, thirds (e.g. 29% Upper / 37% Mid / 34% Lower), objective ("Lift, not width").
     - **02 Frames**: Optical specs and sunglasses tailored to face shape + frames to avoid.
     - **03 Hair**: Top cuts + Barber Specifications (exact clipper guards & top length).
     - **04 Grooming**: Beard styling & contouring guidance.
     - **05 Colour**: Undertone analysis, 8 base neutrals, 12 shirt colors, and shades to avoid.
   - The user record and scan photo are saved in **Supabase**.
   - The app automatically triggers your **n8n Webhook** with the complete payload.

2. **n8n Workflow Execution:**
   - Automatically sends a luxury, dark-mode **HTML Email Report** via Gmail or SMTP.
   - Automatically sends an instant **WhatsApp Message** with their styling summary and lookbook link.

---

## 2. Importing the Workflow into n8n (2 Minutes)

1. Open your n8n workspace (`http://localhost:5678` or your hosted n8n instance).
2. Click **Add Workflow** → Click the three dots `...` (top right) → **Import from File**.
3. Select `n8n-workflow-unseen-men.json` from this project folder.
4. Click on the **Webhook Trigger** node and copy the **Production Webhook URL** (e.g., `https://your-n8n.instance/webhook/unseen-scan`).
5. In your project `.env.local`, add:
   ```env
   N8N_WEBHOOK_URL="https://your-n8n.instance/webhook/unseen-scan"
   ```
6. Click **Save** and **Activate** the workflow in n8n.

---

## 3. WhatsApp Automation Without Meta API (Zero Cost & No API Approval)

If you don't have the Meta WhatsApp Cloud API credentials, you have two simple ways to automate WhatsApp:

### Option A: Open-Source WhatsApp Web Gateway (Recommended for Automation)
Using **Evolution API** or **Baileys**, you can turn any standard WhatsApp number into an automated API in 3 minutes using Docker:

1. **Run the gateway in Docker:**
   ```bash
   docker run -d --name evolution-api -p 8080:8080 atendai/evolution-api:v2.1.0
   ```
2. Open `http://localhost:8080` in your browser.
3. Click **Create Instance** → name it `unseen-men`.
4. Scan the **QR Code** using your phone’s WhatsApp (**Linked Devices** → **Link a Device**).
5. That’s it! Your WhatsApp is now connected to n8n.
6. In n8n, the node **"Send WhatsApp via Web Gateway"** will automatically send the personalized styling text to the user's phone number as soon as they complete their scan.

### Option B: The Direct "wa.me" Stylist Concierge (Built Right Into The App)
We have added a direct **WhatsApp Concierge Button** on the results page:
- When the user finishes the scan, they see a prominent button: **"Open WhatsApp Concierge"**.
- Tapping it opens WhatsApp on their phone directly to your number (`wa.me/918169506875`) with a pre-filled message:
  > *"Hi UNSEEN MEN! I'm Sai (Member #0302). I just completed my facial analysis (Square face shape, code UM-ZP2E). Send me my complete grooming lookbook and ongoing styling suggestions!"*
- When they tap **Send**, you instantly have their chat in WhatsApp!
- You can now reply directly, save their contact in WhatsApp Business, and send them new drops, seasonal grooming tips, and product recommendations over time.

---

## 4. Email Setup in n8n

1. In the n8n canvas, double-click the **"Send Luxury HTML Email"** node.
2. Select your credential:
   - **Gmail OAuth2** (recommended if you use Google Workspace or Gmail)
   - Or **SMTP** (if using Amazon SES, Postmark, Resend, or SendGrid).
3. The recipient (`sendTo`), subject, and full luxury HTML template are already mapped to:
   - `{{ $json.email }}`
   - `{{ $json.emailSubject }}`
   - `{{ $json.emailHtml }}`

---

## 5. Webhook Payload Reference

Whenever a scan completes, `/api/waitlist` sends the following JSON payload to `N8N_WEBHOOK_URL`:

```json
{
  "event": "scan_completed",
  "timestamp": "2026-11-03T09:45:00.000Z",
  "memberNumber": 302,
  "referralCode": "UM-ZP2E",
  "referralLink": "https://unseen-men.vercel.app/?ref=UM-ZP2E",
  "waitlistPosition": 14,
  "user": {
    "name": "Sai Gonga",
    "phone": "+918169506875",
    "email": "sai@example.com",
    "ageBracket": "25-34",
    "faceShape": "Square",
    "skinConcern": "oiliness",
    "photoUrl": "https://xgprocpjosntaawrqkce.supabase.co/storage/v1/object/public/scans/UM-ZP2E_1793692158472.jpg"
  },
  "styling": {
    "facialThirds": {
      "upperPct": 29,
      "midPct": 37,
      "lowerPct": 34
    },
    "barberGuide": {
      "primaryDirection": "Lift, not width",
      "topLength": "5.5 – 7.0 cm",
      "sidesLength": "1.0 cm (#3 guard) into skin taper",
      "taper": "Low-to-mid taper",
      "stylingProduct": "Matte texturizing clay or styling powder",
      "notes": "Square off corners at crown. Avoid bulk over ears."
    },
    "eyewear": {
      "headline": "Eyewear Selection",
      "objective": "Frames that lift and soften angular structure without adding boxy width.",
      "optical": [
        { "name": "Defined D-Frame", "desc": "Softens jawline with vertical lift" },
        { "name": "Modern Browline", "desc": "Draws eye upward to balance jaw" }
      ]
    },
    "palette": {
      "undertoneName": "Medium Warm Golden",
      "baseNeutrals": ["Ivory", "Oatmeal", "Camel", "Deep Navy", "Espresso", "Olive"]
    }
  }
}
```
