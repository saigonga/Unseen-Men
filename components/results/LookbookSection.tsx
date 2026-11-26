"use client";

import { useEffect, useRef } from "react";
import type { Photo } from "../FaceScanApp";
import type { Look, Lookbook } from "@/lib/lookbook";
import { lookDescription, lookTitle } from "@/lib/lookbook";
import { drawLookCard } from "@/lib/lookbookCanvas";
import SaveImageButton from "./SaveImageButton";

function LookCard({ look, book, photo, index }: { look: Look; book: Lookbook; photo: Photo; index: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const title = lookTitle(look);

  useEffect(() => {
    if (canvas.current) drawLookCard(canvas.current, photo.img, photo.det, look);
  }, [look, photo]);

  return (
    <article style={{ border: "1px solid #DDD9D3", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <canvas ref={canvas} role="img" aria-label={`Your selfie with ${title.toLowerCase()}`}
        width={640} height={800} style={{ display: "block", width: "100%", height: "auto", background: "#17120f" }} />
      <div style={{ padding: 12, display: "grid", gap: 8, justifyItems: "start" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#5C4F47" }}>{lookDescription(book.shape, look)}</p>
        <SaveImageButton canvas={() => canvas.current} filename={`nodd-men-look-${index + 1}.jpg`} label={`Save ${title}`} />
      </div>
    </article>
  );
}

export default function LookbookSection({ book, photo }: { book: Lookbook; photo: Photo }) {
  return (
    <section aria-labelledby="lookbook-title" style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 id="lookbook-title" style={{ margin: 0, fontSize: 22 }}>Your personal lookbook</h2>
        <p style={{ margin: "4px 0 0", color: "#5C4F47", fontSize: 13 }}>Try eight looks on your selfie. Hair and beard filters show a stylized preview.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 185px), 1fr))", gap: 12 }}>
        {book.looks.map((look, index) => <LookCard key={index} look={look} book={book} photo={photo} index={index} />)}
      </div>
    </section>
  );
}
