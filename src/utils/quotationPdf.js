// src/utils/quotationPdf.js
// Turns the on-screen quotation sheet (.q-sheet) into a real A4 PDF file (a Blob).
// Needs:  npm install html2canvas jspdf
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function elementToPdfBlob(el) {
  if (!el) throw new Error("Quotation sheet is not ready yet");
  if (document.fonts?.ready) await document.fonts.ready; // keep ₹ / Devanagari in the right font

  const canvas = await html2canvas(el, {
    scale: 2, // sharper text
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    // Lay the sheet out as on a desktop screen, so the PDF has the 2-column layout even when made on a phone.
    windowWidth: 1100,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 18;

  let w = pageW - margin * 2;
  let h = (canvas.height * w) / canvas.width;
  if (h > pageH - margin * 2) {
    // taller than one page: shrink to fit a single page
    h = pageH - margin * 2;
    w = (canvas.width * h) / canvas.height;
  }
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (pageW - w) / 2, margin, w, h);
  return pdf.output("blob");
}