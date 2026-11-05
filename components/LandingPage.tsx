"use client";

import { useState } from "react";
import Link from "next/link";

interface LandingPageProps {
  onStart: () => void;
}

type SampleTab = "overview" | "structure";

interface ShapeItem {
  name: string;
  image: string;
  viewBox: string;
  path: string;
  ratio: string;
  confidence: string;
  description: string;
}

const SHAPES_DATA: ShapeItem[] = [
  {
    name: "Round",
    image: "/images/mockup/shape-round.jpg",
    viewBox: "30 40 240 330",
    path: "M127.4 104.8 C137.1 104.2 147.9 103.7 157.6 104.3 C167.2 104.9 175.9 106.1 185.1 108.5 C194.3 110.8 204.7 114.2 212.7 118.6 C220.7 122.9 227.3 128.4 233.2 134.6 C239.0 140.7 244.0 148.4 247.8 155.6 C251.7 162.8 254.2 169.6 256.4 178.0 C258.7 186.3 260.1 196.8 261.1 205.7 C262.0 214.6 261.9 222.8 262.1 231.4 C262.2 239.9 262.4 248.3 261.9 257.1 C261.4 265.8 260.9 275.0 259.1 284.1 C257.3 293.2 254.7 303.6 251.2 311.6 C247.7 319.6 242.9 326.5 238.0 332.2 C233.2 337.9 228.1 341.6 222.1 345.8 C216.1 349.9 208.3 353.9 202.2 357.0 C196.0 360.0 191.0 362.0 185.2 364.0 C179.4 366.0 173.5 367.7 167.3 369.1 C161.2 370.4 155.2 371.7 148.4 372.3 C141.6 372.9 133.6 372.6 126.7 372.4 C119.7 372.2 112.5 372.0 106.8 371.1 C101.1 370.1 96.6 368.5 92.3 366.8 C87.9 365.2 84.4 363.4 80.7 361.3 C77.1 359.2 73.9 357.2 70.2 354.3 C66.5 351.3 61.8 347.5 58.6 343.6 C55.4 339.8 53.3 336.5 51.0 331.3 C48.7 326.1 46.5 319.9 44.8 312.3 C43.0 304.7 41.5 294.5 40.4 285.9 C39.3 277.2 38.7 268.5 38.3 260.2 C37.9 251.9 38.2 244.2 38.0 236.1 C37.7 228.0 37.0 220.2 36.9 211.8 C36.7 203.3 36.6 193.4 37.0 185.4 C37.4 177.4 37.8 170.6 39.3 163.5 C40.7 156.4 42.6 148.9 45.7 142.6 C48.7 136.4 52.4 130.8 57.6 126.1 C62.8 121.3 69.8 117.2 76.8 114.1 C83.8 111.0 91.0 109.1 99.5 107.6 C107.9 106.0 117.7 105.3 127.4 104.8 Z",
    ratio: "1.08",
    confidence: "0.88",
    description: "Drives haircuts and styling. Height on top and tighter sides elongate the face; avoid round fringes.",
  },
  {
    name: "Oval",
    image: "/images/mockup/shape-oval.jpg",
    viewBox: "30 40 240 330",
    path: "M151.5 111.7 C161.2 111.7 171.5 111.6 180.3 112.4 C189.2 113.2 196.9 114.5 204.7 116.6 C212.4 118.7 220.8 121.6 226.8 125.2 C232.8 128.8 237.2 133.3 240.9 138.3 C244.7 143.3 247.3 149.3 249.4 155.1 C251.5 160.9 252.6 166.4 253.7 173.2 C254.7 180.1 255.3 188.6 255.7 196.0 C256.0 203.4 255.8 210.4 255.7 217.8 C255.5 225.2 255.5 232.7 254.9 240.4 C254.2 248.1 253.6 256.1 252.0 264.2 C250.4 272.3 248.1 281.5 245.3 288.9 C242.6 296.3 238.9 302.8 235.3 308.4 C231.7 314.0 228.1 318.1 223.8 322.6 C219.5 327.2 214.0 332.1 209.7 335.8 C205.3 339.6 201.8 342.4 197.7 345.2 C193.5 348.1 189.6 350.9 184.9 353.1 C180.3 355.4 175.6 357.5 169.9 358.7 C164.2 359.8 157.1 360.1 150.7 360.1 C144.3 360.1 137.3 359.8 131.7 358.6 C126.1 357.4 121.5 355.2 116.9 353.0 C112.3 350.7 108.3 348.0 104.2 345.1 C100.1 342.3 96.5 339.6 92.2 335.9 C87.8 332.2 82.2 327.4 77.8 322.9 C73.5 318.3 69.9 314.3 66.2 308.7 C62.6 303.1 58.8 296.7 55.9 289.3 C53.1 281.9 50.8 272.5 49.1 264.4 C47.4 256.3 46.5 248.3 45.7 240.6 C44.9 232.9 44.7 225.6 44.5 218.2 C44.2 210.8 43.7 203.9 44.1 196.5 C44.4 189.1 45.3 180.7 46.5 173.8 C47.7 167.0 49.0 161.4 51.3 155.5 C53.6 149.6 56.4 143.6 60.4 138.6 C64.4 133.5 69.0 129.0 75.3 125.3 C81.5 121.7 90.0 118.7 97.9 116.6 C105.8 114.5 113.7 113.3 122.6 112.5 C131.6 111.7 141.9 111.7 151.5 111.7 Z",
    ratio: "1.27",
    confidence: "0.93",
    description: "Drives haircuts and frames. Oval proportions take most cuts; textured crops and side parts suit best.",
  },
  {
    name: "Square",
    image: "/images/mockup/shape-square.jpg",
    viewBox: "30 40 240 330",
    path: "M133.4 104.2 C143.5 104.0 154.8 103.7 164.5 104.3 C174.3 104.9 183.0 106.0 191.9 107.9 C200.9 109.8 210.7 112.3 218.1 115.7 C225.5 119.1 231.3 123.5 236.4 128.5 C241.5 133.5 245.5 139.5 248.8 145.6 C252.1 151.7 254.2 157.5 256.2 164.9 C258.2 172.3 259.8 181.7 260.8 190.0 C261.9 198.2 262.1 206.1 262.5 214.5 C263.0 222.9 263.7 231.4 263.6 240.4 C263.6 249.4 263.6 258.6 262.3 268.2 C261.0 277.9 258.9 289.0 255.8 298.0 C252.7 307.1 248.3 315.5 243.9 322.6 C239.5 329.7 234.9 335.0 229.4 340.7 C223.9 346.4 216.7 352.2 210.9 356.8 C205.2 361.4 200.4 364.6 194.9 368.1 C189.4 371.6 183.9 375.0 177.9 377.6 C171.9 380.2 165.2 381.7 158.4 382.4 C151.6 383.0 144.3 382.9 137.4 382.7 C130.4 382.4 124.9 384.1 116.7 382.3 C110.7 380.5 105.9 377.6 101.3 374.5 C96.7 371.4 92.9 367.6 88.9 363.9 C84.9 360.1 81.4 356.7 77.3 352.1 C73.1 347.4 67.9 341.5 64.1 335.8 C60.4 330.1 57.6 324.8 54.6 317.9 C51.6 311.0 48.6 303.1 46.3 294.3 C44.0 285.6 41.9 274.8 40.5 265.5 C39.2 256.3 38.7 247.4 38.2 238.9 C37.8 230.3 38.1 222.3 37.9 214.3 C37.7 206.2 37.1 198.6 37.1 190.6 C37.1 182.6 37.4 173.7 38.1 166.5 C38.7 159.3 39.5 153.4 41.0 147.4 C42.6 141.4 44.5 135.5 47.5 130.6 C50.6 125.7 54.1 121.3 59.4 117.8 C64.8 114.3 72.2 111.6 79.6 109.5 C87.0 107.4 94.8 106.2 103.7 105.3 C112.7 104.4 123.3 104.4 133.4 104.2 Z",
    ratio: "1.12",
    confidence: "0.91",
    description: "Drives haircuts and frames. Strong jaw suits classic fades, side parts, and round or curved eyewear.",
  },
  {
    name: "Oblong",
    image: "/images/mockup/shape-oblong.jpg",
    viewBox: "30 40 240 330",
    path: "M164.0 114.5 C172.7 114.6 181.5 114.6 189.3 115.3 C197.2 116.1 204.5 117.3 211.1 119.1 C217.7 120.9 224.1 123.1 228.9 126.2 C233.8 129.3 237.3 133.0 240.4 137.5 C243.5 142.1 245.6 147.6 247.3 153.3 C248.9 159.1 249.7 164.9 250.3 171.9 C251.0 178.9 251.2 187.8 251.2 195.4 C251.2 203.1 250.9 210.3 250.6 217.8 C250.3 225.3 250.0 232.9 249.4 240.7 C248.8 248.6 248.0 256.7 246.8 264.9 C245.6 273.2 244.1 282.6 242.3 290.2 C240.4 297.9 238.1 304.6 235.8 310.6 C233.4 316.5 231.1 320.8 228.0 325.7 C225.0 330.6 220.8 335.9 217.5 340.0 C214.2 344.1 211.4 347.1 208.1 350.3 C204.8 353.4 201.7 356.5 197.7 359.0 C193.7 361.5 189.6 363.9 184.3 365.4 C179.0 366.8 172.2 367.4 165.9 367.7 C159.5 368.0 152.1 368.1 146.1 367.2 C140.0 366.3 134.7 364.3 129.4 362.2 C124.2 360.0 119.3 357.3 114.4 354.5 C109.6 351.7 105.4 349.1 100.4 345.3 C95.4 341.5 89.1 336.5 84.3 331.7 C79.5 326.9 75.4 322.6 71.5 316.7 C67.5 310.8 63.6 304.1 60.8 296.3 C57.9 288.5 56.0 278.5 54.4 270.0 C52.7 261.4 51.7 253.0 50.9 244.9 C50.1 236.8 49.9 229.1 49.7 221.3 C49.6 213.5 49.3 206.2 50.0 198.2 C50.7 190.3 52.2 181.1 54.1 173.7 C55.9 166.3 58.0 160.1 61.3 154.0 C64.5 147.9 68.7 141.9 73.6 137.2 C78.4 132.4 84.0 128.4 90.5 125.3 C97.1 122.1 105.2 120.0 113.0 118.3 C120.8 116.6 129.0 115.6 137.5 115.0 C146.0 114.4 155.4 114.4 164.0 114.5 Z",
    ratio: "1.48",
    confidence: "0.89",
    description: "Drives haircuts and styling. Side volume and slight fringe balance length; avoid excess pompadour height.",
  },
  {
    name: "Heart",
    image: "/images/mockup/shape-heart.jpg",
    viewBox: "30 40 240 330",
    path: "M169.2 109.8 C178.9 109.9 188.9 109.9 197.3 110.7 C205.8 111.5 213.0 112.7 219.9 114.6 C226.7 116.5 233.8 119.0 238.6 122.2 C243.4 125.5 246.4 129.6 248.9 134.1 C251.4 138.7 252.5 144.1 253.5 149.5 C254.4 154.9 254.7 160.1 254.7 166.5 C254.7 173.0 253.9 181.0 253.4 188.1 C252.8 195.1 251.9 201.8 251.2 208.9 C250.5 215.9 250.1 223.1 249.1 230.5 C248.1 237.9 247.0 245.3 245.3 253.2 C243.6 261.1 241.4 270.2 239.1 277.8 C236.9 285.3 234.4 292.5 231.9 298.6 C229.4 304.7 226.9 309.3 223.9 314.4 C220.8 319.4 216.6 324.6 213.4 328.8 C210.1 332.9 207.4 335.9 204.2 339.2 C201.0 342.5 198.0 345.8 194.2 348.5 C190.4 351.2 186.5 353.9 181.5 355.5 C176.5 357.1 170.1 357.7 164.0 357.9 C158.0 358.1 150.9 357.9 145.2 356.7 C139.5 355.4 134.7 353.0 129.8 350.5 C124.9 348.0 120.4 344.9 115.9 341.8 C111.3 338.7 107.4 336.0 102.6 332.0 C97.8 328.0 91.7 322.9 86.9 317.9 C82.1 312.9 77.8 308.1 73.8 302.0 C69.7 295.8 65.7 288.8 62.5 281.0 C59.4 273.3 57.0 263.7 55.0 255.5 C53.1 247.2 51.9 239.3 50.9 231.6 C50.0 223.9 49.6 216.4 49.3 209.1 C48.9 201.8 48.4 195.0 48.8 187.8 C49.2 180.6 50.1 172.5 51.6 166.0 C53.1 159.5 54.7 154.1 57.6 148.6 C60.5 143.1 64.3 137.4 69.1 132.7 C74.0 128.1 79.7 123.9 86.9 120.6 C94.1 117.3 103.8 114.9 112.5 113.1 C121.2 111.3 129.7 110.4 139.1 109.9 C148.6 109.3 159.5 109.6 169.2 109.8 Z",
    ratio: "1.24",
    confidence: "0.87",
    description: "Drives haircuts and beard. Fuller beard fills out narrow chin; textured mid-length styles soften forehead width.",
  },
  {
    name: "Diamond",
    image: "/images/mockup/shape-diamond.jpg",
    viewBox: "30 40 240 330",
    path: "M175.2 109.2 C184.8 109.5 194.4 109.7 202.6 110.7 C210.8 111.7 217.9 113.0 224.6 115.3 C231.3 117.5 238.1 120.3 242.8 124.0 C247.4 127.7 250.3 132.3 252.7 137.3 C255.1 142.4 256.3 148.5 257.2 154.4 C258.2 160.3 258.3 166.0 258.3 172.9 C258.3 179.9 257.5 188.6 257.1 196.1 C256.6 203.7 255.9 210.9 255.4 218.4 C255.0 225.9 254.9 233.4 254.2 241.2 C253.6 249.1 252.9 257.2 251.5 265.6 C250.2 273.9 248.2 283.5 246.1 291.3 C244.0 299.0 241.6 306.1 239.2 312.1 C236.8 318.2 234.6 322.5 231.7 327.5 C228.8 332.4 224.8 337.7 221.7 341.9 C218.6 346.0 216.0 349.2 212.9 352.4 C209.8 355.7 206.9 359.0 203.0 361.7 C199.2 364.4 195.1 367.0 189.8 368.6 C184.4 370.2 177.7 370.9 171.0 371.3 C164.3 371.7 156.1 371.8 149.6 370.9 C143.0 369.9 137.3 367.8 131.6 365.5 C125.9 363.3 120.5 360.5 115.2 357.6 C109.9 354.6 105.3 352.0 99.8 348.1 C94.3 344.2 87.5 339.1 82.1 334.1 C76.7 329.1 72.1 324.5 67.7 318.2 C63.2 311.9 58.8 304.6 55.6 296.4 C52.5 288.2 50.3 277.8 48.6 268.8 C46.9 259.9 46.1 251.2 45.5 242.9 C44.8 234.5 44.8 226.7 44.7 218.8 C44.6 210.9 44.2 203.4 44.9 195.5 C45.6 187.6 47.1 178.6 48.9 171.3 C50.8 164.1 52.7 158.1 56.1 151.9 C59.5 145.8 64.0 139.4 69.5 134.2 C75.0 129.0 81.3 124.3 89.1 120.7 C97.0 117.1 107.4 114.4 116.7 112.5 C125.9 110.6 134.8 109.7 144.6 109.1 C154.3 108.6 165.5 109.0 175.2 109.2 Z",
    ratio: "1.34",
    confidence: "0.86",
    description: "Drives cuts and beard. Textured fringe softens cheekbone prominence; chin beard balances lower face.",
  },
];

const MORE_ATTRS = [
  { code: "A03", name: "Forehead height", value: "Medium" },
  { code: "A04", name: "Hair texture", value: "Wavy" },
  { code: "A05", name: "Hair density", value: "Full" },
  { code: "A06", name: "Beard growth", value: "Medium" },
  { code: "A08", name: "Face width", value: "Medium, 135 to 140 mm frames" },
  { code: "A09", name: "Visible skin cues", value: "T-zone shine" },
];

export default function LandingPage({ onStart }: LandingPageProps) {
  const [selectedShape, setSelectedShape] = useState("Oval");
  const [activeTab, setActiveTab] = useState<SampleTab>("structure");

  return (
    <div
      style={{
        background: "#FFFFFF",
        color: "#111111",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontSize: 15,
        lineHeight: 1.6,
        minHeight: "100vh",
      }}
    >
      {/* 1. Header */}
      <header
        style={{
          borderBottom: "1px solid #ECECEA",
          position: "sticky",
          top: 0,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 clamp(16px, 4vw, 32px)",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: "0.08em",
                color: "#4F2C1D",
              }}
            >
              NODD MEN
            </span>
            <span className="desktop-nav" style={{ fontSize: 12.5, color: "#8A8A85" }}>Facial Analysis</span>
          </div>

          <nav
            className="desktop-nav"
            style={{
              display: "flex",
              gap: 28,
              fontSize: 14,
              color: "#5F5F5B",
            }}
          >
            <a href="#how" style={{ color: "inherit" }}>
              How it works
            </a>
            <a href="#analysis" style={{ color: "inherit" }}>
              The analysis
            </a>
            <a href="#report" style={{ color: "inherit" }}>
              Sample report
            </a>
            <a href="#privacy" style={{ color: "inherit" }}>
              Privacy
            </a>
            <a href="#faq" style={{ color: "inherit" }}>
              FAQ
            </a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href="https://noddmen.com" className="desktop-domain" style={{ color: "inherit", fontSize: 13.5 }}>
              noddmen.com
            </a>
            <button
              type="button"
              onClick={onStart}
              className="btn-primary"
              style={{
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 8,
                whiteSpace: "nowrap",
              }}
            >
              Start analysis
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(36px, 7vw, 72px) clamp(16px, 4vw, 32px) clamp(24px, 5vw, 40px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #ECECEA",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: "clamp(11px, 3.2vw, 13px)",
            color: "#5F5F5B",
            maxWidth: "100%",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#E0A526",
              flexShrink: 0,
            }}
          />
          Free for Founding Members until 13 December 2026
        </span>

        <h1
          style={{
            margin: 0,
            fontFamily: "'Sora', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(28px, 6.5vw, 60px)",
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            maxWidth: 900,
          }}
        >
          A precise analysis of your face,{" "}
          <span style={{ fontWeight: 600, color: "#4F2C1D" }}>built for men's grooming.</span>
        </h1>

        <p style={{ margin: 0, fontSize: "clamp(15px, 3.8vw, 18px)", lineHeight: 1.5, color: "#5F5F5B", maxWidth: 640 }}>
          One front-facing photo. Facial landmarks are mapped and nine structural attributes classified,
          then matched to the haircuts, frames, colours and beard styles that suit you.
        </p>

        <div
          className="hero-buttons"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginTop: 4,
            width: "100%",
            maxWidth: 420,
          }}
        >
          <button
            type="button"
            onClick={onStart}
            className="btn-primary"
            style={{
              padding: "15px 26px",
              fontSize: 15,
              fontWeight: 500,
              minHeight: 50,
            }}
          >
            Start my analysis
          </button>
          <a
            href="#report"
            className="btn-secondary"
            style={{
              padding: "14px 22px",
              fontSize: 15,
              minHeight: 48,
            }}
          >
            View a sample report
          </a>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px 28px",
            fontSize: 13,
            color: "#8A8A85",
            marginTop: 4,
          }}
        >
          <span>Photo stored privately, deleted on request</span>
          <span>No age, ethnicity or attractiveness scoring</span>
          <span>Takes about 60 seconds</span>
        </div>
      </section>

      {/* 3. Hero Showcase Card & Telemetry Summary Bar */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px) clamp(40px, 8vw, 80px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Desktop Showcase Card */}
          <div
            className="hero-desktop-card"
            style={{
              position: "relative",
              height: 600,
              borderRadius: 16,
              overflow: "hidden",
              background: "#E5E5E3",
            }}
            role="img"
            aria-label="AI-generated sample face on a backdrop with landmark rings, a centre line and frosted panels showing face shape, widths, length to width 1.27 and a gonial angle of 132 degrees"
          >
            <img
              src="/images/mockup/hero-face.jpg"
              alt="AI-generated sample face"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 0,
                width: 450,
                height: 600,
                display: "block",
                objectFit: "cover",
              }}
            />
            {/* Radial highlight overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 70% 80% at 50% 38%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.06) 100%)",
                pointerEvents: "none",
              }}
            />
            {/* Bottom vignette */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 200,
                background: "linear-gradient(rgba(15,15,17,0), rgba(15,15,17,0.45))",
                pointerEvents: "none",
              }}
            />

            {/* SVG Landmark Overlay */}
            <svg
              viewBox="0 0 1136 600"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              aria-hidden="true"
            >
              <line x1="570.7" y1="0" x2="570.7" y2="600" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="5 6" />
              <g stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1">
                <line x1="409.6" y1="327.3" x2="726.4" y2="326.7" />
                <line x1="442.2" y1="463.0" x2="695.8" y2="462.6" />
              </g>
              {/* Forehead landmark */}
              <circle cx="570.6" cy="138.3" r="7" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="570.6" cy="138.3" r="2.2" fill="#FFFFFF" />
              {/* Pupils */}
              <circle cx="496.1" cy="282.5" r="5.5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="496.1" cy="282.5" r="2.2" fill="#FFFFFF" />
              <circle cx="645.0" cy="282.1" r="5.5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="645.0" cy="282.1" r="2.2" fill="#FFFFFF" />
              {/* Nose */}
              <circle cx="571.5" cy="391.2" r="5.5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="571.5" cy="391.2" r="2.2" fill="#FFFFFF" />
              {/* Chin */}
              <circle cx="569.0" cy="540.1" r="7" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="569.0" cy="540.1" r="2.2" fill="#FFFFFF" />
              {/* Cheekbones */}
              <circle cx="409.6" cy="327.3" r="7" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="409.6" cy="327.3" r="2.2" fill="#FFFFFF" />
              <circle cx="726.4" cy="326.7" r="7" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="726.4" cy="326.7" r="2.2" fill="#FFFFFF" />
              {/* Jaw Corners */}
              <circle cx="442.2" cy="463.0" r="7" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="442.2" cy="463.0" r="2.2" fill="#FFFFFF" />
              <circle cx="695.8" cy="462.6" r="7" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="695.8" cy="462.6" r="2.2" fill="#FFFFFF" />
            </svg>

            {/* Frosted Badge 1: Top Left */}
            <div
              style={{
                position: "absolute",
                left: 32,
                top: 32,
                width: 280,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "rgba(28, 28, 28, 0.55)",
                WebkitBackdropFilter: "blur(14px)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: 12,
                color: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.55)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                  }}
                >
                  01
                </span>
                <span style={{ flex: 1 }}>Face shape</span>
                <span style={{ fontSize: 12, background: "rgba(255,255,255,0.16)", borderRadius: 6, padding: "2px 8px" }}>
                  Oval
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.55)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                  }}
                >
                  02
                </span>
                <span style={{ flex: 1 }}>Jawline</span>
                <span style={{ fontSize: 12, background: "rgba(255,255,255,0.16)", borderRadius: 6, padding: "2px 8px" }}>
                  Defined
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.55)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                  }}
                >
                  03
                </span>
                <span style={{ flex: 1 }}>Facial thirds</span>
                <span style={{ fontSize: 12, background: "rgba(255,255,255,0.16)", borderRadius: 6, padding: "2px 8px" }}>
                  Balanced
                </span>
              </div>
            </div>

            {/* Frosted Badge 2: Top Right (Widths) */}
            <div
              style={{
                position: "absolute",
                right: 32,
                top: 32,
                width: 280,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "rgba(28, 28, 28, 0.55)",
                WebkitBackdropFilter: "blur(14px)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: 12,
                color: "#FFFFFF",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.72)",
                }}
              >
                Widths · relative to cheekbones
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "82px minmax(0, 1fr) 36px", gap: 10, alignItems: "center", fontSize: 13 }}>
                <span>Forehead</span>
                <span style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.16)", position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "85%", background: "#FFFFFF", borderRadius: 2, opacity: 0.7 }} />
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, textAlign: "right" }}>0.85</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "82px minmax(0, 1fr) 36px", gap: 10, alignItems: "center", fontSize: 13 }}>
                <span>Cheekbones</span>
                <span style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.16)", position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100%", background: "#FFFFFF", borderRadius: 2, opacity: 0.7 }} />
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, textAlign: "right" }}>1.00</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "82px minmax(0, 1fr) 36px", gap: 10, alignItems: "center", fontSize: 13 }}>
                <span>Jaw</span>
                <span style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.16)", position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80%", background: "#FFFFFF", borderRadius: 2, opacity: 0.7 }} />
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, textAlign: "right" }}>0.80</span>
              </div>
            </div>

            {/* Frosted Badge 3: Bottom Left (Length to width) */}
            <div
              style={{
                position: "absolute",
                left: 32,
                bottom: 32,
                width: 300,
                padding: "16px 18px",
                background: "rgba(28, 28, 28, 0.55)",
                WebkitBackdropFilter: "blur(14px)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: 12,
                color: "#FFFFFF",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.72)",
                }}
              >
                Length to width
              </div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300, fontSize: 44, lineHeight: 1.05, marginTop: 6 }}>
                1.27
              </div>
              <div style={{ position: "relative", height: 4, background: "rgba(255,255,255,0.16)", borderRadius: 2, marginTop: 30 }}>
                <span style={{ position: "absolute", left: "20.0%", width: "40.0%", top: 0, height: 4, background: "rgba(255,255,255,0.45)", borderRadius: 2 }} />
                <span style={{ position: "absolute", left: "33.7%", top: -6, width: 2, height: 16, marginLeft: -1, background: "#FFFFFF", borderRadius: 1 }} />
                <span
                  style={{
                    position: "absolute",
                    left: "33.7%",
                    top: -24,
                    transform: "translateX(-50%)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  1.27 (You)
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <span>Rounder 1.10</span>
                <span>Longer 1.60</span>
              </div>
            </div>

            {/* Frosted Badge 4: Bottom Right (Gonial angle) */}
            <div
              style={{
                position: "absolute",
                right: 32,
                bottom: 32,
                width: 300,
                padding: "16px 18px",
                background: "rgba(28, 28, 28, 0.55)",
                WebkitBackdropFilter: "blur(14px)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: 12,
                color: "#FFFFFF",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.72)",
                }}
              >
                Gonial angle · jaw
              </div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300, fontSize: 44, lineHeight: 1.05, marginTop: 6 }}>
                132°
              </div>
              <div style={{ position: "relative", height: 4, background: "rgba(255,255,255,0.16)", borderRadius: 2, marginTop: 30 }}>
                <span style={{ position: "absolute", left: "28.6%", width: "42.8%", top: 0, height: 4, background: "rgba(255,255,255,0.45)", borderRadius: 2 }} />
                <span style={{ position: "absolute", left: "62.9%", top: -6, width: 2, height: 16, marginLeft: -1, background: "#FFFFFF", borderRadius: 1 }} />
                <span
                  style={{
                    position: "absolute",
                    left: "62.9%",
                    top: -24,
                    transform: "translateX(-50%)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  132° (You)
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <span>Sharper 110°</span>
                <span>Softer 145°</span>
              </div>
            </div>

            {/* Disclaimer at Bottom */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 12,
                textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              AI-generated sample face · not a real person
            </div>
          </div>

          {/* Mobile Showcase Card */}
          <div
            className="hero-mobile-card"
            style={{
              borderRadius: 14,
              overflow: "hidden",
              background: "#E5E5E3",
              border: "1px solid #ECECEA",
            }}
          >
            <svg
              viewBox="0 0 440 300"
              role="img"
              aria-label="AI-generated sample face with landmark rings and panels showing an oval face shape, length to width 1.27, jaw to cheek 0.80 and a 132 degree jaw angle"
              style={{ width: "100%", height: "auto", display: "block" }}
            >
              <defs>
                <linearGradient id="s2g-hero" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0.55" stopColor="#0F0F11" stopOpacity="0" />
                  <stop offset="1" stopColor="#0F0F11" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <rect width="440" height="300" fill="#E5E5E3" />
              <image href="/images/mockup/hero-face.jpg" x="70" y="-20" width="300" height="400" preserveAspectRatio="none" />
              <rect width="440" height="300" fill="url(#s2g-hero)" />
              <line x1="220" y1="0" x2="220" y2="300" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="3 3" />
              <g stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.8">
                <line x1="140.8" y1="163.6" x2="299.2" y2="163.4" />
                <line x1="157.1" y1="231.5" x2="283.9" y2="231.3" />
              </g>
              <circle cx="220.3" cy="69.1" r="4.6" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.02" />
              <circle cx="220.3" cy="69.1" r="1.5" fill="#FFFFFF" />
              <circle cx="182.2" cy="141.2" r="3.7" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.00" />
              <circle cx="182.2" cy="141.2" r="1.2" fill="#FFFFFF" />
              <circle cx="258.5" cy="141.1" r="3.7" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.00" />
              <circle cx="258.5" cy="141.1" r="1.2" fill="#FFFFFF" />
              <circle cx="221.7" cy="195.6" r="3.7" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.00" />
              <circle cx="221.7" cy="195.6" r="1.2" fill="#FFFFFF" />
              <circle cx="220.5" cy="270.1" r="4.6" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.02" />
              <circle cx="220.5" cy="270.1" r="1.5" fill="#FFFFFF" />
              <circle cx="140.8" cy="163.6" r="4.6" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.02" />
              <circle cx="140.8" cy="163.6" r="1.5" fill="#FFFFFF" />
              <circle cx="299.2" cy="163.4" r="4.6" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.02" />
              <circle cx="299.2" cy="163.4" r="1.5" fill="#FFFFFF" />
              <circle cx="157.1" cy="231.5" r="4.6" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.02" />
              <circle cx="157.1" cy="231.5" r="1.5" fill="#FFFFFF" />
              <circle cx="283.9" cy="231.3" r="4.6" fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="1.02" />
              <circle cx="283.9" cy="231.3" r="1.5" fill="#FFFFFF" />

              <rect x="12.0" y="12.0" width="89.5" height="40.0" rx="7.0" fill="#1C1C1C" fillOpacity="0.55" stroke="#FFFFFF" strokeOpacity="0.10" />
              <text x="21.0" y="26.0" fontFamily="JetBrains Mono, monospace" fontSize="7.0" letterSpacing="0.50" fill="#FFFFFF" fillOpacity="0.72">FACE SHAPE</text>
              <text x="21.0" y="45.0" fontFamily="Sora, sans-serif" fontWeight="300" fontSize="17.0" fill="#FFFFFF">Oval</text>

              <rect x="338.5" y="12.0" width="89.5" height="40.0" rx="7.0" fill="#1C1C1C" fillOpacity="0.55" stroke="#FFFFFF" strokeOpacity="0.10" />
              <text x="347.5" y="26.0" fontFamily="JetBrains Mono, monospace" fontSize="7.0" letterSpacing="0.50" fill="#FFFFFF" fillOpacity="0.72">JAW ÷ CHEEKS</text>
              <text x="347.5" y="45.0" fontFamily="Sora, sans-serif" fontWeight="300" fontSize="17.0" fill="#FFFFFF">0.80</text>

              <rect x="12.0" y="248.0" width="89.5" height="40.0" rx="7.0" fill="#1C1C1C" fillOpacity="0.55" stroke="#FFFFFF" strokeOpacity="0.10" />
              <text x="21.0" y="262.0" fontFamily="JetBrains Mono, monospace" fontSize="7.0" letterSpacing="0.50" fill="#FFFFFF" fillOpacity="0.72">JAW ANGLE</text>
              <text x="21.0" y="281.0" fontFamily="Sora, sans-serif" fontWeight="300" fontSize="17.0" fill="#FFFFFF">132°</text>

              <rect x="338.5" y="248.0" width="89.5" height="40.0" rx="7.0" fill="#1C1C1C" fillOpacity="0.55" stroke="#FFFFFF" strokeOpacity="0.10" />
              <text x="347.5" y="262.0" fontFamily="JetBrains Mono, monospace" fontSize="7.0" letterSpacing="0.50" fill="#FFFFFF" fillOpacity="0.72">LENGTH : WIDTH</text>
              <text x="347.5" y="281.0" fontFamily="Sora, sans-serif" fontWeight="300" fontSize="17.0" fill="#FFFFFF">1.27</text>

              <text x="220.0" y="294.0" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="6.2" letterSpacing="0.50" fill="#FFFFFF" fillOpacity="0.7">AI-GENERATED SAMPLE · NOT A REAL PERSON</text>
            </svg>
          </div>

          {/* 4-Stat Summary Bar Below Hero Card */}
          <div style={{ border: "1px solid #ECECEA", borderRadius: 14, overflow: "hidden", background: "#FFFFFF" }}>
            <div className="hero-summary-grid">
              <div style={{ padding: "18px 20px", borderRight: "1px solid #ECECEA" }}>
                <div style={{ fontSize: 12.5, color: "#8A8A85" }}>Face shape</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 500 }}>Oval</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8A8A85" }}>CONFIDENCE 0.93</div>
              </div>
              <div style={{ padding: "18px 20px", borderRight: "1px solid #ECECEA" }}>
                <div style={{ fontSize: 12.5, color: "#8A8A85" }}>Length to width</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 500 }}>1.27</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8A8A85" }}>HAIRLINE TO CHIN ÷ CHEEKBONES</div>
              </div>
              <div style={{ padding: "18px 20px", borderRight: "1px solid #ECECEA" }}>
                <div style={{ fontSize: 12.5, color: "#8A8A85" }}>Jaw definition</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 500 }}>Defined</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8A8A85" }}>BIGONIAL 0.80 OF CHEEKS</div>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: 12.5, color: "#8A8A85" }}>Undertone</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 500 }}>Warm</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8A8A85" }}>MEDIUM CONTRAST</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Analysis Section (#analysis) */}
      <section
        id="analysis"
        style={{
          background: "#FAFAF9",
          borderTop: "1px solid #ECECEA",
          borderBottom: "1px solid #ECECEA",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(44px, 8vw, 88px) clamp(16px, 4vw, 32px)",
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 20,
            }}
          >
            <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#8A8A85", letterSpacing: "0.04em" }}>
                The analysis
              </span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(24px, 5vw, 40px)",
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                }}
              >
                Nine attributes, each with{" "}
                <span style={{ fontWeight: 600 }}>a clear role</span> in your recommendations.
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 380, color: "#5F5F5B", fontSize: 14 }}>
              Every result is shown against its full range, so it is clear where you sit and why a
              recommendation follows from it.
            </p>
          </div>

          {/* 3 Featured Attribute Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 20,
            }}
          >
            {/* Card 1: Jawline */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #ECECEA",
                borderRadius: 14,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 17 }}>
                  Jawline
                </span>
                <span
                  style={{
                    fontSize: 12,
                    border: "1px solid #ECECEA",
                    borderRadius: 999,
                    padding: "2px 10px",
                    color: "#4F2C1D",
                  }}
                >
                  Defined
                </span>
              </div>

              {/* Lower Jaw Photographic Crop with Landmark overlay */}
              <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "#E5E5E3" }}>
                <svg
                  viewBox="18 251 264 149"
                  role="img"
                  aria-label="Lower face of the sample with the measured jaw contour and jaw angle"
                  style={{ width: "100%", height: "auto", display: "block" }}
                >
                  <defs>
                    <clipPath id="jawclip">
                      <rect x="0" y="228" width="300" height="400" />
                    </clipPath>
                    <linearGradient id="jfade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#0F0F11" stopOpacity="0" />
                      <stop offset="1" stopColor="#0F0F11" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  <image href="/images/mockup/hero-face.jpg" x="0" y="0" width="300" height="400" preserveAspectRatio="none" />
                  <rect x="0" y="330" width="300" height="120" fill="url(#jfade)" />
                  <path
                    d="M151.5 111.7 C161.2 111.7 171.5 111.6 180.3 112.4 C189.2 113.2 196.9 114.5 204.7 116.6 C212.4 118.7 220.8 121.6 226.8 125.2 C232.8 128.8 237.2 133.3 240.9 138.3 C244.7 143.3 247.3 149.3 249.4 155.1 C251.5 160.9 252.6 166.4 253.7 173.2 C254.7 180.1 255.3 188.6 255.7 196.0 C256.0 203.4 255.8 210.4 255.7 217.8 C255.5 225.2 255.5 232.7 254.9 240.4 C254.2 248.1 253.6 256.1 252.0 264.2 C250.4 272.3 248.1 281.5 245.3 288.9 C242.6 296.3 238.9 302.8 235.3 308.4 C231.7 314.0 228.1 318.1 223.8 322.6 C219.5 327.2 214.0 332.1 209.7 335.8 C205.3 339.6 201.8 342.4 197.7 345.2 C193.5 348.1 189.6 350.9 184.9 353.1 C180.3 355.4 175.6 357.5 169.9 358.7 C164.2 359.8 157.1 360.1 150.7 360.1 C144.3 360.1 137.3 359.8 131.7 358.6 C126.1 357.4 121.5 355.2 116.9 353.0 C112.3 350.7 108.3 348.0 104.2 345.1 C100.1 342.3 96.5 339.6 92.2 335.9 C87.8 332.2 82.2 327.4 77.8 322.9 C73.5 318.3 69.9 314.3 66.2 308.7 C62.6 303.1 58.8 296.7 55.9 289.3 C53.1 281.9 50.8 272.5 49.1 264.4 C47.4 256.3 46.5 248.3 45.7 240.6 C44.9 232.9 44.7 225.6 44.5 218.2 C44.2 210.8 43.7 203.9 44.1 196.5 C44.4 189.1 45.3 180.7 46.5 173.8 C47.7 167.0 49.0 161.4 51.3 155.5 C53.6 149.6 56.4 143.6 60.4 138.6 C64.4 133.5 69.0 129.0 75.3 125.3 C81.5 121.7 90.0 118.7 97.9 116.6 C105.8 114.5 113.7 113.3 122.6 112.5 C131.6 111.7 141.9 111.7 151.5 111.7 Z"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.3"
                    strokeOpacity="0.9"
                    clipPath="url(#jawclip)"
                  />
                  <line x1="66.21" y1="308.7" x2="235.28" y2="308.42" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.8" strokeDasharray="3 3" />
                  <circle cx="66.2" cy="308.7" r="4.5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="66.2" cy="308.7" r="2.2" fill="#FFFFFF" />
                  <circle cx="235.3" cy="308.4" r="4.5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="235.3" cy="308.4" r="2.2" fill="#FFFFFF" />
                  <circle cx="150.7" cy="360.1" r="4.5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="150.7" cy="360.1" r="2.2" fill="#FFFFFF" />
                </svg>
                {/* Badges on Jaw Image */}
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    bottom: 10,
                    padding: "8px 12px",
                    background: "rgba(28, 28, 28, 0.55)",
                    WebkitBackdropFilter: "blur(14px)",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    borderRadius: 12,
                    color: "#FFFFFF",
                  }}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.72)", fontSize: 9 }}>
                    Gonial angle
                  </div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300, fontSize: 24, lineHeight: 1.1 }}>
                    132°
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    bottom: 10,
                    padding: "8px 12px",
                    background: "rgba(28, 28, 28, 0.55)",
                    WebkitBackdropFilter: "blur(14px)",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    borderRadius: 12,
                    color: "#FFFFFF",
                  }}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.72)", fontSize: 9 }}>
                    Jaw ÷ cheeks
                  </div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300, fontSize: 24, lineHeight: 1.1 }}>
                    0.80
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ position: "relative", height: 18 }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 8, height: 2, background: "#E6E6E3" }} />
                  <div style={{ position: "absolute", left: "48%", top: 3, width: 1, height: 12, background: "#8A8A85" }} />
                  <div
                    style={{
                      position: "absolute",
                      left: "78%",
                      top: 2,
                      width: 14,
                      height: 14,
                      marginLeft: -7,
                      borderRadius: 999,
                      background: "#4F2C1D",
                      border: "3px solid #FFFFFF",
                      boxShadow: "0 0 0 1px #4F2C1D",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8A8A85" }}>
                  <span>Soft</span>
                  <span>Average ┃</span>
                  <span><strong style={{ color: "#111111" }}>You</strong> · Defined</span>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "#5F5F5B",
                  borderTop: "1px solid #F0F0EE",
                  paddingTop: 12,
                }}
              >
                Drives beard recommendations. A defined angle carries short, boxed shapes that keep the jaw line visible.
              </p>
            </div>

            {/* Card 2: Facial thirds */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #ECECEA",
                borderRadius: 14,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 17 }}>
                  Facial thirds
                </span>
                <span
                  style={{
                    fontSize: 12,
                    border: "1px solid #ECECEA",
                    borderRadius: 999,
                    padding: "2px 10px",
                    color: "#4F2C1D",
                  }}
                >
                  Balanced
                </span>
              </div>

              {/* Profile Photo Crop & Thirds Sliders */}
              <div style={{ background: "#F4F4F2", borderRadius: 8, padding: 12, display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ position: "relative", width: 112, flex: "none", borderRadius: 8, overflow: "hidden", background: "#E5E5E3" }}>
                  <svg viewBox="40 52 220 328" style={{ width: "100%", height: "auto", display: "block" }} aria-hidden="true">
                    <image href="/images/mockup/hero-face.jpg" x="0" y="0" width="300" height="400" preserveAspectRatio="none" />
                    <g stroke="#FFFFFF" strokeWidth="1.6" strokeDasharray="6 5">
                      <line x1="40" y1="92" x2="260" y2="92" />
                      <line x1="40" y1="163" x2="260" y2="163" />
                      <line x1="40" y1="261" x2="260" y2="261" />
                      <line x1="40" y1="360" x2="260" y2="360" />
                    </g>
                    <circle cx="151.8" cy="92.2" r="5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="151.8" cy="92.2" r="2.2" fill="#FFFFFF" />
                    <circle cx="151.8" cy="162.8" r="5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="151.8" cy="162.8" r="2.2" fill="#FFFFFF" />
                    <circle cx="152.4" cy="260.8" r="5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="152.4" cy="260.8" r="2.2" fill="#FFFFFF" />
                    <circle cx="150.7" cy="360.1" r="5" fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="150.7" cy="360.1" r="2.2" fill="#FFFFFF" />
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 0 }}>
                  {[
                    { name: "Upper", v: "0.26", pos: "13.1%" },
                    { name: "Middle", v: "0.37", pos: "69.9%" },
                    { name: "Lower", v: "0.37", pos: "72.5%" },
                  ].map((t) => (
                    <div key={t.name} style={{ display: "grid", gridTemplateColumns: "54px minmax(0, 1fr) 38px", gap: 10, alignItems: "center", fontSize: 12.5 }}>
                      <span style={{ color: "#5F5F5B" }}>{t.name}</span>
                      <span style={{ position: "relative", height: 14, display: "block" }}>
                        <span style={{ position: "absolute", left: 0, right: 0, top: 6, height: 2, background: "#E6E6E3" }} />
                        <span style={{ position: "absolute", left: "30%", width: "40%", top: 3, height: 8, background: "#EFE7DD", borderRadius: 2 }} />
                        <span style={{ position: "absolute", left: t.pos, top: 2, width: 10, height: 10, marginLeft: -5, borderRadius: 999, background: "#4F2C1D" }} />
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textAlign: "right" }}>{t.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#8A8A85" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 14, height: 8, background: "#EFE7DD", borderRadius: 2 }} />
                  Typical range 0.30 to 0.36
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "#4F2C1D" }} />
                  You
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "#5F5F5B",
                  borderTop: "1px solid #F0F0EE",
                  paddingTop: 12,
                }}
              >
                Drives fringe and volume. Balanced thirds suit most heights on top; no fringe correction is needed.
              </p>
            </div>

            {/* Card 3: Face shape */}
            {(() => {
              const activeShape = SHAPES_DATA.find((s) => s.name === selectedShape) || SHAPES_DATA[1];
              return (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #ECECEA",
                    borderRadius: 14,
                    padding: 22,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 17 }}>
                      Face shape
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        border: "1px solid #ECECEA",
                        borderRadius: 999,
                        padding: "2px 10px",
                        color: "#4F2C1D",
                      }}
                    >
                      {activeShape.name}
                    </span>
                  </div>

                  {/* 6 Real Photographic Shape Previews with Contour Overlays */}
                  <div
                    style={{
                      background: "#FCFCFB",
                      borderRadius: 8,
                      padding: "12px 8px",
                      display: "grid",
                      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                      gap: 6,
                    }}
                  >
                    {SHAPES_DATA.map((shape) => {
                      const on = selectedShape === shape.name;
                      return (
                        <button
                          key={shape.name}
                          type="button"
                          onClick={() => setSelectedShape(shape.name)}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              borderRadius: 6,
                              overflow: "hidden",
                              background: "#E5E5E3",
                              outline: on ? "2px solid #111111" : "none",
                              outlineOffset: 1,
                            }}
                          >
                            <svg viewBox={shape.viewBox} style={{ width: "100%", height: "auto", display: "block" }} aria-hidden="true">
                              <image href={shape.image} x="0" y="0" width="300" height="400" preserveAspectRatio="none" />
                              <path
                                d={shape.path}
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth={on ? 4 : 3}
                                strokeDasharray={on ? "none" : "10 7"}
                                opacity={on ? 1 : 0.85}
                              />
                            </svg>
                          </div>
                          <span
                            style={{
                              fontSize: 10.5,
                              color: on ? "#111111" : "#8A8A85",
                              fontWeight: on ? 600 : 400,
                            }}
                          >
                            {shape.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Length to Width & Confidence */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 8,
                      fontSize: 12.5,
                    }}
                  >
                    <div style={{ border: "1px solid #F0F0EE", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ color: "#8A8A85" }}>Length : width</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>{activeShape.ratio}</div>
                    </div>
                    <div style={{ border: "1px solid #F0F0EE", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ color: "#8A8A85" }}>Confidence</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>{activeShape.confidence}</div>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      color: "#5F5F5B",
                      borderTop: "1px solid #F0F0EE",
                      paddingTop: 12,
                    }}
                  >
                    {activeShape.description}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* 6 Grid Attributes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              border: "1px solid #ECECEA",
              borderRadius: 14,
              background: "#FFFFFF",
              overflow: "hidden",
            }}
          >
            {MORE_ATTRS.map((m) => (
              <div
                key={m.code}
                style={{
                  padding: "14px 16px",
                  borderTop: "1px solid #F0F0EE",
                  borderRight: "1px solid #F0F0EE",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: "#8A8A85",
                      marginRight: 10,
                    }}
                  >
                    {m.code}
                  </span>
                  {m.name}
                </span>
                <span style={{ fontSize: 13, color: "#4F2C1D" }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Sample Report Section (#report) */}
      <section
        id="report"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(44px, 8vw, 88px) clamp(16px, 4vw, 32px)",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#8A8A85", letterSpacing: "0.04em" }}>Sample report</span>
          <h2
            style={{
              margin: 0,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(24px, 5vw, 40px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            Every finding comes with{" "}
            <span style={{ fontWeight: 600 }}>an explanation and an action.</span>
          </h2>
        </div>

        <div
          className="sample-report-grid"
          style={{
            border: "1px solid #ECECEA",
            borderRadius: 16,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "240px minmax(0, 1fr)",
            boxShadow: "0 24px 48px -32px rgba(17,17,17,0.25)",
          }}
        >
          {/* Sidebar */}
          <aside
            className="sample-report-sidebar"
            style={{
              background: "#FAFAF9",
              borderRight: "1px solid #ECECEA",
              padding: "22px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 14,
            }}
          >
            <div
              style={{
                padding: "0 8px 14px",
                borderBottom: "1px solid #ECECEA",
                marginBottom: 10,
              }}
            >
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500 }}>Rohan's Report</div>
              <div style={{ fontSize: 12, color: "#8A8A85" }}>29 October 2026 · Member #0347</div>
            </div>

            {(
              [
                ["overview", "Overview"],
                ["structure", "Face structure"],
              ] as [SampleTab, string][]
            ).map(([t, label]) => {
              const active = activeTab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: active ? "#FFFFFF" : "transparent",
                    border: active ? "1px solid #ECECEA" : "1px solid transparent",
                    fontWeight: active ? 500 : 400,
                    color: active ? "#111111" : "#5F5F5B",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                >
                  {label}
                </button>
              );
            })}

            <div
              style={{
                marginTop: "auto",
                fontSize: 11.5,
                color: "#8A8A85",
                padding: "12px 8px 0",
                borderTop: "1px solid #ECECEA",
              }}
            >
              Sample data. Style guidance, not a medical assessment.
            </div>
          </aside>

          {/* Report Content Body */}
          <div
            className="sample-report-body"
            style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 500,
                  fontSize: 22,
                  textTransform: "capitalize",
                }}
              >
                {activeTab === "structure" ? "Face structure" : "Overview"}
              </h3>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#8A8A85",
                }}
              >
                SECTION 2 OF 6
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {/* Width profile chart */}
              <div
                style={{
                  border: "1px solid #ECECEA",
                  borderRadius: 12,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: "#8A8A85",
                  }}
                >
                  WIDTH PROFILE, RELATIVE TO CHEEKBONES
                </div>
                <svg
                  viewBox="0 0 320 150"
                  role="img"
                  aria-label="Bar chart of forehead, cheekbone and jaw widths relative to cheekbone width, with a typical oval band"
                  style={{ width: "100%", height: "auto" }}
                >
                  <g stroke="#F0F0EE" strokeWidth="1">
                    <line x1="90" y1="10" x2="90" y2="130" />
                    <line x1="160" y1="10" x2="160" y2="130" />
                    <line x1="230" y1="10" x2="230" y2="130" />
                    <line x1="300" y1="10" x2="300" y2="130" />
                  </g>
                  <rect x="216" y="14" width="56" height="112" fill="#EFE7DD" opacity="0.7" />
                  <g fill="#4F2C1D">
                    <rect x="90" y="22" width="174" height="16" rx="2" />
                    <rect x="90" y="62" width="210" height="16" rx="2" />
                    <rect x="90" y="102" width="162" height="16" rx="2" />
                  </g>
                  <g fontFamily="Space Grotesk, sans-serif" fontSize="12" fill="#5F5F5B">
                    <text x="0" y="34">
                      Forehead
                    </text>
                    <text x="0" y="74">
                      Cheekbones
                    </text>
                    <text x="0" y="114">
                      Jaw
                    </text>
                  </g>
                  <g fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#111111">
                    <text x="270" y="34">
                      0.83
                    </text>
                    <text x="304" y="74" fill="#5F5F5B">
                      1.00
                    </text>
                    <text x="258" y="114">
                      0.80
                    </text>
                  </g>
                  <g fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#8A8A85">
                    <text x="86" y="146">
                      0.4
                    </text>
                    <text x="154" y="146">
                      0.6
                    </text>
                    <text x="224" y="146">
                      0.8
                    </text>
                    <text x="292" y="146">
                      1.0
                    </text>
                  </g>
                </svg>
                <div style={{ fontSize: 12, color: "#8A8A85" }}>
                  Shaded band: typical range for an oval face.
                </div>
              </div>

              {/* Explanation */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: "#8A8A85",
                  }}
                >
                  EXPLANATION
                </div>
                <p style={{ margin: 0, color: "#333330" }}>
                  Your cheekbones are the widest point of the face, with the forehead slightly narrower and
                  the jaw clearly defined at 0.80 of cheekbone width. Combined with a length-to-width ratio of
                  1.27, this places you firmly in the oval range.
                </p>
                <p style={{ margin: 0, color: "#333330" }}>
                  In practice, most haircut shapes work. Volume on top keeps the length in proportion; very
                  wide sides would hide the cheekbone line.
                </p>
              </div>
            </div>

            {/* Recommended Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: "#8A8A85",
                }}
              >
                RECOMMENDED ACTIONS
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  {
                    title: "Textured crop",
                    cat: "Hairstyle",
                    upkeep: "Low",
                    basis: "Oval shape, balanced thirds",
                    note: "Ask for: scissor-cut top, number 2 on the sides.",
                  },
                  {
                    title: "Rectangular frames",
                    cat: "Eyewear",
                    upkeep: "None",
                    basis: "Oval shape, medium width",
                    note: "Frame width 135 to 140 mm; avoid very round lenses.",
                  },
                  {
                    title: "Short boxed beard",
                    cat: "Beard",
                    upkeep: "Medium",
                    basis: "Defined jaw, medium growth",
                    note: "Keep cheek line low and the neckline one finger above the Adam’s apple.",
                  },
                ].map((a) => (
                  <div
                    key={a.title}
                    style={{
                      border: "1px solid #ECECEA",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 15.5 }}>
                      {a.title}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0, 1fr)",
                        gap: "4px 12px",
                        fontSize: 12.5,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          color: "#8A8A85",
                          paddingTop: 2,
                        }}
                      >
                        CATEGORY
                      </span>
                      <span>{a.cat}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          color: "#8A8A85",
                          paddingTop: 2,
                        }}
                      >
                        UPKEEP
                      </span>
                      <span>{a.upkeep}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          color: "#8A8A85",
                          paddingTop: 2,
                        }}
                      >
                        BASED ON
                      </span>
                      <span>{a.basis}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "#5F5F5B",
                        background: "#FAFAF9",
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      {a.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section (#how) */}
      <section id="how" style={{ borderTop: "1px solid #ECECEA" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(44px, 8vw, 88px) clamp(16px, 4vw, 32px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(32px, 6vw, 64px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#8A8A85", letterSpacing: "0.04em" }}>How it works</span>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(24px, 5vw, 40px)",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
              }}
            >
              Three steps, <span style={{ fontWeight: 600 }}>about a minute.</span>
            </h2>
            <div
              style={{
                marginTop: 12,
                border: "1px dashed #D9D9D6",
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                gap: 16,
                alignItems: "center",
              }}
            >
              <svg width="60" height="76" viewBox="0 0 64 80" aria-hidden="true" style={{ flexShrink: 0 }}>
                <rect x="1" y="1" width="62" height="78" rx="8" fill="#FAFAF9" stroke="#D9D9D6" />
                <path
                  d="M32 16 C44 16 49 25 49 36 C49 49 41 60 32 60 C23 60 15 49 15 36 C15 25 20 16 32 16 Z"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="1.2"
                />
              </svg>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10.5,
                    letterSpacing: "0.08em",
                    color: "#8A8A85",
                  }}
                >
                  POSE REQUIRED
                </div>
                <div style={{ fontWeight: 500, fontSize: 14.5 }}>Front face, neutral expression</div>
                <div style={{ fontSize: 13, color: "#5F5F5B" }}>Natural light, glasses off, forehead clear.</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              {
                num: "01",
                title: "Pose & capture",
                desc: "Front-facing selfie in natural light. Glasses and caps off. Takes 15 seconds.",
              },
              {
                num: "02",
                title: "Landmark mapping",
                desc: "Forty-six key points are mapped across the jaw, cheekbones, brow, nose and chin.",
              },
              {
                num: "03",
                title: "Grooming report",
                desc: "Your face shape, top three haircuts, barber specifications, beard guide and grooming routine.",
              },
            ].map((step) => (
              <div key={step.num} style={{ display: "flex", gap: 18 }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: "#4F2C1D",
                    fontWeight: 500,
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 17 }}>
                    {step.title}
                  </div>
                  <p style={{ margin: "4px 0 0", color: "#5F5F5B", fontSize: 13.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Privacy Section (#privacy) */}
      <section
        id="privacy"
        style={{
          background: "#FAFAF9",
          borderTop: "1px solid #ECECEA",
          borderBottom: "1px solid #ECECEA",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(44px, 8vw, 72px) clamp(16px, 4vw, 32px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(32px, 6vw, 64px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#8A8A85", letterSpacing: "0.04em" }}>Privacy</span>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(24px, 5vw, 36px)",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
              }}
            >
              Your photo is private,{" "}
              <span style={{ fontWeight: 600 }}>and securely stored.</span>
            </h2>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #ECECEA",
              borderRadius: 14,
              overflow: "hidden",
              fontSize: 14,
            }}
          >
            <div
              className="privacy-table-row"
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                padding: "16px 20px",
                borderBottom: "1px solid #F0F0EE",
              }}
            >
              <span style={{ color: "#8A8A85" }}>Photo</span>
              <span>Stored securely in your private Founding Member profile.</span>
            </div>
            <div
              className="privacy-table-row"
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                padding: "16px 20px",
                borderBottom: "1px solid #F0F0EE",
              }}
            >
              <span style={{ color: "#8A8A85" }}>Kept</span>
              <span>Written results only, such as "oval face, wavy hair".</span>
            </div>
            <div
              className="privacy-table-row"
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                padding: "16px 20px",
                borderBottom: "1px solid #F0F0EE",
              }}
            >
              <span style={{ color: "#8A8A85" }}>Identifiers</span>
              <span>No account required for the analysis.</span>
            </div>
            <div
              className="privacy-table-row"
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                padding: "16px 20px",
              }}
            >
              <span style={{ color: "#8A8A85" }}>Security</span>
              <span>Landmark mapping runs on your device or in memory.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Questions (FAQ) Section (#faq) */}
      <section
        id="faq"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(44px, 8vw, 72px) clamp(16px, 4vw, 32px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "clamp(24px, 5vw, 64px)",
        }}
      >
        <h2 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontWeight: 400, fontSize: "clamp(24px, 5vw, 36px)", letterSpacing: "-0.03em" }}>
          Questions
        </h2>

        <div>
          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>Is the analysis free?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B", fontSize: 14 }}>
              Yes. The analysis, the report and every recommendation until launch cost nothing.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>How accurate is it?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B", fontSize: 14 }}>
              Each result shows a confidence level. If a photo is unclear, a retake is requested rather than
              a guess.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>Can I join without the camera?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B", fontSize: 14 }}>
              Yes. Select a face shape from a reference chart and receive the same program.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>What happens to my photo?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B", fontSize: 14 }}>
              It is discarded the moment landmarks are measured. We retain written proportions only.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>When does Nodd Men launch?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B", fontSize: 14 }}>
              The store opens to everyone at 10 am on Sunday 13 December 2026.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", borderBottom: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>What are Founding Members?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B", fontSize: 14 }}>
              Men who complete the analysis receive a permanent member number and priority access to the product pre-order.
            </p>
          </details>
        </div>
      </section>

      {/* 9. Closing CTA Section */}
      <section style={{ borderTop: "1px solid #ECECEA" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(48px, 8vw, 72px) clamp(16px, 4vw, 32px) clamp(64px, 10vw, 80px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(24px, 6vw, 40px)",
              letterSpacing: "-0.03em",
            }}
          >
            Know your face{" "}
            <span style={{ fontWeight: 600, color: "#4F2C1D" }}>before you style it.</span>
          </h2>
          <p style={{ margin: 0, color: "#5F5F5B", fontSize: "clamp(13.5px, 3.5vw, 15px)" }}>
            Founding Member numbers close on 13 December 2026.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="btn-primary"
            style={{
              padding: "14px 28px",
              fontSize: 15,
              width: "min(100%, 320px)",
            }}
          >
            Start my analysis
          </button>
        </div>
      </section>

      {/* 10. Footer */}
      <footer style={{ borderTop: "1px solid #ECECEA" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "24px clamp(16px, 4vw, 32px) 96px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 14,
            fontSize: 12.5,
            color: "#8A8A85",
          }}
        >
          <span>
            Recommendations are style guidance generated with AI and are not medical advice. Results shown
            are sample data.
          </span>
          <span style={{ display: "flex", gap: 20 }}>
            <Link href="/how-we-use-your-data" style={{ color: "#8A8A85" }}>
              Privacy policy
            </Link>
            <a href="https://noddmen.com" style={{ color: "#8A8A85" }}>
              noddmen.com
            </a>
            <span>© 2026 Grit Sense Pvt Ltd</span>
          </span>
        </div>
      </footer>

      {/* Floating Bottom Sticky Bar for Mobile */}
      <div className="mobile-bottom-bar">
        <button
          type="button"
          onClick={onStart}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "14px 20px",
            fontSize: 15,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(79, 44, 29, 0.25)",
            borderRadius: 8,
          }}
        >
          Start facial analysis
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
