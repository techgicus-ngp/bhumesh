// src/utils/shareQuotation.js
// Shares the quotation PDF through the phone's share sheet (WhatsApp is one of the choices),
// with a download + WhatsApp-chat fallback for browsers that cannot share files.
import { fmtCurrency } from "./format";

/** Quotation_Ramesh_Patil_Plot_12.pdf */
export const quotationFileName = (q) => {
  const clean = (s) => String(s ?? "").replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "");
  return ["Quotation", clean(q.customerName) || "Customer", q.plotNumber ? `Plot_${clean(q.plotNumber)}` : ""]
    .filter(Boolean)
    .join("_") + ".pdf";
};

export const quotationMessage = (q) =>
  `Hello ${q.customerName},\n\n` +
  `Please find your quotation for ${q.projectName} – Plot ${q.plotNumber}.\n` +
  `Total amount: ${fmtCurrency(q.finalTotalAmount)}\n\n` +
  `Thank you,\nBhumesh Realtors`;

/** 10-digit Indian mobile → 91XXXXXXXXXX (wa.me format, digits only) */
export function normalizeMobile(m) {
  let d = String(m ?? "").replace(/\D/g, "");
  d = d.replace(/^0+/, "");
  if (d.length === 10) d = `91${d}`;
  return d;
}

const canShareFile = (file) =>
  typeof navigator !== "undefined" &&
  typeof navigator.share === "function" &&
  typeof navigator.canShare === "function" &&
  navigator.canShare({ files: [file] });

/**
 * Call this straight from the click handler, with a PDF Blob that is ALREADY generated.
 * Returns "shared" | "cancelled" | "fallback".
 */
export async function sharePdfToWhatsApp(q, pdfBlob) {
  const file = new File([pdfBlob], quotationFileName(q), { type: "application/pdf" });
  const text = quotationMessage(q);

  if (canShareFile(file)) {
    try {
      await navigator.share({ files: [file], title: `Quotation – ${q.customerName}`, text });
      return "shared";
    } catch (e) {
      if (e?.name === "AbortError") return "cancelled"; // user closed the share sheet
      // any other error → use the fallback below
    }
  }

  // Fallback (desktop and browsers without file sharing): save the PDF, open the chat with the message.
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  const phone = normalizeMobile(q.mobileNumber);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  return "fallback";
}