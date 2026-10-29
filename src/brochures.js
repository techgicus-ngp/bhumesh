// src/brochures.js
// Brochure PDFs sit directly in /public, so they are served from the site root.
// The first rule whose `match` text appears in the map name wins. Capital letters, spaces
// and punctuation are ignored, so "Anandam Elite 5 ( Waroda 36 B" still matches "waroda".
// File names are case-sensitive on Vercel: keep `file` exactly as the file in /public.
const RULES = [
  { match: "waranga",        file: "/WARANGA.pdf" },
  { match: "waroda",         file: "/WARODA.pdf" },
  { match: "shankarpur",     file: "/SHANKARPUR.pdf" },
  { match: "isasani",        file: "/ISASANI.pdf" },
  { match: "shreeramempire", file: "/shreeramempire.pdf" },
];

const squash = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** { url, fileName } for a map document, or null when that map has no brochure.
 *  A `brochureUrl` field on the Firestore map document (if you ever add one) wins over the rules. */
export function getBrochure(map) {
  if (!map) return null;
  const key = squash(map.name);
  const rule = RULES.find((r) => key.includes(r.match));
  const url = map.brochureUrl || rule?.file;
  if (!url) return null;
  const base =
    String(map.name || "layout").trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "layout";
  return { url, fileName: `${base}-brochure.pdf` };
}

/** Saves the PDF. Falls back to opening it in a new tab if it can't be fetched (e.g. another domain). */
export async function downloadBrochure({ url, fileName }) {
  try {
    const res = await fetch(url);
    // On Vercel a missing file returns index.html with status 200, so check the type too.
    if (!res.ok || !(res.headers.get("content-type") || "").includes("pdf")) {
      throw new Error("not a pdf");
    }
    const blobUrl = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}