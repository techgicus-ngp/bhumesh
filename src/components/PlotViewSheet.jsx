// widgets/plot_view_sheet.dart
// import { useNavigate } from "react-router-dom";
// import { FileText } from "lucide-react";
// import Modal from "./Modal";
// import { statusColor } from "../models/plot";
// import { isGuest } from "../models/user";
// import { capitalize } from "../utils/format";

// const Tile = ({ title, value, sub }) => (
//   <div
//     style={{ flex: 1, background: "#F8FAFC", borderRadius: 12, padding: 12 }}
//   >
//     <div style={{ fontSize: 11, color: "#64748b" }}>{title}</div>
//     <div style={{ fontWeight: 700 }}>{value}</div>
//     {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
//   </div>
// );

// export default function PlotViewSheet({ plot, mapId, mapName, user, onClose }) {
//   const nav = useNavigate();
//   const c = statusColor(plot.status);
//   return (
//     <Modal
//       sheet
//       onClose={onClose}
//       actions={
//         <>
//           {plot.type === "plot" && !isGuest(user) && (
//             <button
//               className="btn"
//               onClick={() =>
//                 nav("/quotations/new", { state: { plot, mapId, mapName } })
//               }
//             >
//               <FileText size={16} /> Generate Quotation
//             </button>
//           )}
//           <button className="btn ghost" onClick={onClose}>
//             Close
//           </button>
//         </>
//       }
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <div>
//           <div style={{ fontSize: 12, color: "#64748b" }}>
//             {capitalize(plot.type)}
//           </div>
//           <h3 style={{ margin: 0 }}>
//             {plot.type === "plot" ? `Plot ${plot.plotNo}` : plot.title}
//           </h3>
//         </div>
//         <span
//           className="status-badge"
//           style={{ color: c, borderColor: c, background: `${c}1A` }}
//         >
//           {plot.status}
//         </span>
//       </div>
//       <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
//         <Tile
//           title="Area"
//           value={`${plot.area.toFixed(0)} sq.m`}
//           sub={`(${plot.areaSqFt.toFixed(0)} sq.ft)`}
//         />
//         <Tile title="Dimensions" value={plot.dimensions || "Not set"} />
//         <Tile title="Facing" value={plot.facing} />
//       </div>
//       <div style={{ fontSize: 13, color: "#475569" }}>
//         <b>Center Coordinates</b>
//         <br />
//         Latitude: {plot.center.lat.toFixed(6)}
//         <br />
//         Longitude: {plot.center.lng.toFixed(6)}
//       </div>
//       {plot.notes && (
//         <p
//           style={{
//             background: "#FEF9C3",
//             padding: 12,
//             borderRadius: 10,
//             fontSize: 13,
//           }}
//         >
//           <b>Notes</b>
//           <br />
//           {plot.notes}
//         </p>
//       )}
//       <details style={{ marginTop: 12 }}>
//         <summary style={{ cursor: "pointer", fontWeight: 600 }}>
//           Corner Points ({plot.corners.length})
//         </summary>
//         {plot.corners.map((p, i) => (
//           <div
//             key={i}
//             style={{ fontSize: 12, color: "#64748b", padding: "3px 0" }}
//           >
//             #{i + 1} · Lat: {p.lat.toFixed(6)} · Lng: {p.lng.toFixed(6)}
//           </div>
//         ))}
//       </details>
//     </Modal>
//   );
// }




// widgets/plot_view_sheet.dart — Architectural Dark-Glass Plot Inspector Sheet
import { useNavigate } from "react-router-dom";
import {
  FileText,
  X,
  Compass,
  Maximize2,
  MapPin,
  ChevronDown,
  StickyNote,
} from "lucide-react";
import { statusColor } from "../models/plot";
import { isGuest } from "../models/user";
import { capitalize } from "../utils/format";

const CANVAS = "rgba(21, 24, 29, 0.94)";
const HAIR = "rgba(231, 225, 213, 0.14)";
const ACCENT = "#D4AF37";
const INK = "#E7E1D5";
const MUTED = "#9AA5B1";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', Consolas, monospace";

const Tile = ({ icon: Icon, title, value, sub }) => (
  <div
    style={{
      flex: 1,
      minWidth: 105,
      background: "rgba(255, 255, 255, 0.03)",
      border: `1px solid ${HAIR}`,
      borderRadius: 12,
      padding: "12px 13px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: MUTED,
      }}
    >
      {Icon && <Icon size={12} color={ACCENT} />}
      {title}
    </div>
    <div
      style={{
        fontFamily: MONO,
        fontSize: 15,
        fontWeight: 700,
        color: INK,
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: MUTED }}>
        {sub}
      </div>
    )}
  </div>
);

export default function PlotViewSheet({ plot, mapId, mapName, user, onClose }) {
  const nav = useNavigate();
  const c = statusColor(plot.status);

  return (
    <div
      role="dialog"
      aria-label="Plot details"
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 30,
        width: 390,
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 48px)",
        display: "flex",
        flexDirection: "column",
        background: CANVAS,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${HAIR}`,
        borderRadius: 16,
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.65)",
        color: INK,
        fontFamily: SANS,
        overflow: "hidden",
        animation: "pvsSlideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes pvsSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          div[aria-label="Plot details"] {
            left: 10px !important;
            right: 10px !important;
            bottom: 10px !important;
            width: auto !important;
            max-width: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "16px 18px 14px",
          borderBottom: `1px solid ${HAIR}`,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: ACCENT,
              marginBottom: 4,
            }}
          >
            {capitalize(plot.type)}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: INK,
            }}
          >
            {plot.type === "plot" ? `Plot ${plot.plotNo}` : plot.title}
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {plot.status && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: c,
                border: `1px solid ${c}`,
                background: `${c}22`,
                padding: "5px 10px",
                borderRadius: 999,
              }}
            >
              {plot.status}
            </span>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${HAIR}`,
              color: MUTED,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "16px 18px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Key Metric Tiles */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Tile
            icon={Maximize2}
            title="Area"
            value={`${plot.area.toFixed(0)} sq.m`}
            sub={`${plot.areaSqFt.toFixed(0)} sq.ft`}
          />
          <Tile
            title="Dimensions"
            value={plot.dimensions || "Standard"}
          />
          <Tile
            icon={Compass}
            title="Facing"
            value={plot.facing || "—"}
          />
        </div>

        {/* Center Coordinates */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.025)",
            border: `1px solid ${HAIR}`,
            borderRadius: 11,
            padding: "11px 13px",
            fontSize: 12.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={15} color={ACCENT} />
            <span style={{ color: MUTED, fontWeight: 600 }}>
              Center Coordinates
            </span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: INK }}>
            {plot.center.lat.toFixed(6)}, {plot.center.lng.toFixed(6)}
          </span>
        </div>

        {/* Notes */}
        {plot.notes && (
          <div
            style={{
              background: "rgba(212, 175, 55, 0.10)",
              border: `1px solid rgba(212, 175, 55, 0.35)`,
              padding: "12px 14px",
              borderRadius: 11,
              fontSize: 13,
              color: INK,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: ACCENT,
                marginBottom: 4,
              }}
            >
              <StickyNote size={13} /> Notes
            </div>
            {plot.notes}
          </div>
        )}

        {/* Collapsible Corner Coordinates */}
        <details
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: `1px solid ${HAIR}`,
            borderRadius: 11,
            padding: "10px 13px",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12.5,
              color: MUTED,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              listStyle: "none",
            }}
          >
            <span>Corner Points ({plot.corners.length})</span>
            <ChevronDown size={14} />
          </summary>
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: `1px solid ${HAIR}`,
              display: "grid",
              gap: 5,
              maxHeight: 130,
              overflowY: "auto",
            }}
          >
            {plot.corners.map((p, i) => (
              <div
                key={i}
                style={{
                  fontFamily: MONO,
                  fontSize: 11.5,
                  color: MUTED,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: ACCENT }}>#{i + 1}</span>
                <span>
                  Lat: {p.lat.toFixed(6)} · Lng: {p.lng.toFixed(6)}
                </span>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 18px 16px",
          borderTop: `1px solid ${HAIR}`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            font: `500 13px/1 ${MONO}`,
            color: INK,
            background: "transparent",
            border: `1px solid ${HAIR}`,
            borderRadius: 10,
            padding: "12px 14px",
            cursor: "pointer",
          }}
        >
          Close
        </button>

        {plot.type === "plot" && !isGuest(user) && (
          <button
            type="button"
            onClick={() =>
              nav("/quotations/new", { state: { plot, mapId, mapName } })
            }
            style={{
              flex: 1.8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              font: `600 13px/1 ${MONO}`,
              color: "#15181D",
              background: ACCENT,
              border: `1px solid ${ACCENT}`,
              borderRadius: 10,
              padding: "12px 16px",
              cursor: "pointer",
            }}
          >
            <FileText size={15} /> Generate Quotation
          </button>
        )}
      </div>
    </div>
  );
}