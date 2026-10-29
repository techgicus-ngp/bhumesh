// // screens/employee_home.dart — 4 tabs: Maps · Quotations · Site Visits · Bookings
// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   LogOut,
//   Map as MapIcon,
//   FileText,
//   ClipboardList,
//   BookmarkCheck,
//   Plus,
//   FileX,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import {
//   getEmployeeQuotations,
//   getQuotationsForSites,
// } from "../services/quotationService";
// import { getEmployeeVisits } from "../services/siteVisitService";
// import { SearchBar, Spinner, EmptyState, StatPill } from "../components/ui";
// import MapsTab from "../components/MapsTab";
// import QuotationCard from "../components/QuotationCard";
// import SiteVisitList from "../components/SiteVisitList";
// import { fmtCurrency } from "../utils/format";

// const TABS = [
//   ["Maps", MapIcon],
//   ["Quotations", FileText],
//   ["Site Visits", ClipboardList],
//   ["Bookings", BookmarkCheck],
// ];

// function useSub(subscribe, deps) {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   useEffect(() => {
//     setData(null);
//     return subscribe(setData, (e) => {
//       console.error(e);
//       setError(e);
//       setData([]);
//     });
//   }, deps); // eslint-disable-line
//   return [data, error];
// }

// export default function EmployeeHome() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   const [tab, setTab] = useState(0);
//   const [search, setSearch] = useState("");

//   const [quotations, qErr] = useSub(
//     (cb, err) => getEmployeeQuotations(user.uid, cb, err),
//     [user.uid],
//   );
//   const [visits] = useSub(
//     (cb, err) => getEmployeeVisits(user.uid, cb, err),
//     [user.uid],
//   );
//   const [bookings] = useSub(
//     (cb, err) => getQuotationsForSites(user.assignedSiteIds, cb, err),
//     [user.assignedSiteIds.join(",")],
//   );

//   const total = useMemo(
//     () => (quotations ?? []).reduce((s, q) => s + q.finalTotalAmount, 0),
//     [quotations],
//   );
//   const filteredQ = useMemo(() => {
//     const n = search.toLowerCase();
//     return (quotations ?? []).filter(
//       (q) =>
//         !n ||
//         q.customerName.toLowerCase().includes(n) ||
//         q.plotNumber.toLowerCase().includes(n) ||
//         q.projectName.toLowerCase().includes(n),
//     );
//   }, [quotations, search]);

//   return (
//     <div className="page">
//       <div className="hero">
//         <div className="container">
//           <div className="row">
//             <div>
//               <small>{user.role.toUpperCase()}</small>
//               <h2>Welcome, {user.name}</h2>
//               <p>Bhumesh Realtors</p>
//             </div>
//             <button
//               className="icon-btn light"
//               onClick={logout}
//               title="Sign out"
//             >
//               <LogOut />
//             </button>
//           </div>
//           <div className="stat-row">
//             <StatPill label="Quotations" value={quotations?.length ?? "–"} />
//             <StatPill
//               label="Total Value"
//               value={quotations ? fmtCurrency(total) : "–"}
//             />
//             <StatPill label="Site Visits" value={visits?.length ?? "–"} />
//           </div>
//           <div className="tabs">
//             {TABS.map(([label, Icon], i) => (
//               <button
//                 key={label}
//                 className={`tab ${tab === i ? "active" : ""}`}
//                 onClick={() => setTab(i)}
//               >
//                 <Icon size={16} /> {label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="container" style={{ flex: 1 }}>
//         {tab === 0 && (
//           <MapsTab withFilters onOpen={(m) => nav(`/maps/${m.id}`)} />
//         )}

//         {tab === 1 && (
//           <>
//             <div style={{ paddingTop: 14 }}>
//               <SearchBar
//                 value={search}
//                 onChange={setSearch}
//                 placeholder="Search by customer, plot or project…"
//               />
//             </div>
//             <div className="section-head">
//               <span>Quotations</span>
//               <span className="hint">Tap to view details</span>
//             </div>
//             {qErr ? (
//               <p style={{ color: "#ef4444" }}>
//                 Failed to load quotations: {qErr.message}
//               </p>
//             ) : quotations === null ? (
//               <Spinner />
//             ) : filteredQ.length === 0 ? (
//               <EmptyState
//                 icon={FileX}
//                 title={search ? "No quotations found" : "No quotations yet"}
//                 subtitle={
//                   search
//                     ? "Try a different search"
//                     : "Open a map, tap a plot and generate one"
//                 }
//               />
//             ) : (
//               <div className="list">
//                 {filteredQ.map((q, i) => (
//                   <QuotationCard key={q.id} q={q} index={i} />
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {tab === 2 && <SiteVisitList employee={user} />}

//         {tab === 3 &&
//           (user.assignedSiteIds.length === 0 ? (
//             <EmptyState
//               icon={MapIcon}
//               title="No sites assigned yet"
//               subtitle="Contact your admin to get assigned to a site."
//             />
//           ) : (
//             <>
//               <div className="section-head">
//                 <span>Customers &amp; Bookings</span>
//                 <span className="hint">For your assigned sites</span>
//               </div>
//               {bookings === null ? (
//                 <Spinner />
//               ) : bookings.length === 0 ? (
//                 <EmptyState icon={FileX} title="No quotations yet" />
//               ) : (
//                 <div className="list">
//                   {bookings.map((q, i) => (
//                     <QuotationCard key={q.id} q={q} index={i} />
//                   ))}
//                 </div>
//               )}
//             </>
//           ))}
//       </div>

//       {tab === 2 && (
//         <button className="btn fab" onClick={() => nav("/site-visit/new")}>
//           <Plus size={18} /> New Visit
//         </button>
//       )}
//     </div>
//   );
// }



// screens/employee_home.jsx — Premium Employee Dashboard

// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   LogOut,
//   Map as MapIcon,
//   FileText,
//   ClipboardList,
//   BookmarkCheck,
//   Plus,
//   FileX,
//   ArrowUpRight,
//   Building2,
// } from "lucide-react";

// import { useAuth } from "../context/AuthContext";
// import {
//   getEmployeeQuotations,
//   getQuotationsForSites,
// } from "../services/quotationService";
// import { getEmployeeVisits } from "../services/siteVisitService";
// import {
//   SearchBar,
//   Spinner,
//   EmptyState,
//   StatPill,
// } from "../components/ui";
// import MapsTab from "../components/MapsTab";
// import QuotationCard from "../components/QuotationCard";
// import SiteVisitList from "../components/SiteVisitList";
// import { fmtCurrency } from "../utils/format";

// const TABS = [
//   ["Maps", MapIcon],
//   ["Quotations", FileText],
//   ["Site Visits", ClipboardList],
//   ["Bookings", BookmarkCheck],
// ];

// function useSub(subscribe, deps) {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setData(null);
//     return subscribe(
//       setData,
//       (e) => {
//         console.error(e);
//         setError(e);
//         setData([]);
//       }
//     );
//   }, deps); // eslint-disable-line

//   return [data, error];
// }

// export default function EmployeeHome() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();

//   const [tab, setTab] = useState(0);
//   const [search, setSearch] = useState("");

//   const [quotations, qErr] = useSub(
//     (cb, err) => getEmployeeQuotations(user.uid, cb, err),
//     [user.uid]
//   );

//   const [visits] = useSub(
//     (cb, err) => getEmployeeVisits(user.uid, cb, err),
//     [user.uid]
//   );

//   const [bookings] = useSub(
//     (cb, err) =>
//       getQuotationsForSites(user.assignedSiteIds, cb, err),
//     [user.assignedSiteIds.join(",")]
//   );

//   const total = useMemo(
//     () =>
//       (quotations ?? []).reduce(
//         (sum, quotation) => sum + quotation.finalTotalAmount,
//         0
//       ),
//     [quotations]
//   );

//   const filteredQ = useMemo(() => {
//     const n = search.toLowerCase();

//     return (quotations ?? []).filter(
//       (q) =>
//         !n ||
//         q.customerName.toLowerCase().includes(n) ||
//         q.plotNumber.toLowerCase().includes(n) ||
//         q.projectName.toLowerCase().includes(n)
//     );
//   }, [quotations, search]);

//   const stats = [
//     {
//       label: "Quotations",
//       value: quotations?.length ?? "–",
//       icon: FileText,
//       tone: "indigo",
//     },
//     {
//       label: "Total Value",
//       value: quotations ? fmtCurrency(total) : "–",
//       icon: Building2,
//       tone: "blue",
//     },
//     {
//       label: "Site Visits",
//       value: visits?.length ?? "–",
//       icon: ClipboardList,
//       tone: "green",
//     },
//   ];

//   return (
//     <div
//       className="page employee-dashboard"
//       style={{
//         minHeight: "100vh",
//         background: "#f6f7fb",
//         color: "#172033",
//       }}
//     >
//       {/* Dashboard hero */}
//       <header
//         className="hero employee-hero"
//         style={{
//           position: "relative",
//           overflow: "hidden",
//           background:
//             "linear-gradient(125deg, #111c42 0%, #263b79 56%, #4f46e5 100%)",
//           color: "#ffffff",
//           borderRadius: "0 0 28px 28px",
//           boxShadow: "0 12px 32px rgba(30, 41, 89, 0.16)",
//         }}
//       >
//         <div
//           className="container"
//           style={{
//             position: "relative",
//             zIndex: 1,
//             paddingTop: 30,
//             paddingBottom: 0,
//           }}
//         >
//           {/* Welcome section */}
//           <div
//             className="row employee-welcome"
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               justifyContent: "space-between",
//               gap: 20,
//               marginBottom: 30,
//             }}
//           >
//             <div style={{ minWidth: 0 }}>
//               <div
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 8,
//                   padding: "7px 11px",
//                   marginBottom: 15,
//                   border: "1px solid rgba(255,255,255,0.18)",
//                   borderRadius: 10,
//                   background: "rgba(255,255,255,0.09)",
//                   color: "#dbeafe",
//                   fontSize: 11,
//                   fontWeight: 750,
//                   letterSpacing: "0.1em",
//                 }}
//               >
//                 <Building2 size={14} />
//                 {user.role.toUpperCase()}
//               </div>

//               <h2
//                 style={{
//                   margin: "0 0 8px",
//                   color: "#ffffff",
//                   fontSize: "clamp(25px, 4vw, 35px)",
//                   fontWeight: 800,
//                   lineHeight: 1.2,
//                   letterSpacing: "-0.035em",
//                   overflowWrap: "anywhere",
//                 }}
//               >
//                 Welcome, {user.name}
//               </h2>

//               <p
//                 style={{
//                   margin: 0,
//                   color: "#c7d2fe",
//                   fontSize: 14,
//                   lineHeight: 1.6,
//                 }}
//               >
//                 Bhumesh Realtors
//                 <span style={{ color: "#94a3b8" }}>
//                   {" "}·{" "}Your workspace
//                 </span>
//               </p>
//             </div>

//             <button
//               type="button"
//               className="icon-btn light"
//               onClick={logout}
//               title="Sign out"
//               aria-label="Sign out"
//               style={{
//                 width: 44,
//                 height: 44,
//                 flexShrink: 0,
//                 display: "grid",
//                 placeItems: "center",
//                 border: "1px solid rgba(255,255,255,0.2)",
//                 borderRadius: 13,
//                 background: "rgba(255,255,255,0.1)",
//                 color: "#ffffff",
//                 cursor: "pointer",
//               }}
//             >
//               <LogOut size={19} />
//             </button>
//           </div>

//           {/* Overview statistics */}
//           <div
//             className="stat-row employee-stat-grid"
//             style={{
//               display: "grid",
//               gridTemplateColumns:
//                 "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
//               gap: 14,
//               marginBottom: 28,
//             }}
//           >
//             {stats.map(({ label, value, icon: Icon, tone }) => {
//               const iconBackground =
//                 tone === "green"
//                   ? "rgba(134,239,172,0.15)"
//                   : tone === "blue"
//                     ? "rgba(147,197,253,0.16)"
//                     : "rgba(196,181,253,0.17)";

//               const iconColor =
//                 tone === "green"
//                   ? "#86efac"
//                   : tone === "blue"
//                     ? "#bfdbfe"
//                     : "#c4b5fd";

//               return (
//                 <div
//                   key={label}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 14,
//                     minWidth: 0,
//                     padding: "17px 18px",
//                     border: "1px solid rgba(255,255,255,0.15)",
//                     borderRadius: 17,
//                     background: "rgba(255,255,255,0.085)",
//                     backdropFilter: "blur(10px)",
//                   }}
//                 >
//                   <div
//                     style={{
//                       width: 43,
//                       height: 43,
//                       flexShrink: 0,
//                       display: "grid",
//                       placeItems: "center",
//                       borderRadius: 13,
//                       background: iconBackground,
//                       color: iconColor,
//                     }}
//                   >
//                     <Icon size={20} />
//                   </div>

//                   <div style={{ minWidth: 0 }}>
//                     <div
//                       style={{
//                         color: "#c7d2fe",
//                         fontSize: 12,
//                         fontWeight: 550,
//                         marginBottom: 6,
//                       }}
//                     >
//                       {label}
//                     </div>

//                     <div
//                       style={{
//                         color: "#ffffff",
//                         fontSize: "clamp(18px, 2vw, 23px)",
//                         fontWeight: 800,
//                         lineHeight: 1.25,
//                         overflowWrap: "anywhere",
//                       }}
//                     >
//                       {value}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Main navigation tabs */}
//           <nav
//             className="tabs employee-tabs"
//             aria-label="Employee dashboard sections"
//             style={{
//               display: "flex",
//               alignItems: "stretch",
//               gap: 6,
//               overflowX: "auto",
//               scrollbarWidth: "none",
//               borderBottom: "1px solid rgba(255,255,255,0.15)",
//             }}
//           >
//             {TABS.map(([label, Icon], i) => {
//               const active = tab === i;

//               return (
//                 <button
//                   type="button"
//                   key={label}
//                   className={`tab ${active ? "active" : ""}`}
//                   onClick={() => setTab(i)}
//                   aria-current={active ? "page" : undefined}
//                   style={{
//                     position: "relative",
//                     display: "inline-flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: 9,
//                     flexShrink: 0,
//                     padding: "15px 17px",
//                     border: "none",
//                     borderRadius: "12px 12px 0 0",
//                     background: active
//                       ? "rgba(255,255,255,0.12)"
//                       : "transparent",
//                     color: active ? "#ffffff" : "#c7d2fe",
//                     fontSize: 13,
//                     fontWeight: active ? 750 : 600,
//                     whiteSpace: "nowrap",
//                     cursor: "pointer",
//                   }}
//                 >
//                   <Icon size={17} />
//                   {label}

//                   {active && (
//                     <span
//                       style={{
//                         position: "absolute",
//                         right: 12,
//                         bottom: 0,
//                         left: 12,
//                         height: 3,
//                         borderRadius: "4px 4px 0 0",
//                         background: "#a5b4fc",
//                       }}
//                     />
//                   )}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </header>

//       {/* Active tab content */}
//       <main
//         className="container employee-content"
//         style={{
//           flex: 1,
//           width: "100%",
//           minWidth: 0,
//           paddingTop: 26,
//           paddingBottom: 100,
//         }}
//       >
//         {tab === 0 && (
//           <MapsTab
//             withFilters
//             onOpen={(m) => nav(`/maps/${m.id}`)}
//           />
//         )}

//         {tab === 1 && (
//           <>
//             <div
//               style={{
//                 padding: "4px 0 20px",
//                 maxWidth: 600,
//               }}
//             >
//               <SearchBar
//                 value={search}
//                 onChange={setSearch}
//                 placeholder="Search by customer, plot or project…"
//               />
//             </div>

//             <div
//               className="section-head"
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 flexWrap: "wrap",
//                 gap: 12,
//                 marginBottom: 18,
//                 paddingBottom: 15,
//                 borderBottom: "1px solid #e8edf5",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                   color: "#172033",
//                   fontSize: 16,
//                   fontWeight: 750,
//                 }}
//               >
//                 <FileText size={19} color="#4f46e5" />
//                 Quotations
//                 <span
//                   style={{
//                     padding: "4px 9px",
//                     borderRadius: 8,
//                     background: "#eef2ff",
//                     color: "#4f46e5",
//                     fontSize: 12,
//                     fontWeight: 750,
//                   }}
//                 >
//                   {filteredQ.length}
//                 </span>
//               </div>

//               <span
//                 className="hint"
//                 style={{ color: "#94a3b8", fontSize: 12 }}
//               >
//                 Tap to view details
//               </span>
//             </div>

//             {qErr ? (
//               <div
//                 role="alert"
//                 style={{
//                   padding: 16,
//                   border: "1px solid #fecaca",
//                   borderRadius: 14,
//                   background: "#fff1f2",
//                   color: "#b91c1c",
//                   fontSize: 13,
//                 }}
//               >
//                 Failed to load quotations: {qErr.message}
//               </div>
//             ) : quotations === null ? (
//               <Spinner />
//             ) : filteredQ.length === 0 ? (
//               <EmptyState
//                 icon={FileX}
//                 title={search ? "No quotations found" : "No quotations yet"}
//                 subtitle={
//                   search
//                     ? "Try a different search"
//                     : "Open a map, tap a plot and generate one"
//                 }
//               />
//             ) : (
//               <div
//                 className="list"
//                 style={{
//                   display: "grid",
//                   gap: 15,
//                   minWidth: 0,
//                 }}
//               >
//                 {filteredQ.map((q, i) => (
//                   <QuotationCard key={q.id} q={q} index={i} />
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {tab === 2 && <SiteVisitList employee={user} />}

//         {tab === 3 &&
//           (user.assignedSiteIds.length === 0 ? (
//             <EmptyState
//               icon={MapIcon}
//               title="No sites assigned yet"
//               subtitle="Contact your admin to get assigned to a site."
//             />
//           ) : (
//             <>
//               <div
//                 className="section-head"
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   flexWrap: "wrap",
//                   gap: 12,
//                   marginBottom: 18,
//                   paddingBottom: 15,
//                   borderBottom: "1px solid #e8edf5",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 10,
//                     color: "#172033",
//                     fontSize: 16,
//                     fontWeight: 750,
//                   }}
//                 >
//                   <BookmarkCheck size={19} color="#4f46e5" />
//                   Customers &amp; Bookings
//                 </div>

//                 <span
//                   className="hint"
//                   style={{ color: "#94a3b8", fontSize: 12 }}
//                 >
//                   For your assigned sites
//                 </span>
//               </div>

//               {bookings === null ? (
//                 <Spinner />
//               ) : bookings.length === 0 ? (
//                 <EmptyState
//                   icon={FileX}
//                   title="No quotations yet"
//                 />
//               ) : (
//                 <div
//                   className="list"
//                   style={{
//                     display: "grid",
//                     gap: 15,
//                     minWidth: 0,
//                   }}
//                 >
//                   {bookings.map((q, i) => (
//                     <QuotationCard key={q.id} q={q} index={i} />
//                   ))}
//                 </div>
//               )}
//             </>
//           ))}
//       </main>

//       {/* Floating action for site visits */}
//       {tab === 2 && (
//         <button
//           type="button"
//           className="btn fab"
//           onClick={() => nav("/site-visit/new")}
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 9,
//             borderRadius: 16,
//             padding: "14px 20px",
//             background: "#4f46e5",
//             color: "#ffffff",
//             border: "none",
//             boxShadow: "0 8px 24px rgba(79,70,229,0.3)",
//             fontSize: 13,
//             fontWeight: 750,
//             cursor: "pointer",
//           }}
//         >
//           <Plus size={18} />
//           New Visit
//           <ArrowUpRight size={15} />
//         </button>
//       )}
//     </div>
//   );
// }



// screens/EmployeeHome.jsx — Executive Real Estate Portal

// screens/EmployeeHome.jsx — Full-Bleed Connected Executive Portal

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Map as MapIcon,
  FileText,
  ClipboardList,
  BookmarkCheck,
  Plus,
  FileX,
  ArrowUpRight,
  Building2,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getEmployeeQuotations,
  getQuotationsForSites,
} from "../services/quotationService";
import { getEmployeeVisits } from "../services/siteVisitService";
import { SearchBar, Spinner, EmptyState } from "../components/ui";
import MapsTab from "../components/MapsTab";
import QuotationCard from "../components/QuotationCard";
import SiteVisitList from "../components/SiteVisitList";
import { fmtCurrency } from "../utils/format";

const DEFAULT_BANNER_SRC = "/bhumesh-banner.png";

const TABS = [
  { label: "Maps", icon: MapIcon },
  { label: "Quotations", icon: FileText },
  { label: "Site Visits", icon: ClipboardList },
  { label: "Bookings", icon: BookmarkCheck },
];

function useSub(subscribe, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    return subscribe(setData, (e) => {
      console.error(e);
      setError(e);
      setData([]);
    });
  }, deps); // eslint-disable-line

  return [data, error];
}

export default function EmployeeHome({ bannerSrc = DEFAULT_BANNER_SRC }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [bannerFailed, setBannerFailed] = useState(false);

  const [quotations, qErr] = useSub(
    (cb, err) => getEmployeeQuotations(user.uid, cb, err),
    [user.uid]
  );

  const [visits] = useSub(
    (cb, err) => getEmployeeVisits(user.uid, cb, err),
    [user.uid]
  );

  const [bookings] = useSub(
    (cb, err) => getQuotationsForSites(user.assignedSiteIds, cb, err),
    [user.assignedSiteIds.join(",")]
  );

  const total = useMemo(
    () =>
      (quotations ?? []).reduce(
        (sum, quotation) => sum + quotation.finalTotalAmount,
        0
      ),
    [quotations]
  );

  const filteredQ = useMemo(() => {
    const n = search.toLowerCase();

    return (quotations ?? []).filter(
      (q) =>
        !n ||
        q.customerName.toLowerCase().includes(n) ||
        q.plotNumber.toLowerCase().includes(n) ||
        q.projectName.toLowerCase().includes(n)
    );
  }, [quotations, search]);

  const stats = [
    {
      label: "Quotations",
      value: quotations?.length ?? "–",
      sub: "Generated proposals",
      icon: FileText,
      tone: "gold",
    },
    {
      label: "Pipeline Value",
      value: quotations ? fmtCurrency(total) : "–",
      sub: "Total quoted amount",
      icon: Building2,
      tone: "sky",
    },
    {
      label: "Site Visits",
      value: visits?.length ?? "–",
      sub: "Logged client tours",
      icon: ClipboardList,
      tone: "emerald",
    },
  ];

  const tabCounts = [
    null,
    quotations?.length ?? null,
    visits?.length ?? null,
    bookings?.length ?? null,
  ];

  const initials = useMemo(() => {
    if (!user?.name) return "BR";
    return user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.name]);

  return (
    <div className="page eh-page">
      {/* ================= UNIFIED FULL-BLEED HERO ================= */}
      <header className="eh-hero-shell">
        {/* Top Floating Glass Bar (Overlaid on Banner) */}
        <div className="eh-topbar-overlay">
          <div className="eh-brand-pill">
            <span className="eh-live-dot" />
            <Sparkles size={13} className="eh-sparkle-icon" />
            <span>BHUMESH REALTORS</span>
            <span className="eh-brand-sep">·</span>
            <span className="eh-role-tag">{user.role.toUpperCase()}</span>
          </div>

          <div className="eh-user-actions">
            <div className="eh-user-chip">
              <div className="eh-avatar" aria-hidden="true">
                {initials}
              </div>
              <div className="eh-user-meta">
                <span className="eh-user-greeting">Signed in as</span>
                <strong className="eh-user-name">{user.name}</strong>
              </div>
            </div>

            <button
              type="button"
              className="eh-logout-btn"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
              <span className="eh-logout-label">Sign out</span>
            </button>
          </div>
        </div>

        {/* Full-Width Panoramic Banner Stage */}
        <div className="eh-banner-stage">
          {!bannerFailed ? (
            <img
              src={bannerSrc}
              alt="Bhumesh Realtors — A Tradition of Trust"
              className="eh-banner-img"
              onError={() => setBannerFailed(true)}
            />
          ) : (
            <div className="eh-banner-fallback">
              <div>
                <span className="eh-fallback-eyebrow">
                  A Tradition of Trust
                </span>
                <h3>Bhumesh Realtors</h3>
              </div>
            </div>
          )}
          {/* Seamless multi-directional vignette that connects banner into the deck */}
          <div className="eh-banner-blend" />
        </div>

        {/* Connected Full-Width Command Deck */}
        <div className="eh-command-deck">
          <div className="eh-deck-inner">
            <div className="eh-deck-top">
              <div className="eh-welcome-block">
                <span className="eh-eyebrow">
                  <Building2 size={13} />
                  Executive Sales Workspace
                </span>
                <h1 className="eh-welcome-title">Welcome back, {user.name}</h1>
                <p className="eh-welcome-sub">
                  Manage interactive site layouts, client quotations, and
                  scheduled property visits.
                </p>
              </div>

              {/* KPI Stat Cards — No mid-number wrapping */}
              <div className="eh-stats-grid">
                {stats.map(({ label, value, sub, icon: Icon, tone }) => (
                  <div key={label} className={`eh-stat-card tone-${tone}`}>
                    <div className="eh-stat-icon">
                      <Icon size={20} />
                    </div>
                    <div className="eh-stat-body">
                      <span className="eh-stat-label">{label}</span>
                      <strong className="eh-stat-value" title={String(value)}>
                        {value}
                      </strong>
                      <span className="eh-stat-sub">{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrated Full-Width Navigation Bar */}
            <nav
              className="eh-tabs-nav"
              aria-label="Employee dashboard sections"
            >
              {TABS.map(({ label, icon: Icon }, i) => {
                const active = tab === i;
                const count = tabCounts[i];

                return (
                  <button
                    type="button"
                    key={label}
                    className={`eh-tab-btn ${active ? "is-active" : ""}`}
                    onClick={() => setTab(i)}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={16} className="eh-tab-icon" />
                    <span>{label}</span>
                    {count !== null && count !== undefined && (
                      <span className="eh-tab-badge">{count}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ================= FULL-WIDTH WORKSPACE CONTENT ================= */}
      <main className="eh-main">
        <div className="eh-workspace-inner">
          {tab === 0 && (
            <section className="eh-panel">
              <MapsTab withFilters onOpen={(m) => nav(`/maps/${m.id}`)} />
            </section>
          )}

          {tab === 1 && (
            <section className="eh-panel">
              <div className="eh-toolbar">
                <div className="eh-search-wrap">
                  <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by customer, plot or project…"
                  />
                </div>

                <div className="eh-section-meta">
                  <div className="eh-section-title">
                    <FileText size={18} className="eh-section-icon" />
                    <span>Quotations</span>
                    <span className="eh-count-pill">{filteredQ.length}</span>
                  </div>
                  <span className="eh-hint">Tap any card to view full sheet</span>
                </div>
              </div>

              {qErr ? (
                <div role="alert" className="eh-alert-error">
                  Failed to load quotations: {qErr.message}
                </div>
              ) : quotations === null ? (
                <Spinner />
              ) : filteredQ.length === 0 ? (
                <div className="eh-empty-card">
                  <EmptyState
                    icon={FileX}
                    title={search ? "No quotations found" : "No quotations yet"}
                    subtitle={
                      search
                        ? "Try adjusting your search keywords"
                        : "Open a site map, select a plot, and generate a quotation"
                    }
                  />
                </div>
              ) : (
                <div className="list eh-card-list">
                  {filteredQ.map((q, i) => (
                    <QuotationCard key={q.id} q={q} index={i} />
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 2 && (
            <section className="eh-panel">
              <SiteVisitList employee={user} />
            </section>
          )}

          {tab === 3 && (
            <section className="eh-panel">
              {user.assignedSiteIds.length === 0 ? (
                <div className="eh-empty-card">
                  <EmptyState
                    icon={MapIcon}
                    title="No sites assigned yet"
                    subtitle="Contact your administrator to get assigned to active project sites."
                  />
                </div>
              ) : (
                <>
                  <div className="eh-toolbar eh-toolbar-single">
                    <div className="eh-section-meta">
                      <div className="eh-section-title">
                        <BookmarkCheck size={18} className="eh-section-icon" />
                        <span>Customers &amp; Bookings</span>
                        {bookings && (
                          <span className="eh-count-pill">
                            {bookings.length}
                          </span>
                        )}
                      </div>
                      <span className="eh-hint">
                        Showing activity for your assigned sites
                      </span>
                    </div>
                  </div>

                  {bookings === null ? (
                    <Spinner />
                  ) : bookings.length === 0 ? (
                    <div className="eh-empty-card">
                      <EmptyState
                        icon={FileX}
                        title="No bookings or quotations yet"
                        subtitle="Quotations generated on your assigned sites will appear here automatically."
                      />
                    </div>
                  ) : (
                    <div className="list eh-card-list">
                      {bookings.map((q, i) => (
                        <QuotationCard key={q.id} q={q} index={i} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </main>

      {/* ================= FLOATING ACTION BUTTON ================= */}
      {tab === 2 && (
        <button
          type="button"
          className="btn fab eh-fab"
          onClick={() => nav("/site-visit/new")}
        >
          <Plus size={18} />
          <span>New Site Visit</span>
          <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}