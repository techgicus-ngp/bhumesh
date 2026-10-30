// import React, {
//   memo,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   GoogleMap,
//   useJsApiLoader,
//   PolygonF,
//   MarkerF,
// } from "@react-google-maps/api";
// import {
//   ArrowLeft,
//   Pencil,
//   Check,
//   Info,
//   SlidersHorizontal,
//   Search,
//   X,
//   Maximize2,
//   Eye,
//   Trash2,
//   Share2,
//   Copy,
//   MessageCircle,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { isAdmin } from "../models/user";
// import { getMap, updateMapPlots } from "../services/mapService";
// import { plotFromDoc } from "../models/plot";
// import {
//   calculatePolygonArea,
//   getPolygonCenter,
//   getBounds,
// } from "../utils/mapUtils";
// import { Spinner } from "../components/ui";
// import Modal from "../components/Modal";
// import PlotViewSheet from "../components/PlotViewSheet";
// import { useToast } from "../components/Toast";

// /* ── Reference Architectural Theme Tokens ──────────────────────────── */
// const CANVAS = "rgba(21, 24, 29, 0.90)";
// const PANEL = "rgba(21, 24, 29, 0.86)";
// const HAIR = "rgba(231, 225, 213, 0.14)";
// const ACCENT = "#D4AF37";
// const MUTED = "#9AA5B1";
// const INK = "#E7E1D5";
// const PLAIN_FILL = "#F1ECE2";
// const SELECTED_FILL = "#A855F7";
// const SELECTED_STROKE = "#E9C6F2";
// const ROAD_AND_BG_COLOR = "#475569"; // Unified solid cement color for roads & layout base
// const UNIFORM_PLOT_FONT_SIZE = 1.95; // Uniform font size (in meters) for all plot numbers
// const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
// const MONO = "'JetBrains Mono', 'SF Mono', Consolas, monospace";
// const MAPFONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
// const SQFT = 10.7639104;

// /* ── Camera & Animation Constants (from PlanMap.jsx) ───────────────── */
// const FLY_MS = 780;
// const ZOOM_STEP = 0.75;
// const ZOOM_STEP_MS = 220;
// const FLY_MIN_Z = 18.5;
// const FLY_MAX_Z = 22.2;
// const MAP_MAX_Z = 24;
// const easeOut = (t) => 1 - (1 - t) ** 3;
// const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// // Hard-coded highlight lists from the original app
// const GOLDEN = new Set([
//   "142", "143", "164", "165", "186", "222", "216", "220", "187", "204",
//   "215", "221", "223", "224", "225", "226", "227", "228", "229", "230",
//   "231", "232", "233", "234", "235", "434", "433", "432", "431", "430",
//   "429", "344", "345", "315", "314", "370", "371", "304", "303", "394",
//   "395", "292", "291", "413", "278", "277", "414", "428", "266", "265",
//   "264", "263", "262", "261", "244", "245", "246", "247", "248", "249",
//   "250", "251", "252", "253", "254", "255", "256", "257", "258", "259",
//   "260", "236",
// ]);
// const ORANGE = new Set([
//   "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "210", "11", "62",
//   "63", "64", "65", "66", "67", "205", "206", "207", "208", "209", "211",
//   "243", "242", "241", "240", "239", "238", "237",
// ]);
// const FACINGS = [
//   "All",
//   "North",
//   "South",
//   "East",
//   "West",
//   "North-East",
//   "North-West",
//   "South-East",
//   "South-West",
// ];
// const LIBRARIES = [];

// const isAmenity = (p) =>
//   p.type === "amenity" ||
//   p.type === "open_space.Amenityspace" ||
//   (p.type === "open_space" &&
//     (p.title || "").toLowerCase().includes("amenity"));

// /* Architectural color palette for Status ON vs Status OFF */
// function styleForFeature(p, showStatus) {
//   if (p.type === "road") {
//     return {
//       fill: ROAD_AND_BG_COLOR, // Solid cement color matching background
//       stroke: "none",          // Removed road border
//       ink: "#E7E1D5",
//       sw: 0,                   // Zero border width
//     };
//   }
//   if (isAmenity(p)) {
//     return {
//       fill: "#D9468F",
//       stroke: "#F472B6",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "space for STP" || p.type === "open_space.SpaceforSTP") {
//     return {
//       fill: "#EAB308",
//       stroke: "#FEF08A",
//       ink: "#1A1208",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "space for ESS" || p.type === "open_space.SpaceforESS") {
//     return {
//       fill: "#7C3AED",
//       stroke: "#C4B5FD",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "open_space") {
//     return {
//       fill: "#2E7D32",
//       stroke: "#81C784",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }

//   // Plot styling
//   if (!showStatus) {
//     return {
//       fill: PLAIN_FILL,
//       stroke: "#52473B",
//       ink: "#1A1208",
//       sw: 0.22,
//     };
//   }

//   const st = (p.status || "").toLowerCase();
//   if (st === "sold") {
//     return { fill: "#EF4444", stroke: "#FCA5A5", ink: "#FFFFFF", sw: 0.22 };
//   }
//   if (st === "booked" || st === "reserved" || st === "hold") {
//     return { fill: "#F59E0B", stroke: "#FDE68A", ink: "#1A1208", sw: 0.22 };
//   }
//   if (GOLDEN.has(p.plotNo)) {
//     return { fill: "#E7D055", stroke: "#FEF9C3", ink: "#1A1208", sw: 0.22 };
//   }
//   if (ORANGE.has(p.plotNo)) {
//     return { fill: "#FB923C", stroke: "#FFEDD5", ink: "#1A1208", sw: 0.22 };
//   }
//   return { fill: "#56B870", stroke: "#DCFCE7", ink: "#0F172A", sw: 0.22 };
// }

// /* ── Self-Contained Local Meter Geometry & CAD Helpers ─────────────── */

// function createLocalProjection(originLat, originLng) {
//   const R = 6378137;
//   const cosLat = Math.cos((originLat * Math.PI) / 180);
//   return {
//     toMeters(lat, lng) {
//       const x = ((lng - originLng) * Math.PI * R * cosLat) / 180;
//       const y = -((lat - originLat) * Math.PI * R) / 180;
//       return [x, y];
//     },
//     toLatLng(x, y) {
//       const lat = originLat - (y * 180) / (Math.PI * R);
//       const lng = originLng + (x * 180) / (Math.PI * R * cosLat);
//       return { lat, lng };
//     },
//   };
// }

// function ptsToPath(pts) {
//   if (!pts || pts.length < 3) return "";
//   let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
//   for (let i = 1; i < pts.length; i++) {
//     d += `L${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
//   }
//   return `${d}Z`;
// }

// function distToSeg(px, py, x1, y1, x2, y2) {
//   const dx = x2 - x1;
//   const dy = y2 - y1;
//   const l2 = dx * dx + dy * dy;
//   if (l2 === 0) return Math.hypot(px - x1, py - y1);
//   let t = ((px - x1) * dx + (py - y1) * dy) / l2;
//   t = Math.max(0, Math.min(1, t));
//   return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
// }

// function computeFeatureMetrics(pts) {
//   if (!pts || pts.length < 3) {
//     return { cx: 0, cy: 0, ir: 4, angle: 0 };
//   }
//   let minX = Infinity,
//     maxX = -Infinity,
//     minY = Infinity,
//     maxY = -Infinity;

//   // Shoelace Area Centroid so rounded corner plots with 25+ curve vertices stay dead-center
//   let area2 = 0;
//   let sx = 0;
//   let sy = 0;

//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     if (x1 < minX) minX = x1;
//     if (x1 > maxX) maxX = x1;
//     if (y1 < minY) minY = y1;
//     if (y1 > maxY) maxY = y1;

//     const cross = x1 * y2 - x2 * y1;
//     area2 += cross;
//     sx += (x1 + x2) * cross;
//     sy += (y1 + y2) * cross;
//   }

//   const bw = maxX - minX;
//   const bh = maxY - minY;
//   const cx = Math.abs(area2) > 1e-4 ? sx / (3 * area2) : (minX + maxX) / 2;
//   const cy = Math.abs(area2) > 1e-4 ? sy / (3 * area2) : (minY + maxY) / 2;

//   let ir = Infinity;
//   let longestLen = 0;
//   let longestAngle = 0;

//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     const d = distToSeg(cx, cy, x1, y1, x2, y2);
//     if (d < ir) ir = d;

//     const segLen = Math.hypot(x2 - x1, y2 - y1);
//     if (segLen > longestLen) {
//       longestLen = segLen;
//       let deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
//       if (deg > 90) deg -= 180;
//       if (deg < -90) deg += 180;
//       longestAngle = deg;
//     }
//   }

//   const boxIr = Math.min(bw, bh) * 0.42;
//   const safeIr =
//     Number.isFinite(ir) && ir > 1.5
//       ? Math.max(ir, boxIr * 0.85)
//       : Math.max(2.2, boxIr);

//   return { cx, cy, ir: safeIr, angle: longestAngle };
// }

// /* ── CAD Dimension Overlay for Selected Plot (from DimensionOverlay.jsx) ── */
// const SelectedDimensionOverlay = memo(function SelectedDimensionOverlay({
//   feature,
// }) {
//   const geom = useMemo(() => {
//     if (!feature || !feature.pts || feature.pts.length < 3) return null;
//     const { pts, cx, cy, ir, raw } = feature;
//     const scale = 1.25;
//     const off = (0.55 + ir * 0.03) * scale;
//     const txt = Math.max(0.65, Math.min(ir * 0.18, 1.35)) * scale;
//     const tick = txt * 0.65;
//     const hair = 0.06 * scale;

//     const numSize = Math.max(1.4, Math.min(ir * 0.34, 3.6));
//     const sqmSize = numSize * 0.38;
//     const sqftSize = numSize * 0.46;

//     const edges = [];
//     for (let i = 0; i < pts.length; i++) {
//       const p1 = pts[i];
//       const p2 = pts[(i + 1) % pts.length];
//       const dx = p2[0] - p1[0];
//       const dy = p2[1] - p1[1];
//       const len = Math.hypot(dx, dy);
//       if (len < 0.8) continue;

//       const ux = dx / len;
//       const uy = dy / len;
//       const mx = (p1[0] + p2[0]) / 2;
//       const my = (p1[1] + p2[1]) / 2;

//       let nx = -uy;
//       let ny = ux;
//       if (nx * (mx - cx) + ny * (my - cy) < 0) {
//         nx = -nx;
//         ny = -ny;
//       }

//       const a = [p1[0] + nx * off, p1[1] + ny * off];
//       const b = [p2[0] + nx * off, p2[1] + ny * off];
//       const lx = mx + nx * (off + txt * 0.85);
//       const ly = my + ny * (off + txt * 0.85);

//       let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
//       if (deg > 90) deg -= 180;
//       if (deg < -90) deg += 180;

//       edges.push({
//         key: `edge-${i}`,
//         p1,
//         p2,
//         a,
//         b,
//         kx: nx * tick * 0.5,
//         ky: ny * tick * 0.5,
//         lx,
//         ly,
//         deg,
//         label: `${len.toFixed(2)} m`,
//       });
//     }

//     const areaNum = Number(raw.area) || 0;
//     const areaSqFt = Number(raw.areaSqFt) || areaNum * SQFT;

//     return {
//       cx,
//       cy,
//       txt,
//       hair,
//       numSize,
//       sqmSize,
//       sqftSize,
//       edges,
//       title: raw.type === "plot" ? raw.plotNo : raw.title,
//       sqmLabel: `${areaNum.toFixed(1)} m²`,
//       sqftLabel: `${Math.round(areaSqFt).toLocaleString("en-IN")} ft²`,
//     };
//   }, [feature]);

//   if (!geom) return null;
//   const {
//     cx,
//     cy,
//     txt,
//     hair,
//     numSize,
//     sqmSize,
//     sqftSize,
//     edges,
//     title,
//     sqmLabel,
//     sqftLabel,
//   } = geom;

//   return (
//     <g style={{ pointerEvents: "none" }}>
//       {edges.map((r) => (
//         <g key={r.key}>
//           <line
//             x1={r.p1[0]}
//             y1={r.p1[1]}
//             x2={r.a[0]}
//             y2={r.a[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair}
//             strokeDasharray={`${hair * 4} ${hair * 3}`}
//             opacity="0.78"
//           />
//           <line
//             x1={r.p2[0]}
//             y1={r.p2[1]}
//             x2={r.b[0]}
//             y2={r.b[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair}
//             strokeDasharray={`${hair * 4} ${hair * 3}`}
//             opacity="0.78"
//           />
//           <line
//             x1={r.a[0]}
//             y1={r.a[1]}
//             x2={r.b[0]}
//             y2={r.b[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.15}
//             strokeDasharray={`${hair * 5} ${hair * 3}`}
//             opacity="0.95"
//           />
//           <line
//             x1={r.a[0] - r.kx}
//             y1={r.a[1] - r.ky}
//             x2={r.a[0] + r.kx}
//             y2={r.a[1] + r.ky}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.5}
//           />
//           <line
//             x1={r.b[0] - r.kx}
//             y1={r.b[1] - r.ky}
//             x2={r.b[0] + r.kx}
//             y2={r.b[1] + r.ky}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.5}
//           />
//           <text
//             x={r.lx}
//             y={r.ly}
//             transform={`rotate(${r.deg} ${r.lx} ${r.ly})`}
//             textAnchor="middle"
//             dy="0.35em"
//             fontFamily={MONO}
//             fontSize={txt}
//             fontWeight="700"
//             fill="#FFFFFF"
//             stroke="#15181D"
//             strokeWidth={txt * 0.22}
//             paintOrder="stroke"
//           >
//             {r.label}
//           </text>
//         </g>
//       ))}

//       <text
//         x={cx}
//         y={cy - numSize * 0.52}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MAPFONT}
//         fontSize={numSize}
//         fontWeight="800"
//         fill="#FFFFFF"
//         stroke="rgba(21,24,29,0.65)"
//         strokeWidth={numSize * 0.12}
//         paintOrder="stroke"
//       >
//         {title}
//       </text>
//       <text
//         x={cx}
//         y={cy + numSize * 0.35}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MONO}
//         fontSize={sqmSize}
//         fontWeight="600"
//         fill="#F3E8FF"
//       >
//         {sqmLabel}
//       </text>
//       <text
//         x={cx}
//         y={cy + numSize * 0.92}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MONO}
//         fontSize={sqftSize}
//         fontWeight="700"
//         fill="#FFFFFF"
//       >
//         {sqftLabel}
//       </text>
//     </g>
//   );
// });

// /* ── Unified Masterplan SVG Content (from PlanContent.jsx) ─────────── */
// const MasterplanSvgContent = memo(function MasterplanSvgContent({
//   layout,
//   showNumbers,
//   showStatus,
//   highlightKey,
//   editingKey,
//   opacityFor,
//   onPlotClick,
// }) {
//   const selectedFeature = useMemo(
//     () =>
//       highlightKey
//         ? layout.features.find((f) => f.key === highlightKey)
//         : null,
//     [layout, highlightKey],
//   );

//   return (
//     <g>
//       {/* Layout Boundary Base — Solid 100% Opaque Cement Color Matching Roads */}
//       {layout.boundaryD && (
//         <path
//           d={layout.boundaryD}
//           fill={ROAD_AND_BG_COLOR}
//           fillOpacity="1"
//           stroke={ACCENT}
//           strokeWidth="0.45"
//           strokeDasharray="1.8 1.2"
//           style={{ pointerEvents: "none" }}
//         />
//       )}

//       {/* All Polygons (Roads first, then Open Spaces, then Plots) */}
//       <g>
//         {layout.sorted.map((f) => {
//           if (editingKey && f.key === editingKey) return null;
//           const isSel = highlightKey === f.key;
//           const isRoad = f.raw.type === "road";
//           const st = styleForFeature(f.raw, showStatus);
//           // Roads stay 100% opaque so they blend seamlessly with the background
//           const baseAlpha = isRoad
//             ? 1
//             : highlightKey && !isSel
//               ? 0.52
//               : 0.96;
//           const alpha = opacityFor(f.raw, baseAlpha);

//           return (
//             <path
//               key={f.key}
//               className="plan-plot-shape"
//               d={f.d}
//               fill={isSel ? SELECTED_FILL : st.fill}
//               fillRule="evenodd"
//               fillOpacity={isSel ? 0.96 : alpha}
//               stroke={isSel ? SELECTED_STROKE : st.stroke}
//               strokeWidth={isSel ? 0.55 : st.sw}
//               strokeOpacity={isRoad ? 0 : alpha < 0.4 ? 0.35 : 0.95}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onPlotClick(f.raw);
//               }}
//             />
//           );
//         })}
//       </g>

//       {/* Plot Numbers Layer — Uniform Size Across All Plots */}
//       {showNumbers && (
//         <g style={{ pointerEvents: "none" }}>
//           {layout.plotFeatures.map((f) => {
//             if (f.key === highlightKey || f.key === editingKey) return null;
//             if (!f.label) return null;
//             const st = styleForFeature(f.raw, showStatus);
//             const alpha = opacityFor(f.raw, highlightKey ? 0.55 : 1);

//             return (
//               <text
//                 key={`num-${f.key}`}
//                 x={f.cx}
//                 y={f.cy}
//                 textAnchor="middle"
//                 dy="0.35em"
//                 fontFamily={MAPFONT}
//                 fontSize={f.fontSize}
//                 fontWeight="700"
//                 fill={st.ink}
//                 fillOpacity={alpha < 0.4 ? 0.28 : alpha}
//               >
//                 {f.label}
//               </text>
//             );
//           })}
//         </g>
//       )}

//       {/* Road & Open Space Rotated Feature Labels */}
//       <g style={{ pointerEvents: "none" }}>
//         {layout.zoneFeatures.map((f) => {
//           if (!f.label) return null;
//           const isRoad = f.raw.type === "road";
//           const size = Math.min(
//             Math.max(f.ir * (isRoad ? 0.42 : 0.32), 1.15),
//             isRoad ? 2.4 : 3.2,
//           );
//           if (size < 1.05) return null;
//           const alpha = opacityFor(f.raw, highlightKey ? 0.5 : 1);

//           return (
//             <g
//               key={`lbl-${f.key}`}
//               paintOrder="stroke"
//               stroke="rgba(15, 18, 24, 0.75)"
//               strokeWidth={size * 0.14}
//               transform={`rotate(${f.angle.toFixed(1)} ${f.cx.toFixed(2)} ${f.cy.toFixed(2)})`}
//               opacity={alpha < 0.4 ? 0.25 : alpha}
//             >
//               <text
//                 x={f.cx}
//                 y={isRoad ? f.cy : f.cy - size * 0.35}
//                 textAnchor="middle"
//                 dy="0.35em"
//                 fontFamily={SANS}
//                 fontSize={size}
//                 letterSpacing={isRoad ? "0.04em" : "0.06em"}
//                 fill="#F8FAFC"
//                 fontWeight="700"
//               >
//                 {f.label}
//               </text>
//               {!isRoad && f.raw.area > 120 && (
//                 <text
//                   x={f.cx}
//                   y={f.cy + size * 0.75}
//                   textAnchor="middle"
//                   dy="0.35em"
//                   fontFamily={MONO}
//                   fontSize={size * 0.64}
//                   fill="#E7E1D5"
//                   fontWeight="600"
//                 >
//                   {Math.round(f.raw.area).toLocaleString("en-IN")} m²
//                 </text>
//               )}
//             </g>
//           );
//         })}
//       </g>

//       {/* Raised Selected Plot + Engineering Dimensions */}
//       {selectedFeature && editingKey !== selectedFeature.key && (
//         <g style={{ pointerEvents: "none" }}>
//           <path
//             d={selectedFeature.d}
//             fill={SELECTED_FILL}
//             fillOpacity="0.94"
//             stroke={SELECTED_STROKE}
//             strokeWidth="0.65"
//           />
//           <SelectedDimensionOverlay feature={selectedFeature} />
//         </g>
//       )}
//     </g>
//   );
// });

// /* ── Main MapViewer Screen ─────────────────────────────────────────── */
// const PUBLIC_USER = { uid: "public", name: "Visitor", role: "guest" };

// export default function MapViewer({ publicView = false }) {
//   const { mapId } = useParams();
//   const { user } = useAuth();
//   const isPublic = publicView;
//   const viewer = isPublic ? PUBLIC_USER : user;
//   const hideStatus = isPublic;
//   const nav = useNavigate();
//   const toast = useToast();
//   const mapRef = useRef(null);
//   const flyRafRef = useRef(0);
//   const initialFitDoneRef = useRef(false);
//   const overlayPortalRef = useRef(null);
//   const compassNeedleRef = useRef(null);
//   const [, setOverlayReady] = useState(0);

//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
//     libraries: LIBRARIES,
//   });

//   const [mapDoc, setMapDoc] = useState(null);
//   const [plots, setPlots] = useState([]);
//   const [boundary, setBoundary] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [typeFilter, setTypeFilter] = useState("all");
//   const [category, setCategory] = useState(null);
//   const [query, setQuery] = useState("");
//   const [highlight, setHighlight] = useState(null);
//   const [selected, setSelected] = useState(null);
//   const [showAdv, setShowAdv] = useState(false);
//   const [adv, setAdv] = useState({
//     min: "",
//     max: "",
//     facing: "All",
//     status: "All",
//     unit: "m²",
//   });
//   const [advMatch, setAdvMatch] = useState(new Set());
//   const [showArea, setShowArea] = useState(false);
//   const [showShare, setShowShare] = useState(false);

//   const [showNumbers, setShowNumbers] = useState(true);
//   const [showStatus, setShowStatus] = useState(!hideStatus);

//   const [editMode, setEditMode] = useState(false);
//   const [optionsFor, setOptionsFor] = useState(null);
//   const [deleteFor, setDeleteFor] = useState(null);
//   const [editing, setEditing] = useState(null);
//   const [points, setPoints] = useState([]);

//   useEffect(() => {
//     initialFitDoneRef.current = false;
//     getMap(mapId)
//       .then((m) => {
//         if (!m) return;
//         setMapDoc(m);
//         setPlots((m.plots ?? []).map((p) => plotFromDoc(p)));
//         setBoundary(
//           (m.layoutBoundary ?? []).map((p) => ({ lat: +p.lat, lng: +p.lng })),
//         );
//       })
//       .catch((e) => console.error("Error loading map data:", e))
//       .finally(() => setLoading(false));
//   }, [mapId]);

//   useEffect(() => () => cancelAnimationFrame(flyRafRef.current), []);

//   /* ── Share ── */
//   const shareUrl = `${window.location.origin}/share/${mapId}`;
//   const shareText = `${mapDoc?.name || "Layout"} — view the layout and plots`;
//   const copyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(shareUrl);
//     } catch {
//       const t = document.createElement("textarea");
//       t.value = shareUrl;
//       document.body.appendChild(t);
//       t.select();
//       document.execCommand("copy");
//       t.remove();
//     }
//     toast("Link copied", "success");
//   };
//   const nativeShare = () =>
//     navigator
//       .share({ title: shareText, text: shareText, url: shareUrl })
//       .catch(() => {});
//   const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

//   const statuses = useMemo(
//     () =>
//       hideStatus
//         ? ["All"]
//         : [
//             "All",
//             ...new Set(
//               plots
//                 .filter((p) => p.type === "plot" && p.status)
//                 .map((p) => p.status),
//             ),
//           ],
//     [plots, hideStatus],
//   );
//   const count = useCallback(
//     (t) => plots.filter((p) => p.type === t).length,
//     [plots],
//   );
//   const countStatus = useCallback(
//     (s) =>
//       plots.filter(
//         (p) => p.type === "plot" && (p.status || "").toLowerCase() === s,
//       ).length,
//     [plots],
//   );

//   /* Build local meter coordinate layout for the unified SVG overlay */
//   const layout = useMemo(() => {
//     const allPts = plots.length
//       ? plots.flatMap((p) => p.corners || [])
//       : boundary;
//     if (!allPts.length) return null;

//     const b = getBounds(allPts);
//     if (!b) return null;

//     const originLat = (b.north + b.south) / 2;
//     const originLng = (b.east + b.west) / 2;
//     const proj = createLocalProjection(originLat, originLng);

//     let minX = Infinity,
//       maxX = -Infinity,
//       minY = Infinity,
//       maxY = -Infinity;
//     const track = ([x, y]) => {
//       if (x < minX) minX = x;
//       if (x > maxX) maxX = x;
//       if (y < minY) minY = y;
//       if (y > maxY) maxY = y;
//     };

//     const boundaryPts = boundary.map((c) => {
//       const pt = proj.toMeters(c.lat, c.lng);
//       track(pt);
//       return pt;
//     });

//     const features = plots.map((p, idx) => {
//       const pts = (p.corners || []).map((c) => {
//         const pt = proj.toMeters(c.lat, c.lng);
//         track(pt);
//         return pt;
//       });
//       const { cx, cy, ir, angle } = computeFeatureMetrics(pts);
//       const label =
//         p.type === "plot" ? String(p.plotNo || "") : String(p.title || "");

//       return {
//         key: p.srNo || p.plotNo || `f-${idx}`,
//         raw: p,
//         pts,
//         d: ptsToPath(pts),
//         cx,
//         cy,
//         ir,
//         angle,
//         label,
//         // Every plot uses the same consistent font size
//         fontSize: UNIFORM_PLOT_FONT_SIZE,
//       };
//     });

//     const orderScore = (t) => (t === "road" ? 0 : t === "plot" ? 2 : 1);
//     const sorted = [...features].sort(
//       (a, b) => orderScore(a.raw.type) - orderScore(b.raw.type),
//     );

//     const pad = 16;
//     const x0 = minX - pad;
//     const y0 = minY - pad;
//     const x1 = maxX + pad;
//     const y1 = maxY + pad;

//     return {
//       proj,
//       x0,
//       y0,
//       x1,
//       y1,
//       w: Math.max(1, x1 - x0),
//       h: Math.max(1, y1 - y0),
//       northWestLL: proj.toLatLng(x0, y0),
//       southEastLL: proj.toLatLng(x1, y1),
//       boundaryD: boundaryPts.length > 2 ? ptsToPath(boundaryPts) : "",
//       features,
//       sorted,
//       plotFeatures: features.filter((f) => f.raw.type === "plot"),
//       zoneFeatures: features.filter((f) => f.raw.type !== "plot"),
//     };
//   }, [plots, boundary]);

//   /* ── Smooth Camera Animation Helper (from PlanMap.jsx) ── */
//   const animateCameraTo = useCallback(
//     (aimCenter, aimZoom, durationMs = FLY_MS) => {
//       const m = mapRef.current;
//       if (!m || !aimCenter) return;

//       cancelAnimationFrame(flyRafRef.current);
//       const c0 = m.getCenter();
//       if (!c0) {
//         m.setCenter(aimCenter);
//         if (aimZoom != null) m.setZoom(aimZoom);
//         return;
//       }

//       const startLat = c0.lat();
//       const startLng = c0.lng();
//       const startZoom = m.getZoom() || 18;
//       const targetZoom = aimZoom != null ? aimZoom : startZoom;

//       m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });

//       const t0 = performance.now();
//       const step = (now) => {
//         const k = Math.min(1, (now - t0) / durationMs);
//         const e = easeOut(k);
//         const center = {
//           lat: startLat + (aimCenter.lat - startLat) * e,
//           lng: startLng + (aimCenter.lng - startLng) * e,
//         };
//         const zoom = startZoom + (targetZoom - startZoom) * e;

//         if (typeof m.moveCamera === "function") {
//           m.moveCamera({ center, zoom });
//         } else {
//           m.setCenter(center);
//           m.setZoom(zoom);
//         }

//         if (k < 1) {
//           flyRafRef.current = requestAnimationFrame(step);
//         } else {
//           overlayPortalRef.current?.overlay?.draw?.();
//         }
//       };
//       flyRafRef.current = requestAnimationFrame(step);
//     },
//     [],
//   );

//   /* ── Tight Layout Fit on Load (from PlanMap.jsx fitPlan) ── */
//   const fitAll = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     cancelAnimationFrame(flyRafRef.current);

//     const plotPts = plots
//       .filter((p) => p.type === "plot")
//       .flatMap((p) => p.corners || []);
//     const pts = plotPts.length
//       ? plotPts
//       : plots.length
//         ? plots.flatMap((p) => p.corners || [])
//         : boundary;

//     const b = getBounds(pts);
//     if (!b) return;

//     m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });

//     const vw = window.innerWidth;
//     const pad =
//       vw < 600
//         ? { top: 82, right: 6, bottom: 48, left: 6 }
//         : vw < 1024
//           ? { top: 88, right: 10, bottom: 42, left: 10 }
//           : { top: 92, right: 12, bottom: 32, left: 12 };

//     m.fitBounds(
//       { south: b.south, north: b.north, west: b.west, east: b.east },
//       pad,
//     );

//     window.google?.maps?.event?.addListenerOnce(m, "idle", () => {
//       const currentZoom = m.getZoom();
//       if (currentZoom < 18.2) {
//         m.setZoom(18.2);
//       }
//     });
//   }, [plots, boundary]);

//   /* ── Calculate Ideal Zoom & Screen-Offset Frame for a Clicked Plot ── */
//   const flyToPlot = useCallback(
//     (plot, durationMs = FLY_MS, forceZoom = null) => {
//       const m = mapRef.current;
//       if (!m || !plot) return;

//       const corners = plot.corners || [];
//       const b = getBounds(corners);
//       const center =
//         plot.center ||
//         (b && {
//           lat: (b.north + b.south) / 2,
//           lng: (b.east + b.west) / 2,
//         });
//       if (!center) return;

//       let targetZoom = forceZoom;
//       if (targetZoom == null) {
//         const R = 6378137;
//         const cosLat = Math.cos((center.lat * Math.PI) / 180);
//         const spanLatM = b
//           ? ((b.north - b.south) * Math.PI * R) / 180
//           : Math.sqrt(plot.area || 150);
//         const spanLngM = b
//           ? ((b.east - b.west) * Math.PI * R * cosLat) / 180
//           : Math.sqrt(plot.area || 150);

//         const vw = window.innerWidth;
//         const vh = window.innerHeight;
//         const boost = vw < 640 ? 1.85 : vw < 1024 ? 1.6 : 1.45;
//         const gutterM = 6;

//         const needW = (spanLngM + gutterM * 2) * 1.05;
//         const needH = (spanLatM + gutterM * 2) * 1.05;

//         const availW = Math.max(vw - (vw > 640 ? 410 : 40), 180);
//         const availH = Math.max(vh - (vw <= 640 ? 300 : 150), 180);

//         const world = 156543.03392 * cosLat;
//         const mpp = Math.max(needW / availW, needH / availH) / boost;
//         targetZoom = clamp(Math.log2(world / mpp), FLY_MIN_Z, FLY_MAX_Z);
//       }

//       let aim = center;
//       const proj = m.getProjection?.();
//       if (proj && window.google?.maps) {
//         const vw = window.innerWidth;
//         const scale = 2 ** targetZoom;
//         const shiftPxX = vw > 640 ? 150 : 0;
//         const shiftPxY = vw <= 640 ? 95 : -15;
//         const pt = proj.fromLatLngToPoint(
//           new window.google.maps.LatLng(center.lat, center.lng),
//         );
//         if (pt) {
//           const shifted = proj.fromPointToLatLng(
//             new window.google.maps.Point(
//               pt.x + shiftPxX / scale,
//               pt.y + shiftPxY / scale,
//             ),
//           );
//           if (shifted) {
//             aim = { lat: shifted.lat(), lng: shifted.lng() };
//           }
//         }
//       }

//       animateCameraTo(aim, targetZoom, durationMs);
//     },
//     [animateCameraTo],
//   );

//   const nudgeZoom = useCallback(
//     (delta) => {
//       const m = mapRef.current;
//       if (!m) return;
//       const z0 = m.getZoom() || 19;
//       const z1 = clamp(z0 + delta, 15, MAP_MAX_Z);
//       if (selected) {
//         flyToPlot(selected, ZOOM_STEP_MS, z1);
//       } else {
//         animateCameraTo(
//           { lat: m.getCenter().lat(), lng: m.getCenter().lng() },
//           z1,
//           ZOOM_STEP_MS,
//         );
//       }
//     },
//     [selected, flyToPlot, animateCameraTo],
//   );

//   /* Mount custom Google Maps OverlayView hosting the unified SVG sheet */
//   const attachOverlay = useCallback(
//     (mapInstance) => {
//       if (!window.google?.maps || !layout) return;
//       if (overlayPortalRef.current?.overlay) {
//         overlayPortalRef.current.overlay.setMap(null);
//       }

//       const hostDiv = document.createElement("div");
//       hostDiv.style.position = "absolute";
//       hostDiv.style.pointerEvents = "auto";
//       hostDiv.style.willChange = "transform, width, height, left, top";

//       class MasterplanOverlay extends window.google.maps.OverlayView {
//         onAdd() {
//           const panes = this.getPanes();
//           panes.overlayMouseTarget.appendChild(hostDiv);
//         }
//         draw() {
//           const proj = this.getProjection();
//           if (!proj) return;
//           const nw = proj.fromLatLngToDivPixel(
//             new window.google.maps.LatLng(
//               layout.northWestLL.lat,
//               layout.northWestLL.lng,
//             ),
//           );
//           const se = proj.fromLatLngToDivPixel(
//             new window.google.maps.LatLng(
//               layout.southEastLL.lat,
//               layout.southEastLL.lng,
//             ),
//           );
//           if (!nw || !se) return;
//           const left = Math.min(nw.x, se.x);
//           const top = Math.min(nw.y, se.y);
//           const width = Math.max(1, Math.abs(se.x - nw.x));
//           const height = Math.max(1, Math.abs(se.y - nw.y));

//           hostDiv.style.left = `${left}px`;
//           hostDiv.style.top = `${top}px`;
//           hostDiv.style.width = `${width}px`;
//           hostDiv.style.height = `${height}px`;
//         }
//         onRemove() {
//           if (hostDiv.parentNode) hostDiv.parentNode.removeChild(hostDiv);
//         }
//       }

//       const ov = new MasterplanOverlay();
//       ov.setMap(mapInstance);
//       overlayPortalRef.current = { overlay: ov, div: hostDiv };
//       setOverlayReady((n) => n + 1);
//     },
//     [layout],
//   );

//   const onLoad = useCallback(
//     (m) => {
//       mapRef.current = m;
//       m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });
//       fitAll();
//       attachOverlay(m);

//       if (window.google?.maps?.event) {
//         window.google.maps.event.addListenerOnce(m, "idle", () => {
//           if (!initialFitDoneRef.current) {
//             initialFitDoneRef.current = true;
//             fitAll();
//           }
//         });
//       }
//     },
//     [fitAll, attachOverlay],
//   );

//   useEffect(() => {
//     if (isLoaded && mapRef.current && layout) {
//       attachOverlay(mapRef.current);
//       if (!initialFitDoneRef.current) {
//         initialFitDoneRef.current = true;
//         fitAll();
//       }
//     }
//     return () => {
//       if (overlayPortalRef.current?.overlay) {
//         overlayPortalRef.current.overlay.setMap(null);
//       }
//     };
//   }, [isLoaded, layout, attachOverlay, fitAll]);

//   const onIdle = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     if (compassNeedleRef.current) {
//       const h = m.getHeading?.() || 0;
//       compassNeedleRef.current.style.transform = `rotate(${-h}deg)`;
//     }
//   }, []);

//   const resetNorth = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     if (typeof m.moveCamera === "function") {
//       m.moveCamera({ heading: 0, tilt: 0 });
//     }
//     setSelected(null);
//     setHighlight(null);
//     fitAll();
//   }, [fitAll]);

//   const opacityFor = useCallback(
//     (p, base) => {
//       let o = base;
//       if (advMatch.size && p.type === "plot" && !advMatch.has(p.srNo)) o = 0.14;
//       if (typeFilter === "plot" && p.type !== "plot") o = 0.16;
//       if (typeFilter === "road" && p.type !== "road") o = 0.16;
//       if (typeFilter === "open_space" && p.type !== "open_space") o = 0.16;
//       if (typeFilter === "amenity" && !isAmenity(p)) o = 0.16;
//       if (
//         typeFilter === "category" &&
//         (p.type !== "plot" || p.status !== category)
//       )
//         o = 0.16;
//       return o;
//     },
//     [advMatch, typeFilter, category],
//   );

//   /* ── Click Plot -> Highlight, Open Sheet & Smoothly Fly/Zoom Into Plot ── */
//   const onPlotClick = useCallback(
//     (p) => {
//       if (editing) return;
//       if (editMode) return setOptionsFor(p);
//       setHighlight(p);
//       setSelected(p);
//       flyToPlot(p, FLY_MS);
//     },
//     [editing, editMode, flyToPlot],
//   );

//   // ── search ──
//   const doSearch = () => {
//     const q = query.trim().toLowerCase();
//     if (!q) return setHighlight(null);
//     const hit = plots.find(
//       (p) =>
//         (p.plotNo || "").toLowerCase() === q ||
//         (p.srNo || "").toLowerCase() === q ||
//         (p.title || "").toLowerCase().includes(q),
//     );
//     if (!hit) return toast("No match found", "error");
//     setHighlight(hit);
//     setSelected(hit);
//     flyToPlot(hit, FLY_MS);
//   };

//   // ── advanced filter ──
//   const applyAdv = () => {
//     let minA = parseFloat(adv.min);
//     let maxA = parseFloat(adv.max);
//     if (!isNaN(minA) && !isNaN(maxA) && minA > maxA) {
//       [minA, maxA] = [maxA, minA];
//     }
//     const isFt = adv.unit === "ft²";
//     const hasArea = !isNaN(minA) || !isNaN(maxA);
//     if (!hasArea && adv.facing === "All" && adv.status === "All") {
//       setAdvMatch(new Set());
//       setShowAdv(false);
//       return;
//     }
//     const matched = plots.filter((p) => {
//       if (p.type !== "plot") return false;
//       const val = isFt ? p.areaSqFt || p.area * SQFT : p.area;
//       if (!isNaN(minA) && val < minA) return false;
//       if (!isNaN(maxA) && val > maxA) return false;
//       if (
//         adv.facing !== "All" &&
//         !(p.facing || "").toLowerCase().includes(adv.facing.toLowerCase())
//       )
//         return false;
//       if (adv.status !== "All" && p.status !== adv.status) return false;
//       return true;
//     });
//     setAdvMatch(new Set(matched.map((p) => p.srNo)));
//     setShowAdv(false);
//     const b = getBounds(matched.flatMap((p) => p.corners));
//     if (b)
//       mapRef.current?.fitBounds(
//         { south: b.south, north: b.north, west: b.west, east: b.east },
//         { top: 96, right: 24, bottom: 64, left: 24 },
//       );
//   };

//   const clearAdv = () => {
//     setAdv({ min: "", max: "", facing: "All", status: "All", unit: "m²" });
//     setAdvMatch(new Set());
//   };

//   // ── edit mode (admin) ──
//   const persist = async (nextPlots) => {
//     await updateMapPlots(mapId, nextPlots, boundary);
//     setPlots(nextPlots);
//   };
//   const savePlotEdits = async () => {
//     if (!editing || points.length < 3)
//       return toast("Need at least 3 points", "error");
//     try {
//       const updated = {
//         ...editing,
//         corners: points,
//         area: calculatePolygonArea(points),
//         center: getPolygonCenter(points),
//       };
//       await persist(plots.map((p) => (p.srNo === editing.srNo ? updated : p)));
//       setEditing(null);
//       setPoints([]);
//       toast("Plot updated", "success");
//     } catch (e) {
//       toast(`Error: ${e.message}`, "error");
//     }
//   };
//   const deletePlot = async () => {
//     const p = deleteFor;
//     setDeleteFor(null);
//     try {
//       await persist(plots.filter((x) => x.srNo !== p.srNo));
//       toast(`${p.plotNo} deleted`, "success");
//     } catch (e) {
//       toast(`Error: ${e.message}`, "error");
//     }
//   };

//   const highlightKey = highlight ? highlight.srNo || highlight.plotNo : null;
//   const editingKey = editing ? editing.srNo || editing.plotNo : null;

//   if (loading) return <Spinner />;
//   if (loadError)
//     return (
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           display: "grid",
//           placeItems: "center",
//           background: "#0B0E13",
//           color: "#E68A72",
//           fontFamily: MONO,
//           padding: 24,
//           textAlign: "center",
//         }}
//       >
//         <div>
//           <h3 style={{ color: INK, marginBottom: 8 }}>
//             Google Maps failed to load
//           </h3>
//           <p style={{ color: MUTED, fontSize: 13 }}>
//             Check VITE_GOOGLE_MAPS_API_KEY and disable any ad-blocker.
//           </p>
//         </div>
//       </div>
//     );

//   const center = plots[0]?.center ??
//     boundary[0] ?? { lat: 21.1458, lng: 79.0882 };

//   return (
//     <div className="ref-map-page">
//       <style>{`
//         .ref-map-page {
//           position: relative;
//           width: 100vw;
//           height: 100vh;
//           overflow: hidden;
//           background: #0B0E13;
//           font-family: ${SANS};
//           color: ${INK};
//           user-select: none;
//         }
//         path.plan-plot-shape {
//           cursor: pointer;
//           transition: fill-opacity 120ms ease, stroke-width 120ms ease;
//         }
//         path.plan-plot-shape:hover {
//           fill-opacity: 0.78;
//         }
//         .ref-hud-top {
//           position: absolute;
//           top: 14px;
//           left: 14px;
//           right: 14px;
//           z-index: 10;
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//           pointer-events: none;
//         }
//         .ref-topbar {
//           pointer-events: auto;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 10px 14px;
//           background: ${CANVAS};
//           backdrop-filter: blur(16px);
//           -webkit-backdrop-filter: blur(16px);
//           border: 1px solid ${HAIR};
//           border-radius: 14px;
//           box-shadow: 0 18px 42px rgba(0, 0, 0, 0.52);
//           flex-wrap: wrap;
//         }
//         .ref-icon-btn {
//           width: 38px;
//           height: 38px;
//           border-radius: 10px;
//           background: rgba(255, 255, 255, 0.03);
//           border: 1px solid ${HAIR};
//           color: ${INK};
//           display: grid;
//           place-items: center;
//           cursor: pointer;
//           transition: border-color 150ms ease, color 150ms ease, transform 120ms ease;
//           flex-shrink: 0;
//         }
//         .ref-icon-btn:hover {
//           border-color: ${ACCENT};
//           color: ${ACCENT};
//         }
//         .ref-icon-btn.active {
//           background: ${ACCENT};
//           border-color: ${ACCENT};
//           color: #15181D;
//         }
//         .ref-search {
//           flex: 1;
//           min-width: 200px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid ${HAIR};
//           border-radius: 10px;
//           padding: 4px 6px 4px 12px;
//         }
//         .ref-search:focus-within {
//           border-color: ${ACCENT};
//         }
//         .ref-search input {
//           flex: 1;
//           background: transparent;
//           border: none;
//           outline: none;
//           color: ${INK};
//           font: 400 13px/1 ${MONO};
//           padding: 6px 0;
//         }
//         .ref-search input::placeholder {
//           color: ${MUTED};
//         }
//         .ref-find-btn {
//           font: 600 12px/1 ${MONO};
//           background: ${ACCENT};
//           color: #15181D;
//           border: none;
//           border-radius: 7px;
//           padding: 7px 12px;
//           cursor: pointer;
//         }
//         .ref-chips-row {
//           pointer-events: auto;
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           overflow-x: auto;
//           scrollbar-width: none;
//           padding-bottom: 2px;
//         }
//         .ref-chips-row::-webkit-scrollbar { display: none; }
//         .ref-pill {
//           font: 500 12px/1 ${MONO};
//           color: ${INK};
//           background: ${PANEL};
//           border: 1px solid ${HAIR};
//           border-radius: 999px;
//           padding: 9px 13px;
//           cursor: pointer;
//           white-space: nowrap;
//           box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
//           transition: all 150ms ease;
//         }
//         .ref-pill:hover {
//           border-color: ${ACCENT};
//         }
//         .ref-pill.on {
//           color: #15181D;
//           background: ${ACCENT};
//           border-color: ${ACCENT};
//           font-weight: 700;
//         }
//       `}</style>

//       {/* ── Google Map Base Canvas ── */}
//       <GoogleMap
//         mapContainerStyle={{ position: "absolute", inset: 0 }}
//         center={center}
//         zoom={18.5}
//         onLoad={onLoad}
//         onIdle={onIdle}
//         options={{
//           mapTypeId: "hybrid",
//           isFractionalZoomEnabled: true,
//           streetViewControl: false,
//           fullscreenControl: false,
//           mapTypeControl: false,
//           rotateControl: false,
//           zoomControl: false,
//           gestureHandling: "greedy",
//           maxZoom: MAP_MAX_Z,
//           backgroundColor: "#0B0E13",
//         }}
//         onClick={(e) => {
//           if (editing) {
//             setPoints((p) => [
//               ...p,
//               { lat: e.latLng.lat(), lng: e.latLng.lng() },
//             ]);
//           } else if (selected || highlight) {
//             setHighlight(null);
//             setSelected(null);
//             fitAll();
//           }
//         }}
//       >
//         {/* Admin Polygon Vertex Editor (Active only while editing a boundary) */}
//         {editing && (
//           <>
//             <PolygonF
//               paths={points}
//               options={{
//                 fillColor: ACCENT,
//                 fillOpacity: 0.35,
//                 strokeColor: ACCENT,
//                 strokeWeight: 3,
//                 clickable: false,
//                 zIndex: 30,
//               }}
//             />
//             {points.map((pt, i) => (
//               <MarkerF
//                 key={i}
//                 position={pt}
//                 draggable
//                 zIndex={40}
//                 onDragEnd={(e) =>
//                   setPoints((ps) =>
//                     ps.map((p, j) =>
//                       j === i
//                         ? { lat: e.latLng.lat(), lng: e.latLng.lng() }
//                         : p,
//                     ),
//                   )
//                 }
//                 onRightClick={() =>
//                   setPoints((ps) => ps.filter((_, j) => j !== i))
//                 }
//               />
//             ))}
//           </>
//         )}
//       </GoogleMap>

//       {/* ── Unified Masterplan SVG Portal ── */}
//       {overlayPortalRef.current?.div &&
//         layout &&
//         createPortal(
//           <svg
//             viewBox={`${layout.x0} ${layout.y0} ${layout.w} ${layout.h}`}
//             width="100%"
//             height="100%"
//             preserveAspectRatio="none"
//             style={{
//               display: "block",
//               width: "100%",
//               height: "100%",
//               overflow: "visible",
//             }}
//           >
//             <MasterplanSvgContent
//               layout={layout}
//               showNumbers={showNumbers}
//               showStatus={showStatus}
//               highlightKey={highlightKey}
//               editingKey={editingKey}
//               opacityFor={opacityFor}
//               onPlotClick={onPlotClick}
//             />
//           </svg>,
//           overlayPortalRef.current.div,
//         )}

//       {/* ── Top Architectural Bar + Category Pills ── */}
//       <div className="ref-hud-top">
//         <div className="ref-topbar">
//           {!isPublic && (
//             <button
//               className="ref-icon-btn"
//               onClick={() => nav(-1)}
//               title="Back"
//             >
//               <ArrowLeft size={18} />
//             </button>
//           )}

//           <div style={{ minWidth: 140 }}>
//             <div
//               style={{
//                 fontFamily: MONO,
//                 fontSize: 10,
//                 letterSpacing: "0.1em",
//                 textTransform: "uppercase",
//                 color: ACCENT,
//               }}
//             >
//               MASTERPLAN
//             </div>
//             <div
//               style={{
//                 fontSize: 15,
//                 fontWeight: 700,
//                 color: INK,
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 maxWidth: 240,
//               }}
//             >
//               {mapDoc?.name || "Layout Map"}
//             </div>
//           </div>

//           <div className="ref-search">
//             <Search size={15} color={MUTED} />
//             <input
//               placeholder="Search plot no / sr no / title…"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && doSearch()}
//             />
//             {query && (
//               <button
//                 onClick={() => {
//                   setQuery("");
//                   setHighlight(null);
//                   setSelected(null);
//                   fitAll();
//                 }}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: MUTED,
//                   cursor: "pointer",
//                   display: "grid",
//                   placeItems: "center",
//                 }}
//               >
//                 <X size={14} />
//               </button>
//             )}
//             <button className="ref-find-btn" onClick={doSearch}>
//               Find
//             </button>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <button
//               className={`ref-icon-btn ${showAdv || advMatch.size > 0 ? "active" : ""}`}
//               title="Filters"
//               onClick={() => setShowAdv(!showAdv)}
//             >
//               <SlidersHorizontal size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Fit Full Layout"
//               onClick={() => {
//                 setSelected(null);
//                 setHighlight(null);
//                 fitAll();
//               }}
//             >
//               <Maximize2 size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Area Details"
//               onClick={() => setShowArea(true)}
//             >
//               <Info size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Share"
//               onClick={() => setShowShare(true)}
//             >
//               <Share2 size={17} />
//             </button>

//             {isAdmin(user) && (
//               <button
//                 className={`ref-icon-btn ${editMode ? "active" : ""}`}
//                 title={editMode ? "Done Editing" : "Edit Layout"}
//                 onClick={() => {
//                   setEditMode(!editMode);
//                   toast(editMode ? "Edit mode OFF" : "Edit mode ON");
//                 }}
//               >
//                 {editMode ? <Check size={17} /> : <Pencil size={17} />}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Category Filter Pills */}
//         <div className="ref-chips-row">
//           {[
//             ["all", `All (${plots.length})`],
//             ["plot", `Plots (${count("plot")})`],
//             ["road", `Roads (${count("road")})`],
//             ["open_space", `Open Spaces (${count("open_space")})`],
//             ["amenity", "Amenities"],
//           ].map(([k, l]) => (
//             <button
//               key={k}
//               className={`ref-pill ${typeFilter === k ? "on" : ""}`}
//               onClick={() => {
//                 setTypeFilter(k);
//                 setCategory(null);
//               }}
//             >
//               {l}
//             </button>
//           ))}
//           {statuses
//             .filter((s) => s !== "All")
//             .map((s) => (
//               <button
//                 key={s}
//                 className={`ref-pill ${typeFilter === "category" && category === s ? "on" : ""}`}
//                 onClick={() => {
//                   setTypeFilter("category");
//                   setCategory(s);
//                 }}
//               >
//                 {s} ({countStatus(s.toLowerCase())})
//               </button>
//             ))}
//         </div>
//       </div>

//       {/* ── Reference Staged FilterPanel (from FilterPanel.jsx) ── */}
//       {showAdv && (
//         <div
//           role="dialog"
//           aria-label="Filter plots"
//           onPointerDown={(e) => e.stopPropagation()}
//           style={{
//             position: "absolute",
//             top: 122,
//             left: 14,
//             zIndex: 12,
//             width: 320,
//             maxWidth: "calc(100vw - 28px)",
//             maxHeight: "calc(100vh - 150px)",
//             display: "flex",
//             flexDirection: "column",
//             background: CANVAS,
//             backdropFilter: "blur(16px)",
//             WebkitBackdropFilter: "blur(16px)",
//             border: `1px solid ${HAIR}`,
//             borderRadius: 14,
//             boxShadow: "0 22px 54px rgba(0, 0, 0, 0.55)",
//             overflow: "hidden",
//           }}
//         >
//           <header
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: "14px 16px 11px",
//               borderBottom: `1px solid ${HAIR}`,
//             }}
//           >
//             <div
//               style={{
//                 fontFamily: SANS,
//                 fontSize: 13,
//                 fontWeight: 600,
//                 letterSpacing: "0.08em",
//                 textTransform: "uppercase",
//                 color: ACCENT,
//               }}
//             >
//               Filters
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               {advMatch.size > 0 && (
//                 <span
//                   style={{
//                     fontFamily: MONO,
//                     fontSize: 11,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.06)",
//                     padding: "4px 8px",
//                     borderRadius: 6,
//                   }}
//                 >
//                   {advMatch.size} matched
//                 </span>
//               )}
//               <button
//                 onClick={() => setShowAdv(false)}
//                 style={{
//                   font: `400 18px/1 ${MONO}`,
//                   color: MUTED,
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 &times;
//               </button>
//             </div>
//           </header>

//           <div
//             style={{
//               display: "grid",
//               gap: 16,
//               padding: 16,
//               overflowY: "auto",
//             }}
//           >
//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Area Range ({adv.unit})
//               </div>
//               <div style={{ display: "flex", gap: 7 }}>
//                 {["m²", "ft²"].map((u) => (
//                   <button
//                     key={u}
//                     type="button"
//                     onClick={() => setAdv({ ...adv, unit: u })}
//                     style={{
//                       font: `500 12px/1 ${MONO}`,
//                       color: adv.unit === u ? "#15181D" : INK,
//                       background:
//                         adv.unit === u ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                       border: `1px solid ${adv.unit === u ? ACCENT : HAIR}`,
//                       borderRadius: 999,
//                       padding: "7px 13px",
//                       cursor: "pointer",
//                     }}
//                   >
//                     {u}
//                   </button>
//                 ))}
//               </div>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr auto 1fr",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 <input
//                   type="number"
//                   placeholder="Min"
//                   value={adv.min}
//                   onChange={(e) => setAdv({ ...adv, min: e.target.value })}
//                   style={{
//                     font: `400 13px/1 ${MONO}`,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.03)",
//                     border: `1px solid ${HAIR}`,
//                     borderRadius: 9,
//                     padding: "10px",
//                     width: "100%",
//                     boxSizing: "border-box",
//                     outline: "none",
//                   }}
//                 />
//                 <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
//                   to
//                 </span>
//                 <input
//                   type="number"
//                   placeholder="Max"
//                   value={adv.max}
//                   onChange={(e) => setAdv({ ...adv, max: e.target.value })}
//                   style={{
//                     font: `400 13px/1 ${MONO}`,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.03)",
//                     border: `1px solid ${HAIR}`,
//                     borderRadius: 9,
//                     padding: "10px",
//                     width: "100%",
//                     boxSizing: "border-box",
//                     outline: "none",
//                   }}
//                 />
//               </div>
//             </div>

//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Facing
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                 {FACINGS.map((f) => {
//                   const on = adv.facing === f;
//                   return (
//                     <button
//                       key={f}
//                       type="button"
//                       onClick={() => setAdv({ ...adv, facing: f })}
//                       style={{
//                         font: `500 12px/1 ${MONO}`,
//                         color: on ? "#15181D" : INK,
//                         background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                         border: `1px solid ${on ? ACCENT : HAIR}`,
//                         borderRadius: 999,
//                         padding: "8px 12px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {f}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Status
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                 {statuses.map((s) => {
//                   const on = adv.status === s;
//                   return (
//                     <button
//                       key={s}
//                       type="button"
//                       onClick={() => setAdv({ ...adv, status: s })}
//                       style={{
//                         font: `500 12px/1 ${MONO}`,
//                         color: on ? "#15181D" : INK,
//                         background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                         border: `1px solid ${on ? ACCENT : HAIR}`,
//                         borderRadius: 999,
//                         padding: "8px 12px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {s}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           <footer
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1.5fr",
//               gap: 9,
//               padding: 12,
//               borderTop: `1px solid ${HAIR}`,
//             }}
//           >
//             <button
//               type="button"
//               onClick={clearAdv}
//               style={{
//                 font: `500 13px/1 ${MONO}`,
//                 color: INK,
//                 background: "transparent",
//                 border: `1px solid ${HAIR}`,
//                 borderRadius: 10,
//                 padding: "11px 0",
//                 cursor: "pointer",
//               }}
//             >
//               Clear
//             </button>
//             <button
//               type="button"
//               onClick={applyAdv}
//               style={{
//                 font: `600 13px/1 ${MONO}`,
//                 color: "#15181D",
//                 background: ACCENT,
//                 border: `1px solid ${ACCENT}`,
//                 borderRadius: 10,
//                 padding: "11px 0",
//                 cursor: "pointer",
//               }}
//             >
//               Apply
//             </button>
//           </footer>
//         </div>
//       )}

//       {/* ── Live North Compass & Zoom Controls (from PlanMap.jsx) ── */}
//       <div
//         style={{
//           position: "absolute",
//           zIndex: 8,
//           right: 14,
//           top: 122,
//           display: "flex",
//           flexDirection: "column",
//           gap: 8,
//           alignItems: "center",
//         }}
//       >
//         <button
//           type="button"
//           title="Face north & fit layout"
//           onClick={resetNorth}
//           style={{
//             width: 44,
//             height: 44,
//             display: "grid",
//             placeItems: "center",
//             padding: 0,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 22,
//             cursor: "pointer",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           <svg width="26" height="26" viewBox="-13 -13 26 26">
//             <g
//               ref={compassNeedleRef}
//               style={{ transformOrigin: "50% 50%", willChange: "transform" }}
//             >
//               <path d="M0 -9 L4.5 1.5 L0 -0.8 Z" fill={ACCENT} />
//               <path
//                 d="M0 -9 L-4.5 1.5 L0 -0.8 Z"
//                 fill={ACCENT}
//                 fillOpacity="0.55"
//               />
//               <path d="M0 9 L4.5 -1.5 L0 0.8 Z" fill={HAIR} />
//               <path
//                 d="M0 9 L-4.5 -1.5 L0 0.8 Z"
//                 fill={HAIR}
//                 fillOpacity="0.55"
//               />
//             </g>
//             <text
//               x="0"
//               y="-9.5"
//               textAnchor="middle"
//               fill={INK}
//               fontFamily={MONO}
//               fontSize="7"
//               fontWeight="700"
//             >
//               N
//             </text>
//           </svg>
//         </button>

//         {/* Zoom + / - / Re-center Plot controls */}
//         <button
//           type="button"
//           title="Zoom in"
//           onClick={() => nudgeZoom(ZOOM_STEP)}
//           style={{
//             width: 42,
//             height: 42,
//             font: `500 18px/1 ${MONO}`,
//             color: INK,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             cursor: "pointer",
//             display: "grid",
//             placeItems: "center",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           +
//         </button>
//         <button
//           type="button"
//           title="Zoom out"
//           onClick={() => nudgeZoom(-ZOOM_STEP)}
//           style={{
//             width: 42,
//             height: 42,
//             font: `500 18px/1 ${MONO}`,
//             color: INK,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             cursor: "pointer",
//             display: "grid",
//             placeItems: "center",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           −
//         </button>
//         {selected && (
//           <button
//             type="button"
//             title="Refit selected plot"
//             onClick={() => flyToPlot(selected, 320)}
//             style={{
//               width: 42,
//               height: 42,
//               font: `500 16px/1 ${MONO}`,
//               color: ACCENT,
//               background: CANVAS,
//               border: `1px solid ${ACCENT}`,
//               borderRadius: 12,
//               cursor: "pointer",
//               display: "grid",
//               placeItems: "center",
//               boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//             }}
//           >
//             ⌂
//           </button>
//         )}
//       </div>

//       {/* ── Admin Polygon Editing Banner ── */}
//       {editing && (
//         <div
//           style={{
//             position: "absolute",
//             bottom: 74,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 15,
//             display: "flex",
//             alignItems: "center",
//             gap: 14,
//             padding: "12px 18px",
//             background: CANVAS,
//             backdropFilter: "blur(16px)",
//             border: `1px solid ${ACCENT}`,
//             borderRadius: 14,
//             boxShadow: "0 20px 44px rgba(0,0,0,0.6)",
//             fontFamily: MONO,
//             fontSize: 12,
//           }}
//         >
//           <span>
//             Points: <b style={{ color: ACCENT }}>{points.length}</b> · click map
//             to add, right-click vertex to remove
//           </span>
//           <button
//             onClick={savePlotEdits}
//             style={{
//               font: `600 12px/1 ${MONO}`,
//               background: ACCENT,
//               color: "#15181D",
//               border: "none",
//               borderRadius: 8,
//               padding: "8px 14px",
//               cursor: "pointer",
//             }}
//           >
//             Save
//           </button>
//           <button
//             onClick={() => {
//               setEditing(null);
//               setPoints([]);
//             }}
//             style={{
//               font: `500 12px/1 ${MONO}`,
//               background: "transparent",
//               color: INK,
//               border: `1px solid ${HAIR}`,
//               borderRadius: 8,
//               padding: "8px 12px",
//               cursor: "pointer",
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       )}

//       {/* ── Bottom-Left StatusLegend (from Statuslegend.jsx) ── */}
//       {showStatus && (
//         <div
//           style={{
//             position: "absolute",
//             left: 14,
//             bottom: 14,
//             zIndex: 8,
//             display: "flex",
//             flexWrap: "wrap",
//             alignItems: "center",
//             gap: "10px 14px",
//             padding: "10px 14px",
//             background: PANEL,
//             backdropFilter: "blur(14px)",
//             WebkitBackdropFilter: "blur(14px)",
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             boxShadow: "0 10px 30px rgba(0, 0, 0, 0.38)",
//             maxWidth: "calc(100vw - 220px)",
//           }}
//         >
//           {[
//             ["#56B870", "Available", countStatus("available")],
//             ["#F59E0B", "Booked", countStatus("booked")],
//             ["#EF4444", "Sold", countStatus("sold")],
//             ["#E7D055", "Premium", null],
//             ["#FB923C", "Featured", null],
//             ["#2E7D32", "Open Space", count("open_space")],
//             ["#D9468F", "Amenity", null],
//             [ROAD_AND_BG_COLOR, "Road", count("road")],
//           ].map(([dot, label, cnt]) => (
//             <div
//               key={label}
//               style={{ display: "flex", alignItems: "center", gap: 7 }}
//             >
//               <span
//                 style={{
//                   width: 11,
//                   height: 11,
//                   borderRadius: 3,
//                   background: dot,
//                   border: `1px solid ${HAIR}`,
//                 }}
//               />
//               <span
//                 style={{
//                   font: `500 12px/1 ${MONO}`,
//                   color: INK,
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {label}
//               </span>
//               {cnt !== null && cnt > 0 && (
//                 <span
//                   style={{
//                     font: `500 11px/1 ${MONO}`,
//                     color: MUTED,
//                     background: "rgba(255, 255, 255, 0.06)",
//                     padding: "3px 6px",
//                     borderRadius: 5,
//                   }}
//                 >
//                   {cnt}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Bottom-Right MapToggles (from Maptoggles.jsx) ── */}
//       <div
//         style={{
//           position: "absolute",
//           right: 14,
//           bottom: 14,
//           zIndex: 8,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "flex-end",
//           gap: 8,
//         }}
//       >
//         {[
//           ["Numbers", showNumbers, setShowNumbers],
//           ...(hideStatus ? [] : [["Status", showStatus, setShowStatus]]),
//         ].map(([label, on, toggle]) => (
//           <button
//             key={label}
//             type="button"
//             role="switch"
//             aria-checked={on}
//             onClick={() => toggle(!on)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//               font: `500 13px/1 ${MONO}`,
//               color: INK,
//               background: PANEL,
//               backdropFilter: "blur(14px)",
//               WebkitBackdropFilter: "blur(14px)",
//               border: `1px solid ${HAIR}`,
//               borderRadius: 12,
//               padding: "9px 13px",
//               cursor: "pointer",
//               boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
//             }}
//           >
//             <span>{label}</span>
//             <span
//               style={{
//                 width: 42,
//                 height: 22,
//                 borderRadius: 999,
//                 background: on ? "#7CB342" : "rgba(255, 255, 255, 0.20)",
//                 position: "relative",
//                 transition: "background 180ms ease",
//               }}
//             >
//               <span
//                 style={{
//                   position: "absolute",
//                   top: 2,
//                   left: 2,
//                   width: 18,
//                   height: 18,
//                   borderRadius: "50%",
//                   background: "#FFFFFF",
//                   transform: on ? "translateX(20px)" : "translateX(0px)",
//                   transition: "transform 180ms ease",
//                 }}
//               />
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* ── Selected Plot Inspector Sheet ── */}
//       {selected && (
//         <PlotViewSheet
//           plot={hideStatus ? { ...selected, status: "" } : selected}
//           mapId={mapId}
//           mapName={mapDoc?.name ?? ""}
//           user={viewer}
//           onClose={() => {
//             setSelected(null);
//             setHighlight(null);
//             fitAll();
//           }}
//         />
//       )}

//       {/* ── Admin Options Modal ── */}
//       {optionsFor && (
//         <Modal
//           title={`Plot ${optionsFor.plotNo || optionsFor.title}`}
//           onClose={() => setOptionsFor(null)}
//         >
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             <button
//               className="btn ghost"
//               onClick={() => {
//                 setEditing(optionsFor);
//                 setPoints(optionsFor.corners);
//                 setOptionsFor(null);
//                 toast(
//                   "Click map to add points. Right-click a point to remove.",
//                 );
//               }}
//             >
//               <Pencil size={15} /> Edit Boundary
//             </button>
//             <button
//               className="btn ghost"
//               onClick={() => {
//                 setSelected(optionsFor);
//                 setHighlight(optionsFor);
//                 setOptionsFor(null);
//                 flyToPlot(optionsFor, FLY_MS);
//               }}
//             >
//               <Eye size={15} /> View Details
//             </button>
//             <button
//               className="btn danger"
//               onClick={() => {
//                 setDeleteFor(optionsFor);
//                 setOptionsFor(null);
//               }}
//             >
//               <Trash2 size={15} /> Delete Plot
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* ── Delete Confirmation Modal ── */}
//       {deleteFor && (
//         <Modal
//           title="Delete Plot"
//           onClose={() => setDeleteFor(null)}
//           actions={
//             <>
//               <button className="btn text" onClick={() => setDeleteFor(null)}>
//                 Cancel
//               </button>
//               <button className="btn danger" onClick={deletePlot}>
//                 Delete
//               </button>
//             </>
//           }
//         >
//           Delete {deleteFor.plotNo}?
//         </Modal>
//       )}

//       {/* ── Area Telemetry Modal ── */}
//       {showArea && (
//         <Modal
//           title="Area Details"
//           onClose={() => setShowArea(false)}
//           actions={
//             <button className="btn" onClick={() => setShowArea(false)}>
//               Close
//             </button>
//           }
//         >
//           {[
//             ["Total Area", mapDoc?.totalArea ?? "0"],
//             ["Total Plots", mapDoc?.totalPlots ?? count("plot")],
//             ["Total Roads", mapDoc?.totalRoads ?? count("road")],
//             [
//               "Total Open Spaces",
//               mapDoc?.totalOpenSpaces ?? count("open_space"),
//             ],
//           ].map(([k, v]) => (
//             <div className="kv" key={k}>
//               <span>{k}</span>
//               <b>{String(v)}</b>
//             </div>
//           ))}
//         </Modal>
//       )}

//       {/* ── Share Modal ── */}
//       {showShare && (
//         <Modal
//           title="Share this layout"
//           onClose={() => setShowShare(false)}
//           actions={
//             <button className="btn" onClick={() => setShowShare(false)}>
//               Done
//             </button>
//           }
//         >
//           <p style={{ marginTop: 0, color: "#64748b", fontSize: 13 }}>
//             Anyone with this link can view the layout. No login needed.
//           </p>
//           <input
//             readOnly
//             value={shareUrl}
//             onFocus={(e) => e.target.select()}
//             style={{
//               width: "100%",
//               padding: "11px 12px",
//               border: "1px solid #D0DFFF",
//               borderRadius: 10,
//               fontSize: 13,
//               background: "#F5F9FF",
//               boxSizing: "border-box",
//             }}
//           />
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: 8,
//               marginTop: 14,
//             }}
//           >
//             <button className="btn" onClick={copyLink}>
//               <Copy size={15} /> Copy link
//             </button>
//             <a
//               className="btn green"
//               href={whatsappUrl}
//               target="_blank"
//               rel="noreferrer"
//               style={{ textDecoration: "none" }}
//             >
//               <MessageCircle size={15} /> WhatsApp
//             </a>
//             {navigator.share && (
//               <button className="btn ghost" onClick={nativeShare}>
//                 <Share2 size={15} /> More…
//               </button>
//             )}
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

// import React, {
//   memo,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   GoogleMap,
//   useJsApiLoader,
//   PolygonF,
//   MarkerF,
// } from "@react-google-maps/api";
// import {
//   ArrowLeft,
//   Pencil,
//   Check,
//   Info,
//   SlidersHorizontal,
//   Search,
//   X,
//   Maximize2,
//   Eye,
//   Trash2,
//   Share2,
//   Copy,
//   MessageCircle,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { isAdmin } from "../models/user";
// import { getMap, updateMapPlots } from "../services/mapService";
// import { plotFromDoc } from "../models/plot";
// import {
//   calculatePolygonArea,
//   getPolygonCenter,
//   getBounds,
// } from "../utils/mapUtils";
// import { Spinner } from "../components/ui";
// import Modal from "../components/Modal";
// import PlotViewSheet from "../components/PlotViewSheet";
// import { useToast } from "../components/Toast";

// /* ── Reference Architectural Theme Tokens ──────────────────────────── */
// const CANVAS = "rgba(21, 24, 29, 0.90)";
// const PANEL = "rgba(21, 24, 29, 0.86)";
// const HAIR = "rgba(231, 225, 213, 0.14)";
// const ACCENT = "#D4AF37";
// const MUTED = "#9AA5B1";
// const INK = "#E7E1D5";
// const PLAIN_FILL = "#F1ECE2";
// const SELECTED_FILL = "#A855F7";
// const SELECTED_STROKE = "#E9C6F2";
// const ROAD_AND_BG_COLOR = "#475569"; // Unified solid cement color for roads & layout base
// const UNIFORM_PLOT_FONT_SIZE = 1.95; // Uniform font size (in meters) for all plot numbers
// const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
// const MONO = "'JetBrains Mono', 'SF Mono', Consolas, monospace";
// const MAPFONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
// const SQFT = 10.7639104;

// /* ── Camera & Animation Constants (from PlanMap.jsx) ───────────────── */
// const FLY_MS = 780;
// const ZOOM_STEP = 0.75;
// const ZOOM_STEP_MS = 220;
// const FLY_MIN_Z = 18.5;
// const FLY_MAX_Z = 22.2;
// const MAP_MAX_Z = 24;
// const easeOut = (t) => 1 - (1 - t) ** 3;
// const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// // Hard-coded highlight lists from the original app
// const GOLDEN = new Set([
//   "142", "143", "164", "165", "186", "222", "216", "220", "187", "204",
//   "215", "221", "223", "224", "225", "226", "227", "228", "229", "230",
//   "231", "232", "233", "234", "235", "434", "433", "432", "431", "430",
//   "429", "344", "345", "315", "314", "370", "371", "304", "303", "394",
//   "395", "292", "291", "413", "278", "277", "414", "428", "266", "265",
//   "264", "263", "262", "261", "244", "245", "246", "247", "248", "249",
//   "250", "251", "252", "253", "254", "255", "256", "257", "258", "259",
//   "260", "236",
// ]);
// const ORANGE = new Set([
//   "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "210", "11", "62",
//   "63", "64", "65", "66", "67", "205", "206", "207", "208", "209", "211",
//   "243", "242", "241", "240", "239", "238", "237",
// ]);
// const FACINGS = [
//   "All",
//   "North",
//   "South",
//   "East",
//   "West",
//   "North-East",
//   "North-West",
//   "South-East",
//   "South-West",
// ];
// const LIBRARIES = [];

// const isAmenity = (p) =>
//   p.type === "amenity" ||
//   p.type === "open_space.Amenityspace" ||
//   (p.type === "open_space" &&
//     (p.title || "").toLowerCase().includes("amenity"));

// /* Architectural color palette for Status ON vs Status OFF */
// function styleForFeature(p, showStatus) {
//   if (p.type === "road") {
//     return {
//       fill: ROAD_AND_BG_COLOR, // Solid cement color matching background
//       stroke: "none",          // Removed road border
//       ink: "#E7E1D5",
//       sw: 0,                   // Zero border width
//     };
//   }
//   if (isAmenity(p)) {
//     return {
//       fill: "#D9468F",
//       stroke: "#F472B6",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "space for STP" || p.type === "open_space.SpaceforSTP") {
//     return {
//       fill: "#EAB308",
//       stroke: "#FEF08A",
//       ink: "#1A1208",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "space for ESS" || p.type === "open_space.SpaceforESS") {
//     return {
//       fill: "#7C3AED",
//       stroke: "#C4B5FD",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "open_space") {
//     return {
//       fill: "#2E7D32",
//       stroke: "#81C784",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }

//   // Plot styling
//   if (!showStatus) {
//     return {
//       fill: PLAIN_FILL,
//       stroke: "#52473B",
//       ink: "#1A1208",
//       sw: 0.22,
//     };
//   }

//   const st = (p.status || "").toLowerCase();
//   if (st === "sold") {
//     return { fill: "#EF4444", stroke: "#FCA5A5", ink: "#FFFFFF", sw: 0.22 };
//   }
//   if (st === "booked" || st === "reserved" || st === "hold") {
//     return { fill: "#F59E0B", stroke: "#FDE68A", ink: "#1A1208", sw: 0.22 };
//   }
//   if (GOLDEN.has(p.plotNo)) {
//     return { fill: "#E7D055", stroke: "#FEF9C3", ink: "#1A1208", sw: 0.22 };
//   }
//   if (ORANGE.has(p.plotNo)) {
//     return { fill: "#FB923C", stroke: "#FFEDD5", ink: "#1A1208", sw: 0.22 };
//   }
//   return { fill: "#56B870", stroke: "#DCFCE7", ink: "#0F172A", sw: 0.22 };
// }

// /* ── Self-Contained Local Meter Geometry & CAD Helpers ─────────────── */

// function createLocalProjection(originLat, originLng) {
//   const R = 6378137;
//   const cosLat = Math.cos((originLat * Math.PI) / 180);
//   return {
//     toMeters(lat, lng) {
//       const x = ((lng - originLng) * Math.PI * R * cosLat) / 180;
//       const y = -((lat - originLat) * Math.PI * R) / 180;
//       return [x, y];
//     },
//     toLatLng(x, y) {
//       const lat = originLat - (y * 180) / (Math.PI * R);
//       const lng = originLng + (x * 180) / (Math.PI * R * cosLat);
//       return { lat, lng };
//     },
//   };
// }

// function ptsToPath(pts) {
//   if (!pts || pts.length < 3) return "";
//   let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
//   for (let i = 1; i < pts.length; i++) {
//     d += `L${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
//   }
//   return `${d}Z`;
// }

// function distToSeg(px, py, x1, y1, x2, y2) {
//   const dx = x2 - x1;
//   const dy = y2 - y1;
//   const l2 = dx * dx + dy * dy;
//   if (l2 === 0) return Math.hypot(px - x1, py - y1);
//   let t = ((px - x1) * dx + (py - y1) * dy) / l2;
//   t = Math.max(0, Math.min(1, t));
//   return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
// }

// function computeFeatureMetrics(pts) {
//   if (!pts || pts.length < 3) {
//     return { cx: 0, cy: 0, ir: 4, angle: 0 };
//   }
//   let minX = Infinity,
//     maxX = -Infinity,
//     minY = Infinity,
//     maxY = -Infinity;

//   // Shoelace Area Centroid so rounded corner plots with 25+ curve vertices stay dead-center
//   let area2 = 0;
//   let sx = 0;
//   let sy = 0;

//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     if (x1 < minX) minX = x1;
//     if (x1 > maxX) maxX = x1;
//     if (y1 < minY) minY = y1;
//     if (y1 > maxY) maxY = y1;

//     const cross = x1 * y2 - x2 * y1;
//     area2 += cross;
//     sx += (x1 + x2) * cross;
//     sy += (y1 + y2) * cross;
//   }

//   const bw = maxX - minX;
//   const bh = maxY - minY;
//   const cx = Math.abs(area2) > 1e-4 ? sx / (3 * area2) : (minX + maxX) / 2;
//   const cy = Math.abs(area2) > 1e-4 ? sy / (3 * area2) : (minY + maxY) / 2;

//   let ir = Infinity;
//   let longestLen = 0;
//   let longestAngle = 0;

//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     const d = distToSeg(cx, cy, x1, y1, x2, y2);
//     if (d < ir) ir = d;

//     const segLen = Math.hypot(x2 - x1, y2 - y1);
//     if (segLen > longestLen) {
//       longestLen = segLen;
//       let deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
//       if (deg > 90) deg -= 180;
//       if (deg < -90) deg += 180;
//       longestAngle = deg;
//     }
//   }

//   const boxIr = Math.min(bw, bh) * 0.42;
//   const safeIr =
//     Number.isFinite(ir) && ir > 1.5
//       ? Math.max(ir, boxIr * 0.85)
//       : Math.max(2.2, boxIr);

//   return { cx, cy, ir: safeIr, angle: longestAngle };
// }

// /* ── Road Label Placement ──────────────────────────────────────────────
//    A road polygon can be long, bent, or run into a junction, so its centroid often lands
//    on a junction or off the road's own axis, and neighbouring labels then collide.
//    Instead: find the road's direction, slide the label along it, and take the straightest
//    stretch (not a junction) where the whole label fits inside the road, clear of plots and
//    of labels already placed. If nothing fits, the label is skipped rather than overlapping. */
// const ROAD_GLYPH_W = 0.7; // average glyph advance (em) for bold uppercase + tracking
// const roadTextLength = (text, size) => text.length * size * ROAD_GLYPH_W;

// function pointInPoly(x, y, poly) {
//   let inside = false;
//   for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
//     const [xi, yi] = poly[i];
//     const [xj, yj] = poly[j];
//     if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
//       inside = !inside;
//     }
//   }
//   return inside;
// }

// /* Direction of the road: principal axis of its outline (radians, along the road) */
// function roadAxisAngle(pts) {
//   let n = 0;
//   let mx = 0;
//   let my = 0;
//   const samples = [];
//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 1.5));
//     for (let k = 0; k < steps; k++) {
//       const x = x1 + ((x2 - x1) * k) / steps;
//       const y = y1 + ((y2 - y1) * k) / steps;
//       samples.push([x, y]);
//       mx += x;
//       my += y;
//       n++;
//     }
//   }
//   mx /= n;
//   my /= n;
//   let sxx = 0;
//   let syy = 0;
//   let sxy = 0;
//   for (const [x, y] of samples) {
//     sxx += (x - mx) * (x - mx);
//     syy += (y - my) * (y - my);
//     sxy += (x - mx) * (y - my);
//   }
//   return 0.5 * Math.atan2(2 * sxy, sxx - syy);
// }

// function labelBox(cx, cy, len, hgt, ang) {
//   const c = Math.cos(ang);
//   const s = Math.sin(ang);
//   const hx = len / 2;
//   const hy = hgt / 2;
//   return [
//     [-hx, -hy],
//     [hx, -hy],
//     [hx, hy],
//     [-hx, hy],
//   ].map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]);
// }

// /* Separating-axis test for two convex quads, with a clearance margin */
// function boxesOverlap(a, b, margin) {
//   for (const q of [a, b]) {
//     for (let i = 0; i < 4; i++) {
//       const [x1, y1] = q[i];
//       const [x2, y2] = q[(i + 1) % 4];
//       const nx = y1 - y2;
//       const ny = x2 - x1;
//       const l = Math.hypot(nx, ny) || 1;
//       let aMin = Infinity;
//       let aMax = -Infinity;
//       let bMin = Infinity;
//       let bMax = -Infinity;
//       for (const [x, y] of a) {
//         const d = (x * nx + y * ny) / l;
//         if (d < aMin) aMin = d;
//         if (d > aMax) aMax = d;
//       }
//       for (const [x, y] of b) {
//         const d = (x * nx + y * ny) / l;
//         if (d < bMin) bMin = d;
//         if (d > bMax) bMax = d;
//       }
//       if (aMax + margin < bMin || bMax + margin < aMin) return false;
//     }
//   }
//   return true;
// }

// /**
//  * @param roads  [{ key, pts, label }]
//  * @param plots  [{ pts }]  polygons a label must not run over
//  * @returns Map(key -> { x, y, angle (deg), size })
//  */
// function placeRoadLabels(roads, plots) {
//   const plotIndex = plots.map((p) => {
//     let x0 = Infinity;
//     let y0 = Infinity;
//     let x1 = -Infinity;
//     let y1 = -Infinity;
//     for (const [x, y] of p.pts) {
//       if (x < x0) x0 = x;
//       if (x > x1) x1 = x;
//       if (y < y0) y0 = y;
//       if (y > y1) y1 = y;
//     }
//     return { pts: p.pts, x0, y0, x1, y1 };
//   });
//   const onPlot = (x, y) =>
//     plotIndex.some(
//       (p) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1 && pointInPoly(x, y, p.pts),
//     );

//   // Prepare each road: axis, polygon in (u along, v across) coordinates, widths along it
//   const prepared = [];
//   for (const r of roads) {
//     if (!r.label || !r.pts || r.pts.length < 3) continue;
//     const ang = roadAxisAngle(r.pts);
//     const c = Math.cos(ang);
//     const s = Math.sin(ang);
//     const uv = r.pts.map(([x, y]) => [x * c + y * s, -x * s + y * c]);
//     let uMin = Infinity;
//     let uMax = -Infinity;
//     for (const [u] of uv) {
//       if (u < uMin) uMin = u;
//       if (u > uMax) uMax = u;
//     }
//     const length = uMax - uMin;
//     if (length < 3) continue;
//     const step = Math.max(0.75, length / 140);
//     const slices = [];
//     for (let u = uMin + step; u < uMax - step * 0.5; u += step) {
//       const vs = [];
//       for (let i = 0; i < uv.length; i++) {
//         const [u1, v1] = uv[i];
//         const [u2, v2] = uv[(i + 1) % uv.length];
//         if (u1 !== u2 && (u1 <= u) !== (u2 <= u)) vs.push(v1 + ((u - u1) * (v2 - v1)) / (u2 - u1));
//       }
//       vs.sort((a, b) => a - b);
//       let best = null;
//       for (let i = 0; i + 1 < vs.length; i += 2) {
//         const w = vs[i + 1] - vs[i];
//         if (!best || w > best.w) best = { w, vm: (vs[i] + vs[i + 1]) / 2 };
//       }
//       if (best && best.w > 0.5) slices.push({ u, ...best });
//     }
//     if (!slices.length) continue;
//     const widths = slices.map((q) => q.w).sort((a, b) => a - b);
//     const wMed = widths[Math.floor(widths.length / 2)];
//     prepared.push({ r, ang, c, s, uMin, uMax, slices, wMed, length });
//   }
//   // Main roads first, so they get the best spots
//   prepared.sort((a, b) => b.wMed - a.wMed || b.length - a.length);

//   const placed = [];
//   const out = new Map();

//   for (const p of prepared) {
//     const { r, ang, c, s, uMin, uMax, slices, wMed } = p;
//     const uMid = (uMin + uMax) / 2;
//     const base = Math.min(Math.max(wMed * 0.21, 1.15), 2.4);

//     for (const size of [base, base * 0.85, base * 0.72]) {
//       if (size < 1.0) break;
//       const len = roadTextLength(r.label, size) * 3.04;
//       const hgt = size * 2.3;

//       // Straight stretches only (no junction bulges), label must fit across the road
//       const cands = slices
//         .filter((q) => q.w >= hgt + 0.9 && q.w <= wMed * 1.3 + 0.4)
//         .map((q) => ({ ...q, d: Math.abs(q.u - uMid) }))
//         .sort((a, b) => a.d - b.d);

//       for (const q of cands) {
//         const cx = q.u * c - q.vm * s;
//         const cy = q.u * s + q.vm * c;
//         const box = labelBox(cx, cy, len, hgt + 0.5, ang);

//         // 1) the whole label inside this road
//         let inside = true;
//         for (let i = 0; i <= 8 && inside; i++) {
//           for (let j = 0; j <= 2; j++) {
//             const u = -len / 2 + (len * i) / 8;
//             const v = -(hgt + 0.5) / 2 + ((hgt + 0.5) * j) / 2;
//             if (!pointInPoly(cx + u * Math.cos(ang) - v * Math.sin(ang), cy + u * Math.sin(ang) + v * Math.cos(ang), r.pts)) {
//               inside = false;
//               break;
//             }
//           }
//         }
//         if (!inside) continue;

//         // 2) not over any plot
//         let hitsPlot = false;
//         for (let i = 0; i <= 8 && !hitsPlot; i++) {
//           for (let j = 0; j <= 2; j++) {
//             const u = -len / 2 + (len * i) / 8;
//             const v = -(hgt + 0.5) / 2 + ((hgt + 0.5) * j) / 2;
//             if (onPlot(cx + u * Math.cos(ang) - v * Math.sin(ang), cy + u * Math.sin(ang) + v * Math.cos(ang))) {
//               hitsPlot = true;
//               break;
//             }
//           }
//         }
//         if (hitsPlot) continue;

//         // 3) not touching a label already placed
//         if (placed.some((b) => boxesOverlap(box, b, 1.0))) continue;

//         placed.push(box);
//         let deg = (ang * 180) / Math.PI;
//         if (deg > 90) deg -= 180;
//         if (deg <= -90) deg += 180;
//         out.set(r.key, { x: cx, y: cy, angle: deg, size });
//         break;
//       }
//       if (out.has(r.key)) break;
//     }
//   }
//   return out;
// }

// /* ── CAD Dimension Overlay for Selected Plot (from DimensionOverlay.jsx) ── */
// const SelectedDimensionOverlay = memo(function SelectedDimensionOverlay({
//   feature,
// }) {
//   const geom = useMemo(() => {
//     if (!feature || !feature.pts || feature.pts.length < 3) return null;
//     const { pts, cx, cy, ir, raw } = feature;
//     const scale = 1.25;
//     const off = (0.55 + ir * 0.03) * scale;
//     const txt = Math.max(0.65, Math.min(ir * 0.18, 1.35)) * scale;
//     const tick = txt * 0.65;
//     const hair = 0.06 * scale;

//     const numSize = Math.max(1.4, Math.min(ir * 0.34, 3.6));
//     const sqmSize = numSize * 0.38;
//     const sqftSize = numSize * 0.46;

//     const edges = [];
//     for (let i = 0; i < pts.length; i++) {
//       const p1 = pts[i];
//       const p2 = pts[(i + 1) % pts.length];
//       const dx = p2[0] - p1[0];
//       const dy = p2[1] - p1[1];
//       const len = Math.hypot(dx, dy);
//       if (len < 0.8) continue;

//       const ux = dx / len;
//       const uy = dy / len;
//       const mx = (p1[0] + p2[0]) / 2;
//       const my = (p1[1] + p2[1]) / 2;

//       let nx = -uy;
//       let ny = ux;
//       if (nx * (mx - cx) + ny * (my - cy) < 0) {
//         nx = -nx;
//         ny = -ny;
//       }

//       const a = [p1[0] + nx * off, p1[1] + ny * off];
//       const b = [p2[0] + nx * off, p2[1] + ny * off];
//       const lx = mx + nx * (off + txt * 0.85);
//       const ly = my + ny * (off + txt * 0.85);

//       let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
//       if (deg > 90) deg -= 180;
//       if (deg < -90) deg += 180;

//       edges.push({
//         key: `edge-${i}`,
//         p1,
//         p2,
//         a,
//         b,
//         kx: nx * tick * 0.5,
//         ky: ny * tick * 0.5,
//         lx,
//         ly,
//         deg,
//         label: `${len.toFixed(2)} m`,
//       });
//     }

//     const areaNum = Number(raw.area) || 0;
//     const areaSqFt = Number(raw.areaSqFt) || areaNum * SQFT;

//     return {
//       cx,
//       cy,
//       txt,
//       hair,
//       numSize,
//       sqmSize,
//       sqftSize,
//       edges,
//       title: raw.type === "plot" ? raw.plotNo : raw.title,
//       sqmLabel: `${areaNum.toFixed(1)} m²`,
//       sqftLabel: `${Math.round(areaSqFt).toLocaleString("en-IN")} ft²`,
//     };
//   }, [feature]);

//   if (!geom) return null;
//   const {
//     cx,
//     cy,
//     txt,
//     hair,
//     numSize,
//     sqmSize,
//     sqftSize,
//     edges,
//     title,
//     sqmLabel,
//     sqftLabel,
//   } = geom;

//   return (
//     <g style={{ pointerEvents: "none" }}>
//       {edges.map((r) => (
//         <g key={r.key}>
//           <line
//             x1={r.p1[0]}
//             y1={r.p1[1]}
//             x2={r.a[0]}
//             y2={r.a[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair}
//             strokeDasharray={`${hair * 4} ${hair * 3}`}
//             opacity="0.78"
//           />
//           <line
//             x1={r.p2[0]}
//             y1={r.p2[1]}
//             x2={r.b[0]}
//             y2={r.b[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair}
//             strokeDasharray={`${hair * 4} ${hair * 3}`}
//             opacity="0.78"
//           />
//           <line
//             x1={r.a[0]}
//             y1={r.a[1]}
//             x2={r.b[0]}
//             y2={r.b[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.15}
//             strokeDasharray={`${hair * 5} ${hair * 3}`}
//             opacity="0.95"
//           />
//           <line
//             x1={r.a[0] - r.kx}
//             y1={r.a[1] - r.ky}
//             x2={r.a[0] + r.kx}
//             y2={r.a[1] + r.ky}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.5}
//           />
//           <line
//             x1={r.b[0] - r.kx}
//             y1={r.b[1] - r.ky}
//             x2={r.b[0] + r.kx}
//             y2={r.b[1] + r.ky}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.5}
//           />
//           <text
//             x={r.lx}
//             y={r.ly}
//             transform={`rotate(${r.deg} ${r.lx} ${r.ly})`}
//             textAnchor="middle"
//             dy="0.35em"
//             fontFamily={MONO}
//             fontSize={txt}
//             fontWeight="700"
//             fill="#FFFFFF"
//             stroke="#15181D"
//             strokeWidth={txt * 0.22}
//             paintOrder="stroke"
//           >
//             {r.label}
//           </text>
//         </g>
//       ))}

//       <text
//         x={cx}
//         y={cy - numSize * 0.52}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MAPFONT}
//         fontSize={numSize}
//         fontWeight="800"
//         fill="#FFFFFF"
//         stroke="rgba(21,24,29,0.65)"
//         strokeWidth={numSize * 0.12}
//         paintOrder="stroke"
//       >
//         {title}
//       </text>
//       <text
//         x={cx}
//         y={cy + numSize * 0.35}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MONO}
//         fontSize={sqmSize}
//         fontWeight="600"
//         fill="#F3E8FF"
//       >
//         {sqmLabel}
//       </text>
//       <text
//         x={cx}
//         y={cy + numSize * 0.92}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MONO}
//         fontSize={sqftSize}
//         fontWeight="700"
//         fill="#FFFFFF"
//       >
//         {sqftLabel}
//       </text>
//     </g>
//   );
// });

// /* ── Unified Masterplan SVG Content (from PlanContent.jsx) ─────────── */
// const MasterplanSvgContent = memo(function MasterplanSvgContent({
//   layout,
//   showStatus,
//   highlightKey,
//   editingKey,
//   opacityFor,
//   onPlotClick,
// }) {
//   const selectedFeature = useMemo(
//     () =>
//       highlightKey
//         ? layout.features.find((f) => f.key === highlightKey)
//         : null,
//     [layout, highlightKey],
//   );

//   return (
//     <g>
//       {/* Layout Boundary Base — Solid 100% Opaque Cement Color Matching Roads */}
//       {layout.boundaryD && (
//         <path
//           d={layout.boundaryD}
//           fill={ROAD_AND_BG_COLOR}
//           fillOpacity="1"
//           stroke={ACCENT}
//           strokeWidth="0.45"
//           strokeDasharray="1.8 1.2"
//           style={{ pointerEvents: "none" }}
//         />
//       )}

//       {/* All Polygons (Roads first, then Open Spaces, then Plots) */}
//       <g>
//         {layout.sorted.map((f) => {
//           if (editingKey && f.key === editingKey) return null;
//           const isSel = highlightKey === f.key;
//           const isRoad = f.raw.type === "road";
//           const st = styleForFeature(f.raw, showStatus);
//           // Roads stay 100% opaque so they blend seamlessly with the background
//           const baseAlpha = isRoad
//             ? 1
//             : highlightKey && !isSel
//               ? 0.52
//               : 0.96;
//           const alpha = opacityFor(f.raw, baseAlpha);

//           return (
//             <path
//               key={f.key}
//               className="plan-plot-shape"
//               d={f.d}
//               fill={isSel ? SELECTED_FILL : st.fill}
//               fillRule="evenodd"
//               fillOpacity={isSel ? 0.96 : alpha}
//               stroke={isSel ? SELECTED_STROKE : st.stroke}
//               strokeWidth={isSel ? 0.55 : st.sw}
//               strokeOpacity={isRoad ? 0 : alpha < 0.4 ? 0.35 : 0.95}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onPlotClick(f.raw);
//               }}
//             />
//           );
//         })}
//       </g>

//       {/* Plot Numbers Layer — Uniform Size Across All Plots */}
//       <g style={{ pointerEvents: "none" }}>
//         {layout.plotFeatures.map((f) => {
//           if (f.key === highlightKey || f.key === editingKey) return null;
//           if (!f.label) return null;
//           const st = styleForFeature(f.raw, showStatus);
//           const alpha = opacityFor(f.raw, highlightKey ? 0.55 : 1);

//           return (
//             <text
//               key={`num-${f.key}`}
//               x={f.cx}
//               y={f.cy}
//               textAnchor="middle"
//               dy="0.35em"
//               fontFamily={MAPFONT}
//               fontSize={f.fontSize}
//               fontWeight="700"
//               fill={st.ink}
//               fillOpacity={alpha < 0.4 ? 0.28 : alpha}
//             >
//               {f.label}
//             </text>
//           );
//         })}
//       </g>

//       {/* Road & Open Space Rotated Feature Labels */}
//       <g style={{ pointerEvents: "none" }}>
//         {layout.zoneFeatures.map((f) => {
//           if (!f.label) return null;
//           const isRoad = f.raw.type === "road";
//           const rl = isRoad ? f.roadLabel : null;
//           if (isRoad && !rl) return null; // no clear spot for this road's label
//           const size = rl
//             ? rl.size
//             : Math.min(Math.max(f.ir * 0.32, 1.15), 3.2);
//           if (size < 1.0) return null;
//           const lx = rl ? rl.x : f.cx;
//           const ly = rl ? rl.y : f.cy;
//           const lang = rl ? rl.angle : f.angle;
//           const alpha = opacityFor(f.raw, highlightKey ? 0.5 : 1);

//           return (
//             <g
//               key={`lbl-${f.key}`}
//               paintOrder="stroke"
//               stroke="rgba(15, 18, 24, 0.75)"
//               strokeWidth={size * 0.14}
//               transform={`rotate(${lang.toFixed(1)} ${lx.toFixed(2)} ${ly.toFixed(2)})`}
//               opacity={alpha < 0.4 ? 0.25 : alpha}
//             >
//               <text
//                 x={lx}
//                 y={isRoad ? ly : ly - size * 0.35}
//                 textAnchor="middle"
//                 dy="0.35em"
//                 fontFamily={SANS}
//                 fontSize={size}
//                 letterSpacing={isRoad ? "0.04em" : "0.06em"}
//                 fill="#F8FAFC"
//                 fontWeight="700"
//               >
//                 {f.label}
//               </text>
//               {!isRoad && f.raw.area > 120 && (
//                 <text
//                   x={lx}
//                   y={ly + size * 0.75}
//                   textAnchor="middle"
//                   dy="0.35em"
//                   fontFamily={MONO}
//                   fontSize={size * 0.64}
//                   fill="#E7E1D5"
//                   fontWeight="600"
//                 >
//                   {Math.round(f.raw.area).toLocaleString("en-IN")} m²
//                 </text>
//               )}
//             </g>
//           );
//         })}
//       </g>

//       {/* Raised Selected Plot + Engineering Dimensions */}
//       {selectedFeature && editingKey !== selectedFeature.key && (
//         <g style={{ pointerEvents: "none" }}>
//           <path
//             d={selectedFeature.d}
//             fill={SELECTED_FILL}
//             fillOpacity="0.94"
//             stroke={SELECTED_STROKE}
//             strokeWidth="0.65"
//           />
//           <SelectedDimensionOverlay feature={selectedFeature} />
//         </g>
//       )}
//     </g>
//   );
// });

// /* ── Main MapViewer Screen ─────────────────────────────────────────── */
// const PUBLIC_USER = { uid: "public", name: "Visitor", role: "guest" };

// export default function MapViewer({ publicView = false }) {
//   const { mapId } = useParams();
//   const { user } = useAuth();
//   const isPublic = publicView;
//   const viewer = isPublic ? PUBLIC_USER : user;
//   const hideStatus = isPublic;
//   const nav = useNavigate();
//   const toast = useToast();
//   const mapRef = useRef(null);
//   const flyRafRef = useRef(0);
//   const initialFitDoneRef = useRef(false);
//   const overlayPortalRef = useRef(null);
//   const compassNeedleRef = useRef(null);
//   const [, setOverlayReady] = useState(0);

//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
//     libraries: LIBRARIES,
//   });

//   const [mapDoc, setMapDoc] = useState(null);
//   const [plots, setPlots] = useState([]);
//   const [boundary, setBoundary] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [typeFilter, setTypeFilter] = useState("all");
//   const [category, setCategory] = useState(null);
//   const [query, setQuery] = useState("");
//   const [highlight, setHighlight] = useState(null);
//   const [selected, setSelected] = useState(null);
//   const [showAdv, setShowAdv] = useState(false);
//   const [adv, setAdv] = useState({
//     min: "",
//     max: "",
//     facing: "All",
//     status: "All",
//     unit: "m²",
//   });
//   const [advMatch, setAdvMatch] = useState(new Set());
//   const [showArea, setShowArea] = useState(false);
//   const [showShare, setShowShare] = useState(false);

//   const [showStatus, setShowStatus] = useState(!hideStatus);

//   const [editMode, setEditMode] = useState(false);
//   const [optionsFor, setOptionsFor] = useState(null);
//   const [deleteFor, setDeleteFor] = useState(null);
//   const [editing, setEditing] = useState(null);
//   const [points, setPoints] = useState([]);

//   useEffect(() => {
//     initialFitDoneRef.current = false;
//     getMap(mapId)
//       .then((m) => {
//         if (!m) return;
//         setMapDoc(m);
//         setPlots((m.plots ?? []).map((p) => plotFromDoc(p)));
//         setBoundary(
//           (m.layoutBoundary ?? []).map((p) => ({ lat: +p.lat, lng: +p.lng })),
//         );
//       })
//       .catch((e) => console.error("Error loading map data:", e))
//       .finally(() => setLoading(false));
//   }, [mapId]);

//   useEffect(() => () => cancelAnimationFrame(flyRafRef.current), []);

//   /* ── Share ── */
//   const shareUrl = `${window.location.origin}/share/${mapId}`;
//   const shareText = `${mapDoc?.name || "Layout"} — view the layout and plots`;
//   const copyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(shareUrl);
//     } catch {
//       const t = document.createElement("textarea");
//       t.value = shareUrl;
//       document.body.appendChild(t);
//       t.select();
//       document.execCommand("copy");
//       t.remove();
//     }
//     toast("Link copied", "success");
//   };
//   const nativeShare = () =>
//     navigator
//       .share({ title: shareText, text: shareText, url: shareUrl })
//       .catch(() => {});
//   const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

//   const statuses = useMemo(
//     () =>
//       hideStatus
//         ? ["All"]
//         : [
//             "All",
//             ...new Set(
//               plots
//                 .filter((p) => p.type === "plot" && p.status)
//                 .map((p) => p.status),
//             ),
//           ],
//     [plots, hideStatus],
//   );
//   const count = useCallback(
//     (t) => plots.filter((p) => p.type === t).length,
//     [plots],
//   );
//   const countStatus = useCallback(
//     (s) =>
//       plots.filter(
//         (p) => p.type === "plot" && (p.status || "").toLowerCase() === s,
//       ).length,
//     [plots],
//   );

//   /* Build local meter coordinate layout for the unified SVG overlay */
//   const layout = useMemo(() => {
//     const allPts = plots.length
//       ? plots.flatMap((p) => p.corners || [])
//       : boundary;
//     if (!allPts.length) return null;

//     const b = getBounds(allPts);
//     if (!b) return null;

//     const originLat = (b.north + b.south) / 2;
//     const originLng = (b.east + b.west) / 2;
//     const proj = createLocalProjection(originLat, originLng);

//     let minX = Infinity,
//       maxX = -Infinity,
//       minY = Infinity,
//       maxY = -Infinity;
//     const track = ([x, y]) => {
//       if (x < minX) minX = x;
//       if (x > maxX) maxX = x;
//       if (y < minY) minY = y;
//       if (y > maxY) maxY = y;
//     };

//     const boundaryPts = boundary.map((c) => {
//       const pt = proj.toMeters(c.lat, c.lng);
//       track(pt);
//       return pt;
//     });

//     const features = plots.map((p, idx) => {
//       const pts = (p.corners || []).map((c) => {
//         const pt = proj.toMeters(c.lat, c.lng);
//         track(pt);
//         return pt;
//       });
//       const { cx, cy, ir, angle } = computeFeatureMetrics(pts);
//       const label =
//         p.type === "plot" ? String(p.plotNo || "") : String(p.title || "");

//       return {
//         key: p.srNo || p.plotNo || `f-${idx}`,
//         raw: p,
//         pts,
//         d: ptsToPath(pts),
//         cx,
//         cy,
//         ir,
//         angle,
//         label,
//         // Every plot uses the same consistent font size
//         fontSize: UNIFORM_PLOT_FONT_SIZE,
//       };
//     });

//     // One clear, aligned label per road: no junction pile-ups, nothing over plots or other labels
//     const roadLabels = placeRoadLabels(
//       features
//         .map((f, i) => ({ key: i, pts: f.pts, label: f.label, type: f.raw.type }))
//         .filter((f) => f.type === "road"),
//       features.filter((f) => f.raw.type === "plot").map((f) => ({ pts: f.pts })),
//     );
//     features.forEach((f, i) => {
//       f.roadLabel = roadLabels.get(i) || null;
//     });

//     const orderScore = (t) => (t === "road" ? 0 : t === "plot" ? 2 : 1);
//     const sorted = [...features].sort(
//       (a, b) => orderScore(a.raw.type) - orderScore(b.raw.type),
//     );

//     const pad = 16;
//     const x0 = minX - pad;
//     const y0 = minY - pad;
//     const x1 = maxX + pad;
//     const y1 = maxY + pad;

//     return {
//       proj,
//       x0,
//       y0,
//       x1,
//       y1,
//       w: Math.max(1, x1 - x0),
//       h: Math.max(1, y1 - y0),
//       northWestLL: proj.toLatLng(x0, y0),
//       southEastLL: proj.toLatLng(x1, y1),
//       boundaryD: boundaryPts.length > 2 ? ptsToPath(boundaryPts) : "",
//       features,
//       sorted,
//       plotFeatures: features.filter((f) => f.raw.type === "plot"),
//       zoneFeatures: features.filter((f) => f.raw.type !== "plot"),
//     };
//   }, [plots, boundary]);

//   /* ── Smooth Camera Animation Helper (from PlanMap.jsx) ── */
//   const animateCameraTo = useCallback(
//     (aimCenter, aimZoom, durationMs = FLY_MS) => {
//       const m = mapRef.current;
//       if (!m || !aimCenter) return;

//       cancelAnimationFrame(flyRafRef.current);
//       const c0 = m.getCenter();
//       if (!c0) {
//         m.setCenter(aimCenter);
//         if (aimZoom != null) m.setZoom(aimZoom);
//         return;
//       }

//       const startLat = c0.lat();
//       const startLng = c0.lng();
//       const startZoom = m.getZoom() || 18;
//       const targetZoom = aimZoom != null ? aimZoom : startZoom;

//       m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });

//       const t0 = performance.now();
//       const step = (now) => {
//         const k = Math.min(1, (now - t0) / durationMs);
//         const e = easeOut(k);
//         const center = {
//           lat: startLat + (aimCenter.lat - startLat) * e,
//           lng: startLng + (aimCenter.lng - startLng) * e,
//         };
//         const zoom = startZoom + (targetZoom - startZoom) * e;

//         if (typeof m.moveCamera === "function") {
//           m.moveCamera({ center, zoom });
//         } else {
//           m.setCenter(center);
//           m.setZoom(zoom);
//         }

//         if (k < 1) {
//           flyRafRef.current = requestAnimationFrame(step);
//         } else {
//           overlayPortalRef.current?.overlay?.draw?.();
//         }
//       };
//       flyRafRef.current = requestAnimationFrame(step);
//     },
//     [],
//   );

//   /* ── Tight Layout Fit on Load (from PlanMap.jsx fitPlan) ── */
//   const fitAll = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     cancelAnimationFrame(flyRafRef.current);

//     const plotPts = plots
//       .filter((p) => p.type === "plot")
//       .flatMap((p) => p.corners || []);
//     const pts = plotPts.length
//       ? plotPts
//       : plots.length
//         ? plots.flatMap((p) => p.corners || [])
//         : boundary;

//     const b = getBounds(pts);
//     if (!b) return;

//     m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });

//     const vw = window.innerWidth;
//     const pad =
//       vw < 600
//         ? { top: 82, right: 6, bottom: 48, left: 6 }
//         : vw < 1024
//           ? { top: 88, right: 10, bottom: 42, left: 10 }
//           : { top: 92, right: 12, bottom: 32, left: 12 };

//     m.fitBounds(
//       { south: b.south, north: b.north, west: b.west, east: b.east },
//       pad,
//     );

//     window.google?.maps?.event?.addListenerOnce(m, "idle", () => {
//       const currentZoom = m.getZoom();
//       if (currentZoom < 18.2) {
//         m.setZoom(18.2);
//       }
//     });
//   }, [plots, boundary]);

//   /* ── Calculate Ideal Zoom & Screen-Offset Frame for a Clicked Plot ── */
//   const flyToPlot = useCallback(
//     (plot, durationMs = FLY_MS, forceZoom = null) => {
//       const m = mapRef.current;
//       if (!m || !plot) return;

//       const corners = plot.corners || [];
//       const b = getBounds(corners);
//       const center =
//         plot.center ||
//         (b && {
//           lat: (b.north + b.south) / 2,
//           lng: (b.east + b.west) / 2,
//         });
//       if (!center) return;

//       let targetZoom = forceZoom;
//       if (targetZoom == null) {
//         const R = 6378137;
//         const cosLat = Math.cos((center.lat * Math.PI) / 180);
//         const spanLatM = b
//           ? ((b.north - b.south) * Math.PI * R) / 180
//           : Math.sqrt(plot.area || 150);
//         const spanLngM = b
//           ? ((b.east - b.west) * Math.PI * R * cosLat) / 180
//           : Math.sqrt(plot.area || 150);

//         const vw = window.innerWidth;
//         const vh = window.innerHeight;
//         const boost = vw < 640 ? 1.85 : vw < 1024 ? 1.6 : 1.45;
//         const gutterM = 6;

//         const needW = (spanLngM + gutterM * 2) * 1.05;
//         const needH = (spanLatM + gutterM * 2) * 1.05;

//         const availW = Math.max(vw - (vw > 640 ? 410 : 40), 180);
//         const availH = Math.max(vh - (vw <= 640 ? 300 : 150), 180);

//         const world = 156543.03392 * cosLat;
//         const mpp = Math.max(needW / availW, needH / availH) / boost;
//         targetZoom = clamp(Math.log2(world / mpp), FLY_MIN_Z, FLY_MAX_Z);
//       }

//       let aim = center;
//       const proj = m.getProjection?.();
//       if (proj && window.google?.maps) {
//         const vw = window.innerWidth;
//         const scale = 2 ** targetZoom;
//         const shiftPxX = vw > 640 ? 150 : 0;
//         const shiftPxY = vw <= 640 ? 95 : -15;
//         const pt = proj.fromLatLngToPoint(
//           new window.google.maps.LatLng(center.lat, center.lng),
//         );
//         if (pt) {
//           const shifted = proj.fromPointToLatLng(
//             new window.google.maps.Point(
//               pt.x + shiftPxX / scale,
//               pt.y + shiftPxY / scale,
//             ),
//           );
//           if (shifted) {
//             aim = { lat: shifted.lat(), lng: shifted.lng() };
//           }
//         }
//       }

//       animateCameraTo(aim, targetZoom, durationMs);
//     },
//     [animateCameraTo],
//   );

//   const nudgeZoom = useCallback(
//     (delta) => {
//       const m = mapRef.current;
//       if (!m) return;
//       const z0 = m.getZoom() || 19;
//       const z1 = clamp(z0 + delta, 15, MAP_MAX_Z);
//       if (selected) {
//         flyToPlot(selected, ZOOM_STEP_MS, z1);
//       } else {
//         animateCameraTo(
//           { lat: m.getCenter().lat(), lng: m.getCenter().lng() },
//           z1,
//           ZOOM_STEP_MS,
//         );
//       }
//     },
//     [selected, flyToPlot, animateCameraTo],
//   );

//   /* Mount custom Google Maps OverlayView hosting the unified SVG sheet */
//   const attachOverlay = useCallback(
//     (mapInstance) => {
//       if (!window.google?.maps || !layout) return;
//       if (overlayPortalRef.current?.overlay) {
//         overlayPortalRef.current.overlay.setMap(null);
//       }

//       const hostDiv = document.createElement("div");
//       hostDiv.style.position = "absolute";
//       hostDiv.style.pointerEvents = "auto";
//       hostDiv.style.willChange = "transform, width, height, left, top";

//       class MasterplanOverlay extends window.google.maps.OverlayView {
//         onAdd() {
//           const panes = this.getPanes();
//           panes.overlayMouseTarget.appendChild(hostDiv);
//         }
//         draw() {
//           const proj = this.getProjection();
//           if (!proj) return;
//           const nw = proj.fromLatLngToDivPixel(
//             new window.google.maps.LatLng(
//               layout.northWestLL.lat,
//               layout.northWestLL.lng,
//             ),
//           );
//           const se = proj.fromLatLngToDivPixel(
//             new window.google.maps.LatLng(
//               layout.southEastLL.lat,
//               layout.southEastLL.lng,
//             ),
//           );
//           if (!nw || !se) return;
//           const left = Math.min(nw.x, se.x);
//           const top = Math.min(nw.y, se.y);
//           const width = Math.max(1, Math.abs(se.x - nw.x));
//           const height = Math.max(1, Math.abs(se.y - nw.y));

//           hostDiv.style.left = `${left}px`;
//           hostDiv.style.top = `${top}px`;
//           hostDiv.style.width = `${width}px`;
//           hostDiv.style.height = `${height}px`;
//         }
//         onRemove() {
//           if (hostDiv.parentNode) hostDiv.parentNode.removeChild(hostDiv);
//         }
//       }

//       const ov = new MasterplanOverlay();
//       ov.setMap(mapInstance);
//       overlayPortalRef.current = { overlay: ov, div: hostDiv };
//       setOverlayReady((n) => n + 1);
//     },
//     [layout],
//   );

//   const onLoad = useCallback(
//     (m) => {
//       mapRef.current = m;
//       m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });
//       fitAll();
//       attachOverlay(m);

//       if (window.google?.maps?.event) {
//         window.google.maps.event.addListenerOnce(m, "idle", () => {
//           if (!initialFitDoneRef.current) {
//             initialFitDoneRef.current = true;
//             fitAll();
//           }
//         });
//       }
//     },
//     [fitAll, attachOverlay],
//   );

//   useEffect(() => {
//     if (isLoaded && mapRef.current && layout) {
//       attachOverlay(mapRef.current);
//       if (!initialFitDoneRef.current) {
//         initialFitDoneRef.current = true;
//         fitAll();
//       }
//     }
//     return () => {
//       if (overlayPortalRef.current?.overlay) {
//         overlayPortalRef.current.overlay.setMap(null);
//       }
//     };
//   }, [isLoaded, layout, attachOverlay, fitAll]);

//   const onIdle = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     if (compassNeedleRef.current) {
//       const h = m.getHeading?.() || 0;
//       compassNeedleRef.current.style.transform = `rotate(${-h}deg)`;
//     }
//   }, []);

//   const resetNorth = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     if (typeof m.moveCamera === "function") {
//       m.moveCamera({ heading: 0, tilt: 0 });
//     }
//     setSelected(null);
//     setHighlight(null);
//     fitAll();
//   }, [fitAll]);

//   const opacityFor = useCallback(
//     (p, base) => {
//       let o = base;
//       if (advMatch.size && p.type === "plot" && !advMatch.has(p.srNo)) o = 0.14;
//       if (typeFilter === "plot" && p.type !== "plot") o = 0.16;
//       if (typeFilter === "road" && p.type !== "road") o = 0.16;
//       if (typeFilter === "open_space" && p.type !== "open_space") o = 0.16;
//       if (typeFilter === "amenity" && !isAmenity(p)) o = 0.16;
//       if (
//         typeFilter === "category" &&
//         (p.type !== "plot" || p.status !== category)
//       )
//         o = 0.16;
//       return o;
//     },
//     [advMatch, typeFilter, category],
//   );

//   /* ── Click Plot -> Highlight, Open Sheet & Smoothly Fly/Zoom Into Plot ── */
//   const onPlotClick = useCallback(
//     (p) => {
//       if (editing) return;
//       if (editMode) return setOptionsFor(p);
//       setHighlight(p);
//       setSelected(p);
//       flyToPlot(p, FLY_MS);
//     },
//     [editing, editMode, flyToPlot],
//   );

//   // ── search ──
//   const doSearch = () => {
//     const q = query.trim().toLowerCase();
//     if (!q) return setHighlight(null);
//     const hit = plots.find(
//       (p) =>
//         (p.plotNo || "").toLowerCase() === q ||
//         (p.srNo || "").toLowerCase() === q ||
//         (p.title || "").toLowerCase().includes(q),
//     );
//     if (!hit) return toast("No match found", "error");
//     setHighlight(hit);
//     setSelected(hit);
//     flyToPlot(hit, FLY_MS);
//   };

//   // ── advanced filter ──
//   const applyAdv = () => {
//     let minA = parseFloat(adv.min);
//     let maxA = parseFloat(adv.max);
//     if (!isNaN(minA) && !isNaN(maxA) && minA > maxA) {
//       [minA, maxA] = [maxA, minA];
//     }
//     const isFt = adv.unit === "ft²";
//     const hasArea = !isNaN(minA) || !isNaN(maxA);
//     if (!hasArea && adv.facing === "All" && adv.status === "All") {
//       setAdvMatch(new Set());
//       setShowAdv(false);
//       return;
//     }
//     const matched = plots.filter((p) => {
//       if (p.type !== "plot") return false;
//       const val = isFt ? p.areaSqFt || p.area * SQFT : p.area;
//       if (!isNaN(minA) && val < minA) return false;
//       if (!isNaN(maxA) && val > maxA) return false;
//       if (
//         adv.facing !== "All" &&
//         !(p.facing || "").toLowerCase().includes(adv.facing.toLowerCase())
//       )
//         return false;
//       if (adv.status !== "All" && p.status !== adv.status) return false;
//       return true;
//     });
//     setAdvMatch(new Set(matched.map((p) => p.srNo)));
//     setShowAdv(false);
//     const b = getBounds(matched.flatMap((p) => p.corners));
//     if (b)
//       mapRef.current?.fitBounds(
//         { south: b.south, north: b.north, west: b.west, east: b.east },
//         { top: 96, right: 24, bottom: 64, left: 24 },
//       );
//   };

//   const clearAdv = () => {
//     setAdv({ min: "", max: "", facing: "All", status: "All", unit: "m²" });
//     setAdvMatch(new Set());
//   };

//   // ── edit mode (admin) ──
//   const persist = async (nextPlots) => {
//     await updateMapPlots(mapId, nextPlots, boundary);
//     setPlots(nextPlots);
//   };
//   const savePlotEdits = async () => {
//     if (!editing || points.length < 3)
//       return toast("Need at least 3 points", "error");
//     try {
//       const updated = {
//         ...editing,
//         corners: points,
//         area: calculatePolygonArea(points),
//         center: getPolygonCenter(points),
//       };
//       await persist(plots.map((p) => (p.srNo === editing.srNo ? updated : p)));
//       setEditing(null);
//       setPoints([]);
//       toast("Plot updated", "success");
//     } catch (e) {
//       toast(`Error: ${e.message}`, "error");
//     }
//   };
//   const deletePlot = async () => {
//     const p = deleteFor;
//     setDeleteFor(null);
//     try {
//       await persist(plots.filter((x) => x.srNo !== p.srNo));
//       toast(`${p.plotNo} deleted`, "success");
//     } catch (e) {
//       toast(`Error: ${e.message}`, "error");
//     }
//   };

//   const highlightKey = highlight ? highlight.srNo || highlight.plotNo : null;
//   const editingKey = editing ? editing.srNo || editing.plotNo : null;

//   if (loading) return <Spinner />;
//   if (loadError)
//     return (
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           display: "grid",
//           placeItems: "center",
//           background: "#0B0E13",
//           color: "#E68A72",
//           fontFamily: MONO,
//           padding: 24,
//           textAlign: "center",
//         }}
//       >
//         <div>
//           <h3 style={{ color: INK, marginBottom: 8 }}>
//             Google Maps failed to load
//           </h3>
//           <p style={{ color: MUTED, fontSize: 13 }}>
//             Check VITE_GOOGLE_MAPS_API_KEY and disable any ad-blocker.
//           </p>
//         </div>
//       </div>
//     );

//   const center = plots[0]?.center ??
//     boundary[0] ?? { lat: 21.1458, lng: 79.0882 };

//   return (
//     <div className="ref-map-page">
//       <style>{`
//         .ref-map-page {
//           position: relative;
//           width: 100vw;
//           height: 100vh;
//           overflow: hidden;
//           background: #0B0E13;
//           font-family: ${SANS};
//           color: ${INK};
//           user-select: none;
//         }
//         path.plan-plot-shape {
//           cursor: pointer;
//           transition: fill-opacity 120ms ease, stroke-width 120ms ease;
//         }
//         path.plan-plot-shape:hover {
//           fill-opacity: 0.78;
//         }
//         .ref-hud-top {
//           position: absolute;
//           top: 14px;
//           left: 14px;
//           right: 14px;
//           z-index: 10;
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//           pointer-events: none;
//         }
//         .ref-topbar {
//           pointer-events: auto;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 10px 14px;
//           background: ${CANVAS};
//           backdrop-filter: blur(16px);
//           -webkit-backdrop-filter: blur(16px);
//           border: 1px solid ${HAIR};
//           border-radius: 14px;
//           box-shadow: 0 18px 42px rgba(0, 0, 0, 0.52);
//           flex-wrap: wrap;
//         }
//         .ref-icon-btn {
//           width: 38px;
//           height: 38px;
//           border-radius: 10px;
//           background: rgba(255, 255, 255, 0.03);
//           border: 1px solid ${HAIR};
//           color: ${INK};
//           display: grid;
//           place-items: center;
//           cursor: pointer;
//           transition: border-color 150ms ease, color 150ms ease, transform 120ms ease;
//           flex-shrink: 0;
//         }
//         .ref-icon-btn:hover {
//           border-color: ${ACCENT};
//           color: ${ACCENT};
//         }
//         .ref-icon-btn.active {
//           background: ${ACCENT};
//           border-color: ${ACCENT};
//           color: #15181D;
//         }
//         .ref-search {
//           flex: 1;
//           min-width: 200px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid ${HAIR};
//           border-radius: 10px;
//           padding: 4px 6px 4px 12px;
//         }
//         .ref-search:focus-within {
//           border-color: ${ACCENT};
//         }
//         .ref-search input {
//           flex: 1;
//           background: transparent;
//           border: none;
//           outline: none;
//           color: ${INK};
//           font: 400 13px/1 ${MONO};
//           padding: 6px 0;
//         }
//         .ref-search input::placeholder {
//           color: ${MUTED};
//         }
//         .ref-find-btn {
//           font: 600 12px/1 ${MONO};
//           background: ${ACCENT};
//           color: #15181D;
//           border: none;
//           border-radius: 7px;
//           padding: 7px 12px;
//           cursor: pointer;
//         }
//         .ref-chips-row {
//           pointer-events: auto;
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           overflow-x: auto;
//           scrollbar-width: none;
//           padding-bottom: 2px;
//         }
//         .ref-chips-row::-webkit-scrollbar { display: none; }
//         .ref-pill {
//           font: 500 12px/1 ${MONO};
//           color: ${INK};
//           background: ${PANEL};
//           border: 1px solid ${HAIR};
//           border-radius: 999px;
//           padding: 9px 13px;
//           cursor: pointer;
//           white-space: nowrap;
//           box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
//           transition: all 150ms ease;
//         }
//         .ref-pill:hover {
//           border-color: ${ACCENT};
//         }
//         .ref-pill.on {
//           color: #15181D;
//           background: ${ACCENT};
//           border-color: ${ACCENT};
//           font-weight: 700;
//         }
//       `}</style>

//       {/* ── Google Map Base Canvas ── */}
//       <GoogleMap
//         mapContainerStyle={{ position: "absolute", inset: 0 }}
//         center={center}
//         zoom={18.5}
//         onLoad={onLoad}
//         onIdle={onIdle}
//         options={{
//           mapTypeId: "hybrid",
//           isFractionalZoomEnabled: true,
//           streetViewControl: false,
//           fullscreenControl: false,
//           mapTypeControl: false,
//           rotateControl: false,
//           zoomControl: false,
//           gestureHandling: "greedy",
//           maxZoom: MAP_MAX_Z,
//           backgroundColor: "#0B0E13",
//         }}
//         onClick={(e) => {
//           if (editing) {
//             setPoints((p) => [
//               ...p,
//               { lat: e.latLng.lat(), lng: e.latLng.lng() },
//             ]);
//           } else if (selected || highlight) {
//             setHighlight(null);
//             setSelected(null);
//             fitAll();
//           }
//         }}
//       >
//         {/* Admin Polygon Vertex Editor (Active only while editing a boundary) */}
//         {editing && (
//           <>
//             <PolygonF
//               paths={points}
//               options={{
//                 fillColor: ACCENT,
//                 fillOpacity: 0.35,
//                 strokeColor: ACCENT,
//                 strokeWeight: 3,
//                 clickable: false,
//                 zIndex: 30,
//               }}
//             />
//             {points.map((pt, i) => (
//               <MarkerF
//                 key={i}
//                 position={pt}
//                 draggable
//                 zIndex={40}
//                 onDragEnd={(e) =>
//                   setPoints((ps) =>
//                     ps.map((p, j) =>
//                       j === i
//                         ? { lat: e.latLng.lat(), lng: e.latLng.lng() }
//                         : p,
//                     ),
//                   )
//                 }
//                 onRightClick={() =>
//                   setPoints((ps) => ps.filter((_, j) => j !== i))
//                 }
//               />
//             ))}
//           </>
//         )}
//       </GoogleMap>

//       {/* ── Unified Masterplan SVG Portal ── */}
//       {overlayPortalRef.current?.div &&
//         layout &&
//         createPortal(
//           <svg
//             viewBox={`${layout.x0} ${layout.y0} ${layout.w} ${layout.h}`}
//             width="100%"
//             height="100%"
//             preserveAspectRatio="none"
//             style={{
//               display: "block",
//               width: "100%",
//               height: "100%",
//               overflow: "visible",
//             }}
//           >
//             <MasterplanSvgContent
//               layout={layout}
//               showStatus={showStatus}
//               highlightKey={highlightKey}
//               editingKey={editingKey}
//               opacityFor={opacityFor}
//               onPlotClick={onPlotClick}
//             />
//           </svg>,
//           overlayPortalRef.current.div,
//         )}

//       {/* ── Top Architectural Bar + Category Pills ── */}
//       <div className="ref-hud-top">
//         <div className="ref-topbar">
//           {!isPublic && (
//             <button
//               className="ref-icon-btn"
//               onClick={() => nav(-1)}
//               title="Back"
//             >
//               <ArrowLeft size={18} />
//             </button>
//           )}

//           <div style={{ minWidth: 140 }}>
//             <div
//               style={{
//                 fontFamily: MONO,
//                 fontSize: 10,
//                 letterSpacing: "0.1em",
//                 textTransform: "uppercase",
//                 color: ACCENT,
//               }}
//             >
//               MASTERPLAN
//             </div>
//             <div
//               style={{
//                 fontSize: 15,
//                 fontWeight: 700,
//                 color: INK,
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 maxWidth: 240,
//               }}
//             >
//               {mapDoc?.name || "Layout Map"}
//             </div>
//           </div>

//           <div className="ref-search">
//             <Search size={15} color={MUTED} />
//             <input
//               placeholder="Search plot no / sr no / title…"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && doSearch()}
//             />
//             {query && (
//               <button
//                 onClick={() => {
//                   setQuery("");
//                   setHighlight(null);
//                   setSelected(null);
//                   fitAll();
//                 }}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: MUTED,
//                   cursor: "pointer",
//                   display: "grid",
//                   placeItems: "center",
//                 }}
//               >
//                 <X size={14} />
//               </button>
//             )}
//             <button className="ref-find-btn" onClick={doSearch}>
//               Find
//             </button>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <button
//               className={`ref-icon-btn ${showAdv || advMatch.size > 0 ? "active" : ""}`}
//               title="Filters"
//               onClick={() => setShowAdv(!showAdv)}
//             >
//               <SlidersHorizontal size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Fit Full Layout"
//               onClick={() => {
//                 setSelected(null);
//                 setHighlight(null);
//                 fitAll();
//               }}
//             >
//               <Maximize2 size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Area Details"
//               onClick={() => setShowArea(true)}
//             >
//               <Info size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Share"
//               onClick={() => setShowShare(true)}
//             >
//               <Share2 size={17} />
//             </button>

//             {isAdmin(user) && (
//               <button
//                 className={`ref-icon-btn ${editMode ? "active" : ""}`}
//                 title={editMode ? "Done Editing" : "Edit Layout"}
//                 onClick={() => {
//                   setEditMode(!editMode);
//                   toast(editMode ? "Edit mode OFF" : "Edit mode ON");
//                 }}
//               >
//                 {editMode ? <Check size={17} /> : <Pencil size={17} />}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Category Filter Pills */}
//         <div className="ref-chips-row">
//           {[
//             ["all", `All (${plots.length})`],
//             ["plot", `Plots (${count("plot")})`],
//             ["road", `Roads (${count("road")})`],
//             ["open_space", `Open Spaces (${count("open_space")})`],
//             ["amenity", "Amenities"],
//           ].map(([k, l]) => (
//             <button
//               key={k}
//               className={`ref-pill ${typeFilter === k ? "on" : ""}`}
//               onClick={() => {
//                 setTypeFilter(k);
//                 setCategory(null);
//               }}
//             >
//               {l}
//             </button>
//           ))}
//           {statuses
//             .filter((s) => s !== "All")
//             .map((s) => (
//               <button
//                 key={s}
//                 className={`ref-pill ${typeFilter === "category" && category === s ? "on" : ""}`}
//                 onClick={() => {
//                   setTypeFilter("category");
//                   setCategory(s);
//                 }}
//               >
//                 {s} ({countStatus(s.toLowerCase())})
//               </button>
//             ))}
//         </div>
//       </div>

//       {/* ── Reference Staged FilterPanel (from FilterPanel.jsx) ── */}
//       {showAdv && (
//         <div
//           role="dialog"
//           aria-label="Filter plots"
//           onPointerDown={(e) => e.stopPropagation()}
//           style={{
//             position: "absolute",
//             top: 122,
//             left: 14,
//             zIndex: 12,
//             width: 320,
//             maxWidth: "calc(100vw - 28px)",
//             maxHeight: "calc(100vh - 150px)",
//             display: "flex",
//             flexDirection: "column",
//             background: CANVAS,
//             backdropFilter: "blur(16px)",
//             WebkitBackdropFilter: "blur(16px)",
//             border: `1px solid ${HAIR}`,
//             borderRadius: 14,
//             boxShadow: "0 22px 54px rgba(0, 0, 0, 0.55)",
//             overflow: "hidden",
//           }}
//         >
//           <header
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: "14px 16px 11px",
//               borderBottom: `1px solid ${HAIR}`,
//             }}
//           >
//             <div
//               style={{
//                 fontFamily: SANS,
//                 fontSize: 13,
//                 fontWeight: 600,
//                 letterSpacing: "0.08em",
//                 textTransform: "uppercase",
//                 color: ACCENT,
//               }}
//             >
//               Filters
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               {advMatch.size > 0 && (
//                 <span
//                   style={{
//                     fontFamily: MONO,
//                     fontSize: 11,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.06)",
//                     padding: "4px 8px",
//                     borderRadius: 6,
//                   }}
//                 >
//                   {advMatch.size} matched
//                 </span>
//               )}
//               <button
//                 onClick={() => setShowAdv(false)}
//                 style={{
//                   font: `400 18px/1 ${MONO}`,
//                   color: MUTED,
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 &times;
//               </button>
//             </div>
//           </header>

//           <div
//             style={{
//               display: "grid",
//               gap: 16,
//               padding: 16,
//               overflowY: "auto",
//             }}
//           >
//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Area Range ({adv.unit})
//               </div>
//               <div style={{ display: "flex", gap: 7 }}>
//                 {["m²", "ft²"].map((u) => (
//                   <button
//                     key={u}
//                     type="button"
//                     onClick={() => setAdv({ ...adv, unit: u })}
//                     style={{
//                       font: `500 12px/1 ${MONO}`,
//                       color: adv.unit === u ? "#15181D" : INK,
//                       background:
//                         adv.unit === u ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                       border: `1px solid ${adv.unit === u ? ACCENT : HAIR}`,
//                       borderRadius: 999,
//                       padding: "7px 13px",
//                       cursor: "pointer",
//                     }}
//                   >
//                     {u}
//                   </button>
//                 ))}
//               </div>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr auto 1fr",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 <input
//                   type="number"
//                   placeholder="Min"
//                   value={adv.min}
//                   onChange={(e) => setAdv({ ...adv, min: e.target.value })}
//                   style={{
//                     font: `400 13px/1 ${MONO}`,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.03)",
//                     border: `1px solid ${HAIR}`,
//                     borderRadius: 9,
//                     padding: "10px",
//                     width: "100%",
//                     boxSizing: "border-box",
//                     outline: "none",
//                   }}
//                 />
//                 <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
//                   to
//                 </span>
//                 <input
//                   type="number"
//                   placeholder="Max"
//                   value={adv.max}
//                   onChange={(e) => setAdv({ ...adv, max: e.target.value })}
//                   style={{
//                     font: `400 13px/1 ${MONO}`,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.03)",
//                     border: `1px solid ${HAIR}`,
//                     borderRadius: 9,
//                     padding: "10px",
//                     width: "100%",
//                     boxSizing: "border-box",
//                     outline: "none",
//                   }}
//                 />
//               </div>
//             </div>

//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Facing
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                 {FACINGS.map((f) => {
//                   const on = adv.facing === f;
//                   return (
//                     <button
//                       key={f}
//                       type="button"
//                       onClick={() => setAdv({ ...adv, facing: f })}
//                       style={{
//                         font: `500 12px/1 ${MONO}`,
//                         color: on ? "#15181D" : INK,
//                         background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                         border: `1px solid ${on ? ACCENT : HAIR}`,
//                         borderRadius: 999,
//                         padding: "8px 12px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {f}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Status
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                 {statuses.map((s) => {
//                   const on = adv.status === s;
//                   return (
//                     <button
//                       key={s}
//                       type="button"
//                       onClick={() => setAdv({ ...adv, status: s })}
//                       style={{
//                         font: `500 12px/1 ${MONO}`,
//                         color: on ? "#15181D" : INK,
//                         background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                         border: `1px solid ${on ? ACCENT : HAIR}`,
//                         borderRadius: 999,
//                         padding: "8px 12px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {s}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           <footer
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1.5fr",
//               gap: 9,
//               padding: 12,
//               borderTop: `1px solid ${HAIR}`,
//             }}
//           >
//             <button
//               type="button"
//               onClick={clearAdv}
//               style={{
//                 font: `500 13px/1 ${MONO}`,
//                 color: INK,
//                 background: "transparent",
//                 border: `1px solid ${HAIR}`,
//                 borderRadius: 10,
//                 padding: "11px 0",
//                 cursor: "pointer",
//               }}
//             >
//               Clear
//             </button>
//             <button
//               type="button"
//               onClick={applyAdv}
//               style={{
//                 font: `600 13px/1 ${MONO}`,
//                 color: "#15181D",
//                 background: ACCENT,
//                 border: `1px solid ${ACCENT}`,
//                 borderRadius: 10,
//                 padding: "11px 0",
//                 cursor: "pointer",
//               }}
//             >
//               Apply
//             </button>
//           </footer>
//         </div>
//       )}

//       {/* ── Live North Compass & Zoom Controls (from PlanMap.jsx) ── */}
//       <div
//         style={{
//           position: "absolute",
//           zIndex: 8,
//           right: 14,
//           top: 122,
//           display: "flex",
//           flexDirection: "column",
//           gap: 8,
//           alignItems: "center",
//         }}
//       >
//         <button
//           type="button"
//           title="Face north & fit layout"
//           onClick={resetNorth}
//           style={{
//             width: 44,
//             height: 44,
//             display: "grid",
//             placeItems: "center",
//             padding: 0,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 22,
//             cursor: "pointer",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           <svg width="26" height="26" viewBox="-13 -13 26 26">
//             <g
//               ref={compassNeedleRef}
//               style={{ transformOrigin: "50% 50%", willChange: "transform" }}
//             >
//               <path d="M0 -9 L4.5 1.5 L0 -0.8 Z" fill={ACCENT} />
//               <path
//                 d="M0 -9 L-4.5 1.5 L0 -0.8 Z"
//                 fill={ACCENT}
//                 fillOpacity="0.55"
//               />
//               <path d="M0 9 L4.5 -1.5 L0 0.8 Z" fill={HAIR} />
//               <path
//                 d="M0 9 L-4.5 -1.5 L0 0.8 Z"
//                 fill={HAIR}
//                 fillOpacity="0.55"
//               />
//             </g>
//             <text
//               x="0"
//               y="-9.5"
//               textAnchor="middle"
//               fill={INK}
//               fontFamily={MONO}
//               fontSize="7"
//               fontWeight="700"
//             >
//               N
//             </text>
//           </svg>
//         </button>

//         {/* Zoom + / - / Re-center Plot controls */}
//         <button
//           type="button"
//           title="Zoom in"
//           onClick={() => nudgeZoom(ZOOM_STEP)}
//           style={{
//             width: 42,
//             height: 42,
//             font: `500 18px/1 ${MONO}`,
//             color: INK,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             cursor: "pointer",
//             display: "grid",
//             placeItems: "center",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           +
//         </button>
//         <button
//           type="button"
//           title="Zoom out"
//           onClick={() => nudgeZoom(-ZOOM_STEP)}
//           style={{
//             width: 42,
//             height: 42,
//             font: `500 18px/1 ${MONO}`,
//             color: INK,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             cursor: "pointer",
//             display: "grid",
//             placeItems: "center",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           −
//         </button>
//         {selected && (
//           <button
//             type="button"
//             title="Refit selected plot"
//             onClick={() => flyToPlot(selected, 320)}
//             style={{
//               width: 42,
//               height: 42,
//               font: `500 16px/1 ${MONO}`,
//               color: ACCENT,
//               background: CANVAS,
//               border: `1px solid ${ACCENT}`,
//               borderRadius: 12,
//               cursor: "pointer",
//               display: "grid",
//               placeItems: "center",
//               boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//             }}
//           >
//             ⌂
//           </button>
//         )}
//       </div>

//       {/* ── Admin Polygon Editing Banner ── */}
//       {editing && (
//         <div
//           style={{
//             position: "absolute",
//             bottom: 74,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 15,
//             display: "flex",
//             alignItems: "center",
//             gap: 14,
//             padding: "12px 18px",
//             background: CANVAS,
//             backdropFilter: "blur(16px)",
//             border: `1px solid ${ACCENT}`,
//             borderRadius: 14,
//             boxShadow: "0 20px 44px rgba(0,0,0,0.6)",
//             fontFamily: MONO,
//             fontSize: 12,
//           }}
//         >
//           <span>
//             Points: <b style={{ color: ACCENT }}>{points.length}</b> · click map
//             to add, right-click vertex to remove
//           </span>
//           <button
//             onClick={savePlotEdits}
//             style={{
//               font: `600 12px/1 ${MONO}`,
//               background: ACCENT,
//               color: "#15181D",
//               border: "none",
//               borderRadius: 8,
//               padding: "8px 14px",
//               cursor: "pointer",
//             }}
//           >
//             Save
//           </button>
//           <button
//             onClick={() => {
//               setEditing(null);
//               setPoints([]);
//             }}
//             style={{
//               font: `500 12px/1 ${MONO}`,
//               background: "transparent",
//               color: INK,
//               border: `1px solid ${HAIR}`,
//               borderRadius: 8,
//               padding: "8px 12px",
//               cursor: "pointer",
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       )}

//       {/* ── Bottom-Left StatusLegend (from Statuslegend.jsx) ── */}
//       {showStatus && (
//         <div
//           style={{
//             position: "absolute",
//             left: 14,
//             bottom: 14,
//             zIndex: 8,
//             display: "flex",
//             flexWrap: "wrap",
//             alignItems: "center",
//             gap: "10px 14px",
//             padding: "10px 14px",
//             background: PANEL,
//             backdropFilter: "blur(14px)",
//             WebkitBackdropFilter: "blur(14px)",
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             boxShadow: "0 10px 30px rgba(0, 0, 0, 0.38)",
//             maxWidth: "calc(100vw - 220px)",
//           }}
//         >
//           {[
//             ["#56B870", "Available", countStatus("available")],
//             ["#F59E0B", "Booked", countStatus("booked")],
//             ["#EF4444", "Sold", countStatus("sold")],
//             ["#E7D055", "Premium", null],
//             ["#FB923C", "Featured", null],
//             ["#2E7D32", "Open Space", count("open_space")],
//             ["#D9468F", "Amenity", null],
//             [ROAD_AND_BG_COLOR, "Road", count("road")],
//           ].map(([dot, label, cnt]) => (
//             <div
//               key={label}
//               style={{ display: "flex", alignItems: "center", gap: 7 }}
//             >
//               <span
//                 style={{
//                   width: 11,
//                   height: 11,
//                   borderRadius: 3,
//                   background: dot,
//                   border: `1px solid ${HAIR}`,
//                 }}
//               />
//               <span
//                 style={{
//                   font: `500 12px/1 ${MONO}`,
//                   color: INK,
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {label}
//               </span>
//               {cnt !== null && cnt > 0 && (
//                 <span
//                   style={{
//                     font: `500 11px/1 ${MONO}`,
//                     color: MUTED,
//                     background: "rgba(255, 255, 255, 0.06)",
//                     padding: "3px 6px",
//                     borderRadius: 5,
//                   }}
//                 >
//                   {cnt}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Bottom-Right Status toggle ── */}
//       <div
//         style={{
//           position: "absolute",
//           right: 14,
//           bottom: 14,
//           zIndex: 8,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "flex-end",
//           gap: 8,
//         }}
//       >
//         {[
//           ...(hideStatus ? [] : [["Status", showStatus, setShowStatus]]),
//         ].map(([label, on, toggle]) => (
//           <button
//             key={label}
//             type="button"
//             role="switch"
//             aria-checked={on}
//             onClick={() => toggle(!on)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//               font: `500 13px/1 ${MONO}`,
//               color: INK,
//               background: PANEL,
//               backdropFilter: "blur(14px)",
//               WebkitBackdropFilter: "blur(14px)",
//               border: `1px solid ${HAIR}`,
//               borderRadius: 12,
//               padding: "9px 13px",
//               cursor: "pointer",
//               boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
//             }}
//           >
//             <span>{label}</span>
//             <span
//               style={{
//                 width: 42,
//                 height: 22,
//                 borderRadius: 999,
//                 background: on ? "#7CB342" : "rgba(255, 255, 255, 0.20)",
//                 position: "relative",
//                 transition: "background 180ms ease",
//               }}
//             >
//               <span
//                 style={{
//                   position: "absolute",
//                   top: 2,
//                   left: 2,
//                   width: 18,
//                   height: 18,
//                   borderRadius: "50%",
//                   background: "#FFFFFF",
//                   transform: on ? "translateX(20px)" : "translateX(0px)",
//                   transition: "transform 180ms ease",
//                 }}
//               />
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* ── Selected Plot Inspector Sheet ── */}
//       {selected && (
//         <PlotViewSheet
//           plot={hideStatus ? { ...selected, status: "" } : selected}
//           mapId={mapId}
//           mapName={mapDoc?.name ?? ""}
//           user={viewer}
//           onClose={() => {
//             setSelected(null);
//             setHighlight(null);
//             fitAll();
//           }}
//         />
//       )}

//       {/* ── Admin Options Modal ── */}
//       {optionsFor && (
//         <Modal
//           title={`Plot ${optionsFor.plotNo || optionsFor.title}`}
//           onClose={() => setOptionsFor(null)}
//         >
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             <button
//               className="btn ghost"
//               onClick={() => {
//                 setEditing(optionsFor);
//                 setPoints(optionsFor.corners);
//                 setOptionsFor(null);
//                 toast(
//                   "Click map to add points. Right-click a point to remove.",
//                 );
//               }}
//             >
//               <Pencil size={15} /> Edit Boundary
//             </button>
//             <button
//               className="btn ghost"
//               onClick={() => {
//                 setSelected(optionsFor);
//                 setHighlight(optionsFor);
//                 setOptionsFor(null);
//                 flyToPlot(optionsFor, FLY_MS);
//               }}
//             >
//               <Eye size={15} /> View Details
//             </button>
//             <button
//               className="btn danger"
//               onClick={() => {
//                 setDeleteFor(optionsFor);
//                 setOptionsFor(null);
//               }}
//             >
//               <Trash2 size={15} /> Delete Plot
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* ── Delete Confirmation Modal ── */}
//       {deleteFor && (
//         <Modal
//           title="Delete Plot"
//           onClose={() => setDeleteFor(null)}
//           actions={
//             <>
//               <button className="btn text" onClick={() => setDeleteFor(null)}>
//                 Cancel
//               </button>
//               <button className="btn danger" onClick={deletePlot}>
//                 Delete
//               </button>
//             </>
//           }
//         >
//           Delete {deleteFor.plotNo}?
//         </Modal>
//       )}

//       {/* ── Area Telemetry Modal ── */}
//       {showArea && (
//         <Modal
//           title="Area Details"
//           onClose={() => setShowArea(false)}
//           actions={
//             <button className="btn" onClick={() => setShowArea(false)}>
//               Close
//             </button>
//           }
//         >
//           {[
//             ["Total Area", mapDoc?.totalArea ?? "0"],
//             ["Total Plots", mapDoc?.totalPlots ?? count("plot")],
//             ["Total Roads", mapDoc?.totalRoads ?? count("road")],
//             [
//               "Total Open Spaces",
//               mapDoc?.totalOpenSpaces ?? count("open_space"),
//             ],
//           ].map(([k, v]) => (
//             <div className="kv" key={k}>
//               <span>{k}</span>
//               <b>{String(v)}</b>
//             </div>
//           ))}
//         </Modal>
//       )}

//       {/* ── Share Modal ── */}
//       {showShare && (
//         <Modal
//           title="Share this layout"
//           onClose={() => setShowShare(false)}
//           actions={
//             <button className="btn" onClick={() => setShowShare(false)}>
//               Done
//             </button>
//           }
//         >
//           <p style={{ marginTop: 0, color: "#64748b", fontSize: 13 }}>
//             Anyone with this link can view the layout. No login needed.
//           </p>
//           <input
//             readOnly
//             value={shareUrl}
//             onFocus={(e) => e.target.select()}
//             style={{
//               width: "100%",
//               padding: "11px 12px",
//               border: "1px solid #D0DFFF",
//               borderRadius: 10,
//               fontSize: 13,
//               background: "#F5F9FF",
//               boxSizing: "border-box",
//             }}
//           />
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: 8,
//               marginTop: 14,
//             }}
//           >
//             <button className="btn" onClick={copyLink}>
//               <Copy size={15} /> Copy link
//             </button>
//             <a
//               className="btn green"
//               href={whatsappUrl}
//               target="_blank"
//               rel="noreferrer"
//               style={{ textDecoration: "none" }}
//             >
//               <MessageCircle size={15} /> WhatsApp
//             </a>
//             {navigator.share && (
//               <button className="btn ghost" onClick={nativeShare}>
//                 <Share2 size={15} /> More…
//               </button>
//             )}
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

// import React, {
//   memo,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   GoogleMap,
//   useJsApiLoader,
//   PolygonF,
//   MarkerF,
// } from "@react-google-maps/api";
// import {
//   ArrowLeft,
//   Pencil,
//   Check,
//   Info,
//   SlidersHorizontal,
//   Search,
//   X,
//   Maximize2,
//   Eye,
//   Trash2,
//   Share2,
//   Copy,
//   MessageCircle,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { isAdmin } from "../models/user";
// import { getMap, updateMapPlots } from "../services/mapService";
// import { plotFromDoc } from "../models/plot";
// import {
//   calculatePolygonArea,
//   getPolygonCenter,
//   getBounds,
// } from "../utils/mapUtils";
// import { Spinner } from "../components/ui";
// import Modal from "../components/Modal";
// import PlotViewSheet from "../components/PlotViewSheet";
// import { useToast } from "../components/Toast";

// /* ── Reference Architectural Theme Tokens ──────────────────────────── */
// const CANVAS = "rgba(21, 24, 29, 0.90)";
// const PANEL = "rgba(21, 24, 29, 0.86)";
// const HAIR = "rgba(231, 225, 213, 0.14)";
// const ACCENT = "#D4AF37";
// const MUTED = "#9AA5B1";
// const INK = "#E7E1D5";
// const PLAIN_FILL = "#F1ECE2";
// const SELECTED_FILL = "#A855F7";
// const SELECTED_STROKE = "#E9C6F2";
// const ROAD_AND_BG_COLOR = "#475569"; // Unified solid cement color for roads & layout base
// const UNIFORM_PLOT_FONT_SIZE = 1.95; // Uniform font size (in meters) for all plot numbers
// const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
// const MONO = "'JetBrains Mono', 'SF Mono', Consolas, monospace";
// const MAPFONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
// const SQFT = 10.7639104;

// /* ── Camera & Animation Constants (from PlanMap.jsx) ───────────────── */
// const FLY_MS = 780;
// const ZOOM_STEP = 0.75;
// const ZOOM_STEP_MS = 220;
// const FLY_MIN_Z = 18.5;
// const FLY_MAX_Z = 22.2;
// /* Layout framing on load / "Fit Full Layout": closer than an exact fit.
//    The user can zoom out manually. Tune these two numbers to taste. */
// const LAYOUT_ZOOM_BOOST = 0.6; // extra zoom on top of the exact fit (0 = whole layout just fits)
// const LAYOUT_MIN_ZOOM = 18.2; // never start further out than this
// const MAP_MAX_Z = 24;
// const easeOut = (t) => 1 - (1 - t) ** 3;
// const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// // Hard-coded highlight lists from the original app
// const GOLDEN = new Set([
//   "142", "143", "164", "165", "186", "222", "216", "220", "187", "204",
//   "215", "221", "223", "224", "225", "226", "227", "228", "229", "230",
//   "231", "232", "233", "234", "235", "434", "433", "432", "431", "430",
//   "429", "344", "345", "315", "314", "370", "371", "304", "303", "394",
//   "395", "292", "291", "413", "278", "277", "414", "428", "266", "265",
//   "264", "263", "262", "261", "244", "245", "246", "247", "248", "249",
//   "250", "251", "252", "253", "254", "255", "256", "257", "258", "259",
//   "260", "236",
// ]);
// const ORANGE = new Set([
//   "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "210", "11", "62",
//   "63", "64", "65", "66", "67", "205", "206", "207", "208", "209", "211",
//   "243", "242", "241", "240", "239", "238", "237",
// ]);
// const FACINGS = [
//   "All",
//   "North",
//   "South",
//   "East",
//   "West",
//   "North-East",
//   "North-West",
//   "South-East",
//   "South-West",
// ];
// const LIBRARIES = [];

// const isAmenity = (p) =>
//   p.type === "amenity" ||
//   p.type === "open_space.Amenityspace" ||
//   (p.type === "open_space" &&
//     (p.title || "").toLowerCase().includes("amenity"));

// /* Architectural color palette for Status ON vs Status OFF */
// function styleForFeature(p, showStatus) {
//   if (p.type === "road") {
//     return {
//       fill: ROAD_AND_BG_COLOR, // Solid cement color matching background
//       stroke: "none",          // Removed road border
//       ink: "#E7E1D5",
//       sw: 0,                   // Zero border width
//     };
//   }
//   if (isAmenity(p)) {
//     return {
//       fill: "#D9468F",
//       stroke: "#F472B6",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "space for STP" || p.type === "open_space.SpaceforSTP") {
//     return {
//       fill: "#EAB308",
//       stroke: "#FEF08A",
//       ink: "#1A1208",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "space for ESS" || p.type === "open_space.SpaceforESS") {
//     return {
//       fill: "#7C3AED",
//       stroke: "#C4B5FD",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "open_space") {
//     return {
//       fill: "#2E7D32",
//       stroke: "#81C784",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }

//   // Plot styling
//   if (!showStatus) {
//     return {
//       fill: PLAIN_FILL,
//       stroke: "#52473B",
//       ink: "#1A1208",
//       sw: 0.22,
//     };
//   }

//   const st = (p.status || "").toLowerCase();
//   if (st === "sold") {
//     return { fill: "#EF4444", stroke: "#FCA5A5", ink: "#FFFFFF", sw: 0.22 };
//   }
//   if (st === "booked" || st === "reserved" || st === "hold") {
//     return { fill: "#F59E0B", stroke: "#FDE68A", ink: "#1A1208", sw: 0.22 };
//   }
//   if (GOLDEN.has(p.plotNo)) {
//     return { fill: "#E7D055", stroke: "#FEF9C3", ink: "#1A1208", sw: 0.22 };
//   }
//   if (ORANGE.has(p.plotNo)) {
//     return { fill: "#FB923C", stroke: "#FFEDD5", ink: "#1A1208", sw: 0.22 };
//   }
//   return { fill: "#56B870", stroke: "#DCFCE7", ink: "#0F172A", sw: 0.22 };
// }

// /* ── Self-Contained Local Meter Geometry & CAD Helpers ─────────────── */

// function createLocalProjection(originLat, originLng) {
//   const R = 6378137;
//   const cosLat = Math.cos((originLat * Math.PI) / 180);
//   return {
//     toMeters(lat, lng) {
//       const x = ((lng - originLng) * Math.PI * R * cosLat) / 180;
//       const y = -((lat - originLat) * Math.PI * R) / 180;
//       return [x, y];
//     },
//     toLatLng(x, y) {
//       const lat = originLat - (y * 180) / (Math.PI * R);
//       const lng = originLng + (x * 180) / (Math.PI * R * cosLat);
//       return { lat, lng };
//     },
//   };
// }

// function ptsToPath(pts) {
//   if (!pts || pts.length < 3) return "";
//   let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
//   for (let i = 1; i < pts.length; i++) {
//     d += `L${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
//   }
//   return `${d}Z`;
// }

// function distToSeg(px, py, x1, y1, x2, y2) {
//   const dx = x2 - x1;
//   const dy = y2 - y1;
//   const l2 = dx * dx + dy * dy;
//   if (l2 === 0) return Math.hypot(px - x1, py - y1);
//   let t = ((px - x1) * dx + (py - y1) * dy) / l2;
//   t = Math.max(0, Math.min(1, t));
//   return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
// }

// function computeFeatureMetrics(pts) {
//   if (!pts || pts.length < 3) {
//     return { cx: 0, cy: 0, ir: 4, angle: 0 };
//   }
//   let minX = Infinity,
//     maxX = -Infinity,
//     minY = Infinity,
//     maxY = -Infinity;

//   // Shoelace Area Centroid so rounded corner plots with 25+ curve vertices stay dead-center
//   let area2 = 0;
//   let sx = 0;
//   let sy = 0;

//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     if (x1 < minX) minX = x1;
//     if (x1 > maxX) maxX = x1;
//     if (y1 < minY) minY = y1;
//     if (y1 > maxY) maxY = y1;

//     const cross = x1 * y2 - x2 * y1;
//     area2 += cross;
//     sx += (x1 + x2) * cross;
//     sy += (y1 + y2) * cross;
//   }

//   const bw = maxX - minX;
//   const bh = maxY - minY;
//   const cx = Math.abs(area2) > 1e-4 ? sx / (3 * area2) : (minX + maxX) / 2;
//   const cy = Math.abs(area2) > 1e-4 ? sy / (3 * area2) : (minY + maxY) / 2;

//   let ir = Infinity;
//   let longestLen = 0;
//   let longestAngle = 0;

//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     const d = distToSeg(cx, cy, x1, y1, x2, y2);
//     if (d < ir) ir = d;

//     const segLen = Math.hypot(x2 - x1, y2 - y1);
//     if (segLen > longestLen) {
//       longestLen = segLen;
//       let deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
//       if (deg > 90) deg -= 180;
//       if (deg < -90) deg += 180;
//       longestAngle = deg;
//     }
//   }

//   const boxIr = Math.min(bw, bh) * 0.42;
//   const safeIr =
//     Number.isFinite(ir) && ir > 1.5
//       ? Math.max(ir, boxIr * 0.85)
//       : Math.max(2.2, boxIr);

//   return { cx, cy, ir: safeIr, angle: longestAngle };
// }

// /* ── Road Label Placement ──────────────────────────────────────────────
//    A road polygon can be long, bent, or run into a junction, so its centroid often lands
//    on a junction or off the road's own axis, and neighbouring labels then collide.
//    Instead: find the road's direction, slide the label along it, and take the straightest
//    stretch (not a junction) where the whole label fits inside the road, clear of plots and
//    of labels already placed. If nothing fits, the label is skipped rather than overlapping. */
// const ROAD_GLYPH_W = 0.7; // average glyph advance (em) for bold uppercase + tracking
// const roadTextLength = (text, size) => text.length * size * ROAD_GLYPH_W;

// function pointInPoly(x, y, poly) {
//   let inside = false;
//   for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
//     const [xi, yi] = poly[i];
//     const [xj, yj] = poly[j];
//     if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
//       inside = !inside;
//     }
//   }
//   return inside;
// }

// /* Direction of the road: principal axis of its outline (radians, along the road) */
// function roadAxisAngle(pts) {
//   let n = 0;
//   let mx = 0;
//   let my = 0;
//   const samples = [];
//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 1.5));
//     for (let k = 0; k < steps; k++) {
//       const x = x1 + ((x2 - x1) * k) / steps;
//       const y = y1 + ((y2 - y1) * k) / steps;
//       samples.push([x, y]);
//       mx += x;
//       my += y;
//       n++;
//     }
//   }
//   mx /= n;
//   my /= n;
//   let sxx = 0;
//   let syy = 0;
//   let sxy = 0;
//   for (const [x, y] of samples) {
//     sxx += (x - mx) * (x - mx);
//     syy += (y - my) * (y - my);
//     sxy += (x - mx) * (y - my);
//   }
//   return 0.5 * Math.atan2(2 * sxy, sxx - syy);
// }

// function labelBox(cx, cy, len, hgt, ang) {
//   const c = Math.cos(ang);
//   const s = Math.sin(ang);
//   const hx = len / 2;
//   const hy = hgt / 2;
//   return [
//     [-hx, -hy],
//     [hx, -hy],
//     [hx, hy],
//     [-hx, hy],
//   ].map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]);
// }

// /* Separating-axis test for two convex quads, with a clearance margin */
// function boxesOverlap(a, b, margin) {
//   for (const q of [a, b]) {
//     for (let i = 0; i < 4; i++) {
//       const [x1, y1] = q[i];
//       const [x2, y2] = q[(i + 1) % 4];
//       const nx = y1 - y2;
//       const ny = x2 - x1;
//       const l = Math.hypot(nx, ny) || 1;
//       let aMin = Infinity;
//       let aMax = -Infinity;
//       let bMin = Infinity;
//       let bMax = -Infinity;
//       for (const [x, y] of a) {
//         const d = (x * nx + y * ny) / l;
//         if (d < aMin) aMin = d;
//         if (d > aMax) aMax = d;
//       }
//       for (const [x, y] of b) {
//         const d = (x * nx + y * ny) / l;
//         if (d < bMin) bMin = d;
//         if (d > bMax) bMax = d;
//       }
//       if (aMax + margin < bMin || bMax + margin < aMin) return false;
//     }
//   }
//   return true;
// }

// /**
//  * @param roads  [{ key, pts, label }]
//  * @param plots  [{ pts }]  polygons a label must not run over
//  * @returns Map(key -> { x, y, angle (deg), size })
//  */
// function placeRoadLabels(roads, plots) {
//   const plotIndex = plots.map((p) => {
//     let x0 = Infinity;
//     let y0 = Infinity;
//     let x1 = -Infinity;
//     let y1 = -Infinity;
//     for (const [x, y] of p.pts) {
//       if (x < x0) x0 = x;
//       if (x > x1) x1 = x;
//       if (y < y0) y0 = y;
//       if (y > y1) y1 = y;
//     }
//     return { pts: p.pts, x0, y0, x1, y1 };
//   });
//   const onPlot = (x, y) =>
//     plotIndex.some(
//       (p) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1 && pointInPoly(x, y, p.pts),
//     );

//   // Prepare each road: axis, polygon in (u along, v across) coordinates, widths along it
//   const prepared = [];
//   for (const r of roads) {
//     if (!r.label || !r.pts || r.pts.length < 3) continue;
//     const ang = roadAxisAngle(r.pts);
//     const c = Math.cos(ang);
//     const s = Math.sin(ang);
//     const uv = r.pts.map(([x, y]) => [x * c + y * s, -x * s + y * c]);
//     let uMin = Infinity;
//     let uMax = -Infinity;
//     for (const [u] of uv) {
//       if (u < uMin) uMin = u;
//       if (u > uMax) uMax = u;
//     }
//     const length = uMax - uMin;
//     if (length < 3) continue;
//     const step = Math.max(0.75, length / 140);
//     const slices = [];
//     for (let u = uMin + step; u < uMax - step * 0.5; u += step) {
//       const vs = [];
//       for (let i = 0; i < uv.length; i++) {
//         const [u1, v1] = uv[i];
//         const [u2, v2] = uv[(i + 1) % uv.length];
//         if (u1 !== u2 && (u1 <= u) !== (u2 <= u)) vs.push(v1 + ((u - u1) * (v2 - v1)) / (u2 - u1));
//       }
//       vs.sort((a, b) => a - b);
//       let best = null;
//       for (let i = 0; i + 1 < vs.length; i += 2) {
//         const w = vs[i + 1] - vs[i];
//         if (!best || w > best.w) best = { w, vm: (vs[i] + vs[i + 1]) / 2 };
//       }
//       if (best && best.w > 0.5) slices.push({ u, ...best });
//     }
//     if (!slices.length) continue;
//     const widths = slices.map((q) => q.w).sort((a, b) => a - b);
//     const wMed = widths[Math.floor(widths.length / 2)];
//     prepared.push({ r, ang, c, s, uMin, uMax, slices, wMed, length });
//   }
//   // Main roads first, so they get the best spots
//   prepared.sort((a, b) => b.wMed - a.wMed || b.length - a.length);

//   const placed = [];
//   const out = new Map();

//   for (const p of prepared) {
//     const { r, ang, c, s, uMin, uMax, slices, wMed } = p;
//     const uMid = (uMin + uMax) / 2;
//     const base = Math.min(Math.max(wMed * 0.21, 1.15), 2.4);

//     for (const size of [base, base * 0.85, base * 0.72]) {
//       if (size < 1.0) break;
//       const len = roadTextLength(r.label, size) * 3.04;
//       const hgt = size * 2.3;

//       // Straight stretches only (no junction bulges), label must fit across the road
//       const cands = slices
//         .filter((q) => q.w >= hgt + 0.9 && q.w <= wMed * 1.3 + 0.4)
//         .map((q) => ({ ...q, d: Math.abs(q.u - uMid) }))
//         .sort((a, b) => a.d - b.d);

//       for (const q of cands) {
//         const cx = q.u * c - q.vm * s;
//         const cy = q.u * s + q.vm * c;
//         const box = labelBox(cx, cy, len, hgt + 0.5, ang);

//         // 1) the whole label inside this road
//         let inside = true;
//         for (let i = 0; i <= 8 && inside; i++) {
//           for (let j = 0; j <= 2; j++) {
//             const u = -len / 2 + (len * i) / 8;
//             const v = -(hgt + 0.5) / 2 + ((hgt + 0.5) * j) / 2;
//             if (!pointInPoly(cx + u * Math.cos(ang) - v * Math.sin(ang), cy + u * Math.sin(ang) + v * Math.cos(ang), r.pts)) {
//               inside = false;
//               break;
//             }
//           }
//         }
//         if (!inside) continue;

//         // 2) not over any plot
//         let hitsPlot = false;
//         for (let i = 0; i <= 8 && !hitsPlot; i++) {
//           for (let j = 0; j <= 2; j++) {
//             const u = -len / 2 + (len * i) / 8;
//             const v = -(hgt + 0.5) / 2 + ((hgt + 0.5) * j) / 2;
//             if (onPlot(cx + u * Math.cos(ang) - v * Math.sin(ang), cy + u * Math.sin(ang) + v * Math.cos(ang))) {
//               hitsPlot = true;
//               break;
//             }
//           }
//         }
//         if (hitsPlot) continue;

//         // 3) not touching a label already placed
//         if (placed.some((b) => boxesOverlap(box, b, 1.0))) continue;

//         placed.push(box);
//         let deg = (ang * 180) / Math.PI;
//         if (deg > 90) deg -= 180;
//         if (deg <= -90) deg += 180;
//         out.set(r.key, { x: cx, y: cy, angle: deg, size });
//         break;
//       }
//       if (out.has(r.key)) break;
//     }
//   }
//   return out;
// }

// /* ── CAD Dimension Overlay for Selected Plot (from DimensionOverlay.jsx) ── */
// const SelectedDimensionOverlay = memo(function SelectedDimensionOverlay({
//   feature,
// }) {
//   const geom = useMemo(() => {
//     if (!feature || !feature.pts || feature.pts.length < 3) return null;
//     const { pts, cx, cy, ir, raw } = feature;
//     const scale = 1.25;
//     const off = (0.55 + ir * 0.03) * scale;
//     const txt = Math.max(0.65, Math.min(ir * 0.18, 1.35)) * scale;
//     const tick = txt * 0.65;
//     const hair = 0.06 * scale;

//     const numSize = Math.max(1.4, Math.min(ir * 0.34, 3.6));
//     const sqmSize = numSize * 0.38;
//     const sqftSize = numSize * 0.46;

//     const edges = [];
//     for (let i = 0; i < pts.length; i++) {
//       const p1 = pts[i];
//       const p2 = pts[(i + 1) % pts.length];
//       const dx = p2[0] - p1[0];
//       const dy = p2[1] - p1[1];
//       const len = Math.hypot(dx, dy);
//       if (len < 0.8) continue;

//       const ux = dx / len;
//       const uy = dy / len;
//       const mx = (p1[0] + p2[0]) / 2;
//       const my = (p1[1] + p2[1]) / 2;

//       let nx = -uy;
//       let ny = ux;
//       if (nx * (mx - cx) + ny * (my - cy) < 0) {
//         nx = -nx;
//         ny = -ny;
//       }

//       const a = [p1[0] + nx * off, p1[1] + ny * off];
//       const b = [p2[0] + nx * off, p2[1] + ny * off];
//       const lx = mx + nx * (off + txt * 0.85);
//       const ly = my + ny * (off + txt * 0.85);

//       let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
//       if (deg > 90) deg -= 180;
//       if (deg < -90) deg += 180;

//       edges.push({
//         key: `edge-${i}`,
//         p1,
//         p2,
//         a,
//         b,
//         kx: nx * tick * 0.5,
//         ky: ny * tick * 0.5,
//         lx,
//         ly,
//         deg,
//         label: `${len.toFixed(2)} m`,
//       });
//     }

//     const areaNum = Number(raw.area) || 0;
//     const areaSqFt = Number(raw.areaSqFt) || areaNum * SQFT;

//     return {
//       cx,
//       cy,
//       txt,
//       hair,
//       numSize,
//       sqmSize,
//       sqftSize,
//       edges,
//       title: raw.type === "plot" ? raw.plotNo : raw.title,
//       sqmLabel: `${areaNum.toFixed(1)} m²`,
//       sqftLabel: `${Math.round(areaSqFt).toLocaleString("en-IN")} ft²`,
//     };
//   }, [feature]);

//   if (!geom) return null;
//   const {
//     cx,
//     cy,
//     txt,
//     hair,
//     numSize,
//     sqmSize,
//     sqftSize,
//     edges,
//     title,
//     sqmLabel,
//     sqftLabel,
//   } = geom;

//   return (
//     <g style={{ pointerEvents: "none" }}>
//       {edges.map((r) => (
//         <g key={r.key}>
//           <line
//             x1={r.p1[0]}
//             y1={r.p1[1]}
//             x2={r.a[0]}
//             y2={r.a[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair}
//             strokeDasharray={`${hair * 4} ${hair * 3}`}
//             opacity="0.78"
//           />
//           <line
//             x1={r.p2[0]}
//             y1={r.p2[1]}
//             x2={r.b[0]}
//             y2={r.b[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair}
//             strokeDasharray={`${hair * 4} ${hair * 3}`}
//             opacity="0.78"
//           />
//           <line
//             x1={r.a[0]}
//             y1={r.a[1]}
//             x2={r.b[0]}
//             y2={r.b[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.15}
//             strokeDasharray={`${hair * 5} ${hair * 3}`}
//             opacity="0.95"
//           />
//           <line
//             x1={r.a[0] - r.kx}
//             y1={r.a[1] - r.ky}
//             x2={r.a[0] + r.kx}
//             y2={r.a[1] + r.ky}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.5}
//           />
//           <line
//             x1={r.b[0] - r.kx}
//             y1={r.b[1] - r.ky}
//             x2={r.b[0] + r.kx}
//             y2={r.b[1] + r.ky}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.5}
//           />
//           <text
//             x={r.lx}
//             y={r.ly}
//             transform={`rotate(${r.deg} ${r.lx} ${r.ly})`}
//             textAnchor="middle"
//             dy="0.35em"
//             fontFamily={MONO}
//             fontSize={txt}
//             fontWeight="700"
//             fill="#FFFFFF"
//             stroke="#15181D"
//             strokeWidth={txt * 0.22}
//             paintOrder="stroke"
//           >
//             {r.label}
//           </text>
//         </g>
//       ))}

//       <text
//         x={cx}
//         y={cy - numSize * 0.52}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MAPFONT}
//         fontSize={numSize}
//         fontWeight="800"
//         fill="#FFFFFF"
//         stroke="rgba(21,24,29,0.65)"
//         strokeWidth={numSize * 0.12}
//         paintOrder="stroke"
//       >
//         {title}
//       </text>
//       <text
//         x={cx}
//         y={cy + numSize * 0.35}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MONO}
//         fontSize={sqmSize}
//         fontWeight="600"
//         fill="#F3E8FF"
//       >
//         {sqmLabel}
//       </text>
//       <text
//         x={cx}
//         y={cy + numSize * 0.92}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MONO}
//         fontSize={sqftSize}
//         fontWeight="700"
//         fill="#FFFFFF"
//       >
//         {sqftLabel}
//       </text>
//     </g>
//   );
// });

// /* ── Unified Masterplan SVG Content (from PlanContent.jsx) ─────────── */
// const MasterplanSvgContent = memo(function MasterplanSvgContent({
//   layout,
//   showStatus,
//   highlightKey,
//   editingKey,
//   opacityFor,
//   onPlotClick,
// }) {
//   const selectedFeature = useMemo(
//     () =>
//       highlightKey
//         ? layout.features.find((f) => f.key === highlightKey)
//         : null,
//     [layout, highlightKey],
//   );

//   return (
//     <g>
//       {/* Layout Boundary Base — Solid 100% Opaque Cement Color Matching Roads */}
//       {layout.boundaryD && (
//         <path
//           d={layout.boundaryD}
//           fill={ROAD_AND_BG_COLOR}
//           fillOpacity="1"
//           stroke={ACCENT}
//           strokeWidth="0.45"
//           strokeDasharray="1.8 1.2"
//           style={{ pointerEvents: "none" }}
//         />
//       )}

//       {/* All Polygons (Roads first, then Open Spaces, then Plots) */}
//       <g>
//         {layout.sorted.map((f) => {
//           if (editingKey && f.key === editingKey) return null;
//           const isSel = highlightKey === f.key;
//           const isRoad = f.raw.type === "road";
//           const st = styleForFeature(f.raw, showStatus);
//           // Roads stay 100% opaque so they blend seamlessly with the background
//           const baseAlpha = isRoad
//             ? 1
//             : highlightKey && !isSel
//               ? 0.52
//               : 0.96;
//           const alpha = opacityFor(f.raw, baseAlpha);

//           return (
//             <path
//               key={f.key}
//               className="plan-plot-shape"
//               d={f.d}
//               fill={isSel ? SELECTED_FILL : st.fill}
//               fillRule="evenodd"
//               fillOpacity={isSel ? 0.96 : alpha}
//               stroke={isSel ? SELECTED_STROKE : st.stroke}
//               strokeWidth={isSel ? 0.55 : st.sw}
//               strokeOpacity={isRoad ? 0 : alpha < 0.4 ? 0.35 : 0.95}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onPlotClick(f.raw);
//               }}
//             />
//           );
//         })}
//       </g>

//       {/* Plot Numbers Layer — Uniform Size Across All Plots */}
//       <g style={{ pointerEvents: "none" }}>
//         {layout.plotFeatures.map((f) => {
//           if (f.key === highlightKey || f.key === editingKey) return null;
//           if (!f.label) return null;
//           const st = styleForFeature(f.raw, showStatus);
//           const alpha = opacityFor(f.raw, highlightKey ? 0.55 : 1);

//           return (
//             <text
//               key={`num-${f.key}`}
//               x={f.cx}
//               y={f.cy}
//               textAnchor="middle"
//               dy="0.35em"
//               fontFamily={MAPFONT}
//               fontSize={f.fontSize}
//               fontWeight="700"
//               fill={st.ink}
//               fillOpacity={alpha < 0.4 ? 0.28 : alpha}
//             >
//               {f.label}
//             </text>
//           );
//         })}
//       </g>

//       {/* Road & Open Space Rotated Feature Labels */}
//       <g style={{ pointerEvents: "none" }}>
//         {layout.zoneFeatures.map((f) => {
//           if (!f.label) return null;
//           const isRoad = f.raw.type === "road";
//           const rl = isRoad ? f.roadLabel : null;
//           if (isRoad && !rl) return null; // no clear spot for this road's label
//           const size = rl
//             ? rl.size
//             : Math.min(Math.max(f.ir * 0.32, 1.15), 3.2);
//           if (size < 1.0) return null;
//           const lx = rl ? rl.x : f.cx;
//           const ly = rl ? rl.y : f.cy;
//           const lang = rl ? rl.angle : f.angle;
//           const alpha = opacityFor(f.raw, highlightKey ? 0.5 : 1);

//           return (
//             <g
//               key={`lbl-${f.key}`}
//               paintOrder="stroke"
//               stroke="rgba(15, 18, 24, 0.75)"
//               strokeWidth={size * 0.14}
//               transform={`rotate(${lang.toFixed(1)} ${lx.toFixed(2)} ${ly.toFixed(2)})`}
//               opacity={alpha < 0.4 ? 0.25 : alpha}
//             >
//               <text
//                 x={lx}
//                 y={isRoad ? ly : ly - size * 0.35}
//                 textAnchor="middle"
//                 dy="0.35em"
//                 fontFamily={SANS}
//                 fontSize={size}
//                 letterSpacing={isRoad ? "0.04em" : "0.06em"}
//                 fill="#F8FAFC"
//                 fontWeight="700"
//               >
//                 {f.label}
//               </text>
//               {!isRoad && f.raw.area > 120 && (
//                 <text
//                   x={lx}
//                   y={ly + size * 0.75}
//                   textAnchor="middle"
//                   dy="0.35em"
//                   fontFamily={MONO}
//                   fontSize={size * 0.64}
//                   fill="#E7E1D5"
//                   fontWeight="600"
//                 >
//                   {Math.round(f.raw.area).toLocaleString("en-IN")} m²
//                 </text>
//               )}
//             </g>
//           );
//         })}
//       </g>

//       {/* Raised Selected Plot + Engineering Dimensions */}
//       {selectedFeature && editingKey !== selectedFeature.key && (
//         <g style={{ pointerEvents: "none" }}>
//           <path
//             d={selectedFeature.d}
//             fill={SELECTED_FILL}
//             fillOpacity="0.94"
//             stroke={SELECTED_STROKE}
//             strokeWidth="0.65"
//           />
//           <SelectedDimensionOverlay feature={selectedFeature} />
//         </g>
//       )}
//     </g>
//   );
// });

// /* ── Main MapViewer Screen ─────────────────────────────────────────── */
// const PUBLIC_USER = { uid: "public", name: "Visitor", role: "guest" };

// export default function MapViewer({ publicView = false }) {
//   const { mapId } = useParams();
//   const { user } = useAuth();
//   const isPublic = publicView;
//   const viewer = isPublic ? PUBLIC_USER : user;
//   const hideStatus = isPublic;
//   const nav = useNavigate();
//   const toast = useToast();
//   const mapRef = useRef(null);
//   const flyRafRef = useRef(0);
//   const initialFitDoneRef = useRef(false);
//   const overlayPortalRef = useRef(null);
//   const compassNeedleRef = useRef(null);
//   const [, setOverlayReady] = useState(0);
//   const [mapReady, setMapReady] = useState(false);

//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
//     libraries: LIBRARIES,
//   });

//   const [mapDoc, setMapDoc] = useState(null);
//   const [plots, setPlots] = useState([]);
//   const [boundary, setBoundary] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [typeFilter, setTypeFilter] = useState("all");
//   const [category, setCategory] = useState(null);
//   const [query, setQuery] = useState("");
//   const [highlight, setHighlight] = useState(null);
//   const [selected, setSelected] = useState(null);
//   const [showAdv, setShowAdv] = useState(false);
//   const [adv, setAdv] = useState({
//     min: "",
//     max: "",
//     facing: "All",
//     status: "All",
//     unit: "m²",
//   });
//   const [advMatch, setAdvMatch] = useState(new Set());
//   const [showArea, setShowArea] = useState(false);
//   const [showShare, setShowShare] = useState(false);

//   // const [showStatus, setShowStatus] = useState(!hideStatus);
//   const [showStatus, setShowStatus] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [optionsFor, setOptionsFor] = useState(null);
//   const [deleteFor, setDeleteFor] = useState(null);
//   const [editing, setEditing] = useState(null);
//   const [points, setPoints] = useState([]);

//   useEffect(() => {
//     initialFitDoneRef.current = false;
//     getMap(mapId)
//       .then((m) => {
//         if (!m) return;
//         setMapDoc(m);
//         setPlots((m.plots ?? []).map((p) => plotFromDoc(p)));
//         setBoundary(
//           (m.layoutBoundary ?? []).map((p) => ({ lat: +p.lat, lng: +p.lng })),
//         );
//       })
//       .catch((e) => console.error("Error loading map data:", e))
//       .finally(() => setLoading(false));
//   }, [mapId]);

//   useEffect(() => () => cancelAnimationFrame(flyRafRef.current), []);

//   /* ── Share ── */
//   const shareUrl = `${window.location.origin}/share/${mapId}`;
//   const shareText = `${mapDoc?.name || "Layout"} — view the layout and plots`;
//   const copyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(shareUrl);
//     } catch {
//       const t = document.createElement("textarea");
//       t.value = shareUrl;
//       document.body.appendChild(t);
//       t.select();
//       document.execCommand("copy");
//       t.remove();
//     }
//     toast("Link copied", "success");
//   };
//   const nativeShare = () =>
//     navigator
//       .share({ title: shareText, text: shareText, url: shareUrl })
//       .catch(() => {});
//   const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

//   const statuses = useMemo(
//     () =>
//       hideStatus
//         ? ["All"]
//         : [
//             "All",
//             ...new Set(
//               plots
//                 .filter((p) => p.type === "plot" && p.status)
//                 .map((p) => p.status),
//             ),
//           ],
//     [plots, hideStatus],
//   );
//   const count = useCallback(
//     (t) => plots.filter((p) => p.type === t).length,
//     [plots],
//   );
//   const countStatus = useCallback(
//     (s) =>
//       plots.filter(
//         (p) => p.type === "plot" && (p.status || "").toLowerCase() === s,
//       ).length,
//     [plots],
//   );

//   /* Build local meter coordinate layout for the unified SVG overlay */
//   const layout = useMemo(() => {
//     const allPts = plots.length
//       ? plots.flatMap((p) => p.corners || [])
//       : boundary;
//     if (!allPts.length) return null;

//     const b = getBounds(allPts);
//     if (!b) return null;

//     const originLat = (b.north + b.south) / 2;
//     const originLng = (b.east + b.west) / 2;
//     const proj = createLocalProjection(originLat, originLng);

//     let minX = Infinity,
//       maxX = -Infinity,
//       minY = Infinity,
//       maxY = -Infinity;
//     const track = ([x, y]) => {
//       if (x < minX) minX = x;
//       if (x > maxX) maxX = x;
//       if (y < minY) minY = y;
//       if (y > maxY) maxY = y;
//     };

//     const boundaryPts = boundary.map((c) => {
//       const pt = proj.toMeters(c.lat, c.lng);
//       track(pt);
//       return pt;
//     });

//     const features = plots.map((p, idx) => {
//       const pts = (p.corners || []).map((c) => {
//         const pt = proj.toMeters(c.lat, c.lng);
//         track(pt);
//         return pt;
//       });
//       const { cx, cy, ir, angle } = computeFeatureMetrics(pts);
//       const label =
//         p.type === "plot" ? String(p.plotNo || "") : String(p.title || "");

//       return {
//         key: p.srNo || p.plotNo || `f-${idx}`,
//         raw: p,
//         pts,
//         d: ptsToPath(pts),
//         cx,
//         cy,
//         ir,
//         angle,
//         label,
//         // Every plot uses the same consistent font size
//         fontSize: UNIFORM_PLOT_FONT_SIZE,
//       };
//     });

//     // One clear, aligned label per road: no junction pile-ups, nothing over plots or other labels
//     const roadLabels = placeRoadLabels(
//       features
//         .map((f, i) => ({ key: i, pts: f.pts, label: f.label, type: f.raw.type }))
//         .filter((f) => f.type === "road"),
//       features.filter((f) => f.raw.type === "plot").map((f) => ({ pts: f.pts })),
//     );
//     features.forEach((f, i) => {
//       f.roadLabel = roadLabels.get(i) || null;
//     });

//     const orderScore = (t) => (t === "road" ? 0 : t === "plot" ? 2 : 1);
//     const sorted = [...features].sort(
//       (a, b) => orderScore(a.raw.type) - orderScore(b.raw.type),
//     );

//     const pad = 16;
//     const x0 = minX - pad;
//     const y0 = minY - pad;
//     const x1 = maxX + pad;
//     const y1 = maxY + pad;

//     return {
//       proj,
//       x0,
//       y0,
//       x1,
//       y1,
//       w: Math.max(1, x1 - x0),
//       h: Math.max(1, y1 - y0),
//       northWestLL: proj.toLatLng(x0, y0),
//       southEastLL: proj.toLatLng(x1, y1),
//       boundaryD: boundaryPts.length > 2 ? ptsToPath(boundaryPts) : "",
//       features,
//       sorted,
//       plotFeatures: features.filter((f) => f.raw.type === "plot"),
//       zoneFeatures: features.filter((f) => f.raw.type !== "plot"),
//     };
//   }, [plots, boundary]);

//   /* ── Smooth Camera Animation Helper (from PlanMap.jsx) ── */
//   const animateCameraTo = useCallback(
//     (aimCenter, aimZoom, durationMs = FLY_MS) => {
//       const m = mapRef.current;
//       if (!m || !aimCenter) return;

//       cancelAnimationFrame(flyRafRef.current);
//       const c0 = m.getCenter();
//       if (!c0) {
//         m.setCenter(aimCenter);
//         if (aimZoom != null) m.setZoom(aimZoom);
//         return;
//       }

//       const startLat = c0.lat();
//       const startLng = c0.lng();
//       const startZoom = m.getZoom() || 18;
//       const targetZoom = aimZoom != null ? aimZoom : startZoom;

//       m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });

//       const t0 = performance.now();
//       const step = (now) => {
//         const k = Math.min(1, (now - t0) / durationMs);
//         const e = easeOut(k);
//         const center = {
//           lat: startLat + (aimCenter.lat - startLat) * e,
//           lng: startLng + (aimCenter.lng - startLng) * e,
//         };
//         const zoom = startZoom + (targetZoom - startZoom) * e;

//         if (typeof m.moveCamera === "function") {
//           m.moveCamera({ center, zoom });
//         } else {
//           m.setCenter(center);
//           m.setZoom(zoom);
//         }

//         if (k < 1) {
//           flyRafRef.current = requestAnimationFrame(step);
//         } else {
//           overlayPortalRef.current?.overlay?.draw?.();
//         }
//       };
//       flyRafRef.current = requestAnimationFrame(step);
//     },
//     [],
//   );

//   /* ── Layout framing (single direct camera move: no fitBounds, no idle re-zoom) ── */
//   const fitAll = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     cancelAnimationFrame(flyRafRef.current);

//     const plotPts = plots
//       .filter((p) => p.type === "plot")
//       .flatMap((p) => p.corners || []);
//     const pts = plotPts.length
//       ? plotPts
//       : plots.length
//         ? plots.flatMap((p) => p.corners || [])
//         : boundary;

//     const b = getBounds(pts);
//     if (!b) return;

//     const vw = window.innerWidth;
//     const vh = window.innerHeight;
//     const pad =
//       vw < 600
//         ? { top: 82, right: 6, bottom: 48, left: 6 }
//         : vw < 1024
//           ? { top: 88, right: 10, bottom: 42, left: 10 }
//           : { top: 92, right: 12, bottom: 32, left: 12 };

//     const layoutCenter = {
//       lat: (b.north + b.south) / 2,
//       lng: (b.east + b.west) / 2,
//     };

//     // Zoom at which the layout exactly fits the free area, then go a bit closer.
//     const R = 6378137;
//     const cosLat = Math.cos((layoutCenter.lat * Math.PI) / 180);
//     const spanLatM = ((b.north - b.south) * Math.PI * R) / 180;
//     const spanLngM = ((b.east - b.west) * Math.PI * R * cosLat) / 180;
//     const availW = Math.max(vw - pad.left - pad.right, 120);
//     const availH = Math.max(vh - pad.top - pad.bottom, 120);
//     const world = 156543.03392 * cosLat; // metres per pixel at zoom 0
//     const mpp = Math.max(spanLngM / availW, spanLatM / availH, 0.01);
//     const fitZoom = Math.log2(world / mpp);
//     const zoom = clamp(
//       Math.max(fitZoom + LAYOUT_ZOOM_BOOST, LAYOUT_MIN_ZOOM),
//       15,
//       MAP_MAX_Z,
//     );

//     // The search bar takes more room at the top than the bottom, so nudge the
//     // camera north a little to keep the layout centred in the free area.
//     const shiftPx = (pad.top - pad.bottom) / 2;
//     const dLat = (shiftPx * (world / 2 ** zoom)) / 111320;
//     const target = { lat: layoutCenter.lat + dLat, lng: layoutCenter.lng };

//     m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });
//     if (typeof m.moveCamera === "function") {
//       m.moveCamera({ center: target, zoom });
//     } else {
//       m.setCenter(target);
//       m.setZoom(zoom);
//     }
//     overlayPortalRef.current?.overlay?.draw?.();
//   }, [plots, boundary]);

//   /* ── Calculate Ideal Zoom & Screen-Offset Frame for a Clicked Plot ── */
//   const flyToPlot = useCallback(
//     (plot, durationMs = FLY_MS, forceZoom = null) => {
//       const m = mapRef.current;
//       if (!m || !plot) return;

//       const corners = plot.corners || [];
//       const b = getBounds(corners);
//       const center =
//         plot.center ||
//         (b && {
//           lat: (b.north + b.south) / 2,
//           lng: (b.east + b.west) / 2,
//         });
//       if (!center) return;

//       let targetZoom = forceZoom;
//       if (targetZoom == null) {
//         const R = 6378137;
//         const cosLat = Math.cos((center.lat * Math.PI) / 180);
//         const spanLatM = b
//           ? ((b.north - b.south) * Math.PI * R) / 180
//           : Math.sqrt(plot.area || 150);
//         const spanLngM = b
//           ? ((b.east - b.west) * Math.PI * R * cosLat) / 180
//           : Math.sqrt(plot.area || 150);

//         const vw = window.innerWidth;
//         const vh = window.innerHeight;
//         const boost = vw < 640 ? 1.85 : vw < 1024 ? 1.6 : 1.45;
//         const gutterM = 6;

//         const needW = (spanLngM + gutterM * 2) * 1.05;
//         const needH = (spanLatM + gutterM * 2) * 1.05;

//         const availW = Math.max(vw - (vw > 640 ? 410 : 40), 180);
//         const availH = Math.max(vh - (vw <= 640 ? 300 : 150), 180);

//         const world = 156543.03392 * cosLat;
//         const mpp = Math.max(needW / availW, needH / availH) / boost;
//         targetZoom = clamp(Math.log2(world / mpp), FLY_MIN_Z, FLY_MAX_Z);
//       }

//       let aim = center;
//       const proj = m.getProjection?.();
//       if (proj && window.google?.maps) {
//         const vw = window.innerWidth;
//         const scale = 2 ** targetZoom;
//         const shiftPxX = vw > 640 ? 150 : 0;
//         const shiftPxY = vw <= 640 ? 95 : -15;
//         const pt = proj.fromLatLngToPoint(
//           new window.google.maps.LatLng(center.lat, center.lng),
//         );
//         if (pt) {
//           const shifted = proj.fromPointToLatLng(
//             new window.google.maps.Point(
//               pt.x + shiftPxX / scale,
//               pt.y + shiftPxY / scale,
//             ),
//           );
//           if (shifted) {
//             aim = { lat: shifted.lat(), lng: shifted.lng() };
//           }
//         }
//       }

//       animateCameraTo(aim, targetZoom, durationMs);
//     },
//     [animateCameraTo],
//   );

//   const nudgeZoom = useCallback(
//     (delta) => {
//       const m = mapRef.current;
//       if (!m) return;
//       const z0 = m.getZoom() || 19;
//       const z1 = clamp(z0 + delta, 15, MAP_MAX_Z);
//       if (selected) {
//         flyToPlot(selected, ZOOM_STEP_MS, z1);
//       } else {
//         animateCameraTo(
//           { lat: m.getCenter().lat(), lng: m.getCenter().lng() },
//           z1,
//           ZOOM_STEP_MS,
//         );
//       }
//     },
//     [selected, flyToPlot, animateCameraTo],
//   );

//   /* Mount custom Google Maps OverlayView hosting the unified SVG sheet */
//   const attachOverlay = useCallback(
//     (mapInstance) => {
//       if (!window.google?.maps || !layout) return;
//       if (overlayPortalRef.current?.overlay) {
//         overlayPortalRef.current.overlay.setMap(null);
//       }

//       const hostDiv = document.createElement("div");
//       hostDiv.style.position = "absolute";
//       hostDiv.style.pointerEvents = "auto";
//       hostDiv.style.willChange = "transform, width, height, left, top";

//       class MasterplanOverlay extends window.google.maps.OverlayView {
//         onAdd() {
//           const panes = this.getPanes();
//           panes.overlayMouseTarget.appendChild(hostDiv);
//         }
//         draw() {
//           const proj = this.getProjection();
//           if (!proj) return;
//           const nw = proj.fromLatLngToDivPixel(
//             new window.google.maps.LatLng(
//               layout.northWestLL.lat,
//               layout.northWestLL.lng,
//             ),
//           );
//           const se = proj.fromLatLngToDivPixel(
//             new window.google.maps.LatLng(
//               layout.southEastLL.lat,
//               layout.southEastLL.lng,
//             ),
//           );
//           if (!nw || !se) return;
//           const left = Math.min(nw.x, se.x);
//           const top = Math.min(nw.y, se.y);
//           const width = Math.max(1, Math.abs(se.x - nw.x));
//           const height = Math.max(1, Math.abs(se.y - nw.y));

//           hostDiv.style.left = `${left}px`;
//           hostDiv.style.top = `${top}px`;
//           hostDiv.style.width = `${width}px`;
//           hostDiv.style.height = `${height}px`;
//         }
//         onRemove() {
//           if (hostDiv.parentNode) hostDiv.parentNode.removeChild(hostDiv);
//         }
//       }

//       const ov = new MasterplanOverlay();
//       ov.setMap(mapInstance);
//       overlayPortalRef.current = { overlay: ov, div: hostDiv };
//       setOverlayReady((n) => n + 1);
//     },
//     [layout],
//   );

//   const onLoad = useCallback(
//     (m) => {
//       mapRef.current = m;
//       m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });
//       attachOverlay(m);
//       setMapReady(true); // triggers the one-time initial fit once the layout is also ready
//     },
//     [attachOverlay],
//   );

//   useEffect(() => {
//     if (isLoaded && mapReady && mapRef.current && layout) {
//       attachOverlay(mapRef.current);
//       if (!initialFitDoneRef.current) {
//         initialFitDoneRef.current = true;
//         fitAll(); // exactly once per map, when both the map and the layout exist
//       }
//     }
//     return () => {
//       if (overlayPortalRef.current?.overlay) {
//         overlayPortalRef.current.overlay.setMap(null);
//       }
//     };
//   }, [isLoaded, mapReady, layout, attachOverlay, fitAll]);

//   const onIdle = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     if (compassNeedleRef.current) {
//       const h = m.getHeading?.() || 0;
//       compassNeedleRef.current.style.transform = `rotate(${-h}deg)`;
//     }
//   }, []);

//   const resetNorth = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     if (typeof m.moveCamera === "function") {
//       m.moveCamera({ heading: 0, tilt: 0 });
//     }
//     setSelected(null);
//     setHighlight(null);
//     fitAll();
//   }, [fitAll]);

//   const opacityFor = useCallback(
//     (p, base) => {
//       let o = base;
//       if (advMatch.size && p.type === "plot" && !advMatch.has(p.srNo)) o = 0.14;
//       if (typeFilter === "plot" && p.type !== "plot") o = 0.16;
//       if (typeFilter === "road" && p.type !== "road") o = 0.16;
//       if (typeFilter === "open_space" && p.type !== "open_space") o = 0.16;
//       if (typeFilter === "amenity" && !isAmenity(p)) o = 0.16;
//       if (
//         typeFilter === "category" &&
//         (p.type !== "plot" || p.status !== category)
//       )
//         o = 0.16;
//       return o;
//     },
//     [advMatch, typeFilter, category],
//   );

//   /* ── Click Plot -> Highlight, Open Sheet & Smoothly Fly/Zoom Into Plot ── */
//   const onPlotClick = useCallback(
//     (p) => {
//       if (editing) return;
//       if (editMode) return setOptionsFor(p);
//       setHighlight(p);
//       setSelected(p);
//       flyToPlot(p, FLY_MS);
//     },
//     [editing, editMode, flyToPlot],
//   );

//   // ── search ──
//   const doSearch = () => {
//     const q = query.trim().toLowerCase();
//     if (!q) return setHighlight(null);
//     const hit = plots.find(
//       (p) =>
//         (p.plotNo || "").toLowerCase() === q ||
//         (p.srNo || "").toLowerCase() === q ||
//         (p.title || "").toLowerCase().includes(q),
//     );
//     if (!hit) return toast("No match found", "error");
//     setHighlight(hit);
//     setSelected(hit);
//     flyToPlot(hit, FLY_MS);
//   };

//   // ── advanced filter ──
//   const applyAdv = () => {
//     let minA = parseFloat(adv.min);
//     let maxA = parseFloat(adv.max);
//     if (!isNaN(minA) && !isNaN(maxA) && minA > maxA) {
//       [minA, maxA] = [maxA, minA];
//     }
//     const isFt = adv.unit === "ft²";
//     const hasArea = !isNaN(minA) || !isNaN(maxA);
//     if (!hasArea && adv.facing === "All" && adv.status === "All") {
//       setAdvMatch(new Set());
//       setShowAdv(false);
//       return;
//     }
//     const matched = plots.filter((p) => {
//       if (p.type !== "plot") return false;
//       const val = isFt ? p.areaSqFt || p.area * SQFT : p.area;
//       if (!isNaN(minA) && val < minA) return false;
//       if (!isNaN(maxA) && val > maxA) return false;
//       if (
//         adv.facing !== "All" &&
//         !(p.facing || "").toLowerCase().includes(adv.facing.toLowerCase())
//       )
//         return false;
//       if (adv.status !== "All" && p.status !== adv.status) return false;
//       return true;
//     });
//     setAdvMatch(new Set(matched.map((p) => p.srNo)));
//     setShowAdv(false);
//     const b = getBounds(matched.flatMap((p) => p.corners));
//     if (b)
//       mapRef.current?.fitBounds(
//         { south: b.south, north: b.north, west: b.west, east: b.east },
//         { top: 96, right: 24, bottom: 64, left: 24 },
//       );
//   };

//   const clearAdv = () => {
//     setAdv({ min: "", max: "", facing: "All", status: "All", unit: "m²" });
//     setAdvMatch(new Set());
//   };

//   // ── edit mode (admin) ──
//   const persist = async (nextPlots) => {
//     await updateMapPlots(mapId, nextPlots, boundary);
//     setPlots(nextPlots);
//   };
//   const savePlotEdits = async () => {
//     if (!editing || points.length < 3)
//       return toast("Need at least 3 points", "error");
//     try {
//       const updated = {
//         ...editing,
//         corners: points,
//         area: calculatePolygonArea(points),
//         center: getPolygonCenter(points),
//       };
//       await persist(plots.map((p) => (p.srNo === editing.srNo ? updated : p)));
//       setEditing(null);
//       setPoints([]);
//       toast("Plot updated", "success");
//     } catch (e) {
//       toast(`Error: ${e.message}`, "error");
//     }
//   };
//   const deletePlot = async () => {
//     const p = deleteFor;
//     setDeleteFor(null);
//     try {
//       await persist(plots.filter((x) => x.srNo !== p.srNo));
//       toast(`${p.plotNo} deleted`, "success");
//     } catch (e) {
//       toast(`Error: ${e.message}`, "error");
//     }
//   };

//   const highlightKey = highlight ? highlight.srNo || highlight.plotNo : null;
//   const editingKey = editing ? editing.srNo || editing.plotNo : null;

//   if (loading) return <Spinner />;
//   if (loadError)
//     return (
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           display: "grid",
//           placeItems: "center",
//           background: "#0B0E13",
//           color: "#E68A72",
//           fontFamily: MONO,
//           padding: 24,
//           textAlign: "center",
//         }}
//       >
//         <div>
//           <h3 style={{ color: INK, marginBottom: 8 }}>
//             Google Maps failed to load
//           </h3>
//           <p style={{ color: MUTED, fontSize: 13 }}>
//             Check VITE_GOOGLE_MAPS_API_KEY and disable any ad-blocker.
//           </p>
//         </div>
//       </div>
//     );

//   const center = plots[0]?.center ??
//     boundary[0] ?? { lat: 21.1458, lng: 79.0882 };

//   return (
//     <div className="ref-map-page">
//       <style>{`
//         .ref-map-page {
//           position: relative;
//           width: 100vw;
//           height: 100vh;
//           overflow: hidden;
//           background: #0B0E13;
//           font-family: ${SANS};
//           color: ${INK};
//           user-select: none;
//         }
//         path.plan-plot-shape {
//           cursor: pointer;
//           transition: fill-opacity 120ms ease, stroke-width 120ms ease;
//         }
//         path.plan-plot-shape:hover {
//           fill-opacity: 0.78;
//         }
//         .ref-hud-top {
//           position: absolute;
//           top: 14px;
//           left: 14px;
//           right: 14px;
//           z-index: 10;
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//           pointer-events: none;
//         }
//         .ref-topbar {
//           pointer-events: auto;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 10px 14px;
//           background: ${CANVAS};
//           backdrop-filter: blur(16px);
//           -webkit-backdrop-filter: blur(16px);
//           border: 1px solid ${HAIR};
//           border-radius: 14px;
//           box-shadow: 0 18px 42px rgba(0, 0, 0, 0.52);
//           flex-wrap: wrap;
//         }
//         .ref-icon-btn {
//           width: 38px;
//           height: 38px;
//           border-radius: 10px;
//           background: rgba(255, 255, 255, 0.03);
//           border: 1px solid ${HAIR};
//           color: ${INK};
//           display: grid;
//           place-items: center;
//           cursor: pointer;
//           transition: border-color 150ms ease, color 150ms ease, transform 120ms ease;
//           flex-shrink: 0;
//         }
//         .ref-icon-btn:hover {
//           border-color: ${ACCENT};
//           color: ${ACCENT};
//         }
//         .ref-icon-btn.active {
//           background: ${ACCENT};
//           border-color: ${ACCENT};
//           color: #15181D;
//         }
//         .ref-search {
//           flex: 1;
//           min-width: 200px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid ${HAIR};
//           border-radius: 10px;
//           padding: 4px 6px 4px 12px;
//         }
//         .ref-search:focus-within {
//           border-color: ${ACCENT};
//         }
//         .ref-search input {
//           flex: 1;
//           background: transparent;
//           border: none;
//           outline: none;
//           color: ${INK};
//           font: 400 13px/1 ${MONO};
//           padding: 6px 0;
//         }
//         .ref-search input::placeholder {
//           color: ${MUTED};
//         }
//         .ref-find-btn {
//           font: 600 12px/1 ${MONO};
//           background: ${ACCENT};
//           color: #15181D;
//           border: none;
//           border-radius: 7px;
//           padding: 7px 12px;
//           cursor: pointer;
//         }
//         .ref-chips-row {
//           pointer-events: auto;
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           overflow-x: auto;
//           scrollbar-width: none;
//           padding-bottom: 2px;
//         }
//         .ref-chips-row::-webkit-scrollbar { display: none; }
//         .ref-pill {
//           font: 500 12px/1 ${MONO};
//           color: ${INK};
//           background: ${PANEL};
//           border: 1px solid ${HAIR};
//           border-radius: 999px;
//           padding: 9px 13px;
//           cursor: pointer;
//           white-space: nowrap;
//           box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
//           transition: all 150ms ease;
//         }
//         .ref-pill:hover {
//           border-color: ${ACCENT};
//         }
//         .ref-pill.on {
//           color: #15181D;
//           background: ${ACCENT};
//           border-color: ${ACCENT};
//           font-weight: 700;
//         }
//       `}</style>

//       {/* ── Google Map Base Canvas ── */}
//       <GoogleMap
//         mapContainerStyle={{ position: "absolute", inset: 0 }}
//         center={center}
//         zoom={18.5}
//         onLoad={onLoad}
//         onIdle={onIdle}
//         options={{
//           mapTypeId: "hybrid",
//           isFractionalZoomEnabled: true,
//           streetViewControl: false,
//           fullscreenControl: false,
//           mapTypeControl: false,
//           rotateControl: false,
//           zoomControl: false,
//           gestureHandling: "greedy",
//           maxZoom: MAP_MAX_Z,
//           backgroundColor: "#0B0E13",
//         }}
//         onClick={(e) => {
//           if (editing) {
//             setPoints((p) => [
//               ...p,
//               { lat: e.latLng.lat(), lng: e.latLng.lng() },
//             ]);
//           } else if (selected || highlight) {
//             setHighlight(null);
//             setSelected(null);
//           }
//         }}
//       >
//         {/* Admin Polygon Vertex Editor (Active only while editing a boundary) */}
//         {editing && (
//           <>
//             <PolygonF
//               paths={points}
//               options={{
//                 fillColor: ACCENT,
//                 fillOpacity: 0.35,
//                 strokeColor: ACCENT,
//                 strokeWeight: 3,
//                 clickable: false,
//                 zIndex: 30,
//               }}
//             />
//             {points.map((pt, i) => (
//               <MarkerF
//                 key={i}
//                 position={pt}
//                 draggable
//                 zIndex={40}
//                 onDragEnd={(e) =>
//                   setPoints((ps) =>
//                     ps.map((p, j) =>
//                       j === i
//                         ? { lat: e.latLng.lat(), lng: e.latLng.lng() }
//                         : p,
//                     ),
//                   )
//                 }
//                 onRightClick={() =>
//                   setPoints((ps) => ps.filter((_, j) => j !== i))
//                 }
//               />
//             ))}
//           </>
//         )}
//       </GoogleMap>

//       {/* ── Unified Masterplan SVG Portal ── */}
//       {overlayPortalRef.current?.div &&
//         layout &&
//         createPortal(
//           <svg
//             viewBox={`${layout.x0} ${layout.y0} ${layout.w} ${layout.h}`}
//             width="100%"
//             height="100%"
//             preserveAspectRatio="none"
//             style={{
//               display: "block",
//               width: "100%",
//               height: "100%",
//               overflow: "visible",
//             }}
//           >
//             <MasterplanSvgContent
//               layout={layout}
//               showStatus={showStatus}
//               highlightKey={highlightKey}
//               editingKey={editingKey}
//               opacityFor={opacityFor}
//               onPlotClick={onPlotClick}
//             />
//           </svg>,
//           overlayPortalRef.current.div,
//         )}

//       {/* ── Top Architectural Bar + Category Pills ── */}
//       <div className="ref-hud-top">
//         <div className="ref-topbar">
//           {!isPublic && (
//             <button
//               className="ref-icon-btn"
//               onClick={() => nav(-1)}
//               title="Back"
//             >
//               <ArrowLeft size={18} />
//             </button>
//           )}

//           <div style={{ minWidth: 140 }}>
//             <div
//               style={{
//                 fontFamily: MONO,
//                 fontSize: 10,
//                 letterSpacing: "0.1em",
//                 textTransform: "uppercase",
//                 color: ACCENT,
//               }}
//             >
//               MASTERPLAN
//             </div>
//             <div
//               style={{
//                 fontSize: 15,
//                 fontWeight: 700,
//                 color: INK,
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 maxWidth: 240,
//               }}
//             >
//               {mapDoc?.name || "Layout Map"}
//             </div>
//           </div>

//           <div className="ref-search">
//             <Search size={15} color={MUTED} />
//             <input
//               placeholder="Search plot no / sr no / title…"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && doSearch()}
//             />
//             {query && (
//               <button
//                 onClick={() => {
//                   setQuery("");
//                   setHighlight(null);
//                   setSelected(null);
//                 }}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: MUTED,
//                   cursor: "pointer",
//                   display: "grid",
//                   placeItems: "center",
//                 }}
//               >
//                 <X size={14} />
//               </button>
//             )}
//             <button className="ref-find-btn" onClick={doSearch}>
//               Find
//             </button>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <button
//               className={`ref-icon-btn ${showAdv || advMatch.size > 0 ? "active" : ""}`}
//               title="Filters"
//               onClick={() => setShowAdv(!showAdv)}
//             >
//               <SlidersHorizontal size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Fit Full Layout"
//               onClick={() => {
//                 setSelected(null);
//                 setHighlight(null);
//                 fitAll();
//               }}
//             >
//               <Maximize2 size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Area Details"
//               onClick={() => setShowArea(true)}
//             >
//               <Info size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Share"
//               onClick={() => setShowShare(true)}
//             >
//               <Share2 size={17} />
//             </button>

//             {isAdmin(user) && (
//               <button
//                 className={`ref-icon-btn ${editMode ? "active" : ""}`}
//                 title={editMode ? "Done Editing" : "Edit Layout"}
//                 onClick={() => {
//                   setEditMode(!editMode);
//                   toast(editMode ? "Edit mode OFF" : "Edit mode ON");
//                 }}
//               >
//                 {editMode ? <Check size={17} /> : <Pencil size={17} />}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Category Filter Pills */}
//         <div className="ref-chips-row">
//           {[
//             ["all", `All (${plots.length})`],
//             ["plot", `Plots (${count("plot")})`],
//             ["road", `Roads (${count("road")})`],
//             ["open_space", `Open Spaces (${count("open_space")})`],
//             ["amenity", "Amenities"],
//           ].map(([k, l]) => (
//             <button
//               key={k}
//               className={`ref-pill ${typeFilter === k ? "on" : ""}`}
//               onClick={() => {
//                 setTypeFilter(k);
//                 setCategory(null);
//               }}
//             >
//               {l}
//             </button>
//           ))}
//           {statuses
//             .filter((s) => s !== "All")
//             .map((s) => (
//               <button
//                 key={s}
//                 className={`ref-pill ${typeFilter === "category" && category === s ? "on" : ""}`}
//                 onClick={() => {
//                   setTypeFilter("category");
//                   setCategory(s);
//                 }}
//               >
//                 {s} ({countStatus(s.toLowerCase())})
//               </button>
//             ))}
//         </div>
//       </div>

//       {/* ── Reference Staged FilterPanel (from FilterPanel.jsx) ── */}
//       {showAdv && (
//         <div
//           role="dialog"
//           aria-label="Filter plots"
//           onPointerDown={(e) => e.stopPropagation()}
//           style={{
//             position: "absolute",
//             top: 122,
//             left: 14,
//             zIndex: 12,
//             width: 320,
//             maxWidth: "calc(100vw - 28px)",
//             maxHeight: "calc(100vh - 150px)",
//             display: "flex",
//             flexDirection: "column",
//             background: CANVAS,
//             backdropFilter: "blur(16px)",
//             WebkitBackdropFilter: "blur(16px)",
//             border: `1px solid ${HAIR}`,
//             borderRadius: 14,
//             boxShadow: "0 22px 54px rgba(0, 0, 0, 0.55)",
//             overflow: "hidden",
//           }}
//         >
//           <header
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: "14px 16px 11px",
//               borderBottom: `1px solid ${HAIR}`,
//             }}
//           >
//             <div
//               style={{
//                 fontFamily: SANS,
//                 fontSize: 13,
//                 fontWeight: 600,
//                 letterSpacing: "0.08em",
//                 textTransform: "uppercase",
//                 color: ACCENT,
//               }}
//             >
//               Filters
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               {advMatch.size > 0 && (
//                 <span
//                   style={{
//                     fontFamily: MONO,
//                     fontSize: 11,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.06)",
//                     padding: "4px 8px",
//                     borderRadius: 6,
//                   }}
//                 >
//                   {advMatch.size} matched
//                 </span>
//               )}
//               <button
//                 onClick={() => setShowAdv(false)}
//                 style={{
//                   font: `400 18px/1 ${MONO}`,
//                   color: MUTED,
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 &times;
//               </button>
//             </div>
//           </header>

//           <div
//             style={{
//               display: "grid",
//               gap: 16,
//               padding: 16,
//               overflowY: "auto",
//             }}
//           >
//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Area Range ({adv.unit})
//               </div>
//               <div style={{ display: "flex", gap: 7 }}>
//                 {["m²", "ft²"].map((u) => (
//                   <button
//                     key={u}
//                     type="button"
//                     onClick={() => setAdv({ ...adv, unit: u })}
//                     style={{
//                       font: `500 12px/1 ${MONO}`,
//                       color: adv.unit === u ? "#15181D" : INK,
//                       background:
//                         adv.unit === u ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                       border: `1px solid ${adv.unit === u ? ACCENT : HAIR}`,
//                       borderRadius: 999,
//                       padding: "7px 13px",
//                       cursor: "pointer",
//                     }}
//                   >
//                     {u}
//                   </button>
//                 ))}
//               </div>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr auto 1fr",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 <input
//                   type="number"
//                   placeholder="Min"
//                   value={adv.min}
//                   onChange={(e) => setAdv({ ...adv, min: e.target.value })}
//                   style={{
//                     font: `400 13px/1 ${MONO}`,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.03)",
//                     border: `1px solid ${HAIR}`,
//                     borderRadius: 9,
//                     padding: "10px",
//                     width: "100%",
//                     boxSizing: "border-box",
//                     outline: "none",
//                   }}
//                 />
//                 <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
//                   to
//                 </span>
//                 <input
//                   type="number"
//                   placeholder="Max"
//                   value={adv.max}
//                   onChange={(e) => setAdv({ ...adv, max: e.target.value })}
//                   style={{
//                     font: `400 13px/1 ${MONO}`,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.03)",
//                     border: `1px solid ${HAIR}`,
//                     borderRadius: 9,
//                     padding: "10px",
//                     width: "100%",
//                     boxSizing: "border-box",
//                     outline: "none",
//                   }}
//                 />
//               </div>
//             </div>

//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Facing
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                 {FACINGS.map((f) => {
//                   const on = adv.facing === f;
//                   return (
//                     <button
//                       key={f}
//                       type="button"
//                       onClick={() => setAdv({ ...adv, facing: f })}
//                       style={{
//                         font: `500 12px/1 ${MONO}`,
//                         color: on ? "#15181D" : INK,
//                         background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                         border: `1px solid ${on ? ACCENT : HAIR}`,
//                         borderRadius: 999,
//                         padding: "8px 12px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {f}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Status
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                 {statuses.map((s) => {
//                   const on = adv.status === s;
//                   return (
//                     <button
//                       key={s}
//                       type="button"
//                       onClick={() => setAdv({ ...adv, status: s })}
//                       style={{
//                         font: `500 12px/1 ${MONO}`,
//                         color: on ? "#15181D" : INK,
//                         background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                         border: `1px solid ${on ? ACCENT : HAIR}`,
//                         borderRadius: 999,
//                         padding: "8px 12px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {s}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           <footer
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1.5fr",
//               gap: 9,
//               padding: 12,
//               borderTop: `1px solid ${HAIR}`,
//             }}
//           >
//             <button
//               type="button"
//               onClick={clearAdv}
//               style={{
//                 font: `500 13px/1 ${MONO}`,
//                 color: INK,
//                 background: "transparent",
//                 border: `1px solid ${HAIR}`,
//                 borderRadius: 10,
//                 padding: "11px 0",
//                 cursor: "pointer",
//               }}
//             >
//               Clear
//             </button>
//             <button
//               type="button"
//               onClick={applyAdv}
//               style={{
//                 font: `600 13px/1 ${MONO}`,
//                 color: "#15181D",
//                 background: ACCENT,
//                 border: `1px solid ${ACCENT}`,
//                 borderRadius: 10,
//                 padding: "11px 0",
//                 cursor: "pointer",
//               }}
//             >
//               Apply
//             </button>
//           </footer>
//         </div>
//       )}

//       {/* ── Live North Compass & Zoom Controls (from PlanMap.jsx) ── */}
//       <div
//         style={{
//           position: "absolute",
//           zIndex: 8,
//           right: 14,
//           top: 122,
//           display: "flex",
//           flexDirection: "column",
//           gap: 8,
//           alignItems: "center",
//         }}
//       >
//         <button
//           type="button"
//           title="Face north & fit layout"
//           onClick={resetNorth}
//           style={{
//             width: 44,
//             height: 44,
//             display: "grid",
//             placeItems: "center",
//             padding: 0,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 22,
//             cursor: "pointer",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           <svg width="26" height="26" viewBox="-13 -13 26 26">
//             <g
//               ref={compassNeedleRef}
//               style={{ transformOrigin: "50% 50%", willChange: "transform" }}
//             >
//               <path d="M0 -9 L4.5 1.5 L0 -0.8 Z" fill={ACCENT} />
//               <path
//                 d="M0 -9 L-4.5 1.5 L0 -0.8 Z"
//                 fill={ACCENT}
//                 fillOpacity="0.55"
//               />
//               <path d="M0 9 L4.5 -1.5 L0 0.8 Z" fill={HAIR} />
//               <path
//                 d="M0 9 L-4.5 -1.5 L0 0.8 Z"
//                 fill={HAIR}
//                 fillOpacity="0.55"
//               />
//             </g>
//             <text
//               x="0"
//               y="-9.5"
//               textAnchor="middle"
//               fill={INK}
//               fontFamily={MONO}
//               fontSize="7"
//               fontWeight="700"
//             >
//               N
//             </text>
//           </svg>
//         </button>

//         {/* Zoom + / - / Re-center Plot controls */}
//         <button
//           type="button"
//           title="Zoom in"
//           onClick={() => nudgeZoom(ZOOM_STEP)}
//           style={{
//             width: 42,
//             height: 42,
//             font: `500 18px/1 ${MONO}`,
//             color: INK,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             cursor: "pointer",
//             display: "grid",
//             placeItems: "center",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           +
//         </button>
//         <button
//           type="button"
//           title="Zoom out"
//           onClick={() => nudgeZoom(-ZOOM_STEP)}
//           style={{
//             width: 42,
//             height: 42,
//             font: `500 18px/1 ${MONO}`,
//             color: INK,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             cursor: "pointer",
//             display: "grid",
//             placeItems: "center",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           −
//         </button>
//         {selected && (
//           <button
//             type="button"
//             title="Refit selected plot"
//             onClick={() => flyToPlot(selected, 320)}
//             style={{
//               width: 42,
//               height: 42,
//               font: `500 16px/1 ${MONO}`,
//               color: ACCENT,
//               background: CANVAS,
//               border: `1px solid ${ACCENT}`,
//               borderRadius: 12,
//               cursor: "pointer",
//               display: "grid",
//               placeItems: "center",
//               boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//             }}
//           >
//             ⌂
//           </button>
//         )}
//       </div>

//       {/* ── Admin Polygon Editing Banner ── */}
//       {editing && (
//         <div
//           style={{
//             position: "absolute",
//             bottom: 74,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 15,
//             display: "flex",
//             alignItems: "center",
//             gap: 14,
//             padding: "12px 18px",
//             background: CANVAS,
//             backdropFilter: "blur(16px)",
//             border: `1px solid ${ACCENT}`,
//             borderRadius: 14,
//             boxShadow: "0 20px 44px rgba(0,0,0,0.6)",
//             fontFamily: MONO,
//             fontSize: 12,
//           }}
//         >
//           <span>
//             Points: <b style={{ color: ACCENT }}>{points.length}</b> · click map
//             to add, right-click vertex to remove
//           </span>
//           <button
//             onClick={savePlotEdits}
//             style={{
//               font: `600 12px/1 ${MONO}`,
//               background: ACCENT,
//               color: "#15181D",
//               border: "none",
//               borderRadius: 8,
//               padding: "8px 14px",
//               cursor: "pointer",
//             }}
//           >
//             Save
//           </button>
//           <button
//             onClick={() => {
//               setEditing(null);
//               setPoints([]);
//             }}
//             style={{
//               font: `500 12px/1 ${MONO}`,
//               background: "transparent",
//               color: INK,
//               border: `1px solid ${HAIR}`,
//               borderRadius: 8,
//               padding: "8px 12px",
//               cursor: "pointer",
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       )}

//       {/* ── Bottom-Left StatusLegend (from Statuslegend.jsx) ── */}
//       {showStatus && (
//         <div
//           style={{
//             position: "absolute",
//             left: 14,
//             bottom: 14,
//             zIndex: 8,
//             display: "flex",
//             flexWrap: "wrap",
//             alignItems: "center",
//             gap: "10px 14px",
//             padding: "10px 14px",
//             background: PANEL,
//             backdropFilter: "blur(14px)",
//             WebkitBackdropFilter: "blur(14px)",
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             boxShadow: "0 10px 30px rgba(0, 0, 0, 0.38)",
//             maxWidth: "calc(100vw - 220px)",
//           }}
//         >
//           {[
//             ["#56B870", "Available", countStatus("available")],
//             ["#F59E0B", "Booked", countStatus("booked")],
//             ["#EF4444", "Sold", countStatus("sold")],
//             ["#E7D055", "Premium", null],
//             ["#FB923C", "Featured", null],
//             ["#2E7D32", "Open Space", count("open_space")],
//             ["#D9468F", "Amenity", null],
//             [ROAD_AND_BG_COLOR, "Road", count("road")],
//           ].map(([dot, label, cnt]) => (
//             <div
//               key={label}
//               style={{ display: "flex", alignItems: "center", gap: 7 }}
//             >
//               <span
//                 style={{
//                   width: 11,
//                   height: 11,
//                   borderRadius: 3,
//                   background: dot,
//                   border: `1px solid ${HAIR}`,
//                 }}
//               />
//               <span
//                 style={{
//                   font: `500 12px/1 ${MONO}`,
//                   color: INK,
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {label}
//               </span>
//               {cnt !== null && cnt > 0 && (
//                 <span
//                   style={{
//                     font: `500 11px/1 ${MONO}`,
//                     color: MUTED,
//                     background: "rgba(255, 255, 255, 0.06)",
//                     padding: "3px 6px",
//                     borderRadius: 5,
//                   }}
//                 >
//                   {cnt}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Bottom-Right Status toggle ── */}
//       <div
//         style={{
//           position: "absolute",
//           right: 14,
//           bottom: 14,
//           zIndex: 8,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "flex-end",
//           gap: 8,
//         }}
//       >
//         {[
//           ...(hideStatus ? [] : [["Status", showStatus, setShowStatus]]),
//         ].map(([label, on, toggle]) => (
//           <button
//             key={label}
//             type="button"
//             role="switch"
//             aria-checked={on}
//             onClick={() => toggle(!on)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//               font: `500 13px/1 ${MONO}`,
//               color: INK,
//               background: PANEL,
//               backdropFilter: "blur(14px)",
//               WebkitBackdropFilter: "blur(14px)",
//               border: `1px solid ${HAIR}`,
//               borderRadius: 12,
//               padding: "9px 13px",
//               cursor: "pointer",
//               boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
//             }}
//           >
//             <span>{label}</span>
//             <span
//               style={{
//                 width: 42,
//                 height: 22,
//                 borderRadius: 999,
//                 background: on ? "#7CB342" : "rgba(255, 255, 255, 0.20)",
//                 position: "relative",
//                 transition: "background 180ms ease",
//               }}
//             >
//               <span
//                 style={{
//                   position: "absolute",
//                   top: 2,
//                   left: 2,
//                   width: 18,
//                   height: 18,
//                   borderRadius: "50%",
//                   background: "#FFFFFF",
//                   transform: on ? "translateX(20px)" : "translateX(0px)",
//                   transition: "transform 180ms ease",
//                 }}
//               />
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* ── Selected Plot Inspector Sheet ── */}
//       {selected && (
//         <PlotViewSheet
//           plot={hideStatus ? { ...selected, status: "" } : selected}
//           mapId={mapId}
//           mapName={mapDoc?.name ?? ""}
//           user={viewer}
//           onClose={() => {
//             setSelected(null);
//             setHighlight(null);
//           }}
//         />
//       )}

//       {/* ── Admin Options Modal ── */}
//       {optionsFor && (
//         <Modal
//           title={`Plot ${optionsFor.plotNo || optionsFor.title}`}
//           onClose={() => setOptionsFor(null)}
//         >
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             <button
//               className="btn ghost"
//               onClick={() => {
//                 setEditing(optionsFor);
//                 setPoints(optionsFor.corners);
//                 setOptionsFor(null);
//                 toast(
//                   "Click map to add points. Right-click a point to remove.",
//                 );
//               }}
//             >
//               <Pencil size={15} /> Edit Boundary
//             </button>
//             <button
//               className="btn ghost"
//               onClick={() => {
//                 setSelected(optionsFor);
//                 setHighlight(optionsFor);
//                 setOptionsFor(null);
//                 flyToPlot(optionsFor, FLY_MS);
//               }}
//             >
//               <Eye size={15} /> View Details
//             </button>
//             <button
//               className="btn danger"
//               onClick={() => {
//                 setDeleteFor(optionsFor);
//                 setOptionsFor(null);
//               }}
//             >
//               <Trash2 size={15} /> Delete Plot
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* ── Delete Confirmation Modal ── */}
//       {deleteFor && (
//         <Modal
//           title="Delete Plot"
//           onClose={() => setDeleteFor(null)}
//           actions={
//             <>
//               <button className="btn text" onClick={() => setDeleteFor(null)}>
//                 Cancel
//               </button>
//               <button className="btn danger" onClick={deletePlot}>
//                 Delete
//               </button>
//             </>
//           }
//         >
//           Delete {deleteFor.plotNo}?
//         </Modal>
//       )}

//       {/* ── Area Telemetry Modal ── */}
//       {showArea && (
//         <Modal
//           title="Area Details"
//           onClose={() => setShowArea(false)}
//           actions={
//             <button className="btn" onClick={() => setShowArea(false)}>
//               Close
//             </button>
//           }
//         >
//           {[
//             ["Total Area", mapDoc?.totalArea ?? "0"],
//             ["Total Plots", mapDoc?.totalPlots ?? count("plot")],
//             ["Total Roads", mapDoc?.totalRoads ?? count("road")],
//             [
//               "Total Open Spaces",
//               mapDoc?.totalOpenSpaces ?? count("open_space"),
//             ],
//           ].map(([k, v]) => (
//             <div className="kv" key={k}>
//               <span>{k}</span>
//               <b>{String(v)}</b>
//             </div>
//           ))}
//         </Modal>
//       )}

//       {/* ── Share Modal ── */}
//       {showShare && (
//         <Modal
//           title="Share this layout"
//           onClose={() => setShowShare(false)}
//           actions={
//             <button className="btn" onClick={() => setShowShare(false)}>
//               Done
//             </button>
//           }
//         >
//           <p style={{ marginTop: 0, color: "#64748b", fontSize: 13 }}>
//             Anyone with this link can view the layout. No login needed.
//           </p>
//           <input
//             readOnly
//             value={shareUrl}
//             onFocus={(e) => e.target.select()}
//             style={{
//               width: "100%",
//               padding: "11px 12px",
//               border: "1px solid #D0DFFF",
//               borderRadius: 10,
//               fontSize: 13,
//               background: "#F5F9FF",
//               boxSizing: "border-box",
//             }}
//           />
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: 8,
//               marginTop: 14,
//             }}
//           >
//             <button className="btn" onClick={copyLink}>
//               <Copy size={15} /> Copy link
//             </button>
//             <a
//               className="btn green"
//               href={whatsappUrl}
//               target="_blank"
//               rel="noreferrer"
//               style={{ textDecoration: "none" }}
//             >
//               <MessageCircle size={15} /> WhatsApp
//             </a>
//             {navigator.share && (
//               <button className="btn ghost" onClick={nativeShare}>
//                 <Share2 size={15} /> More…
//               </button>
//             )}
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

// import React, {
//   memo,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   GoogleMap,
//   useJsApiLoader,
//   PolygonF,
//   MarkerF,
// } from "@react-google-maps/api";
// import {
//   ArrowLeft,
//   Pencil,
//   Check,
//   Info,
//   SlidersHorizontal,
//   Search,
//   X,
//   Maximize2,
//   Eye,
//   Trash2,
//   Share2,
//   Copy,
//   MessageCircle,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { isAdmin } from "../models/user";
// import { getMap, updateMapPlots } from "../services/mapService";
// import { plotFromDoc } from "../models/plot";
// import {
//   calculatePolygonArea,
//   getPolygonCenter,
//   getBounds,
// } from "../utils/mapUtils";
// import { Spinner } from "../components/ui";
// import Modal from "../components/Modal";
// import PlotViewSheet from "../components/PlotViewSheet";
// import { useToast } from "../components/Toast";

// /* ── Reference Architectural Theme Tokens ──────────────────────────── */
// const CANVAS = "rgba(21, 24, 29, 0.90)";
// const PANEL = "rgba(21, 24, 29, 0.86)";
// const HAIR = "rgba(231, 225, 213, 0.14)";
// const ACCENT = "#D4AF37";
// const MUTED = "#9AA5B1";
// const INK = "#E7E1D5";
// const PLAIN_FILL = "#F1ECE2";
// const SELECTED_FILL = "#A855F7";
// const SELECTED_STROKE = "#E9C6F2";
// const ROAD_AND_BG_COLOR = "#475569"; // Unified solid cement color for roads & layout base
// const UNIFORM_PLOT_FONT_SIZE = 1.95; // Uniform font size (in meters) for all plot numbers

// /* Status rings around plot numbers (Status toggle ON): booked = black, sold = red.
//    The radius depends only on the number's size, never on the plot's size, so every ring is the
//    same and never shrinks on small plots. A white halo keeps the ring readable on any plot colour. */
// const NUMBER_RING_COLORS = { booked: "#000000", sold: "#B91C1C" }; // deep red: visible on the red sold plot
// const NUMBER_RING_PAD = 0.55; // metres of clear space between the number and its ring
// const numberRingRadius = (label, fontSize) =>
//   (Math.max(3, String(label).length) * fontSize * 0.62) / 2 + NUMBER_RING_PAD;
// const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
// const MONO = "'JetBrains Mono', 'SF Mono', Consolas, monospace";
// const MAPFONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
// const SQFT = 10.7639104;

// /* ── Camera & Animation Constants (from PlanMap.jsx) ───────────────── */
// const FLY_MS = 780;
// const ZOOM_STEP = 0.75;
// const ZOOM_STEP_MS = 220;
// const FLY_MIN_Z = 18.5;
// const FLY_MAX_Z = 22.2;
// /* Layout framing on load / "Fit Full Layout": closer than an exact fit.
//    The user can zoom out manually. Tune these two numbers to taste. */
// const LAYOUT_ZOOM_BOOST = 0.6; // extra zoom on top of the exact fit (0 = whole layout just fits)
// const LAYOUT_MIN_ZOOM = 18.2; // never start further out than this
// const MAP_MAX_Z = 24;
// const easeOut = (t) => 1 - (1 - t) ** 3;
// const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// // Hard-coded highlight lists from the original app
// const GOLDEN = new Set([
//   "142", "143", "164", "165", "186", "222", "216", "220", "187", "204",
//   "215", "221", "223", "224", "225", "226", "227", "228", "229", "230",
//   "231", "232", "233", "234", "235", "434", "433", "432", "431", "430",
//   "429", "344", "345", "315", "314", "370", "371", "304", "303", "394",
//   "395", "292", "291", "413", "278", "277", "414", "428", "266", "265",
//   "264", "263", "262", "261", "244", "245", "246", "247", "248", "249",
//   "250", "251", "252", "253", "254", "255", "256", "257", "258", "259",
//   "260", "236",
// ]);
// const ORANGE = new Set([
//   "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "210", "11", "62",
//   "63", "64", "65", "66", "67", "205", "206", "207", "208", "209", "211",
//   "243", "242", "241", "240", "239", "238", "237",
// ]);
// const FACINGS = [
//   "All",
//   "North",
//   "South",
//   "East",
//   "West",
//   "North-East",
//   "North-West",
//   "South-East",
//   "South-West",
// ];
// const LIBRARIES = [];

// const isAmenity = (p) =>
//   p.type === "amenity" ||
//   p.type === "open_space.Amenityspace" ||
//   (p.type === "open_space" &&
//     (p.title || "").toLowerCase().includes("amenity"));

// /* Architectural color palette for Status ON vs Status OFF */
// function styleForFeature(p, showStatus) {
//   if (p.type === "road") {
//     return {
//       fill: ROAD_AND_BG_COLOR, // Solid cement color matching background
//       stroke: "none",          // Removed road border
//       ink: "#E7E1D5",
//       sw: 0,                   // Zero border width
//     };
//   }
//   if (isAmenity(p)) {
//     return {
//       fill: "#D9468F",
//       stroke: "#F472B6",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "space for STP" || p.type === "open_space.SpaceforSTP") {
//     return {
//       fill: "#EAB308",
//       stroke: "#FEF08A",
//       ink: "#1A1208",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "space for ESS" || p.type === "open_space.SpaceforESS") {
//     return {
//       fill: "#7C3AED",
//       stroke: "#C4B5FD",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }
//   if (p.type === "open_space") {
//     return {
//       fill: "#2E7D32",
//       stroke: "#81C784",
//       ink: "#FFFFFF",
//       sw: 0.25,
//     };
//   }

//   // Plot styling
//   if (!showStatus) {
//     return {
//       fill: PLAIN_FILL,
//       stroke: "#52473B",
//       ink: "#1A1208",
//       sw: 0.22,
//     };
//   }

//   const st = (p.status || "").toLowerCase();
//   if (st === "sold") {
//     return { fill: "#EF4444", stroke: "#FCA5A5", ink: "#FFFFFF", sw: 0.22 };
//   }
//   if (st === "booked" || st === "reserved" || st === "hold") {
//     return { fill: "#F59E0B", stroke: "#FDE68A", ink: "#1A1208", sw: 0.22 };
//   }
//   if (GOLDEN.has(p.plotNo)) {
//     return { fill: "#E7D055", stroke: "#FEF9C3", ink: "#1A1208", sw: 0.22 };
//   }
//   if (ORANGE.has(p.plotNo)) {
//     return { fill: "#FB923C", stroke: "#FFEDD5", ink: "#1A1208", sw: 0.22 };
//   }
//   return { fill: "#56B870", stroke: "#DCFCE7", ink: "#0F172A", sw: 0.22 };
// }

// /* ── Self-Contained Local Meter Geometry & CAD Helpers ─────────────── */

// function createLocalProjection(originLat, originLng) {
//   const R = 6378137;
//   const cosLat = Math.cos((originLat * Math.PI) / 180);
//   return {
//     toMeters(lat, lng) {
//       const x = ((lng - originLng) * Math.PI * R * cosLat) / 180;
//       const y = -((lat - originLat) * Math.PI * R) / 180;
//       return [x, y];
//     },
//     toLatLng(x, y) {
//       const lat = originLat - (y * 180) / (Math.PI * R);
//       const lng = originLng + (x * 180) / (Math.PI * R * cosLat);
//       return { lat, lng };
//     },
//   };
// }

// function ptsToPath(pts) {
//   if (!pts || pts.length < 3) return "";
//   let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
//   for (let i = 1; i < pts.length; i++) {
//     d += `L${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
//   }
//   return `${d}Z`;
// }

// function distToSeg(px, py, x1, y1, x2, y2) {
//   const dx = x2 - x1;
//   const dy = y2 - y1;
//   const l2 = dx * dx + dy * dy;
//   if (l2 === 0) return Math.hypot(px - x1, py - y1);
//   let t = ((px - x1) * dx + (py - y1) * dy) / l2;
//   t = Math.max(0, Math.min(1, t));
//   return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
// }

// function computeFeatureMetrics(pts) {
//   if (!pts || pts.length < 3) {
//     return { cx: 0, cy: 0, ir: 4, angle: 0 };
//   }
//   let minX = Infinity,
//     maxX = -Infinity,
//     minY = Infinity,
//     maxY = -Infinity;

//   // Shoelace Area Centroid so rounded corner plots with 25+ curve vertices stay dead-center
//   let area2 = 0;
//   let sx = 0;
//   let sy = 0;

//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     if (x1 < minX) minX = x1;
//     if (x1 > maxX) maxX = x1;
//     if (y1 < minY) minY = y1;
//     if (y1 > maxY) maxY = y1;

//     const cross = x1 * y2 - x2 * y1;
//     area2 += cross;
//     sx += (x1 + x2) * cross;
//     sy += (y1 + y2) * cross;
//   }

//   const bw = maxX - minX;
//   const bh = maxY - minY;
//   const cx = Math.abs(area2) > 1e-4 ? sx / (3 * area2) : (minX + maxX) / 2;
//   const cy = Math.abs(area2) > 1e-4 ? sy / (3 * area2) : (minY + maxY) / 2;

//   let ir = Infinity;
//   let longestLen = 0;
//   let longestAngle = 0;

//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     const d = distToSeg(cx, cy, x1, y1, x2, y2);
//     if (d < ir) ir = d;

//     const segLen = Math.hypot(x2 - x1, y2 - y1);
//     if (segLen > longestLen) {
//       longestLen = segLen;
//       let deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
//       if (deg > 90) deg -= 180;
//       if (deg < -90) deg += 180;
//       longestAngle = deg;
//     }
//   }

//   const boxIr = Math.min(bw, bh) * 0.42;
//   const safeIr =
//     Number.isFinite(ir) && ir > 1.5
//       ? Math.max(ir, boxIr * 0.85)
//       : Math.max(2.2, boxIr);

//   return { cx, cy, ir: safeIr, angle: longestAngle };
// }

// /* ── Road Label Placement ──────────────────────────────────────────────
//    A road polygon can be long, bent, or run into a junction, so its centroid often lands
//    on a junction or off the road's own axis, and neighbouring labels then collide.
//    Instead: find the road's direction, slide the label along it, and take the straightest
//    stretch (not a junction) where the whole label fits inside the road, clear of plots and
//    of labels already placed. If nothing fits, the label is skipped rather than overlapping. */
// const ROAD_GLYPH_W = 0.7; // average glyph advance (em) for bold uppercase + tracking
// const roadTextLength = (text, size) => text.length * size * ROAD_GLYPH_W;

// function pointInPoly(x, y, poly) {
//   let inside = false;
//   for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
//     const [xi, yi] = poly[i];
//     const [xj, yj] = poly[j];
//     if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
//       inside = !inside;
//     }
//   }
//   return inside;
// }

// /* Direction of the road: principal axis of its outline (radians, along the road) */
// function roadAxisAngle(pts) {
//   let n = 0;
//   let mx = 0;
//   let my = 0;
//   const samples = [];
//   for (let i = 0; i < pts.length; i++) {
//     const [x1, y1] = pts[i];
//     const [x2, y2] = pts[(i + 1) % pts.length];
//     const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 1.5));
//     for (let k = 0; k < steps; k++) {
//       const x = x1 + ((x2 - x1) * k) / steps;
//       const y = y1 + ((y2 - y1) * k) / steps;
//       samples.push([x, y]);
//       mx += x;
//       my += y;
//       n++;
//     }
//   }
//   mx /= n;
//   my /= n;
//   let sxx = 0;
//   let syy = 0;
//   let sxy = 0;
//   for (const [x, y] of samples) {
//     sxx += (x - mx) * (x - mx);
//     syy += (y - my) * (y - my);
//     sxy += (x - mx) * (y - my);
//   }
//   return 0.5 * Math.atan2(2 * sxy, sxx - syy);
// }

// function labelBox(cx, cy, len, hgt, ang) {
//   const c = Math.cos(ang);
//   const s = Math.sin(ang);
//   const hx = len / 2;
//   const hy = hgt / 2;
//   return [
//     [-hx, -hy],
//     [hx, -hy],
//     [hx, hy],
//     [-hx, hy],
//   ].map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]);
// }

// /* Separating-axis test for two convex quads, with a clearance margin */
// function boxesOverlap(a, b, margin) {
//   for (const q of [a, b]) {
//     for (let i = 0; i < 4; i++) {
//       const [x1, y1] = q[i];
//       const [x2, y2] = q[(i + 1) % 4];
//       const nx = y1 - y2;
//       const ny = x2 - x1;
//       const l = Math.hypot(nx, ny) || 1;
//       let aMin = Infinity;
//       let aMax = -Infinity;
//       let bMin = Infinity;
//       let bMax = -Infinity;
//       for (const [x, y] of a) {
//         const d = (x * nx + y * ny) / l;
//         if (d < aMin) aMin = d;
//         if (d > aMax) aMax = d;
//       }
//       for (const [x, y] of b) {
//         const d = (x * nx + y * ny) / l;
//         if (d < bMin) bMin = d;
//         if (d > bMax) bMax = d;
//       }
//       if (aMax + margin < bMin || bMax + margin < aMin) return false;
//     }
//   }
//   return true;
// }

// /**
//  * @param roads  [{ key, pts, label }]
//  * @param plots  [{ pts }]  polygons a label must not run over
//  * @returns Map(key -> { x, y, angle (deg), size })
//  */
// function placeRoadLabels(roads, plots) {
//   const plotIndex = plots.map((p) => {
//     let x0 = Infinity;
//     let y0 = Infinity;
//     let x1 = -Infinity;
//     let y1 = -Infinity;
//     for (const [x, y] of p.pts) {
//       if (x < x0) x0 = x;
//       if (x > x1) x1 = x;
//       if (y < y0) y0 = y;
//       if (y > y1) y1 = y;
//     }
//     return { pts: p.pts, x0, y0, x1, y1 };
//   });
//   const onPlot = (x, y) =>
//     plotIndex.some(
//       (p) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1 && pointInPoly(x, y, p.pts),
//     );

//   // Prepare each road: axis, polygon in (u along, v across) coordinates, widths along it
//   const prepared = [];
//   for (const r of roads) {
//     if (!r.label || !r.pts || r.pts.length < 3) continue;
//     const ang = roadAxisAngle(r.pts);
//     const c = Math.cos(ang);
//     const s = Math.sin(ang);
//     const uv = r.pts.map(([x, y]) => [x * c + y * s, -x * s + y * c]);
//     let uMin = Infinity;
//     let uMax = -Infinity;
//     for (const [u] of uv) {
//       if (u < uMin) uMin = u;
//       if (u > uMax) uMax = u;
//     }
//     const length = uMax - uMin;
//     if (length < 3) continue;
//     const step = Math.max(0.75, length / 140);
//     const slices = [];
//     for (let u = uMin + step; u < uMax - step * 0.5; u += step) {
//       const vs = [];
//       for (let i = 0; i < uv.length; i++) {
//         const [u1, v1] = uv[i];
//         const [u2, v2] = uv[(i + 1) % uv.length];
//         if (u1 !== u2 && (u1 <= u) !== (u2 <= u)) vs.push(v1 + ((u - u1) * (v2 - v1)) / (u2 - u1));
//       }
//       vs.sort((a, b) => a - b);
//       let best = null;
//       for (let i = 0; i + 1 < vs.length; i += 2) {
//         const w = vs[i + 1] - vs[i];
//         if (!best || w > best.w) best = { w, vm: (vs[i] + vs[i + 1]) / 2 };
//       }
//       if (best && best.w > 0.5) slices.push({ u, ...best });
//     }
//     if (!slices.length) continue;
//     const widths = slices.map((q) => q.w).sort((a, b) => a - b);
//     const wMed = widths[Math.floor(widths.length / 2)];
//     prepared.push({ r, ang, c, s, uMin, uMax, slices, wMed, length });
//   }
//   // Main roads first, so they get the best spots
//   prepared.sort((a, b) => b.wMed - a.wMed || b.length - a.length);

//   const placed = [];
//   const out = new Map();

//   for (const p of prepared) {
//     const { r, ang, c, s, uMin, uMax, slices, wMed } = p;
//     const uMid = (uMin + uMax) / 2;
//     const base = Math.min(Math.max(wMed * 0.21, 1.15), 2.4);

//     for (const size of [base, base * 0.85, base * 0.72]) {
//       if (size < 1.0) break;
//       const len = roadTextLength(r.label, size) * 3.04;
//       const hgt = size * 2.3;

//       // Straight stretches only (no junction bulges), label must fit across the road
//       const cands = slices
//         .filter((q) => q.w >= hgt + 0.9 && q.w <= wMed * 1.3 + 0.4)
//         .map((q) => ({ ...q, d: Math.abs(q.u - uMid) }))
//         .sort((a, b) => a.d - b.d);

//       for (const q of cands) {
//         const cx = q.u * c - q.vm * s;
//         const cy = q.u * s + q.vm * c;
//         const box = labelBox(cx, cy, len, hgt + 0.5, ang);

//         // 1) the whole label inside this road
//         let inside = true;
//         for (let i = 0; i <= 8 && inside; i++) {
//           for (let j = 0; j <= 2; j++) {
//             const u = -len / 2 + (len * i) / 8;
//             const v = -(hgt + 0.5) / 2 + ((hgt + 0.5) * j) / 2;
//             if (!pointInPoly(cx + u * Math.cos(ang) - v * Math.sin(ang), cy + u * Math.sin(ang) + v * Math.cos(ang), r.pts)) {
//               inside = false;
//               break;
//             }
//           }
//         }
//         if (!inside) continue;

//         // 2) not over any plot
//         let hitsPlot = false;
//         for (let i = 0; i <= 8 && !hitsPlot; i++) {
//           for (let j = 0; j <= 2; j++) {
//             const u = -len / 2 + (len * i) / 8;
//             const v = -(hgt + 0.5) / 2 + ((hgt + 0.5) * j) / 2;
//             if (onPlot(cx + u * Math.cos(ang) - v * Math.sin(ang), cy + u * Math.sin(ang) + v * Math.cos(ang))) {
//               hitsPlot = true;
//               break;
//             }
//           }
//         }
//         if (hitsPlot) continue;

//         // 3) not touching a label already placed
//         if (placed.some((b) => boxesOverlap(box, b, 1.0))) continue;

//         placed.push(box);
//         let deg = (ang * 180) / Math.PI;
//         if (deg > 90) deg -= 180;
//         if (deg <= -90) deg += 180;
//         out.set(r.key, { x: cx, y: cy, angle: deg, size });
//         break;
//       }
//       if (out.has(r.key)) break;
//     }
//   }
//   return out;
// }

// /* ── CAD Dimension Overlay for Selected Plot (from DimensionOverlay.jsx) ── */
// const SelectedDimensionOverlay = memo(function SelectedDimensionOverlay({
//   feature,
// }) {
//   const geom = useMemo(() => {
//     if (!feature || !feature.pts || feature.pts.length < 3) return null;
//     const { pts, cx, cy, ir, raw } = feature;
//     const scale = 1.25;
//     const off = (0.55 + ir * 0.03) * scale;
//     const txt = Math.max(0.65, Math.min(ir * 0.18, 1.35)) * scale;
//     const tick = txt * 0.65;
//     const hair = 0.06 * scale;

//     const numSize = Math.max(1.4, Math.min(ir * 0.34, 3.6));
//     const sqmSize = numSize * 0.38;
//     const sqftSize = numSize * 0.46;

//     const edges = [];
//     for (let i = 0; i < pts.length; i++) {
//       const p1 = pts[i];
//       const p2 = pts[(i + 1) % pts.length];
//       const dx = p2[0] - p1[0];
//       const dy = p2[1] - p1[1];
//       const len = Math.hypot(dx, dy);
//       if (len < 0.8) continue;

//       const ux = dx / len;
//       const uy = dy / len;
//       const mx = (p1[0] + p2[0]) / 2;
//       const my = (p1[1] + p2[1]) / 2;

//       let nx = -uy;
//       let ny = ux;
//       if (nx * (mx - cx) + ny * (my - cy) < 0) {
//         nx = -nx;
//         ny = -ny;
//       }

//       const a = [p1[0] + nx * off, p1[1] + ny * off];
//       const b = [p2[0] + nx * off, p2[1] + ny * off];
//       const lx = mx + nx * (off + txt * 0.85);
//       const ly = my + ny * (off + txt * 0.85);

//       let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
//       if (deg > 90) deg -= 180;
//       if (deg < -90) deg += 180;

//       edges.push({
//         key: `edge-${i}`,
//         p1,
//         p2,
//         a,
//         b,
//         kx: nx * tick * 0.5,
//         ky: ny * tick * 0.5,
//         lx,
//         ly,
//         deg,
//         label: `${len.toFixed(2)} m`,
//       });
//     }

//     const areaNum = Number(raw.area) || 0;
//     const areaSqFt = Number(raw.areaSqFt) || areaNum * SQFT;

//     return {
//       cx,
//       cy,
//       txt,
//       hair,
//       numSize,
//       sqmSize,
//       sqftSize,
//       edges,
//       title: raw.type === "plot" ? raw.plotNo : raw.title,
//       sqmLabel: `${areaNum.toFixed(1)} m²`,
//       sqftLabel: `${Math.round(areaSqFt).toLocaleString("en-IN")} ft²`,
//     };
//   }, [feature]);

//   if (!geom) return null;
//   const {
//     cx,
//     cy,
//     txt,
//     hair,
//     numSize,
//     sqmSize,
//     sqftSize,
//     edges,
//     title,
//     sqmLabel,
//     sqftLabel,
//   } = geom;

//   return (
//     <g style={{ pointerEvents: "none" }}>
//       {edges.map((r) => (
//         <g key={r.key}>
//           <line
//             x1={r.p1[0]}
//             y1={r.p1[1]}
//             x2={r.a[0]}
//             y2={r.a[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair}
//             strokeDasharray={`${hair * 4} ${hair * 3}`}
//             opacity="0.78"
//           />
//           <line
//             x1={r.p2[0]}
//             y1={r.p2[1]}
//             x2={r.b[0]}
//             y2={r.b[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair}
//             strokeDasharray={`${hair * 4} ${hair * 3}`}
//             opacity="0.78"
//           />
//           <line
//             x1={r.a[0]}
//             y1={r.a[1]}
//             x2={r.b[0]}
//             y2={r.b[1]}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.15}
//             strokeDasharray={`${hair * 5} ${hair * 3}`}
//             opacity="0.95"
//           />
//           <line
//             x1={r.a[0] - r.kx}
//             y1={r.a[1] - r.ky}
//             x2={r.a[0] + r.kx}
//             y2={r.a[1] + r.ky}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.5}
//           />
//           <line
//             x1={r.b[0] - r.kx}
//             y1={r.b[1] - r.ky}
//             x2={r.b[0] + r.kx}
//             y2={r.b[1] + r.ky}
//             stroke="#FFFFFF"
//             strokeWidth={hair * 1.5}
//           />
//           <text
//             x={r.lx}
//             y={r.ly}
//             transform={`rotate(${r.deg} ${r.lx} ${r.ly})`}
//             textAnchor="middle"
//             dy="0.35em"
//             fontFamily={MONO}
//             fontSize={txt}
//             fontWeight="700"
//             fill="#FFFFFF"
//             stroke="#15181D"
//             strokeWidth={txt * 0.22}
//             paintOrder="stroke"
//           >
//             {r.label}
//           </text>
//         </g>
//       ))}

//       <text
//         x={cx}
//         y={cy - numSize * 0.52}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MAPFONT}
//         fontSize={numSize}
//         fontWeight="800"
//         fill="#FFFFFF"
//         stroke="rgba(21,24,29,0.65)"
//         strokeWidth={numSize * 0.12}
//         paintOrder="stroke"
//       >
//         {title}
//       </text>
//       <text
//         x={cx}
//         y={cy + numSize * 0.35}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MONO}
//         fontSize={sqmSize}
//         fontWeight="600"
//         fill="#F3E8FF"
//       >
//         {sqmLabel}
//       </text>
//       <text
//         x={cx}
//         y={cy + numSize * 0.92}
//         textAnchor="middle"
//         dy="0.35em"
//         fontFamily={MONO}
//         fontSize={sqftSize}
//         fontWeight="700"
//         fill="#FFFFFF"
//       >
//         {sqftLabel}
//       </text>
//     </g>
//   );
// });

// /* ── Unified Masterplan SVG Content (from PlanContent.jsx) ─────────── */
// const MasterplanSvgContent = memo(function MasterplanSvgContent({
//   layout,
//   showStatus,
//   highlightKey,
//   editingKey,
//   opacityFor,
//   onPlotClick,
// }) {
//   const selectedFeature = useMemo(
//     () =>
//       highlightKey
//         ? layout.features.find((f) => f.key === highlightKey)
//         : null,
//     [layout, highlightKey],
//   );

//   return (
//     <g>
//       {/* Layout Boundary Base — Solid 100% Opaque Cement Color Matching Roads */}
//       {layout.boundaryD && (
//         <path
//           d={layout.boundaryD}
//           fill={ROAD_AND_BG_COLOR}
//           fillOpacity="1"
//           stroke={ACCENT}
//           strokeWidth="0.45"
//           strokeDasharray="1.8 1.2"
//           style={{ pointerEvents: "none" }}
//         />
//       )}

//       {/* All Polygons (Roads first, then Open Spaces, then Plots) */}
//       <g>
//         {layout.sorted.map((f) => {
//           if (editingKey && f.key === editingKey) return null;
//           const isSel = highlightKey === f.key;
//           const isRoad = f.raw.type === "road";
//           const st = styleForFeature(f.raw, showStatus);
//           // Roads stay 100% opaque so they blend seamlessly with the background
//           const baseAlpha = isRoad
//             ? 1
//             : highlightKey && !isSel
//               ? 0.52
//               : 0.96;
//           const alpha = opacityFor(f.raw, baseAlpha);

//           return (
//             <path
//               key={f.rk}
//               className="plan-plot-shape"
//               d={f.d}
//               fill={isSel ? SELECTED_FILL : st.fill}
//               fillRule="evenodd"
//               fillOpacity={isSel ? 0.96 : alpha}
//               stroke={isSel ? SELECTED_STROKE : st.stroke}
//               strokeWidth={isSel ? 0.55 : st.sw}
//               strokeOpacity={isRoad ? 0 : alpha < 0.4 ? 0.35 : 0.95}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onPlotClick(f.raw);
//               }}
//             />
//           );
//         })}
//       </g>

//       {/* Plot Numbers Layer — Uniform Size Across All Plots */}
//       <g style={{ pointerEvents: "none" }}>
//         {layout.plotFeatures.map((f) => {
//           if (f.key === highlightKey || f.key === editingKey) return null;
//           if (!f.label) return null;
//           const st = styleForFeature(f.raw, showStatus);
//           const alpha = opacityFor(f.raw, highlightKey ? 0.55 : 1);
//           const ringColor = showStatus
//             ? NUMBER_RING_COLORS[(f.raw.status || "").toLowerCase()]
//             : null;
//           const ringAlpha = alpha < 0.4 ? 0.28 : alpha;

//           return (
//             <g key={`num-${f.rk}`}>
//               {ringColor && (
//                 <>
//                   <circle
//                     cx={f.cx}
//                     cy={f.cy}
//                     r={numberRingRadius(f.label, f.fontSize)}
//                     fill="none"
//                     stroke="#FFFFFF"
//                     strokeWidth="1.0"
//                     strokeOpacity={ringAlpha * 0.9}
//                   />
//                   <circle
//                     cx={f.cx}
//                     cy={f.cy}
//                     r={numberRingRadius(f.label, f.fontSize)}
//                     fill="none"
//                     stroke={ringColor}
//                     strokeWidth="0.46"
//                     strokeOpacity={ringAlpha}
//                   />
//                 </>
//               )}
//               <text
//                 x={f.cx}
//                 y={f.cy}
//                 textAnchor="middle"
//                 dy="0.35em"
//                 fontFamily={MAPFONT}
//                 fontSize={f.fontSize}
//                 fontWeight="700"
//                 fill={st.ink}
//                 fillOpacity={ringAlpha}
//               >
//                 {f.label}
//               </text>
//             </g>
//           );
//         })}
//       </g>

//       {/* Road & Open Space Rotated Feature Labels */}
//       <g style={{ pointerEvents: "none" }}>
//         {layout.zoneFeatures.map((f) => {
//           if (!f.label) return null;
//           const isRoad = f.raw.type === "road";
//           const rl = isRoad ? f.roadLabel : null;
//           if (isRoad && !rl) return null; // no clear spot for this road's label
//           const size = rl
//             ? rl.size
//             : Math.min(Math.max(f.ir * 0.32, 1.15), 3.2);
//           if (size < 1.0) return null;
//           const lx = rl ? rl.x : f.cx;
//           const ly = rl ? rl.y : f.cy;
//           const lang = rl ? rl.angle : f.angle;
//           const alpha = opacityFor(f.raw, highlightKey ? 0.5 : 1);

//           return (
//             <g
//               key={`lbl-${f.rk}`}
//               paintOrder="stroke"
//               stroke="rgba(15, 18, 24, 0.75)"
//               strokeWidth={size * 0.14}
//               transform={`rotate(${lang.toFixed(1)} ${lx.toFixed(2)} ${ly.toFixed(2)})`}
//               opacity={alpha < 0.4 ? 0.25 : alpha}
//             >
//               <text
//                 x={lx}
//                 y={isRoad ? ly : ly - size * 0.35}
//                 textAnchor="middle"
//                 dy="0.35em"
//                 fontFamily={SANS}
//                 fontSize={size}
//                 letterSpacing={isRoad ? "0.04em" : "0.06em"}
//                 fill="#F8FAFC"
//                 fontWeight="700"
//               >
//                 {f.label}
//               </text>
//               {!isRoad && f.raw.area > 120 && (
//                 <text
//                   x={lx}
//                   y={ly + size * 0.75}
//                   textAnchor="middle"
//                   dy="0.35em"
//                   fontFamily={MONO}
//                   fontSize={size * 0.64}
//                   fill="#E7E1D5"
//                   fontWeight="600"
//                 >
//                   {Math.round(f.raw.area).toLocaleString("en-IN")} m²
//                 </text>
//               )}
//             </g>
//           );
//         })}
//       </g>

//       {/* Raised Selected Plot + Engineering Dimensions */}
//       {selectedFeature && editingKey !== selectedFeature.key && (
//         <g style={{ pointerEvents: "none" }}>
//           <path
//             d={selectedFeature.d}
//             fill={SELECTED_FILL}
//             fillOpacity="0.94"
//             stroke={SELECTED_STROKE}
//             strokeWidth="0.65"
//           />
//           <SelectedDimensionOverlay feature={selectedFeature} />
//         </g>
//       )}
//     </g>
//   );
// });

// /* ── Main MapViewer Screen ─────────────────────────────────────────── */
// const PUBLIC_USER = { uid: "public", name: "Visitor", role: "guest" };

// export default function MapViewer({ publicView = false }) {
//   const { mapId } = useParams();
//   const { user } = useAuth();
//   const isPublic = publicView;
//   const viewer = isPublic ? PUBLIC_USER : user;
//   const hideStatus = isPublic;
//   const nav = useNavigate();
//   const toast = useToast();
//   const mapRef = useRef(null);
//   const flyRafRef = useRef(0);
//   const initialFitDoneRef = useRef(false);
//   const overlayPortalRef = useRef(null);
//   const compassNeedleRef = useRef(null);
//   const [, setOverlayReady] = useState(0);
//   const [mapReady, setMapReady] = useState(false);

//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
//     libraries: LIBRARIES,
//   });

//   const [mapDoc, setMapDoc] = useState(null);
//   const [plots, setPlots] = useState([]);
//   const [boundary, setBoundary] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [typeFilter, setTypeFilter] = useState("all");
//   const [category, setCategory] = useState(null);
//   const [query, setQuery] = useState("");
//   const [highlight, setHighlight] = useState(null);
//   const [selected, setSelected] = useState(null);
//   const [showAdv, setShowAdv] = useState(false);
//   const [adv, setAdv] = useState({
//     min: "",
//     max: "",
//     facing: "All",
//     status: "All",
//     unit: "m²",
//   });
//   const [advMatch, setAdvMatch] = useState(new Set());
//   const [showArea, setShowArea] = useState(false);
//   const [showShare, setShowShare] = useState(false);

//   // const [showStatus, setShowStatus] = useState(!hideStatus);
//   const [showStatus, setShowStatus] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [optionsFor, setOptionsFor] = useState(null);
//   const [deleteFor, setDeleteFor] = useState(null);
//   const [editing, setEditing] = useState(null);
//   const [points, setPoints] = useState([]);

//   useEffect(() => {
//     initialFitDoneRef.current = false;
//     getMap(mapId)
//       .then((m) => {
//         if (!m) return;
//         setMapDoc(m);
//         setPlots((m.plots ?? []).map((p) => plotFromDoc(p)));
//         setBoundary(
//           (m.layoutBoundary ?? []).map((p) => ({ lat: +p.lat, lng: +p.lng })),
//         );
//       })
//       .catch((e) => console.error("Error loading map data:", e))
//       .finally(() => setLoading(false));
//   }, [mapId]);

//   useEffect(() => () => cancelAnimationFrame(flyRafRef.current), []);

//   /* ── Share ── */
//   const shareUrl = `${window.location.origin}/share/${mapId}`;
//   const shareText = `${mapDoc?.name || "Layout"} — view the layout and plots`;
//   const copyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(shareUrl);
//     } catch {
//       const t = document.createElement("textarea");
//       t.value = shareUrl;
//       document.body.appendChild(t);
//       t.select();
//       document.execCommand("copy");
//       t.remove();
//     }
//     toast("Link copied", "success");
//   };
//   const nativeShare = () =>
//     navigator
//       .share({ title: shareText, text: shareText, url: shareUrl })
//       .catch(() => {});
//   const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

//   const statuses = useMemo(
//     () =>
//       hideStatus
//         ? ["All"]
//         : [
//             "All",
//             ...new Set(
//               plots
//                 .filter((p) => p.type === "plot" && p.status)
//                 .map((p) => p.status),
//             ),
//           ],
//     [plots, hideStatus],
//   );
//   const count = useCallback(
//     (t) => plots.filter((p) => p.type === t).length,
//     [plots],
//   );
//   const countStatus = useCallback(
//     (s) =>
//       plots.filter(
//         (p) => p.type === "plot" && (p.status || "").toLowerCase() === s,
//       ).length,
//     [plots],
//   );

//   /* Build local meter coordinate layout for the unified SVG overlay */
//   const layout = useMemo(() => {
//     const allPts = plots.length
//       ? plots.flatMap((p) => p.corners || [])
//       : boundary;
//     if (!allPts.length) return null;

//     const b = getBounds(allPts);
//     if (!b) return null;

//     const originLat = (b.north + b.south) / 2;
//     const originLng = (b.east + b.west) / 2;
//     const proj = createLocalProjection(originLat, originLng);

//     let minX = Infinity,
//       maxX = -Infinity,
//       minY = Infinity,
//       maxY = -Infinity;
//     const track = ([x, y]) => {
//       if (x < minX) minX = x;
//       if (x > maxX) maxX = x;
//       if (y < minY) minY = y;
//       if (y > maxY) maxY = y;
//     };

//     const boundaryPts = boundary.map((c) => {
//       const pt = proj.toMeters(c.lat, c.lng);
//       track(pt);
//       return pt;
//     });

//     const features = plots.map((p, idx) => {
//       const pts = (p.corners || []).map((c) => {
//         const pt = proj.toMeters(c.lat, c.lng);
//         track(pt);
//         return pt;
//       });
//       const { cx, cy, ir, angle } = computeFeatureMetrics(pts);
//       const label =
//         p.type === "plot" ? String(p.plotNo || "") : String(p.title || "");

//       return {
//         key: p.srNo || p.plotNo || `f-${idx}`, // identity used for highlight / edit matching
//         rk: `${p.srNo || p.plotNo || "f"}~${idx}`, // always-unique React render key
//         raw: p,
//         pts,
//         d: ptsToPath(pts),
//         cx,
//         cy,
//         ir,
//         angle,
//         label,
//         // Every plot uses the same consistent font size
//         fontSize: UNIFORM_PLOT_FONT_SIZE,
//       };
//     });

//     // One clear, aligned label per road: no junction pile-ups, nothing over plots or other labels
//     const roadLabels = placeRoadLabels(
//       features
//         .map((f, i) => ({ key: i, pts: f.pts, label: f.label, type: f.raw.type }))
//         .filter((f) => f.type === "road"),
//       features.filter((f) => f.raw.type === "plot").map((f) => ({ pts: f.pts })),
//     );
//     features.forEach((f, i) => {
//       f.roadLabel = roadLabels.get(i) || null;
//     });

//     const orderScore = (t) => (t === "road" ? 0 : t === "plot" ? 2 : 1);
//     const sorted = [...features].sort(
//       (a, b) => orderScore(a.raw.type) - orderScore(b.raw.type),
//     );

//     const pad = 16;
//     const x0 = minX - pad;
//     const y0 = minY - pad;
//     const x1 = maxX + pad;
//     const y1 = maxY + pad;

//     return {
//       proj,
//       x0,
//       y0,
//       x1,
//       y1,
//       w: Math.max(1, x1 - x0),
//       h: Math.max(1, y1 - y0),
//       northWestLL: proj.toLatLng(x0, y0),
//       southEastLL: proj.toLatLng(x1, y1),
//       boundaryD: boundaryPts.length > 2 ? ptsToPath(boundaryPts) : "",
//       features,
//       sorted,
//       plotFeatures: features.filter((f) => f.raw.type === "plot"),
//       zoneFeatures: features.filter((f) => f.raw.type !== "plot"),
//     };
//   }, [plots, boundary]);

//   /* ── Smooth Camera Animation Helper (from PlanMap.jsx) ── */
//   const animateCameraTo = useCallback(
//     (aimCenter, aimZoom, durationMs = FLY_MS) => {
//       const m = mapRef.current;
//       if (!m || !aimCenter) return;

//       cancelAnimationFrame(flyRafRef.current);
//       const c0 = m.getCenter();
//       if (!c0) {
//         m.setCenter(aimCenter);
//         if (aimZoom != null) m.setZoom(aimZoom);
//         return;
//       }

//       const startLat = c0.lat();
//       const startLng = c0.lng();
//       const startZoom = m.getZoom() || 18;
//       const targetZoom = aimZoom != null ? aimZoom : startZoom;

//       m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });

//       const t0 = performance.now();
//       const step = (now) => {
//         const k = Math.min(1, (now - t0) / durationMs);
//         const e = easeOut(k);
//         const center = {
//           lat: startLat + (aimCenter.lat - startLat) * e,
//           lng: startLng + (aimCenter.lng - startLng) * e,
//         };
//         const zoom = startZoom + (targetZoom - startZoom) * e;

//         if (typeof m.moveCamera === "function") {
//           m.moveCamera({ center, zoom });
//         } else {
//           m.setCenter(center);
//           m.setZoom(zoom);
//         }

//         if (k < 1) {
//           flyRafRef.current = requestAnimationFrame(step);
//         } else {
//           overlayPortalRef.current?.overlay?.draw?.();
//         }
//       };
//       flyRafRef.current = requestAnimationFrame(step);
//     },
//     [],
//   );

//   /* ── Layout framing (single direct camera move: no fitBounds, no idle re-zoom) ── */
//   const fitAll = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     cancelAnimationFrame(flyRafRef.current);

//     const plotPts = plots
//       .filter((p) => p.type === "plot")
//       .flatMap((p) => p.corners || []);
//     const pts = plotPts.length
//       ? plotPts
//       : plots.length
//         ? plots.flatMap((p) => p.corners || [])
//         : boundary;

//     const b = getBounds(pts);
//     if (!b) return;

//     const vw = window.innerWidth;
//     const vh = window.innerHeight;
//     const pad =
//       vw < 600
//         ? { top: 82, right: 6, bottom: 48, left: 6 }
//         : vw < 1024
//           ? { top: 88, right: 10, bottom: 42, left: 10 }
//           : { top: 92, right: 12, bottom: 32, left: 12 };

//     const layoutCenter = {
//       lat: (b.north + b.south) / 2,
//       lng: (b.east + b.west) / 2,
//     };

//     // Zoom at which the layout exactly fits the free area, then go a bit closer.
//     const R = 6378137;
//     const cosLat = Math.cos((layoutCenter.lat * Math.PI) / 180);
//     const spanLatM = ((b.north - b.south) * Math.PI * R) / 180;
//     const spanLngM = ((b.east - b.west) * Math.PI * R * cosLat) / 180;
//     const availW = Math.max(vw - pad.left - pad.right, 120);
//     const availH = Math.max(vh - pad.top - pad.bottom, 120);
//     const world = 156543.03392 * cosLat; // metres per pixel at zoom 0
//     const mpp = Math.max(spanLngM / availW, spanLatM / availH, 0.01);
//     const fitZoom = Math.log2(world / mpp);
//     const zoom = clamp(
//       Math.max(fitZoom + LAYOUT_ZOOM_BOOST, LAYOUT_MIN_ZOOM),
//       15,
//       MAP_MAX_Z,
//     );

//     // The search bar takes more room at the top than the bottom, so nudge the
//     // camera north a little to keep the layout centred in the free area.
//     const shiftPx = (pad.top - pad.bottom) / 2;
//     const dLat = (shiftPx * (world / 2 ** zoom)) / 111320;
//     const target = { lat: layoutCenter.lat + dLat, lng: layoutCenter.lng };

//     m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });
//     if (typeof m.moveCamera === "function") {
//       m.moveCamera({ center: target, zoom });
//     } else {
//       m.setCenter(target);
//       m.setZoom(zoom);
//     }
//     overlayPortalRef.current?.overlay?.draw?.();
//   }, [plots, boundary]);

//   /* ── Calculate Ideal Zoom & Screen-Offset Frame for a Clicked Plot ── */
//   const flyToPlot = useCallback(
//     (plot, durationMs = FLY_MS, forceZoom = null) => {
//       const m = mapRef.current;
//       if (!m || !plot) return;

//       const corners = plot.corners || [];
//       const b = getBounds(corners);
//       const center =
//         plot.center ||
//         (b && {
//           lat: (b.north + b.south) / 2,
//           lng: (b.east + b.west) / 2,
//         });
//       if (!center) return;

//       let targetZoom = forceZoom;
//       if (targetZoom == null) {
//         const R = 6378137;
//         const cosLat = Math.cos((center.lat * Math.PI) / 180);
//         const spanLatM = b
//           ? ((b.north - b.south) * Math.PI * R) / 180
//           : Math.sqrt(plot.area || 150);
//         const spanLngM = b
//           ? ((b.east - b.west) * Math.PI * R * cosLat) / 180
//           : Math.sqrt(plot.area || 150);

//         const vw = window.innerWidth;
//         const vh = window.innerHeight;
//         const boost = vw < 640 ? 1.85 : vw < 1024 ? 1.6 : 1.45;
//         const gutterM = 6;

//         const needW = (spanLngM + gutterM * 2) * 1.05;
//         const needH = (spanLatM + gutterM * 2) * 1.05;

//         const availW = Math.max(vw - (vw > 640 ? 410 : 40), 180);
//         const availH = Math.max(vh - (vw <= 640 ? 300 : 150), 180);

//         const world = 156543.03392 * cosLat;
//         const mpp = Math.max(needW / availW, needH / availH) / boost;
//         targetZoom = clamp(Math.log2(world / mpp), FLY_MIN_Z, FLY_MAX_Z);
//       }

//       let aim = center;
//       const proj = m.getProjection?.();
//       if (proj && window.google?.maps) {
//         const vw = window.innerWidth;
//         const scale = 2 ** targetZoom;
//         const shiftPxX = vw > 640 ? 150 : 0;
//         const shiftPxY = vw <= 640 ? 95 : -15;
//         const pt = proj.fromLatLngToPoint(
//           new window.google.maps.LatLng(center.lat, center.lng),
//         );
//         if (pt) {
//           const shifted = proj.fromPointToLatLng(
//             new window.google.maps.Point(
//               pt.x + shiftPxX / scale,
//               pt.y + shiftPxY / scale,
//             ),
//           );
//           if (shifted) {
//             aim = { lat: shifted.lat(), lng: shifted.lng() };
//           }
//         }
//       }

//       animateCameraTo(aim, targetZoom, durationMs);
//     },
//     [animateCameraTo],
//   );

//   const nudgeZoom = useCallback(
//     (delta) => {
//       const m = mapRef.current;
//       if (!m) return;
//       const z0 = m.getZoom() || 19;
//       const z1 = clamp(z0 + delta, 15, MAP_MAX_Z);
//       if (selected) {
//         flyToPlot(selected, ZOOM_STEP_MS, z1);
//       } else {
//         animateCameraTo(
//           { lat: m.getCenter().lat(), lng: m.getCenter().lng() },
//           z1,
//           ZOOM_STEP_MS,
//         );
//       }
//     },
//     [selected, flyToPlot, animateCameraTo],
//   );

//   /* Mount custom Google Maps OverlayView hosting the unified SVG sheet */
//   const attachOverlay = useCallback(
//     (mapInstance) => {
//       if (!window.google?.maps || !layout) return;
//       if (overlayPortalRef.current?.overlay) {
//         overlayPortalRef.current.overlay.setMap(null);
//       }

//       const hostDiv = document.createElement("div");
//       hostDiv.style.position = "absolute";
//       hostDiv.style.pointerEvents = "auto";
//       hostDiv.style.willChange = "transform, width, height, left, top";

//       class MasterplanOverlay extends window.google.maps.OverlayView {
//         onAdd() {
//           const panes = this.getPanes();
//           panes.overlayMouseTarget.appendChild(hostDiv);
//         }
//         draw() {
//           const proj = this.getProjection();
//           if (!proj) return;
//           const nw = proj.fromLatLngToDivPixel(
//             new window.google.maps.LatLng(
//               layout.northWestLL.lat,
//               layout.northWestLL.lng,
//             ),
//           );
//           const se = proj.fromLatLngToDivPixel(
//             new window.google.maps.LatLng(
//               layout.southEastLL.lat,
//               layout.southEastLL.lng,
//             ),
//           );
//           if (!nw || !se) return;
//           const left = Math.min(nw.x, se.x);
//           const top = Math.min(nw.y, se.y);
//           const width = Math.max(1, Math.abs(se.x - nw.x));
//           const height = Math.max(1, Math.abs(se.y - nw.y));

//           hostDiv.style.left = `${left}px`;
//           hostDiv.style.top = `${top}px`;
//           hostDiv.style.width = `${width}px`;
//           hostDiv.style.height = `${height}px`;
//         }
//         onRemove() {
//           if (hostDiv.parentNode) hostDiv.parentNode.removeChild(hostDiv);
//         }
//       }

//       const ov = new MasterplanOverlay();
//       ov.setMap(mapInstance);
//       overlayPortalRef.current = { overlay: ov, div: hostDiv };
//       setOverlayReady((n) => n + 1);
//     },
//     [layout],
//   );

//   const onLoad = useCallback(
//     (m) => {
//       mapRef.current = m;
//       m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });
//       attachOverlay(m);
//       setMapReady(true); // triggers the one-time initial fit once the layout is also ready
//     },
//     [attachOverlay],
//   );

//   useEffect(() => {
//     if (isLoaded && mapReady && mapRef.current && layout) {
//       attachOverlay(mapRef.current);
//       if (!initialFitDoneRef.current) {
//         initialFitDoneRef.current = true;
//         fitAll(); // exactly once per map, when both the map and the layout exist
//       }
//     }
//     return () => {
//       if (overlayPortalRef.current?.overlay) {
//         overlayPortalRef.current.overlay.setMap(null);
//       }
//     };
//   }, [isLoaded, mapReady, layout, attachOverlay, fitAll]);

//   const onIdle = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     if (compassNeedleRef.current) {
//       const h = m.getHeading?.() || 0;
//       compassNeedleRef.current.style.transform = `rotate(${-h}deg)`;
//     }
//   }, []);

//   const resetNorth = useCallback(() => {
//     const m = mapRef.current;
//     if (!m) return;
//     if (typeof m.moveCamera === "function") {
//       m.moveCamera({ heading: 0, tilt: 0 });
//     }
//     setSelected(null);
//     setHighlight(null);
//     fitAll();
//   }, [fitAll]);

//   const opacityFor = useCallback(
//     (p, base) => {
//       let o = base;
//       if (advMatch.size && p.type === "plot" && !advMatch.has(p.srNo)) o = 0.14;
//       if (typeFilter === "plot" && p.type !== "plot") o = 0.16;
//       if (typeFilter === "road" && p.type !== "road") o = 0.16;
//       if (typeFilter === "open_space" && p.type !== "open_space") o = 0.16;
//       if (typeFilter === "amenity" && !isAmenity(p)) o = 0.16;
//       if (
//         typeFilter === "category" &&
//         (p.type !== "plot" || p.status !== category)
//       )
//         o = 0.16;
//       return o;
//     },
//     [advMatch, typeFilter, category],
//   );

//   /* ── Click Plot -> Highlight, Open Sheet & Smoothly Fly/Zoom Into Plot ── */
//   const onPlotClick = useCallback(
//     (p) => {
//       if (editing) return;
//       if (editMode) return setOptionsFor(p);
//       setHighlight(p);
//       setSelected(p);
//       flyToPlot(p, FLY_MS);
//     },
//     [editing, editMode, flyToPlot],
//   );

//   // ── search ──
//   const doSearch = () => {
//     const q = query.trim().toLowerCase();
//     if (!q) return setHighlight(null);
//     const hit = plots.find(
//       (p) =>
//         (p.plotNo || "").toLowerCase() === q ||
//         (p.srNo || "").toLowerCase() === q ||
//         (p.title || "").toLowerCase().includes(q),
//     );
//     if (!hit) return toast("No match found", "error");
//     setHighlight(hit);
//     setSelected(hit);
//     flyToPlot(hit, FLY_MS);
//   };

//   // ── advanced filter ──
//   const applyAdv = () => {
//     let minA = parseFloat(adv.min);
//     let maxA = parseFloat(adv.max);
//     if (!isNaN(minA) && !isNaN(maxA) && minA > maxA) {
//       [minA, maxA] = [maxA, minA];
//     }
//     const isFt = adv.unit === "ft²";
//     const hasArea = !isNaN(minA) || !isNaN(maxA);
//     if (!hasArea && adv.facing === "All" && adv.status === "All") {
//       setAdvMatch(new Set());
//       setShowAdv(false);
//       return;
//     }
//     const matched = plots.filter((p) => {
//       if (p.type !== "plot") return false;
//       const val = isFt ? p.areaSqFt || p.area * SQFT : p.area;
//       if (!isNaN(minA) && val < minA) return false;
//       if (!isNaN(maxA) && val > maxA) return false;
//       if (
//         adv.facing !== "All" &&
//         !(p.facing || "").toLowerCase().includes(adv.facing.toLowerCase())
//       )
//         return false;
//       if (adv.status !== "All" && p.status !== adv.status) return false;
//       return true;
//     });
//     setAdvMatch(new Set(matched.map((p) => p.srNo)));
//     setShowAdv(false);
//     const b = getBounds(matched.flatMap((p) => p.corners));
//     if (b)
//       mapRef.current?.fitBounds(
//         { south: b.south, north: b.north, west: b.west, east: b.east },
//         { top: 96, right: 24, bottom: 64, left: 24 },
//       );
//   };

//   const clearAdv = () => {
//     setAdv({ min: "", max: "", facing: "All", status: "All", unit: "m²" });
//     setAdvMatch(new Set());
//   };

//   // ── edit mode (admin) ──
//   const persist = async (nextPlots) => {
//     await updateMapPlots(mapId, nextPlots, boundary);
//     setPlots(nextPlots);
//   };
//   const savePlotEdits = async () => {
//     if (!editing || points.length < 3)
//       return toast("Need at least 3 points", "error");
//     try {
//       const updated = {
//         ...editing,
//         corners: points,
//         area: calculatePolygonArea(points),
//         center: getPolygonCenter(points),
//       };
//       await persist(plots.map((p) => (p === editing ? updated : p)));
//       setEditing(null);
//       setPoints([]);
//       toast("Plot updated", "success");
//     } catch (e) {
//       toast(`Error: ${e.message}`, "error");
//     }
//   };
//   const deletePlot = async () => {
//     const p = deleteFor;
//     setDeleteFor(null);
//     try {
//       await persist(plots.filter((x) => x !== p));
//       toast(`${p.plotNo} deleted`, "success");
//     } catch (e) {
//       toast(`Error: ${e.message}`, "error");
//     }
//   };

//   const highlightKey = highlight ? highlight.srNo || highlight.plotNo : null;
//   const editingKey = editing ? editing.srNo || editing.plotNo : null;

//   if (loading) return <Spinner />;
//   if (loadError)
//     return (
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           display: "grid",
//           placeItems: "center",
//           background: "#0B0E13",
//           color: "#E68A72",
//           fontFamily: MONO,
//           padding: 24,
//           textAlign: "center",
//         }}
//       >
//         <div>
//           <h3 style={{ color: INK, marginBottom: 8 }}>
//             Google Maps failed to load
//           </h3>
//           <p style={{ color: MUTED, fontSize: 13 }}>
//             Check VITE_GOOGLE_MAPS_API_KEY and disable any ad-blocker.
//           </p>
//         </div>
//       </div>
//     );

//   const center = plots[0]?.center ??
//     boundary[0] ?? { lat: 21.1458, lng: 79.0882 };

//   return (
//     <div className="ref-map-page">
//       <style>{`
//         .ref-map-page {
//           position: relative;
//           width: 100vw;
//           height: 100vh;
//           overflow: hidden;
//           background: #0B0E13;
//           font-family: ${SANS};
//           color: ${INK};
//           user-select: none;
//         }
//         path.plan-plot-shape {
//           cursor: pointer;
//           transition: fill-opacity 120ms ease, stroke-width 120ms ease;
//         }
//         path.plan-plot-shape:hover {
//           fill-opacity: 0.78;
//         }
//         .ref-hud-top {
//           position: absolute;
//           top: 14px;
//           left: 14px;
//           right: 14px;
//           z-index: 10;
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//           pointer-events: none;
//         }
//         .ref-topbar {
//           pointer-events: auto;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 10px 14px;
//           background: ${CANVAS};
//           backdrop-filter: blur(16px);
//           -webkit-backdrop-filter: blur(16px);
//           border: 1px solid ${HAIR};
//           border-radius: 14px;
//           box-shadow: 0 18px 42px rgba(0, 0, 0, 0.52);
//           flex-wrap: wrap;
//         }
//         .ref-icon-btn {
//           width: 38px;
//           height: 38px;
//           border-radius: 10px;
//           background: rgba(255, 255, 255, 0.03);
//           border: 1px solid ${HAIR};
//           color: ${INK};
//           display: grid;
//           place-items: center;
//           cursor: pointer;
//           transition: border-color 150ms ease, color 150ms ease, transform 120ms ease;
//           flex-shrink: 0;
//         }
//         .ref-icon-btn:hover {
//           border-color: ${ACCENT};
//           color: ${ACCENT};
//         }
//         .ref-icon-btn.active {
//           background: ${ACCENT};
//           border-color: ${ACCENT};
//           color: #15181D;
//         }
//         .ref-search {
//           flex: 1;
//           min-width: 200px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid ${HAIR};
//           border-radius: 10px;
//           padding: 4px 6px 4px 12px;
//         }
//         .ref-search:focus-within {
//           border-color: ${ACCENT};
//         }
//         .ref-search input {
//           flex: 1;
//           background: transparent;
//           border: none;
//           outline: none;
//           color: ${INK};
//           font: 400 13px/1 ${MONO};
//           padding: 6px 0;
//         }
//         .ref-search input::placeholder {
//           color: ${MUTED};
//         }
//         .ref-find-btn {
//           font: 600 12px/1 ${MONO};
//           background: ${ACCENT};
//           color: #15181D;
//           border: none;
//           border-radius: 7px;
//           padding: 7px 12px;
//           cursor: pointer;
//         }
//         .ref-chips-row {
//           pointer-events: auto;
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           overflow-x: auto;
//           scrollbar-width: none;
//           padding-bottom: 2px;
//         }
//         .ref-chips-row::-webkit-scrollbar { display: none; }
//         .ref-pill {
//           font: 500 12px/1 ${MONO};
//           color: ${INK};
//           background: ${PANEL};
//           border: 1px solid ${HAIR};
//           border-radius: 999px;
//           padding: 9px 13px;
//           cursor: pointer;
//           white-space: nowrap;
//           box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
//           transition: all 150ms ease;
//         }
//         .ref-pill:hover {
//           border-color: ${ACCENT};
//         }
//         .ref-pill.on {
//           color: #15181D;
//           background: ${ACCENT};
//           border-color: ${ACCENT};
//           font-weight: 700;
//         }
//       `}</style>

//       {/* ── Google Map Base Canvas ── */}
//       <GoogleMap
//         mapContainerStyle={{ position: "absolute", inset: 0 }}
//         center={center}
//         zoom={18.5}
//         onLoad={onLoad}
//         onIdle={onIdle}
//         options={{
//           mapTypeId: "hybrid",
//           isFractionalZoomEnabled: true,
//           streetViewControl: false,
//           fullscreenControl: false,
//           mapTypeControl: false,
//           rotateControl: false,
//           zoomControl: false,
//           gestureHandling: "greedy",
//           maxZoom: MAP_MAX_Z,
//           backgroundColor: "#0B0E13",
//         }}
//         onClick={(e) => {
//           if (editing) {
//             setPoints((p) => [
//               ...p,
//               { lat: e.latLng.lat(), lng: e.latLng.lng() },
//             ]);
//           } else if (selected || highlight) {
//             setHighlight(null);
//             setSelected(null);
//           }
//         }}
//       >
//         {/* Admin Polygon Vertex Editor (Active only while editing a boundary) */}
//         {editing && (
//           <>
//             <PolygonF
//               paths={points}
//               options={{
//                 fillColor: ACCENT,
//                 fillOpacity: 0.35,
//                 strokeColor: ACCENT,
//                 strokeWeight: 3,
//                 clickable: false,
//                 zIndex: 30,
//               }}
//             />
//             {points.map((pt, i) => (
//               <MarkerF
//                 key={i}
//                 position={pt}
//                 draggable
//                 zIndex={40}
//                 onDragEnd={(e) =>
//                   setPoints((ps) =>
//                     ps.map((p, j) =>
//                       j === i
//                         ? { lat: e.latLng.lat(), lng: e.latLng.lng() }
//                         : p,
//                     ),
//                   )
//                 }
//                 onRightClick={() =>
//                   setPoints((ps) => ps.filter((_, j) => j !== i))
//                 }
//               />
//             ))}
//           </>
//         )}
//       </GoogleMap>

//       {/* ── Unified Masterplan SVG Portal ── */}
//       {overlayPortalRef.current?.div &&
//         layout &&
//         createPortal(
//           <svg
//             viewBox={`${layout.x0} ${layout.y0} ${layout.w} ${layout.h}`}
//             width="100%"
//             height="100%"
//             preserveAspectRatio="none"
//             style={{
//               display: "block",
//               width: "100%",
//               height: "100%",
//               overflow: "visible",
//             }}
//           >
//             <MasterplanSvgContent
//               layout={layout}
//               showStatus={showStatus}
//               highlightKey={highlightKey}
//               editingKey={editingKey}
//               opacityFor={opacityFor}
//               onPlotClick={onPlotClick}
//             />
//           </svg>,
//           overlayPortalRef.current.div,
//         )}

//       {/* ── Top Architectural Bar + Category Pills ── */}
//       <div className="ref-hud-top">
//         <div className="ref-topbar">
//           {!isPublic && (
//             <button
//               className="ref-icon-btn"
//               onClick={() => nav(-1)}
//               title="Back"
//             >
//               <ArrowLeft size={18} />
//             </button>
//           )}

//           <div style={{ minWidth: 140 }}>
//             <div
//               style={{
//                 fontFamily: MONO,
//                 fontSize: 10,
//                 letterSpacing: "0.1em",
//                 textTransform: "uppercase",
//                 color: ACCENT,
//               }}
//             >
//               MASTERPLAN
//             </div>
//             <div
//               style={{
//                 fontSize: 15,
//                 fontWeight: 700,
//                 color: INK,
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 maxWidth: 240,
//               }}
//             >
//               {mapDoc?.name || "Layout Map"}
//             </div>
//           </div>

//           <div className="ref-search">
//             <Search size={15} color={MUTED} />
//             <input
//               placeholder="Search plot no / sr no / title…"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && doSearch()}
//             />
//             {query && (
//               <button
//                 onClick={() => {
//                   setQuery("");
//                   setHighlight(null);
//                   setSelected(null);
//                 }}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: MUTED,
//                   cursor: "pointer",
//                   display: "grid",
//                   placeItems: "center",
//                 }}
//               >
//                 <X size={14} />
//               </button>
//             )}
//             <button className="ref-find-btn" onClick={doSearch}>
//               Find
//             </button>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <button
//               className={`ref-icon-btn ${showAdv || advMatch.size > 0 ? "active" : ""}`}
//               title="Filters"
//               onClick={() => setShowAdv(!showAdv)}
//             >
//               <SlidersHorizontal size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Fit Full Layout"
//               onClick={() => {
//                 setSelected(null);
//                 setHighlight(null);
//                 fitAll();
//               }}
//             >
//               <Maximize2 size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Area Details"
//               onClick={() => setShowArea(true)}
//             >
//               <Info size={17} />
//             </button>

//             <button
//               className="ref-icon-btn"
//               title="Share"
//               onClick={() => setShowShare(true)}
//             >
//               <Share2 size={17} />
//             </button>

//             {isAdmin(user) && (
//               <button
//                 className={`ref-icon-btn ${editMode ? "active" : ""}`}
//                 title={editMode ? "Done Editing" : "Edit Layout"}
//                 onClick={() => {
//                   setEditMode(!editMode);
//                   toast(editMode ? "Edit mode OFF" : "Edit mode ON");
//                 }}
//               >
//                 {editMode ? <Check size={17} /> : <Pencil size={17} />}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Category Filter Pills */}
//         <div className="ref-chips-row">
//           {[
//             ["all", `All (${plots.length})`],
//             ["plot", `Plots (${count("plot")})`],
//             ["road", `Roads (${count("road")})`],
//             ["open_space", `Open Spaces (${count("open_space")})`],
//             ["amenity", "Amenities"],
//           ].map(([k, l]) => (
//             <button
//               key={k}
//               className={`ref-pill ${typeFilter === k ? "on" : ""}`}
//               onClick={() => {
//                 setTypeFilter(k);
//                 setCategory(null);
//               }}
//             >
//               {l}
//             </button>
//           ))}
//           {statuses
//             .filter((s) => s !== "All")
//             .map((s) => (
//               <button
//                 key={s}
//                 className={`ref-pill ${typeFilter === "category" && category === s ? "on" : ""}`}
//                 onClick={() => {
//                   setTypeFilter("category");
//                   setCategory(s);
//                 }}
//               >
//                 {s} ({countStatus(s.toLowerCase())})
//               </button>
//             ))}
//         </div>
//       </div>

//       {/* ── Reference Staged FilterPanel (from FilterPanel.jsx) ── */}
//       {showAdv && (
//         <div
//           role="dialog"
//           aria-label="Filter plots"
//           onPointerDown={(e) => e.stopPropagation()}
//           style={{
//             position: "absolute",
//             top: 122,
//             left: 14,
//             zIndex: 12,
//             width: 320,
//             maxWidth: "calc(100vw - 28px)",
//             maxHeight: "calc(100vh - 150px)",
//             display: "flex",
//             flexDirection: "column",
//             background: CANVAS,
//             backdropFilter: "blur(16px)",
//             WebkitBackdropFilter: "blur(16px)",
//             border: `1px solid ${HAIR}`,
//             borderRadius: 14,
//             boxShadow: "0 22px 54px rgba(0, 0, 0, 0.55)",
//             overflow: "hidden",
//           }}
//         >
//           <header
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: "14px 16px 11px",
//               borderBottom: `1px solid ${HAIR}`,
//             }}
//           >
//             <div
//               style={{
//                 fontFamily: SANS,
//                 fontSize: 13,
//                 fontWeight: 600,
//                 letterSpacing: "0.08em",
//                 textTransform: "uppercase",
//                 color: ACCENT,
//               }}
//             >
//               Filters
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               {advMatch.size > 0 && (
//                 <span
//                   style={{
//                     fontFamily: MONO,
//                     fontSize: 11,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.06)",
//                     padding: "4px 8px",
//                     borderRadius: 6,
//                   }}
//                 >
//                   {advMatch.size} matched
//                 </span>
//               )}
//               <button
//                 onClick={() => setShowAdv(false)}
//                 style={{
//                   font: `400 18px/1 ${MONO}`,
//                   color: MUTED,
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 &times;
//               </button>
//             </div>
//           </header>

//           <div
//             style={{
//               display: "grid",
//               gap: 16,
//               padding: 16,
//               overflowY: "auto",
//             }}
//           >
//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Area Range ({adv.unit})
//               </div>
//               <div style={{ display: "flex", gap: 7 }}>
//                 {["m²", "ft²"].map((u) => (
//                   <button
//                     key={u}
//                     type="button"
//                     onClick={() => setAdv({ ...adv, unit: u })}
//                     style={{
//                       font: `500 12px/1 ${MONO}`,
//                       color: adv.unit === u ? "#15181D" : INK,
//                       background:
//                         adv.unit === u ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                       border: `1px solid ${adv.unit === u ? ACCENT : HAIR}`,
//                       borderRadius: 999,
//                       padding: "7px 13px",
//                       cursor: "pointer",
//                     }}
//                   >
//                     {u}
//                   </button>
//                 ))}
//               </div>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr auto 1fr",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 <input
//                   type="number"
//                   placeholder="Min"
//                   value={adv.min}
//                   onChange={(e) => setAdv({ ...adv, min: e.target.value })}
//                   style={{
//                     font: `400 13px/1 ${MONO}`,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.03)",
//                     border: `1px solid ${HAIR}`,
//                     borderRadius: 9,
//                     padding: "10px",
//                     width: "100%",
//                     boxSizing: "border-box",
//                     outline: "none",
//                   }}
//                 />
//                 <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
//                   to
//                 </span>
//                 <input
//                   type="number"
//                   placeholder="Max"
//                   value={adv.max}
//                   onChange={(e) => setAdv({ ...adv, max: e.target.value })}
//                   style={{
//                     font: `400 13px/1 ${MONO}`,
//                     color: INK,
//                     background: "rgba(255, 255, 255, 0.03)",
//                     border: `1px solid ${HAIR}`,
//                     borderRadius: 9,
//                     padding: "10px",
//                     width: "100%",
//                     boxSizing: "border-box",
//                     outline: "none",
//                   }}
//                 />
//               </div>
//             </div>

//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Facing
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                 {FACINGS.map((f) => {
//                   const on = adv.facing === f;
//                   return (
//                     <button
//                       key={f}
//                       type="button"
//                       onClick={() => setAdv({ ...adv, facing: f })}
//                       style={{
//                         font: `500 12px/1 ${MONO}`,
//                         color: on ? "#15181D" : INK,
//                         background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                         border: `1px solid ${on ? ACCENT : HAIR}`,
//                         borderRadius: 999,
//                         padding: "8px 12px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {f}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div style={{ display: "grid", gap: 9 }}>
//               <div
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: "0.08em",
//                   textTransform: "uppercase",
//                   color: MUTED,
//                 }}
//               >
//                 Status
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//                 {statuses.map((s) => {
//                   const on = adv.status === s;
//                   return (
//                     <button
//                       key={s}
//                       type="button"
//                       onClick={() => setAdv({ ...adv, status: s })}
//                       style={{
//                         font: `500 12px/1 ${MONO}`,
//                         color: on ? "#15181D" : INK,
//                         background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
//                         border: `1px solid ${on ? ACCENT : HAIR}`,
//                         borderRadius: 999,
//                         padding: "8px 12px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {s}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           <footer
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1.5fr",
//               gap: 9,
//               padding: 12,
//               borderTop: `1px solid ${HAIR}`,
//             }}
//           >
//             <button
//               type="button"
//               onClick={clearAdv}
//               style={{
//                 font: `500 13px/1 ${MONO}`,
//                 color: INK,
//                 background: "transparent",
//                 border: `1px solid ${HAIR}`,
//                 borderRadius: 10,
//                 padding: "11px 0",
//                 cursor: "pointer",
//               }}
//             >
//               Clear
//             </button>
//             <button
//               type="button"
//               onClick={applyAdv}
//               style={{
//                 font: `600 13px/1 ${MONO}`,
//                 color: "#15181D",
//                 background: ACCENT,
//                 border: `1px solid ${ACCENT}`,
//                 borderRadius: 10,
//                 padding: "11px 0",
//                 cursor: "pointer",
//               }}
//             >
//               Apply
//             </button>
//           </footer>
//         </div>
//       )}

//       {/* ── Live North Compass & Zoom Controls (from PlanMap.jsx) ── */}
//       <div
//         style={{
//           position: "absolute",
//           zIndex: 8,
//           right: 14,
//           top: 122,
//           display: "flex",
//           flexDirection: "column",
//           gap: 8,
//           alignItems: "center",
//         }}
//       >
//         <button
//           type="button"
//           title="Face north & fit layout"
//           onClick={resetNorth}
//           style={{
//             width: 44,
//             height: 44,
//             display: "grid",
//             placeItems: "center",
//             padding: 0,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 22,
//             cursor: "pointer",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           <svg width="26" height="26" viewBox="-13 -13 26 26">
//             <g
//               ref={compassNeedleRef}
//               style={{ transformOrigin: "50% 50%", willChange: "transform" }}
//             >
//               <path d="M0 -9 L4.5 1.5 L0 -0.8 Z" fill={ACCENT} />
//               <path
//                 d="M0 -9 L-4.5 1.5 L0 -0.8 Z"
//                 fill={ACCENT}
//                 fillOpacity="0.55"
//               />
//               <path d="M0 9 L4.5 -1.5 L0 0.8 Z" fill={HAIR} />
//               <path
//                 d="M0 9 L-4.5 -1.5 L0 0.8 Z"
//                 fill={HAIR}
//                 fillOpacity="0.55"
//               />
//             </g>
//             <text
//               x="0"
//               y="-9.5"
//               textAnchor="middle"
//               fill={INK}
//               fontFamily={MONO}
//               fontSize="7"
//               fontWeight="700"
//             >
//               N
//             </text>
//           </svg>
//         </button>

//         {/* Zoom + / - / Re-center Plot controls */}
//         <button
//           type="button"
//           title="Zoom in"
//           onClick={() => nudgeZoom(ZOOM_STEP)}
//           style={{
//             width: 42,
//             height: 42,
//             font: `500 18px/1 ${MONO}`,
//             color: INK,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             cursor: "pointer",
//             display: "grid",
//             placeItems: "center",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           +
//         </button>
//         <button
//           type="button"
//           title="Zoom out"
//           onClick={() => nudgeZoom(-ZOOM_STEP)}
//           style={{
//             width: 42,
//             height: 42,
//             font: `500 18px/1 ${MONO}`,
//             color: INK,
//             background: CANVAS,
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             cursor: "pointer",
//             display: "grid",
//             placeItems: "center",
//             boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//           }}
//         >
//           −
//         </button>
//         {selected && (
//           <button
//             type="button"
//             title="Refit selected plot"
//             onClick={() => flyToPlot(selected, 320)}
//             style={{
//               width: 42,
//               height: 42,
//               font: `500 16px/1 ${MONO}`,
//               color: ACCENT,
//               background: CANVAS,
//               border: `1px solid ${ACCENT}`,
//               borderRadius: 12,
//               cursor: "pointer",
//               display: "grid",
//               placeItems: "center",
//               boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
//             }}
//           >
//             ⌂
//           </button>
//         )}
//       </div>

//       {/* ── Admin Polygon Editing Banner ── */}
//       {editing && (
//         <div
//           style={{
//             position: "absolute",
//             bottom: 74,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 15,
//             display: "flex",
//             alignItems: "center",
//             gap: 14,
//             padding: "12px 18px",
//             background: CANVAS,
//             backdropFilter: "blur(16px)",
//             border: `1px solid ${ACCENT}`,
//             borderRadius: 14,
//             boxShadow: "0 20px 44px rgba(0,0,0,0.6)",
//             fontFamily: MONO,
//             fontSize: 12,
//           }}
//         >
//           <span>
//             Points: <b style={{ color: ACCENT }}>{points.length}</b> · click map
//             to add, right-click vertex to remove
//           </span>
//           <button
//             onClick={savePlotEdits}
//             style={{
//               font: `600 12px/1 ${MONO}`,
//               background: ACCENT,
//               color: "#15181D",
//               border: "none",
//               borderRadius: 8,
//               padding: "8px 14px",
//               cursor: "pointer",
//             }}
//           >
//             Save
//           </button>
//           <button
//             onClick={() => {
//               setEditing(null);
//               setPoints([]);
//             }}
//             style={{
//               font: `500 12px/1 ${MONO}`,
//               background: "transparent",
//               color: INK,
//               border: `1px solid ${HAIR}`,
//               borderRadius: 8,
//               padding: "8px 12px",
//               cursor: "pointer",
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       )}

//       {/* ── Bottom-Left StatusLegend (from Statuslegend.jsx) ── */}
//       {showStatus && (
//         <div
//           style={{
//             position: "absolute",
//             left: 14,
//             bottom: 14,
//             zIndex: 8,
//             display: "flex",
//             flexWrap: "wrap",
//             alignItems: "center",
//             gap: "10px 14px",
//             padding: "10px 14px",
//             background: PANEL,
//             backdropFilter: "blur(14px)",
//             WebkitBackdropFilter: "blur(14px)",
//             border: `1px solid ${HAIR}`,
//             borderRadius: 12,
//             boxShadow: "0 10px 30px rgba(0, 0, 0, 0.38)",
//             maxWidth: "calc(100vw - 220px)",
//           }}
//         >
//           {[
//             ["#56B870", "Available", countStatus("available")],
//             ["#F59E0B", "Booked", countStatus("booked")],
//             ["#EF4444", "Sold", countStatus("sold")],
//             ["#E7D055", "Premium", null],
//             ["#FB923C", "Featured", null],
//             ["#2E7D32", "Open Space", count("open_space")],
//             ["#D9468F", "Amenity", null],
//             [ROAD_AND_BG_COLOR, "Road", count("road")],
//           ].map(([dot, label, cnt]) => (
//             <div
//               key={label}
//               style={{ display: "flex", alignItems: "center", gap: 7 }}
//             >
//               <span
//                 style={{
//                   width: 11,
//                   height: 11,
//                   borderRadius: 3,
//                   background: dot,
//                   border: `1px solid ${HAIR}`,
//                 }}
//               />
//               <span
//                 style={{
//                   font: `500 12px/1 ${MONO}`,
//                   color: INK,
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {label}
//               </span>
//               {cnt !== null && cnt > 0 && (
//                 <span
//                   style={{
//                     font: `500 11px/1 ${MONO}`,
//                     color: MUTED,
//                     background: "rgba(255, 255, 255, 0.06)",
//                     padding: "3px 6px",
//                     borderRadius: 5,
//                   }}
//                 >
//                   {cnt}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Bottom-Right Status toggle ── */}
//       <div
//         style={{
//           position: "absolute",
//           right: 14,
//           bottom: 14,
//           zIndex: 8,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "flex-end",
//           gap: 8,
//         }}
//       >
//         {[
//           ...(hideStatus ? [] : [["Status", showStatus, setShowStatus]]),
//         ].map(([label, on, toggle]) => (
//           <button
//             key={label}
//             type="button"
//             role="switch"
//             aria-checked={on}
//             onClick={() => toggle(!on)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//               font: `500 13px/1 ${MONO}`,
//               color: INK,
//               background: PANEL,
//               backdropFilter: "blur(14px)",
//               WebkitBackdropFilter: "blur(14px)",
//               border: `1px solid ${HAIR}`,
//               borderRadius: 12,
//               padding: "9px 13px",
//               cursor: "pointer",
//               boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
//             }}
//           >
//             <span>{label}</span>
//             <span
//               style={{
//                 width: 42,
//                 height: 22,
//                 borderRadius: 999,
//                 background: on ? "#7CB342" : "rgba(255, 255, 255, 0.20)",
//                 position: "relative",
//                 transition: "background 180ms ease",
//               }}
//             >
//               <span
//                 style={{
//                   position: "absolute",
//                   top: 2,
//                   left: 2,
//                   width: 18,
//                   height: 18,
//                   borderRadius: "50%",
//                   background: "#FFFFFF",
//                   transform: on ? "translateX(20px)" : "translateX(0px)",
//                   transition: "transform 180ms ease",
//                 }}
//               />
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* ── Selected Plot Inspector Sheet ── */}
//       {selected && (
//         <PlotViewSheet
//           plot={hideStatus ? { ...selected, status: "" } : selected}
//           mapId={mapId}
//           mapName={mapDoc?.name ?? ""}
//           user={viewer}
//           onClose={() => {
//             setSelected(null);
//             setHighlight(null);
//           }}
//         />
//       )}

//       {/* ── Admin Options Modal ── */}
//       {optionsFor && (
//         <Modal
//           title={`Plot ${optionsFor.plotNo || optionsFor.title}`}
//           onClose={() => setOptionsFor(null)}
//         >
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             <button
//               className="btn ghost"
//               onClick={() => {
//                 setEditing(optionsFor);
//                 setPoints(optionsFor.corners);
//                 setOptionsFor(null);
//                 toast(
//                   "Click map to add points. Right-click a point to remove.",
//                 );
//               }}
//             >
//               <Pencil size={15} /> Edit Boundary
//             </button>
//             <button
//               className="btn ghost"
//               onClick={() => {
//                 setSelected(optionsFor);
//                 setHighlight(optionsFor);
//                 setOptionsFor(null);
//                 flyToPlot(optionsFor, FLY_MS);
//               }}
//             >
//               <Eye size={15} /> View Details
//             </button>
//             <button
//               className="btn danger"
//               onClick={() => {
//                 setDeleteFor(optionsFor);
//                 setOptionsFor(null);
//               }}
//             >
//               <Trash2 size={15} /> Delete Plot
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* ── Delete Confirmation Modal ── */}
//       {deleteFor && (
//         <Modal
//           title="Delete Plot"
//           onClose={() => setDeleteFor(null)}
//           actions={
//             <>
//               <button className="btn text" onClick={() => setDeleteFor(null)}>
//                 Cancel
//               </button>
//               <button className="btn danger" onClick={deletePlot}>
//                 Delete
//               </button>
//             </>
//           }
//         >
//           Delete {deleteFor.plotNo}?
//         </Modal>
//       )}

//       {/* ── Area Telemetry Modal ── */}
//       {showArea && (
//         <Modal
//           title="Area Details"
//           onClose={() => setShowArea(false)}
//           actions={
//             <button className="btn" onClick={() => setShowArea(false)}>
//               Close
//             </button>
//           }
//         >
//           {[
//             ["Total Area", mapDoc?.totalArea ?? "0"],
//             ["Total Plots", mapDoc?.totalPlots ?? count("plot")],
//             ["Total Roads", mapDoc?.totalRoads ?? count("road")],
//             [
//               "Total Open Spaces",
//               mapDoc?.totalOpenSpaces ?? count("open_space"),
//             ],
//           ].map(([k, v]) => (
//             <div className="kv" key={k}>
//               <span>{k}</span>
//               <b>{String(v)}</b>
//             </div>
//           ))}
//         </Modal>
//       )}

//       {/* ── Share Modal ── */}
//       {showShare && (
//         <Modal
//           title="Share this layout"
//           onClose={() => setShowShare(false)}
//           actions={
//             <button className="btn" onClick={() => setShowShare(false)}>
//               Done
//             </button>
//           }
//         >
//           <p style={{ marginTop: 0, color: "#64748b", fontSize: 13 }}>
//             Anyone with this link can view the layout. No login needed.
//           </p>
//           <input
//             readOnly
//             value={shareUrl}
//             onFocus={(e) => e.target.select()}
//             style={{
//               width: "100%",
//               padding: "11px 12px",
//               border: "1px solid #D0DFFF",
//               borderRadius: 10,
//               fontSize: 13,
//               background: "#F5F9FF",
//               boxSizing: "border-box",
//             }}
//           />
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: 8,
//               marginTop: 14,
//             }}
//           >
//             <button className="btn" onClick={copyLink}>
//               <Copy size={15} /> Copy link
//             </button>
//             <a
//               className="btn green"
//               href={whatsappUrl}
//               target="_blank"
//               rel="noreferrer"
//               style={{ textDecoration: "none" }}
//             >
//               <MessageCircle size={15} /> WhatsApp
//             </a>
//             {navigator.share && (
//               <button className="btn ghost" onClick={nativeShare}>
//                 <Share2 size={15} /> More…
//               </button>
//             )}
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  PolygonF,
  MarkerF,
} from "@react-google-maps/api";
import {
  ArrowLeft,
  Pencil,
  Check,
  Info,
  SlidersHorizontal,
  Search,
  X,
  Maximize2,
  Eye,
  Trash2,
  Share2,
  Copy,
  MessageCircle,
  Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../models/user";
import { getMap, updateMapPlots } from "../services/mapService";
import { plotFromDoc } from "../models/plot";
import {
  calculatePolygonArea,
  getPolygonCenter,
  getBounds,
} from "../utils/mapUtils";
import { Spinner } from "../components/ui";
import Modal from "../components/Modal";
import PlotViewSheet from "../components/PlotViewSheet";
import { useToast } from "../components/Toast";
import { getBrochure } from "../brochures";
import BrochurePreview from "../components/BrochurePreview";

/* ── Reference Architectural Theme Tokens ──────────────────────────── */
const CANVAS = "rgba(21, 24, 29, 0.90)";
const PANEL = "rgba(21, 24, 29, 0.86)";
const HAIR = "rgba(231, 225, 213, 0.14)";
const ACCENT = "#D4AF37";
const MUTED = "#9AA5B1";
const INK = "#E7E1D5";
const PLAIN_FILL = "#F4EBD3"; // cream: the single colour used for every plot
const SELECTED_FILL = "#A855F7";
const SELECTED_STROKE = "#E9C6F2";
const ROAD_AND_BG_COLOR = "#475569"; // Unified solid cement color for roads & layout base
const UNIFORM_PLOT_FONT_SIZE = 1.95; // Uniform font size (in meters) for all plot numbers

/* Status rings around plot numbers (Status toggle ON): booked = black, sold = red.
   Plots are all one cream colour, so the ring is the only status marker. The radius depends only
   on the number's size, never on the plot's size, so every ring is the same and never shrinks. */
const NUMBER_RING_COLORS = { booked: "#000000", sold: "#DC2626" };
const NUMBER_RING_PAD = 0.8; // metres of clear space between the number and its ring
const numberRingRadius = (label, fontSize) =>
  (Math.max(3, String(label).length) * fontSize * 0.62) / 2 + NUMBER_RING_PAD;
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', Consolas, monospace";
const MAPFONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const SQFT = 10.7639104;

/* ── Camera & Animation Constants (from PlanMap.jsx) ───────────────── */
const FLY_MS = 780;
const ZOOM_STEP = 0.75;
const ZOOM_STEP_MS = 220;
const FLY_MIN_Z = 18.5;
const FLY_MAX_Z = 22.2;
/* Layout framing on load / "Fit Full Layout": closer than an exact fit.
   The user can zoom out manually. Tune these two numbers to taste. */
const LAYOUT_ZOOM_BOOST = 0.6; // extra zoom on top of the exact fit (0 = whole layout just fits)
const LAYOUT_MIN_ZOOM = 18.2; // never start further out than this
const MAP_MAX_Z = 24;
const easeOut = (t) => 1 - (1 - t) ** 3;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const FACINGS = [
  "All",
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];
const LIBRARIES = [];

const isAmenity = (p) =>
  p.type === "amenity" ||
  p.type === "open_space.Amenityspace" ||
  (p.type === "open_space" &&
    (p.title || "").toLowerCase().includes("amenity"));

/* Architectural color palette for Status ON vs Status OFF */
function styleForFeature(p) {
  if (p.type === "road") {
    return {
      fill: ROAD_AND_BG_COLOR, // Solid cement color matching background
      stroke: "none", // Removed road border
      ink: "#E7E1D5",
      sw: 0, // Zero border width
    };
  }
  if (isAmenity(p)) {
    return {
      fill: "#D9468F",
      stroke: "#F472B6",
      ink: "#FFFFFF",
      sw: 0.25,
    };
  }
  if (p.type === "space for STP" || p.type === "open_space.SpaceforSTP") {
    return {
      fill: "#EAB308",
      stroke: "#FEF08A",
      ink: "#1A1208",
      sw: 0.25,
    };
  }
  if (p.type === "space for ESS" || p.type === "open_space.SpaceforESS") {
    return {
      fill: "#7C3AED",
      stroke: "#C4B5FD",
      ink: "#FFFFFF",
      sw: 0.25,
    };
  }
  if (p.type === "open_space") {
    return {
      fill: "#2E7D32",
      stroke: "#81C784",
      ink: "#FFFFFF",
      sw: 0.25,
    };
  }

  // Plots: one cream colour for all of them. Booked / sold are shown by the ring around the number.
  return {
    fill: PLAIN_FILL,
    stroke: "#52473B",
    ink: "#1A1208",
    sw: 0.22,
  };
}

/* ── Self-Contained Local Meter Geometry & CAD Helpers ─────────────── */

function createLocalProjection(originLat, originLng) {
  const R = 6378137;
  const cosLat = Math.cos((originLat * Math.PI) / 180);
  return {
    toMeters(lat, lng) {
      const x = ((lng - originLng) * Math.PI * R * cosLat) / 180;
      const y = -((lat - originLat) * Math.PI * R) / 180;
      return [x, y];
    },
    toLatLng(x, y) {
      const lat = originLat - (y * 180) / (Math.PI * R);
      const lng = originLng + (x * 180) / (Math.PI * R * cosLat);
      return { lat, lng };
    },
  };
}

function ptsToPath(pts) {
  if (!pts || pts.length < 3) return "";
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    d += `L${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
  }
  return `${d}Z`;
}

function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function computeFeatureMetrics(pts) {
  if (!pts || pts.length < 3) {
    return { cx: 0, cy: 0, ir: 4, angle: 0 };
  }
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  // Shoelace Area Centroid so rounded corner plots with 25+ curve vertices stay dead-center
  let area2 = 0;
  let sx = 0;
  let sy = 0;

  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    if (x1 < minX) minX = x1;
    if (x1 > maxX) maxX = x1;
    if (y1 < minY) minY = y1;
    if (y1 > maxY) maxY = y1;

    const cross = x1 * y2 - x2 * y1;
    area2 += cross;
    sx += (x1 + x2) * cross;
    sy += (y1 + y2) * cross;
  }

  const bw = maxX - minX;
  const bh = maxY - minY;
  const cx = Math.abs(area2) > 1e-4 ? sx / (3 * area2) : (minX + maxX) / 2;
  const cy = Math.abs(area2) > 1e-4 ? sy / (3 * area2) : (minY + maxY) / 2;

  let ir = Infinity;
  let longestLen = 0;
  let longestAngle = 0;

  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    const d = distToSeg(cx, cy, x1, y1, x2, y2);
    if (d < ir) ir = d;

    const segLen = Math.hypot(x2 - x1, y2 - y1);
    if (segLen > longestLen) {
      longestLen = segLen;
      let deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      if (deg > 90) deg -= 180;
      if (deg < -90) deg += 180;
      longestAngle = deg;
    }
  }

  const boxIr = Math.min(bw, bh) * 0.42;
  const safeIr =
    Number.isFinite(ir) && ir > 1.5
      ? Math.max(ir, boxIr * 0.85)
      : Math.max(2.2, boxIr);

  return { cx, cy, ir: safeIr, angle: longestAngle };
}

/* ── Road Label Placement ──────────────────────────────────────────────
   A road polygon can be long, bent, or run into a junction, so its centroid often lands
   on a junction or off the road's own axis, and neighbouring labels then collide.
   Instead: find the road's direction, slide the label along it, and take the straightest
   stretch (not a junction) where the whole label fits inside the road, clear of plots and
   of labels already placed. If nothing fits, the label is skipped rather than overlapping. */
const ROAD_GLYPH_W = 0.7; // average glyph advance (em) for bold uppercase + tracking
const roadTextLength = (text, size) => text.length * size * ROAD_GLYPH_W;

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/* Direction of the road: principal axis of its outline (radians, along the road) */
function roadAxisAngle(pts) {
  let n = 0;
  let mx = 0;
  let my = 0;
  const samples = [];
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 1.5));
    for (let k = 0; k < steps; k++) {
      const x = x1 + ((x2 - x1) * k) / steps;
      const y = y1 + ((y2 - y1) * k) / steps;
      samples.push([x, y]);
      mx += x;
      my += y;
      n++;
    }
  }
  mx /= n;
  my /= n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const [x, y] of samples) {
    sxx += (x - mx) * (x - mx);
    syy += (y - my) * (y - my);
    sxy += (x - mx) * (y - my);
  }
  return 0.5 * Math.atan2(2 * sxy, sxx - syy);
}

function labelBox(cx, cy, len, hgt, ang) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const hx = len / 2;
  const hy = hgt / 2;
  return [
    [-hx, -hy],
    [hx, -hy],
    [hx, hy],
    [-hx, hy],
  ].map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]);
}

/* Separating-axis test for two convex quads, with a clearance margin */
function boxesOverlap(a, b, margin) {
  for (const q of [a, b]) {
    for (let i = 0; i < 4; i++) {
      const [x1, y1] = q[i];
      const [x2, y2] = q[(i + 1) % 4];
      const nx = y1 - y2;
      const ny = x2 - x1;
      const l = Math.hypot(nx, ny) || 1;
      let aMin = Infinity;
      let aMax = -Infinity;
      let bMin = Infinity;
      let bMax = -Infinity;
      for (const [x, y] of a) {
        const d = (x * nx + y * ny) / l;
        if (d < aMin) aMin = d;
        if (d > aMax) aMax = d;
      }
      for (const [x, y] of b) {
        const d = (x * nx + y * ny) / l;
        if (d < bMin) bMin = d;
        if (d > bMax) bMax = d;
      }
      if (aMax + margin < bMin || bMax + margin < aMin) return false;
    }
  }
  return true;
}

/**
 * @param roads  [{ key, pts, label }]
 * @param plots  [{ pts }]  polygons a label must not run over
 * @returns Map(key -> { x, y, angle (deg), size })
 */
function placeRoadLabels(roads, plots) {
  const plotIndex = plots.map((p) => {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const [x, y] of p.pts) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    return { pts: p.pts, x0, y0, x1, y1 };
  });
  const onPlot = (x, y) =>
    plotIndex.some(
      (p) =>
        x >= p.x0 &&
        x <= p.x1 &&
        y >= p.y0 &&
        y <= p.y1 &&
        pointInPoly(x, y, p.pts),
    );

  // Prepare each road: axis, polygon in (u along, v across) coordinates, widths along it
  const prepared = [];
  for (const r of roads) {
    if (!r.label || !r.pts || r.pts.length < 3) continue;
    const ang = roadAxisAngle(r.pts);
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const uv = r.pts.map(([x, y]) => [x * c + y * s, -x * s + y * c]);
    let uMin = Infinity;
    let uMax = -Infinity;
    for (const [u] of uv) {
      if (u < uMin) uMin = u;
      if (u > uMax) uMax = u;
    }
    const length = uMax - uMin;
    if (length < 3) continue;
    const step = Math.max(0.75, length / 140);
    const slices = [];
    for (let u = uMin + step; u < uMax - step * 0.5; u += step) {
      const vs = [];
      for (let i = 0; i < uv.length; i++) {
        const [u1, v1] = uv[i];
        const [u2, v2] = uv[(i + 1) % uv.length];
        if (u1 !== u2 && u1 <= u !== u2 <= u)
          vs.push(v1 + ((u - u1) * (v2 - v1)) / (u2 - u1));
      }
      vs.sort((a, b) => a - b);
      let best = null;
      for (let i = 0; i + 1 < vs.length; i += 2) {
        const w = vs[i + 1] - vs[i];
        if (!best || w > best.w) best = { w, vm: (vs[i] + vs[i + 1]) / 2 };
      }
      if (best && best.w > 0.5) slices.push({ u, ...best });
    }
    if (!slices.length) continue;
    const widths = slices.map((q) => q.w).sort((a, b) => a - b);
    const wMed = widths[Math.floor(widths.length / 2)];
    prepared.push({ r, ang, c, s, uMin, uMax, slices, wMed, length });
  }
  // Main roads first, so they get the best spots
  prepared.sort((a, b) => b.wMed - a.wMed || b.length - a.length);

  const placed = [];
  const out = new Map();

  for (const p of prepared) {
    const { r, ang, c, s, uMin, uMax, slices, wMed } = p;
    const uMid = (uMin + uMax) / 2;
    const base = Math.min(Math.max(wMed * 0.21, 1.15), 2.4);

    for (const size of [base, base * 0.85, base * 0.72]) {
      if (size < 1.0) break;
      const len = roadTextLength(r.label, size) * 3.04;
      const hgt = size * 2.3;

      // Straight stretches only (no junction bulges), label must fit across the road
      const cands = slices
        .filter((q) => q.w >= hgt + 0.9 && q.w <= wMed * 1.3 + 0.4)
        .map((q) => ({ ...q, d: Math.abs(q.u - uMid) }))
        .sort((a, b) => a.d - b.d);

      for (const q of cands) {
        const cx = q.u * c - q.vm * s;
        const cy = q.u * s + q.vm * c;
        const box = labelBox(cx, cy, len, hgt + 0.5, ang);

        // 1) the whole label inside this road
        let inside = true;
        for (let i = 0; i <= 8 && inside; i++) {
          for (let j = 0; j <= 2; j++) {
            const u = -len / 2 + (len * i) / 8;
            const v = -(hgt + 0.5) / 2 + ((hgt + 0.5) * j) / 2;
            if (
              !pointInPoly(
                cx + u * Math.cos(ang) - v * Math.sin(ang),
                cy + u * Math.sin(ang) + v * Math.cos(ang),
                r.pts,
              )
            ) {
              inside = false;
              break;
            }
          }
        }
        if (!inside) continue;

        // 2) not over any plot
        let hitsPlot = false;
        for (let i = 0; i <= 8 && !hitsPlot; i++) {
          for (let j = 0; j <= 2; j++) {
            const u = -len / 2 + (len * i) / 8;
            const v = -(hgt + 0.5) / 2 + ((hgt + 0.5) * j) / 2;
            if (
              onPlot(
                cx + u * Math.cos(ang) - v * Math.sin(ang),
                cy + u * Math.sin(ang) + v * Math.cos(ang),
              )
            ) {
              hitsPlot = true;
              break;
            }
          }
        }
        if (hitsPlot) continue;

        // 3) not touching a label already placed
        if (placed.some((b) => boxesOverlap(box, b, 1.0))) continue;

        placed.push(box);
        let deg = (ang * 180) / Math.PI;
        if (deg > 90) deg -= 180;
        if (deg <= -90) deg += 180;
        out.set(r.key, { x: cx, y: cy, angle: deg, size });
        break;
      }
      if (out.has(r.key)) break;
    }
  }
  return out;
}

/* ── CAD Dimension Overlay for Selected Plot (from DimensionOverlay.jsx) ── */
const SelectedDimensionOverlay = memo(function SelectedDimensionOverlay({
  feature,
}) {
  const geom = useMemo(() => {
    if (!feature || !feature.pts || feature.pts.length < 3) return null;
    const { pts, cx, cy, ir, raw } = feature;
    const scale = 1.25;
    const off = (0.55 + ir * 0.03) * scale;
    const txt = Math.max(0.65, Math.min(ir * 0.18, 1.35)) * scale;
    const tick = txt * 0.65;
    const hair = 0.06 * scale;

    const numSize = Math.max(1.4, Math.min(ir * 0.34, 3.6));
    const sqmSize = numSize * 0.38;
    const sqftSize = numSize * 0.46;

    const edges = [];
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const len = Math.hypot(dx, dy);
      if (len < 0.8) continue;

      const ux = dx / len;
      const uy = dy / len;
      const mx = (p1[0] + p2[0]) / 2;
      const my = (p1[1] + p2[1]) / 2;

      let nx = -uy;
      let ny = ux;
      if (nx * (mx - cx) + ny * (my - cy) < 0) {
        nx = -nx;
        ny = -ny;
      }

      const a = [p1[0] + nx * off, p1[1] + ny * off];
      const b = [p2[0] + nx * off, p2[1] + ny * off];
      const lx = mx + nx * (off + txt * 0.85);
      const ly = my + ny * (off + txt * 0.85);

      let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (deg > 90) deg -= 180;
      if (deg < -90) deg += 180;

      edges.push({
        key: `edge-${i}`,
        p1,
        p2,
        a,
        b,
        kx: nx * tick * 0.5,
        ky: ny * tick * 0.5,
        lx,
        ly,
        deg,
        label: `${len.toFixed(2)} m`,
      });
    }

    const areaNum = Number(raw.area) || 0;
    const areaSqFt = Number(raw.areaSqFt) || areaNum * SQFT;

    return {
      cx,
      cy,
      txt,
      hair,
      numSize,
      sqmSize,
      sqftSize,
      edges,
      title: raw.type === "plot" ? raw.plotNo : raw.title,
      sqmLabel: `${areaNum.toFixed(1)} m²`,
      sqftLabel: `${Math.round(areaSqFt).toLocaleString("en-IN")} ft²`,
    };
  }, [feature]);

  if (!geom) return null;
  const {
    cx,
    cy,
    txt,
    hair,
    numSize,
    sqmSize,
    sqftSize,
    edges,
    title,
    sqmLabel,
    sqftLabel,
  } = geom;

  return (
    <g style={{ pointerEvents: "none" }}>
      {edges.map((r) => (
        <g key={r.key}>
          <line
            x1={r.p1[0]}
            y1={r.p1[1]}
            x2={r.a[0]}
            y2={r.a[1]}
            stroke="#FFFFFF"
            strokeWidth={hair}
            strokeDasharray={`${hair * 4} ${hair * 3}`}
            opacity="0.78"
          />
          <line
            x1={r.p2[0]}
            y1={r.p2[1]}
            x2={r.b[0]}
            y2={r.b[1]}
            stroke="#FFFFFF"
            strokeWidth={hair}
            strokeDasharray={`${hair * 4} ${hair * 3}`}
            opacity="0.78"
          />
          <line
            x1={r.a[0]}
            y1={r.a[1]}
            x2={r.b[0]}
            y2={r.b[1]}
            stroke="#FFFFFF"
            strokeWidth={hair * 1.15}
            strokeDasharray={`${hair * 5} ${hair * 3}`}
            opacity="0.95"
          />
          <line
            x1={r.a[0] - r.kx}
            y1={r.a[1] - r.ky}
            x2={r.a[0] + r.kx}
            y2={r.a[1] + r.ky}
            stroke="#FFFFFF"
            strokeWidth={hair * 1.5}
          />
          <line
            x1={r.b[0] - r.kx}
            y1={r.b[1] - r.ky}
            x2={r.b[0] + r.kx}
            y2={r.b[1] + r.ky}
            stroke="#FFFFFF"
            strokeWidth={hair * 1.5}
          />
          <text
            x={r.lx}
            y={r.ly}
            transform={`rotate(${r.deg} ${r.lx} ${r.ly})`}
            textAnchor="middle"
            dy="0.35em"
            fontFamily={MONO}
            fontSize={txt}
            fontWeight="700"
            fill="#FFFFFF"
            stroke="#15181D"
            strokeWidth={txt * 0.22}
            paintOrder="stroke"
          >
            {r.label}
          </text>
        </g>
      ))}

      <text
        x={cx}
        y={cy - numSize * 0.52}
        textAnchor="middle"
        dy="0.35em"
        fontFamily={MAPFONT}
        fontSize={numSize}
        fontWeight="800"
        fill="#FFFFFF"
        stroke="rgba(21,24,29,0.65)"
        strokeWidth={numSize * 0.12}
        paintOrder="stroke"
      >
        {title}
      </text>
      <text
        x={cx}
        y={cy + numSize * 0.35}
        textAnchor="middle"
        dy="0.35em"
        fontFamily={MONO}
        fontSize={sqmSize}
        fontWeight="600"
        fill="#F3E8FF"
      >
        {sqmLabel}
      </text>
      <text
        x={cx}
        y={cy + numSize * 0.92}
        textAnchor="middle"
        dy="0.35em"
        fontFamily={MONO}
        fontSize={sqftSize}
        fontWeight="700"
        fill="#FFFFFF"
      >
        {sqftLabel}
      </text>
    </g>
  );
});

/* ── Unified Masterplan SVG Content (from PlanContent.jsx) ─────────── */
const MasterplanSvgContent = memo(function MasterplanSvgContent({
  layout,
  showStatus,
  highlightKey,
  editingKey,
  opacityFor,
  onPlotClick,
}) {
  const selectedFeature = useMemo(
    () =>
      highlightKey ? layout.features.find((f) => f.key === highlightKey) : null,
    [layout, highlightKey],
  );

  return (
    <g>
      {/* Layout Boundary Base — Solid 100% Opaque Cement Color Matching Roads */}
      {layout.boundaryD && (
        <path
          d={layout.boundaryD}
          fill={ROAD_AND_BG_COLOR}
          fillOpacity="1"
          stroke={ACCENT}
          strokeWidth="0.45"
          strokeDasharray="1.8 1.2"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* All Polygons (Roads first, then Open Spaces, then Plots) */}
      <g>
        {layout.sorted.map((f) => {
          if (editingKey && f.key === editingKey) return null;
          const isSel = highlightKey === f.key;
          const isRoad = f.raw.type === "road";
          const st = styleForFeature(f.raw);
          // Roads stay 100% opaque so they blend seamlessly with the background
          const baseAlpha = isRoad ? 1 : highlightKey && !isSel ? 0.52 : 0.96;
          const alpha = opacityFor(f.raw, baseAlpha);

          return (
            <path
              key={f.rk}
              className="plan-plot-shape"
              d={f.d}
              fill={isSel ? SELECTED_FILL : st.fill}
              fillRule="evenodd"
              fillOpacity={isSel ? 0.96 : alpha}
              stroke={isSel ? SELECTED_STROKE : st.stroke}
              strokeWidth={isSel ? 0.55 : st.sw}
              strokeOpacity={isRoad ? 0 : alpha < 0.4 ? 0.35 : 0.95}
              onClick={(e) => {
                e.stopPropagation();
                onPlotClick(f.raw);
              }}
            />
          );
        })}
      </g>

      {/* Plot Numbers Layer — Uniform Size Across All Plots */}
      <g style={{ pointerEvents: "none" }}>
        {layout.plotFeatures.map((f) => {
          if (f.key === highlightKey || f.key === editingKey) return null;
          if (!f.label) return null;
          const st = styleForFeature(f.raw);
          const alpha = opacityFor(f.raw, highlightKey ? 0.55 : 1);
          const ringColor = showStatus
            ? NUMBER_RING_COLORS[(f.raw.status || "").toLowerCase()]
            : null;
          const ringAlpha = alpha < 0.4 ? 0.28 : alpha;

          return (
            <g key={`num-${f.rk}`}>
              {ringColor && (
                <circle
                  cx={f.cx}
                  cy={f.cy}
                  r={numberRingRadius(f.label, f.fontSize)}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="0.5"
                  strokeOpacity={ringAlpha}
                />
              )}
              <text
                x={f.cx}
                y={f.cy}
                textAnchor="middle"
                dy="0.35em"
                fontFamily={MAPFONT}
                fontSize={f.fontSize}
                fontWeight="700"
                fill={st.ink}
                fillOpacity={ringAlpha}
              >
                {f.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* Road & Open Space Rotated Feature Labels */}
      <g style={{ pointerEvents: "none" }}>
        {layout.zoneFeatures.map((f) => {
          if (!f.label) return null;
          const isRoad = f.raw.type === "road";
          const rl = isRoad ? f.roadLabel : null;
          if (isRoad && !rl) return null; // no clear spot for this road's label
          const size = rl
            ? rl.size
            : Math.min(Math.max(f.ir * 0.32, 1.15), 3.2);
          if (size < 1.0) return null;
          const lx = rl ? rl.x : f.cx;
          const ly = rl ? rl.y : f.cy;
          const lang = rl ? rl.angle : f.angle;
          const alpha = opacityFor(f.raw, highlightKey ? 0.5 : 1);

          return (
            <g
              key={`lbl-${f.rk}`}
              paintOrder="stroke"
              stroke="rgba(15, 18, 24, 0.75)"
              strokeWidth={size * 0.14}
              transform={`rotate(${lang.toFixed(1)} ${lx.toFixed(2)} ${ly.toFixed(2)})`}
              opacity={alpha < 0.4 ? 0.25 : alpha}
            >
              <text
                x={lx}
                y={isRoad ? ly : ly - size * 0.35}
                textAnchor="middle"
                dy="0.35em"
                fontFamily={SANS}
                fontSize={size}
                letterSpacing={isRoad ? "0.04em" : "0.06em"}
                fill="#F8FAFC"
                fontWeight="700"
              >
                {f.label}
              </text>
              {!isRoad && f.raw.area > 120 && (
                <text
                  x={lx}
                  y={ly + size * 0.75}
                  textAnchor="middle"
                  dy="0.35em"
                  fontFamily={MONO}
                  fontSize={size * 0.64}
                  fill="#E7E1D5"
                  fontWeight="600"
                >
                  {Math.round(f.raw.area).toLocaleString("en-IN")} m²
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Raised Selected Plot + Engineering Dimensions */}
      {selectedFeature && editingKey !== selectedFeature.key && (
        <g style={{ pointerEvents: "none" }}>
          <path
            d={selectedFeature.d}
            fill={SELECTED_FILL}
            fillOpacity="0.94"
            stroke={SELECTED_STROKE}
            strokeWidth="0.65"
          />
          <SelectedDimensionOverlay feature={selectedFeature} />
        </g>
      )}
    </g>
  );
});

/* ── Main MapViewer Screen ─────────────────────────────────────────── */
const PUBLIC_USER = { uid: "public", name: "Visitor", role: "guest" };

export default function MapViewer({ publicView = false }) {
  const { mapId } = useParams();
  const { user } = useAuth();
  const isPublic = publicView;
  const viewer = isPublic ? PUBLIC_USER : user;
  const hideStatus = isPublic;
  const nav = useNavigate();
  const toast = useToast();
  const mapRef = useRef(null);
  const flyRafRef = useRef(0);
  const initialFitDoneRef = useRef(false);
  const overlayPortalRef = useRef(null);
  const compassNeedleRef = useRef(null);
  const [, setOverlayReady] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  const [mapDoc, setMapDoc] = useState(null);
  const [plots, setPlots] = useState([]);
  const [boundary, setBoundary] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState("all");
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showAdv, setShowAdv] = useState(false);
  const [adv, setAdv] = useState({
    min: "",
    max: "",
    facing: "All",
    status: "All",
    unit: "m²",
  });
  const [advMatch, setAdvMatch] = useState(new Set());
  const [showArea, setShowArea] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showBrochurePreview, setShowBrochurePreview] = useState(false);

  // const [showStatus, setShowStatus] = useState(!hideStatus);
  const [showStatus, setShowStatus] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [optionsFor, setOptionsFor] = useState(null);
  const [deleteFor, setDeleteFor] = useState(null);
  const [editing, setEditing] = useState(null);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    initialFitDoneRef.current = false;
    getMap(mapId)
      .then((m) => {
        if (!m) return;
        setMapDoc(m);
        setPlots((m.plots ?? []).map((p) => plotFromDoc(p)));
        setBoundary(
          (m.layoutBoundary ?? []).map((p) => ({ lat: +p.lat, lng: +p.lng })),
        );
      })
      .catch((e) => console.error("Error loading map data:", e))
      .finally(() => setLoading(false));
  }, [mapId]);

  useEffect(() => () => cancelAnimationFrame(flyRafRef.current), []);

  /* ── Share ── */
  const shareUrl = `${window.location.origin}/share/${mapId}`;
  const shareText = `${mapDoc?.name || "Layout"} — view the layout and plots`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const t = document.createElement("textarea");
      t.value = shareUrl;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    toast("Link copied", "success");
  };
  const nativeShare = () =>
    navigator
      .share({ title: shareText, text: shareText, url: shareUrl })
      .catch(() => {});
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

  const brochure = useMemo(() => getBrochure(mapDoc), [mapDoc]);

const closeBrochurePreview = useCallback(
  () => setShowBrochurePreview(false),
  [],
);

  const statuses = useMemo(
    () =>
      hideStatus
        ? ["All"]
        : [
            "All",
            ...new Set(
              plots
                .filter((p) => p.type === "plot" && p.status)
                .map((p) => p.status),
            ),
          ],
    [plots, hideStatus],
  );
  const count = useCallback(
    (t) => plots.filter((p) => p.type === t).length,
    [plots],
  );
  const countStatus = useCallback(
    (s) =>
      plots.filter(
        (p) => p.type === "plot" && (p.status || "").toLowerCase() === s,
      ).length,
    [plots],
  );

  /* Build local meter coordinate layout for the unified SVG overlay */
  const layout = useMemo(() => {
    const allPts = plots.length
      ? plots.flatMap((p) => p.corners || [])
      : boundary;
    if (!allPts.length) return null;

    const b = getBounds(allPts);
    if (!b) return null;

    const originLat = (b.north + b.south) / 2;
    const originLng = (b.east + b.west) / 2;
    const proj = createLocalProjection(originLat, originLng);

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    const track = ([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    };

    const boundaryPts = boundary.map((c) => {
      const pt = proj.toMeters(c.lat, c.lng);
      track(pt);
      return pt;
    });

    const features = plots.map((p, idx) => {
      const pts = (p.corners || []).map((c) => {
        const pt = proj.toMeters(c.lat, c.lng);
        track(pt);
        return pt;
      });
      const { cx, cy, ir, angle } = computeFeatureMetrics(pts);
      const label =
        p.type === "plot" ? String(p.plotNo || "") : String(p.title || "");

      return {
        key: p.srNo || p.plotNo || `f-${idx}`, // identity used for highlight / edit matching
        rk: `${p.srNo || p.plotNo || "f"}~${idx}`, // always-unique React render key
        raw: p,
        pts,
        d: ptsToPath(pts),
        cx,
        cy,
        ir,
        angle,
        label,
        // Every plot uses the same consistent font size
        fontSize: UNIFORM_PLOT_FONT_SIZE,
      };
    });

    // One clear, aligned label per road: no junction pile-ups, nothing over plots or other labels
    const roadLabels = placeRoadLabels(
      features
        .map((f, i) => ({
          key: i,
          pts: f.pts,
          label: f.label,
          type: f.raw.type,
        }))
        .filter((f) => f.type === "road"),
      features
        .filter((f) => f.raw.type === "plot")
        .map((f) => ({ pts: f.pts })),
    );
    features.forEach((f, i) => {
      f.roadLabel = roadLabels.get(i) || null;
    });

    const orderScore = (t) => (t === "road" ? 0 : t === "plot" ? 2 : 1);
    const sorted = [...features].sort(
      (a, b) => orderScore(a.raw.type) - orderScore(b.raw.type),
    );

    const pad = 16;
    const x0 = minX - pad;
    const y0 = minY - pad;
    const x1 = maxX + pad;
    const y1 = maxY + pad;

    return {
      proj,
      x0,
      y0,
      x1,
      y1,
      w: Math.max(1, x1 - x0),
      h: Math.max(1, y1 - y0),
      northWestLL: proj.toLatLng(x0, y0),
      southEastLL: proj.toLatLng(x1, y1),
      boundaryD: boundaryPts.length > 2 ? ptsToPath(boundaryPts) : "",
      features,
      sorted,
      plotFeatures: features.filter((f) => f.raw.type === "plot"),
      zoneFeatures: features.filter((f) => f.raw.type !== "plot"),
    };
  }, [plots, boundary]);

  /* ── Smooth Camera Animation Helper (from PlanMap.jsx) ── */
  const animateCameraTo = useCallback(
    (aimCenter, aimZoom, durationMs = FLY_MS) => {
      const m = mapRef.current;
      if (!m || !aimCenter) return;

      cancelAnimationFrame(flyRafRef.current);
      const c0 = m.getCenter();
      if (!c0) {
        m.setCenter(aimCenter);
        if (aimZoom != null) m.setZoom(aimZoom);
        return;
      }

      const startLat = c0.lat();
      const startLng = c0.lng();
      const startZoom = m.getZoom() || 18;
      const targetZoom = aimZoom != null ? aimZoom : startZoom;

      m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });

      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / durationMs);
        const e = easeOut(k);
        const center = {
          lat: startLat + (aimCenter.lat - startLat) * e,
          lng: startLng + (aimCenter.lng - startLng) * e,
        };
        const zoom = startZoom + (targetZoom - startZoom) * e;

        if (typeof m.moveCamera === "function") {
          m.moveCamera({ center, zoom });
        } else {
          m.setCenter(center);
          m.setZoom(zoom);
        }

        if (k < 1) {
          flyRafRef.current = requestAnimationFrame(step);
        } else {
          overlayPortalRef.current?.overlay?.draw?.();
        }
      };
      flyRafRef.current = requestAnimationFrame(step);
    },
    [],
  );

  /* ── Layout framing (single direct camera move: no fitBounds, no idle re-zoom) ── */
  const fitAll = useCallback(() => {
    const m = mapRef.current;
    if (!m) return;
    cancelAnimationFrame(flyRafRef.current);

    const plotPts = plots
      .filter((p) => p.type === "plot")
      .flatMap((p) => p.corners || []);
    const pts = plotPts.length
      ? plotPts
      : plots.length
        ? plots.flatMap((p) => p.corners || [])
        : boundary;

    const b = getBounds(pts);
    if (!b) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad =
      vw < 600
        ? { top: 82, right: 6, bottom: 48, left: 6 }
        : vw < 1024
          ? { top: 88, right: 10, bottom: 42, left: 10 }
          : { top: 92, right: 12, bottom: 32, left: 12 };

    const layoutCenter = {
      lat: (b.north + b.south) / 2,
      lng: (b.east + b.west) / 2,
    };

    // Zoom at which the layout exactly fits the free area, then go a bit closer.
    const R = 6378137;
    const cosLat = Math.cos((layoutCenter.lat * Math.PI) / 180);
    const spanLatM = ((b.north - b.south) * Math.PI * R) / 180;
    const spanLngM = ((b.east - b.west) * Math.PI * R * cosLat) / 180;
    const availW = Math.max(vw - pad.left - pad.right, 120);
    const availH = Math.max(vh - pad.top - pad.bottom, 120);
    const world = 156543.03392 * cosLat; // metres per pixel at zoom 0
    const mpp = Math.max(spanLngM / availW, spanLatM / availH, 0.01);
    const fitZoom = Math.log2(world / mpp);
    const zoom = clamp(
      Math.max(fitZoom + LAYOUT_ZOOM_BOOST, LAYOUT_MIN_ZOOM),
      15,
      MAP_MAX_Z,
    );

    // The search bar takes more room at the top than the bottom, so nudge the
    // camera north a little to keep the layout centred in the free area.
    const shiftPx = (pad.top - pad.bottom) / 2;
    const dLat = (shiftPx * (world / 2 ** zoom)) / 111320;
    const target = { lat: layoutCenter.lat + dLat, lng: layoutCenter.lng };

    m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });
    if (typeof m.moveCamera === "function") {
      m.moveCamera({ center: target, zoom });
    } else {
      m.setCenter(target);
      m.setZoom(zoom);
    }
    overlayPortalRef.current?.overlay?.draw?.();
  }, [plots, boundary]);

  /* ── Calculate Ideal Zoom & Screen-Offset Frame for a Clicked Plot ── */
  const flyToPlot = useCallback(
    (plot, durationMs = FLY_MS, forceZoom = null) => {
      const m = mapRef.current;
      if (!m || !plot) return;

      const corners = plot.corners || [];
      const b = getBounds(corners);
      const center =
        plot.center ||
        (b && {
          lat: (b.north + b.south) / 2,
          lng: (b.east + b.west) / 2,
        });
      if (!center) return;

      let targetZoom = forceZoom;
      if (targetZoom == null) {
        const R = 6378137;
        const cosLat = Math.cos((center.lat * Math.PI) / 180);
        const spanLatM = b
          ? ((b.north - b.south) * Math.PI * R) / 180
          : Math.sqrt(plot.area || 150);
        const spanLngM = b
          ? ((b.east - b.west) * Math.PI * R * cosLat) / 180
          : Math.sqrt(plot.area || 150);

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const boost = vw < 640 ? 1.85 : vw < 1024 ? 1.6 : 1.45;
        const gutterM = 6;

        const needW = (spanLngM + gutterM * 2) * 1.05;
        const needH = (spanLatM + gutterM * 2) * 1.05;

        const availW = Math.max(vw - (vw > 640 ? 410 : 40), 180);
        const availH = Math.max(vh - (vw <= 640 ? 300 : 150), 180);

        const world = 156543.03392 * cosLat;
        const mpp = Math.max(needW / availW, needH / availH) / boost;
        targetZoom = clamp(Math.log2(world / mpp), FLY_MIN_Z, FLY_MAX_Z);
      }

      let aim = center;
      const proj = m.getProjection?.();
      if (proj && window.google?.maps) {
        const vw = window.innerWidth;
        const scale = 2 ** targetZoom;
        const shiftPxX = vw > 640 ? 150 : 0;
        const shiftPxY = vw <= 640 ? 95 : -15;
        const pt = proj.fromLatLngToPoint(
          new window.google.maps.LatLng(center.lat, center.lng),
        );
        if (pt) {
          const shifted = proj.fromPointToLatLng(
            new window.google.maps.Point(
              pt.x + shiftPxX / scale,
              pt.y + shiftPxY / scale,
            ),
          );
          if (shifted) {
            aim = { lat: shifted.lat(), lng: shifted.lng() };
          }
        }
      }

      animateCameraTo(aim, targetZoom, durationMs);
    },
    [animateCameraTo],
  );

  const nudgeZoom = useCallback(
    (delta) => {
      const m = mapRef.current;
      if (!m) return;
      const z0 = m.getZoom() || 19;
      const z1 = clamp(z0 + delta, 15, MAP_MAX_Z);
      if (selected) {
        flyToPlot(selected, ZOOM_STEP_MS, z1);
      } else {
        animateCameraTo(
          { lat: m.getCenter().lat(), lng: m.getCenter().lng() },
          z1,
          ZOOM_STEP_MS,
        );
      }
    },
    [selected, flyToPlot, animateCameraTo],
  );

  /* Mount custom Google Maps OverlayView hosting the unified SVG sheet */
  const attachOverlay = useCallback(
    (mapInstance) => {
      if (!window.google?.maps || !layout) return;
      if (overlayPortalRef.current?.overlay) {
        overlayPortalRef.current.overlay.setMap(null);
      }

      const hostDiv = document.createElement("div");
      hostDiv.style.position = "absolute";
      hostDiv.style.pointerEvents = "auto";
      hostDiv.style.willChange = "transform, width, height, left, top";

      class MasterplanOverlay extends window.google.maps.OverlayView {
        onAdd() {
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(hostDiv);
        }
        draw() {
          const proj = this.getProjection();
          if (!proj) return;
          const nw = proj.fromLatLngToDivPixel(
            new window.google.maps.LatLng(
              layout.northWestLL.lat,
              layout.northWestLL.lng,
            ),
          );
          const se = proj.fromLatLngToDivPixel(
            new window.google.maps.LatLng(
              layout.southEastLL.lat,
              layout.southEastLL.lng,
            ),
          );
          if (!nw || !se) return;
          const left = Math.min(nw.x, se.x);
          const top = Math.min(nw.y, se.y);
          const width = Math.max(1, Math.abs(se.x - nw.x));
          const height = Math.max(1, Math.abs(se.y - nw.y));

          hostDiv.style.left = `${left}px`;
          hostDiv.style.top = `${top}px`;
          hostDiv.style.width = `${width}px`;
          hostDiv.style.height = `${height}px`;
        }
        onRemove() {
          if (hostDiv.parentNode) hostDiv.parentNode.removeChild(hostDiv);
        }
      }

      const ov = new MasterplanOverlay();
      ov.setMap(mapInstance);
      overlayPortalRef.current = { overlay: ov, div: hostDiv };
      setOverlayReady((n) => n + 1);
    },
    [layout],
  );

  const onLoad = useCallback(
    (m) => {
      mapRef.current = m;
      m.setOptions({ isFractionalZoomEnabled: true, maxZoom: MAP_MAX_Z });
      attachOverlay(m);
      setMapReady(true); // triggers the one-time initial fit once the layout is also ready
    },
    [attachOverlay],
  );

  useEffect(() => {
    if (isLoaded && mapReady && mapRef.current && layout) {
      attachOverlay(mapRef.current);
      if (!initialFitDoneRef.current) {
        initialFitDoneRef.current = true;
        fitAll(); // exactly once per map, when both the map and the layout exist
      }
    }
    return () => {
      if (overlayPortalRef.current?.overlay) {
        overlayPortalRef.current.overlay.setMap(null);
      }
    };
  }, [isLoaded, mapReady, layout, attachOverlay, fitAll]);

  const onIdle = useCallback(() => {
    const m = mapRef.current;
    if (!m) return;
    if (compassNeedleRef.current) {
      const h = m.getHeading?.() || 0;
      compassNeedleRef.current.style.transform = `rotate(${-h}deg)`;
    }
  }, []);

  const resetNorth = useCallback(() => {
    const m = mapRef.current;
    if (!m) return;
    if (typeof m.moveCamera === "function") {
      m.moveCamera({ heading: 0, tilt: 0 });
    }
    setSelected(null);
    setHighlight(null);
    fitAll();
  }, [fitAll]);

  const opacityFor = useCallback(
    (p, base) => {
      let o = base;
      if (advMatch.size && p.type === "plot" && !advMatch.has(p.srNo)) o = 0.14;
      if (typeFilter === "plot" && p.type !== "plot") o = 0.16;
      if (typeFilter === "road" && p.type !== "road") o = 0.16;
      if (typeFilter === "open_space" && p.type !== "open_space") o = 0.16;
      if (typeFilter === "amenity" && !isAmenity(p)) o = 0.16;
      if (
        typeFilter === "category" &&
        (p.type !== "plot" || p.status !== category)
      )
        o = 0.16;
      return o;
    },
    [advMatch, typeFilter, category],
  );

  /* ── Click Plot -> Highlight, Open Sheet & Smoothly Fly/Zoom Into Plot ── */
  const onPlotClick = useCallback(
    (p) => {
      if (editing) return;
      if (editMode) return setOptionsFor(p);
      setHighlight(p);
      setSelected(p);
      flyToPlot(p, FLY_MS);
    },
    [editing, editMode, flyToPlot],
  );

  // ── search ──
  const doSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) return setHighlight(null);
    const hit = plots.find(
      (p) =>
        (p.plotNo || "").toLowerCase() === q ||
        (p.srNo || "").toLowerCase() === q ||
        (p.title || "").toLowerCase().includes(q),
    );
    if (!hit) return toast("No match found", "error");
    setHighlight(hit);
    setSelected(hit);
    flyToPlot(hit, FLY_MS);
  };

  // ── advanced filter ──
  const applyAdv = () => {
    let minA = parseFloat(adv.min);
    let maxA = parseFloat(adv.max);
    if (!isNaN(minA) && !isNaN(maxA) && minA > maxA) {
      [minA, maxA] = [maxA, minA];
    }
    const isFt = adv.unit === "ft²";
    const hasArea = !isNaN(minA) || !isNaN(maxA);
    if (!hasArea && adv.facing === "All" && adv.status === "All") {
      setAdvMatch(new Set());
      setShowAdv(false);
      return;
    }
    const matched = plots.filter((p) => {
      if (p.type !== "plot") return false;
      const val = isFt ? p.areaSqFt || p.area * SQFT : p.area;
      if (!isNaN(minA) && val < minA) return false;
      if (!isNaN(maxA) && val > maxA) return false;
      if (
        adv.facing !== "All" &&
        !(p.facing || "").toLowerCase().includes(adv.facing.toLowerCase())
      )
        return false;
      if (adv.status !== "All" && p.status !== adv.status) return false;
      return true;
    });
    setAdvMatch(new Set(matched.map((p) => p.srNo)));
    setShowAdv(false);
    const b = getBounds(matched.flatMap((p) => p.corners));
    if (b)
      mapRef.current?.fitBounds(
        { south: b.south, north: b.north, west: b.west, east: b.east },
        { top: 96, right: 24, bottom: 64, left: 24 },
      );
  };

  const clearAdv = () => {
    setAdv({ min: "", max: "", facing: "All", status: "All", unit: "m²" });
    setAdvMatch(new Set());
  };

  // ── edit mode (admin) ──
  const persist = async (nextPlots) => {
    await updateMapPlots(mapId, nextPlots, boundary);
    setPlots(nextPlots);
  };
  const savePlotEdits = async () => {
    if (!editing || points.length < 3)
      return toast("Need at least 3 points", "error");
    try {
      const updated = {
        ...editing,
        corners: points,
        area: calculatePolygonArea(points),
        center: getPolygonCenter(points),
      };
      await persist(plots.map((p) => (p === editing ? updated : p)));
      setEditing(null);
      setPoints([]);
      toast("Plot updated", "success");
    } catch (e) {
      toast(`Error: ${e.message}`, "error");
    }
  };
  const deletePlot = async () => {
    const p = deleteFor;
    setDeleteFor(null);
    try {
      await persist(plots.filter((x) => x !== p));
      toast(`${p.plotNo} deleted`, "success");
    } catch (e) {
      toast(`Error: ${e.message}`, "error");
    }
  };

  const highlightKey = highlight ? highlight.srNo || highlight.plotNo : null;
  const editingKey = editing ? editing.srNo || editing.plotNo : null;

  if (loading) return <Spinner />;
  if (loadError)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          background: "#0B0E13",
          color: "#E68A72",
          fontFamily: MONO,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <h3 style={{ color: INK, marginBottom: 8 }}>
            Google Maps failed to load
          </h3>
          <p style={{ color: MUTED, fontSize: 13 }}>
            Check VITE_GOOGLE_MAPS_API_KEY and disable any ad-blocker.
          </p>
        </div>
      </div>
    );

  const center = plots[0]?.center ??
    boundary[0] ?? { lat: 21.1458, lng: 79.0882 };

  return (
    <div className="ref-map-page">
      <style>{`
        .ref-map-page {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #0B0E13;
          font-family: ${SANS};
          color: ${INK};
          user-select: none;
        }
        path.plan-plot-shape {
          cursor: pointer;
          transition: fill-opacity 120ms ease, stroke-width 120ms ease;
        }
        path.plan-plot-shape:hover {
          fill-opacity: 0.78;
        }
        .ref-hud-top {
          position: absolute;
          top: 14px;
          left: 14px;
          right: 14px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
        .ref-topbar {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: ${CANVAS};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${HAIR};
          border-radius: 14px;
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.52);
          flex-wrap: wrap;
        }
        .ref-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid ${HAIR};
          color: ${INK};
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: border-color 150ms ease, color 150ms ease, transform 120ms ease;
          flex-shrink: 0;
        }
        .ref-icon-btn:hover {
          border-color: ${ACCENT};
          color: ${ACCENT};
        }
        .ref-icon-btn.active {
          background: ${ACCENT};
          border-color: ${ACCENT};
          color: #15181D;
        }
        .ref-search {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid ${HAIR};
          border-radius: 10px;
          padding: 4px 6px 4px 12px;
        }
        .ref-search:focus-within {
          border-color: ${ACCENT};
        }
        .ref-search input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: ${INK};
          font: 400 13px/1 ${MONO};
          padding: 6px 0;
        }
        .ref-search input::placeholder {
          color: ${MUTED};
        }
        .ref-find-btn {
          font: 600 12px/1 ${MONO};
          background: ${ACCENT};
          color: #15181D;
          border: none;
          border-radius: 7px;
          padding: 7px 12px;
          cursor: pointer;
        }
        .ref-chips-row {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 7px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .ref-chips-row::-webkit-scrollbar { display: none; }
       .ref-pill {
          font: 500 12px/1 ${MONO};
          color: ${INK};
          background: ${PANEL};
          border: 1px solid ${HAIR};
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          transition: all 150ms ease;
          
          /* ── Added Fixes for Mobile Overlap ── */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;         /* Prevents the pill from squishing */
          min-height: 32px;       /* Ensures consistent height */
          box-sizing: border-box; /* Keeps padding inside the width */
        }
        .ref-pill:hover {
          border-color: ${ACCENT};
        }
        .ref-pill.on {
          color: #15181D;
          background: ${ACCENT};
          border-color: ${ACCENT};
          font-weight: 700;
        }
          @media (max-width: 768px) {
          /* ── Make Top HUD Ultra-Compact ── */
          .ref-hud-top {
            top: 8px;
            left: 8px;
            right: 8px;
            gap: 6px;
          }
          .ref-topbar {
            padding: 8px 10px;
            gap: 8px;
            border-radius: 12px;
          }
          .ref-icon-btn {
            width: 36px;
            height: 36px;
          }
          /* Hide Title & Eyebrow on mobile to save vertical space */
          .ref-topbar > div:nth-child(2) {
            display: none;
          }
          .ref-search {
            padding: 0 10px;
            height: 36px;
          }
          .ref-search input {
            font-size: 14px;
          }
          .ref-find-btn {
            padding: 5px 10px;
          }

          /* ── Transform Legend into a Horizontal Bottom Bar ── */
          .mv-status-legend {
            left: 8px !important;
            right: 8px !important;
            bottom: 8px !important;
            max-width: none !important;
            width: calc(100vw - 16px) !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            padding: 8px 12px !important;
            border-radius: 10px !important;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .mv-status-legend::-webkit-scrollbar {
            display: none;
          }
          .mv-status-item {
            flex-shrink: 0; /* Keep items on one line */
          }

          /* ── Nudge Bottom-Right Toggles & Zoom Controls Up ── */
          .mv-bottom-right-controls {
            bottom: 60px !important;
            right: 8px !important;
            transform: scale(0.9);
            transform-origin: bottom right;
          }
        }
      `}</style>

      {/* ── Google Map Base Canvas ── */}
      <GoogleMap
        mapContainerStyle={{ position: "absolute", inset: 0 }}
        center={center}
        zoom={18.5}
        onLoad={onLoad}
        onIdle={onIdle}
        options={{
          mapTypeId: "hybrid",
          isFractionalZoomEnabled: true,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          rotateControl: false,
          zoomControl: false,
          gestureHandling: "greedy",
          maxZoom: MAP_MAX_Z,
          backgroundColor: "#0B0E13",
        }}
        onClick={(e) => {
          if (editing) {
            setPoints((p) => [
              ...p,
              { lat: e.latLng.lat(), lng: e.latLng.lng() },
            ]);
          } else if (selected || highlight) {
            setHighlight(null);
            setSelected(null);
          }
        }}
      >
        {/* Admin Polygon Vertex Editor (Active only while editing a boundary) */}
        {editing && (
          <>
            <PolygonF
              paths={points}
              options={{
                fillColor: ACCENT,
                fillOpacity: 0.35,
                strokeColor: ACCENT,
                strokeWeight: 3,
                clickable: false,
                zIndex: 30,
              }}
            />
            {points.map((pt, i) => (
              <MarkerF
                key={i}
                position={pt}
                draggable
                zIndex={40}
                onDragEnd={(e) =>
                  setPoints((ps) =>
                    ps.map((p, j) =>
                      j === i
                        ? { lat: e.latLng.lat(), lng: e.latLng.lng() }
                        : p,
                    ),
                  )
                }
                onRightClick={() =>
                  setPoints((ps) => ps.filter((_, j) => j !== i))
                }
              />
            ))}
          </>
        )}
      </GoogleMap>

      {/* ── Unified Masterplan SVG Portal ── */}
      {overlayPortalRef.current?.div &&
        layout &&
        createPortal(
          <svg
            viewBox={`${layout.x0} ${layout.y0} ${layout.w} ${layout.h}`}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              overflow: "visible",
            }}
          >
            <MasterplanSvgContent
              layout={layout}
              showStatus={showStatus}
              highlightKey={highlightKey}
              editingKey={editingKey}
              opacityFor={opacityFor}
              onPlotClick={onPlotClick}
            />
          </svg>,
          overlayPortalRef.current.div,
        )}

      {/* ── Top Architectural Bar + Category Pills ── */}
      <div className="ref-hud-top">
        <div className="ref-topbar">
          {!isPublic && (
            <button
              className="ref-icon-btn"
              onClick={() => nav(-1)}
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div style={{ minWidth: 140 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: ACCENT,
              }}
            >
              MASTERPLAN
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: INK,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 240,
              }}
            >
              {mapDoc?.name || "Layout Map"}
            </div>
          </div>

          <div className="ref-search">
            <Search size={15} color={MUTED} />
            <input
              placeholder="Search plot no / sr no / title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setHighlight(null);
                  setSelected(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: MUTED,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={14} />
              </button>
            )}
            <button className="ref-find-btn" onClick={doSearch}>
              Find
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className={`ref-icon-btn ${showAdv || advMatch.size > 0 ? "active" : ""}`}
              title="Filters"
              onClick={() => setShowAdv(!showAdv)}
            >
              <SlidersHorizontal size={17} />
            </button>

            <button
              className="ref-icon-btn"
              title="Fit Full Layout"
              onClick={() => {
                setSelected(null);
                setHighlight(null);
                fitAll();
              }}
            >
              <Maximize2 size={17} />
            </button>

            <button
              className="ref-icon-btn"
              title="Area Details"
              onClick={() => setShowArea(true)}
            >
              <Info size={17} />
            </button>
     {brochure && (
  <button
    className="ref-icon-btn"
    type="button"
    title="View brochure PDF"
    aria-label="View brochure PDF"
    onClick={() => setShowBrochurePreview(true)}
  >
    <Download size={17} />
  </button>
)}
    
            {isAdmin(user) && (
              <button
                className={`ref-icon-btn ${editMode ? "active" : ""}`}
                title={editMode ? "Done Editing" : "Edit Layout"}
                onClick={() => {
                  setEditMode(!editMode);
                  toast(editMode ? "Edit mode OFF" : "Edit mode ON");
                }}
              >
                {editMode ? <Check size={17} /> : <Pencil size={17} />}
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="ref-chips-row">
          {[
            ["all", `All (${plots.length})`],
            ["plot", `Plots (${count("plot")})`],
            ["road", `Roads (${count("road")})`],
            ["open_space", `Open Spaces (${count("open_space")})`],
            ["amenity", "Amenities"],
          ].map(([k, l]) => (
            <button
              key={k}
              className={`ref-pill ${typeFilter === k ? "on" : ""}`}
              onClick={() => {
                setTypeFilter(k);
                setCategory(null);
              }}
            >
              {l}
            </button>
          ))}
          {statuses
            .filter((s) => s !== "All")
            .map((s) => (
              <button
                key={s}
                className={`ref-pill ${typeFilter === "category" && category === s ? "on" : ""}`}
                onClick={() => {
                  setTypeFilter("category");
                  setCategory(s);
                }}
              >
                {s} ({countStatus(s.toLowerCase())})
              </button>
            ))}
        </div>
      </div>

      {/* ── Reference Staged FilterPanel (from FilterPanel.jsx) ── */}
      {showAdv && (
        <div
          role="dialog"
          aria-label="Filter plots"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 122,
            left: 14,
            zIndex: 12,
            width: 320,
            maxWidth: "calc(100vw - 28px)",
            maxHeight: "calc(100vh - 150px)",
            display: "flex",
            flexDirection: "column",
            background: CANVAS,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${HAIR}`,
            borderRadius: 14,
            boxShadow: "0 22px 54px rgba(0, 0, 0, 0.55)",
            overflow: "hidden",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px 11px",
              borderBottom: `1px solid ${HAIR}`,
            }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: ACCENT,
              }}
            >
              Filters
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {advMatch.size > 0 && (
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: INK,
                    background: "rgba(255, 255, 255, 0.06)",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  {advMatch.size} matched
                </span>
              )}
              <button
                onClick={() => setShowAdv(false)}
                style={{
                  font: `400 18px/1 ${MONO}`,
                  color: MUTED,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>
          </header>

          <div
            style={{
              display: "grid",
              gap: 16,
              padding: 16,
              overflowY: "auto",
            }}
          >
            <div style={{ display: "grid", gap: 9 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                Area Range ({adv.unit})
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                {["m²", "ft²"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setAdv({ ...adv, unit: u })}
                    style={{
                      font: `500 12px/1 ${MONO}`,
                      color: adv.unit === u ? "#15181D" : INK,
                      background:
                        adv.unit === u ? ACCENT : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${adv.unit === u ? ACCENT : HAIR}`,
                      borderRadius: 999,
                      padding: "7px 13px",
                      cursor: "pointer",
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <input
                  type="number"
                  placeholder="Min"
                  value={adv.min}
                  onChange={(e) => setAdv({ ...adv, min: e.target.value })}
                  style={{
                    font: `400 13px/1 ${MONO}`,
                    color: INK,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${HAIR}`,
                    borderRadius: 9,
                    padding: "10px",
                    width: "100%",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
                  to
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={adv.max}
                  onChange={(e) => setAdv({ ...adv, max: e.target.value })}
                  style={{
                    font: `400 13px/1 ${MONO}`,
                    color: INK,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${HAIR}`,
                    borderRadius: 9,
                    padding: "10px",
                    width: "100%",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gap: 9 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                Facing
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {FACINGS.map((f) => {
                  const on = adv.facing === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setAdv({ ...adv, facing: f })}
                      style={{
                        font: `500 12px/1 ${MONO}`,
                        color: on ? "#15181D" : INK,
                        background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
                        border: `1px solid ${on ? ACCENT : HAIR}`,
                        borderRadius: 999,
                        padding: "8px 12px",
                        cursor: "pointer",
                      }}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gap: 9 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                Status
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {statuses.map((s) => {
                  const on = adv.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAdv({ ...adv, status: s })}
                      style={{
                        font: `500 12px/1 ${MONO}`,
                        color: on ? "#15181D" : INK,
                        background: on ? ACCENT : "rgba(255, 255, 255, 0.03)",
                        border: `1px solid ${on ? ACCENT : HAIR}`,
                        borderRadius: 999,
                        padding: "8px 12px",
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <footer
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr",
              gap: 9,
              padding: 12,
              borderTop: `1px solid ${HAIR}`,
            }}
          >
            <button
              type="button"
              onClick={clearAdv}
              style={{
                font: `500 13px/1 ${MONO}`,
                color: INK,
                background: "transparent",
                border: `1px solid ${HAIR}`,
                borderRadius: 10,
                padding: "11px 0",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={applyAdv}
              style={{
                font: `600 13px/1 ${MONO}`,
                color: "#15181D",
                background: ACCENT,
                border: `1px solid ${ACCENT}`,
                borderRadius: 10,
                padding: "11px 0",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </footer>
        </div>
      )}

      {/* ── Live North Compass & Zoom Controls (from PlanMap.jsx) ── */}
      <div
        style={{
          position: "absolute",
          zIndex: 8,
          right: 14,
          top: 122,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          title="Face north & fit layout"
          onClick={resetNorth}
          style={{
            width: 44,
            height: 44,
            display: "grid",
            placeItems: "center",
            padding: 0,
            background: CANVAS,
            border: `1px solid ${HAIR}`,
            borderRadius: 22,
            cursor: "pointer",
            boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
          }}
        >
          <svg width="26" height="26" viewBox="-13 -13 26 26">
            <g
              ref={compassNeedleRef}
              style={{ transformOrigin: "50% 50%", willChange: "transform" }}
            >
              <path d="M0 -9 L4.5 1.5 L0 -0.8 Z" fill={ACCENT} />
              <path
                d="M0 -9 L-4.5 1.5 L0 -0.8 Z"
                fill={ACCENT}
                fillOpacity="0.55"
              />
              <path d="M0 9 L4.5 -1.5 L0 0.8 Z" fill={HAIR} />
              <path
                d="M0 9 L-4.5 -1.5 L0 0.8 Z"
                fill={HAIR}
                fillOpacity="0.55"
              />
            </g>
            <text
              x="0"
              y="-9.5"
              textAnchor="middle"
              fill={INK}
              fontFamily={MONO}
              fontSize="7"
              fontWeight="700"
            >
              N
            </text>
          </svg>
        </button>

        {/* Zoom + / - / Re-center Plot controls */}
        <button
          type="button"
          title="Zoom in"
          onClick={() => nudgeZoom(ZOOM_STEP)}
          style={{
            width: 42,
            height: 42,
            font: `500 18px/1 ${MONO}`,
            color: INK,
            background: CANVAS,
            border: `1px solid ${HAIR}`,
            borderRadius: 12,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
          }}
        >
          +
        </button>
        <button
          type="button"
          title="Zoom out"
          onClick={() => nudgeZoom(-ZOOM_STEP)}
          style={{
            width: 42,
            height: 42,
            font: `500 18px/1 ${MONO}`,
            color: INK,
            background: CANVAS,
            border: `1px solid ${HAIR}`,
            borderRadius: 12,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
          }}
        >
          −
        </button>
        {selected && (
          <button
            type="button"
            title="Refit selected plot"
            onClick={() => flyToPlot(selected, 320)}
            style={{
              width: 42,
              height: 42,
              font: `500 16px/1 ${MONO}`,
              color: ACCENT,
              background: CANVAS,
              border: `1px solid ${ACCENT}`,
              borderRadius: 12,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
            }}
          >
            ⌂
          </button>
        )}
      </div>

      {/* ── Admin Polygon Editing Banner ── */}
      {editing && (
        <div
          style={{
            position: "absolute",
            bottom: 74,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 15,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 18px",
            background: CANVAS,
            backdropFilter: "blur(16px)",
            border: `1px solid ${ACCENT}`,
            borderRadius: 14,
            boxShadow: "0 20px 44px rgba(0,0,0,0.6)",
            fontFamily: MONO,
            fontSize: 12,
          }}
        >
          <span>
            Points: <b style={{ color: ACCENT }}>{points.length}</b> · click map
            to add, right-click vertex to remove
          </span>
          <button
            onClick={savePlotEdits}
            style={{
              font: `600 12px/1 ${MONO}`,
              background: ACCENT,
              color: "#15181D",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setPoints([]);
            }}
            style={{
              font: `500 12px/1 ${MONO}`,
              background: "transparent",
              color: INK,
              border: `1px solid ${HAIR}`,
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Bottom-Left StatusLegend (from Statuslegend.jsx) ── */}
      {showStatus && (
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 14,
            zIndex: 8,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "10px 14px",
            padding: "10px 14px",
            background: PANEL,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1px solid ${HAIR}`,
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.38)",
            maxWidth: "calc(100vw - 220px)",
          }}
        >
          {[
            [PLAIN_FILL, "Available", countStatus("available"), null],
            [
              PLAIN_FILL,
              "Booked",
              countStatus("booked"),
              NUMBER_RING_COLORS.booked,
            ],
            [PLAIN_FILL, "Sold", countStatus("sold"), NUMBER_RING_COLORS.sold],
            ["#2E7D32", "Open Space", count("open_space"), null],
            ["#D9468F", "Amenity", null, null],
            [ROAD_AND_BG_COLOR, "Road", count("road"), null],
          ].map(([dot, label, cnt, ring]) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 7 }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: ring ? "50%" : 3,
                  background: dot,
                  border: ring ? `2.5px solid ${ring}` : `1px solid ${HAIR}`,
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  font: `500 12px/1 ${MONO}`,
                  color: INK,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
              {cnt !== null && cnt > 0 && (
                <span
                  style={{
                    font: `500 11px/1 ${MONO}`,
                    color: MUTED,
                    background: "rgba(255, 255, 255, 0.06)",
                    padding: "3px 6px",
                    borderRadius: 5,
                  }}
                >
                  {cnt}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom-Right Status toggle ── */}
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 14,
          zIndex: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {[...(hideStatus ? [] : [["Status", showStatus, setShowStatus]])].map(
          ([label, on, toggle]) => (
            <button
              key={label}
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => toggle(!on)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                font: `500 13px/1 ${MONO}`,
                color: INK,
                background: PANEL,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: `1px solid ${HAIR}`,
                borderRadius: 12,
                padding: "9px 13px",
                cursor: "pointer",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
              }}
            >
              <span>{label}</span>
              <span
                style={{
                  width: 42,
                  height: 22,
                  borderRadius: 999,
                  background: on ? "#7CB342" : "rgba(255, 255, 255, 0.20)",
                  position: "relative",
                  transition: "background 180ms ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 2,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    transform: on ? "translateX(20px)" : "translateX(0px)",
                    transition: "transform 180ms ease",
                  }}
                />
              </span>
            </button>
          ),
        )}
      </div>

      {/* ── Selected Plot Inspector Sheet ── */}
      {selected && (
        <PlotViewSheet
          plot={hideStatus ? { ...selected, status: "" } : selected}
          mapId={mapId}
          mapName={mapDoc?.name ?? ""}
          user={viewer}
          onClose={() => {
            setSelected(null);
            setHighlight(null);
          }}
        />
      )}

      {/* ── Admin Options Modal ── */}
      {optionsFor && (
        <Modal
          title={`Plot ${optionsFor.plotNo || optionsFor.title}`}
          onClose={() => setOptionsFor(null)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="btn ghost"
              onClick={() => {
                setEditing(optionsFor);
                setPoints(optionsFor.corners);
                setOptionsFor(null);
                toast(
                  "Click map to add points. Right-click a point to remove.",
                );
              }}
            >
              <Pencil size={15} /> Edit Boundary
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                setSelected(optionsFor);
                setHighlight(optionsFor);
                setOptionsFor(null);
                flyToPlot(optionsFor, FLY_MS);
              }}
            >
              <Eye size={15} /> View Details
            </button>
            <button
              className="btn danger"
              onClick={() => {
                setDeleteFor(optionsFor);
                setOptionsFor(null);
              }}
            >
              <Trash2 size={15} /> Delete Plot
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteFor && (
        <Modal
          title="Delete Plot"
          onClose={() => setDeleteFor(null)}
          actions={
            <>
              <button className="btn text" onClick={() => setDeleteFor(null)}>
                Cancel
              </button>
              <button className="btn danger" onClick={deletePlot}>
                Delete
              </button>
            </>
          }
        >
          Delete {deleteFor.plotNo}?
        </Modal>
      )}

      {/* ── Area Telemetry Modal ── */}
      {showArea && (
        <Modal
          title="Area Details"
          onClose={() => setShowArea(false)}
          actions={
            <button className="btn" onClick={() => setShowArea(false)}>
              Close
            </button>
          }
        >
          {[
            ["Total Area", mapDoc?.totalArea ?? "0"],
            ["Total Plots", mapDoc?.totalPlots ?? count("plot")],
            ["Total Roads", mapDoc?.totalRoads ?? count("road")],
            [
              "Total Open Spaces",
              mapDoc?.totalOpenSpaces ?? count("open_space"),
            ],
          ].map(([k, v]) => (
            <div className="kv" key={k}>
              <span>{k}</span>
              <b>{String(v)}</b>
            </div>
          ))}
        </Modal>
      )}

      {/* ── Share Modal ── */}
      {showShare && (
        <Modal
          title="Share this layout"
          onClose={() => setShowShare(false)}
          actions={
            <button className="btn" onClick={() => setShowShare(false)}>
              Done
            </button>
          }
        >
          <p style={{ marginTop: 0, color: "#64748b", fontSize: 13 }}>
            Anyone with this link can view the layout. No login needed.
          </p>
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #D0DFFF",
              borderRadius: 10,
              fontSize: 13,
              background: "#F5F9FF",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 14,
            }}
          >
            <button className="btn" onClick={copyLink}>
              <Copy size={15} /> Copy link
            </button>
            <a
              className="btn green"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
            {navigator.share && (
              <button className="btn ghost" onClick={nativeShare}>
                <Share2 size={15} /> More…
              </button>
            )}
            
          </div>
        </Modal>
      )}
      {showBrochurePreview && brochure && (
  <BrochurePreview
    brochure={brochure}
    title={mapDoc?.name || "Layout brochure"}
    onClose={closeBrochurePreview}
  />
)}
    </div>
  );
}
