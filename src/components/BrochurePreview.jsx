// src/components/BrochurePreview.jsx
// Full-screen preview of a brochure PDF with Download / Open-in-new-tab / Close.
// Rendered through a portal so it is not clipped or shifted by the animated map card.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, X } from "lucide-react";

export default function BrochurePreview({ brochure, title, onClose }) {
  const [state, setState] = useState({ status: "loading", blobUrl: null });

  // Load the PDF once; the same blob is used for the preview and for the download.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(brochure.url);
        // On Vercel a missing file returns index.html with status 200, so check the type too.
        if (!res.ok || !(res.headers.get("content-type") || "").includes("pdf")) {
          throw new Error("not a pdf");
        }
        const blobUrl = URL.createObjectURL(await res.blob());
        if (!alive) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        setState({ status: "ready", blobUrl });
      } catch {
        if (alive) setState({ status: "error", blobUrl: null });
      }
    })();
    return () => {
      alive = false;
    };
  }, [brochure.url]);

  // Free the blob when the preview closes.
  useEffect(
    () => () => {
      if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
    },
    [state.blobUrl],
  );

  // Esc closes; page behind doesn't scroll.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const iconBtn = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 38,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #d9def0",
    background: "#fff",
    color: "#334155",
    font: "600 13px/1 system-ui, sans-serif",
    cursor: "pointer",
    textDecoration: "none",
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Brochure preview${title ? `: ${title}` : ""}`}
      // stopPropagation: React events bubble through portals, so a click here must not reach the map card
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(15, 23, 42, 0.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(0px, 2vw, 24px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          height: "100%",
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
          background: "#f1f4fb",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "#fff",
            borderBottom: "1px solid #e5e9f5",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#64748b" }}>
              BROCHURE PREVIEW
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#172033",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title || "Layout brochure"}
            </div>
          </div>

          {state.status === "ready" && (
            <a
              href={state.blobUrl}
              download={brochure.fileName}
              style={{ ...iconBtn, background: "#4f46e5", borderColor: "#4f46e5", color: "#fff" }}
            >
              <Download size={16} /> Download
            </a>
          )}
          <a
            href={brochure.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in a new tab"
            aria-label="Open in a new tab"
            style={{ ...iconBtn, padding: 0, width: 38 }}
          >
            <ExternalLink size={16} />
          </a>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close preview"
            style={{ ...iconBtn, padding: 0, width: 38 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {state.status === "loading" && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#64748b", fontSize: 14 }}>
              Loading brochure…
            </div>
          )}
          {state.status === "error" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                padding: 24,
                textAlign: "center",
                color: "#475569",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <div>
                <b style={{ color: "#172033" }}>The brochure couldn’t be loaded here.</b>
                <br />
                Try{" "}
                <a href={brochure.url} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontWeight: 600 }}>
                  opening it in a new tab
                </a>
                .
              </div>
            </div>
          )}
          {state.status === "ready" && (
            <iframe
              title={`Brochure: ${title || "layout"}`}
              src={`${state.blobUrl}#view=FitH`}
              style={{ width: "100%", height: "100%", border: 0, background: "#fff" }}
            />
          )}
        </div>

        {state.status === "ready" && (
          <div style={{ padding: "7px 14px", background: "#fff", borderTop: "1px solid #e5e9f5", fontSize: 12, color: "#8a94a6" }}>
            Preview not showing on your phone? Use <b>Download</b> or the open-in-new-tab button.
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}