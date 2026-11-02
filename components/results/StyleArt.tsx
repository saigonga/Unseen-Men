import { cutSvg, beardSvg } from "@/lib/illustrations";

/** Our own generated SVG (no user input), safe to inline. */
export default function StyleArt({ kind, name, size = 64 }: { kind: "cut" | "beard"; name: string; size?: number }) {
  const svg = kind === "cut" ? cutSvg(name, { size, bg: "#1d1b19" }) : beardSvg(name, { size, bg: "#1d1b19" });
  return <span className="art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
