// src/hooks/usePdfBlob.js
import { useEffect, useState } from "react";

/**
 * Builds the PDF in the background as soon as the quotation is on screen, so it is READY when the
 * user taps Share (browsers only allow sharing right after a tap, so we can't wait for it then).
 * `generate(q)` must return (or resolve to) a Blob.
 */
export function usePdfBlob(q, generate, delay = 400) {
  const [state, setState] = useState({ blob: null, busy: false, error: null });

  useEffect(() => {
    if (!q) return undefined;
    let alive = true;
    setState({ blob: null, busy: true, error: null });
    // small delay so the page paints first, then the heavy work happens
    const t = setTimeout(async () => {
      try {
        const blob = await generate(q);
        if (alive) setState({ blob, busy: false, error: null });
      } catch (error) {
        console.error("PDF generation failed:", error);
        if (alive) setState({ blob: null, busy: false, error });
      }
    }, delay);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return state; // { blob, busy, error }
}