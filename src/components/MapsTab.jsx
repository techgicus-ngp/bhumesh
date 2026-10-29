// // Shared "maps" tab used by EmployeeHome and GuestHome (_buildMapsTab)
// import { useEffect, useMemo, useState } from 'react';
// import { RefreshCw, Map as MapIcon } from 'lucide-react';
// import { loadEnabledMaps } from '../services/mapService';
// import { SearchBar, Spinner, EmptyState } from './ui';
// import MapCard from './MapCard';

// export default function MapsTab({ onOpen, withFilters = false }) {
//   const [maps, setMaps] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [q, setQ] = useState('');
//   const [filter, setFilter] = useState('All'); // All | Recent | Large | Small

//   const load = async () => {
//     setLoading(true);
//     try { setMaps(await loadEnabledMaps()); } catch (e) { console.error('Error loading maps:', e); }
//     setLoading(false);
//   };
//   useEffect(() => { load(); }, []);

//   const visible = useMemo(() => {
//     let list = maps.filter((m) => (m.name ?? '').toLowerCase().includes(q.toLowerCase()));
//     const plotCount = (m) => (m.plots ?? []).filter((p) => p.type === 'plot').length;
//     if (filter === 'Large') list = [...list].sort((a, b) => plotCount(b) - plotCount(a));
//     if (filter === 'Small') list = [...list].sort((a, b) => plotCount(a) - plotCount(b));
//     return list; // 'Recent' / 'All' keep createdDate-desc order from Firestore
//   }, [maps, q, filter]);

//   return (
//     <>
//       <div style={{ paddingTop: 14 }}><SearchBar value={q} onChange={setQ} placeholder="Search maps..." /></div>
//       {withFilters && (
//         <div className="filter-chips">
//           {['All', 'Recent', 'Large', 'Small'].map((f) => (
//             <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
//           ))}
//         </div>
//       )}
//       <div className="section-head">
//         <span>{visible.length} Map{visible.length !== 1 ? 's' : ''} Available</span>
//         <button className="link-btn" onClick={load}><RefreshCw size={14} /> Refresh</button>
//       </div>
//       {loading ? <Spinner /> : visible.length === 0 ? (
//         <EmptyState icon={MapIcon} title={q ? 'No maps found' : 'No maps available'}
//           subtitle={q ? 'Try a different search term' : 'Maps will appear here once created'} />
//       ) : (
//         <div className="grid">{visible.map((m, i) => <MapCard key={m.id} map={m} index={i} onOpen={onOpen} />)}</div>
//       )}
//     </>
//   );
// }



// MapsTab.jsx — Shared premium maps tab
// Used by EmployeeHome and GuestHome

// import { useEffect, useMemo, useState } from 'react';
// import {
//   RefreshCw,
//   Map as MapIcon,
//   Search,
//   LayoutGrid,
//   Clock3,
//   ArrowDownWideNarrow,
// } from 'lucide-react';

// import { loadEnabledMaps } from '../services/mapService';
// import { SearchBar, Spinner, EmptyState } from './ui';
// import MapCard from './MapCard';

// const FILTERS = [
//   { label: 'All', icon: LayoutGrid },
//   { label: 'Recent', icon: Clock3 },
//   { label: 'Large', icon: ArrowDownWideNarrow },
//   { label: 'Small', icon: ArrowDownWideNarrow },
// ];

// export default function MapsTab({ onOpen, withFilters = false }) {
//   const [maps, setMaps] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [q, setQ] = useState('');
//   const [filter, setFilter] = useState('All');

//   const load = async () => {
//     setLoading(true);
//     try {
//       setMaps(await loadEnabledMaps());
//     } catch (e) {
//       console.error('Error loading maps:', e);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const visible = useMemo(() => {
//     let list = maps.filter((m) =>
//       (m.name ?? '').toLowerCase().includes(q.toLowerCase())
//     );

//     const plotCount = (m) =>
//       (m.plots ?? []).filter((p) => p.type === 'plot').length;

//     if (filter === 'Large') {
//       list = [...list].sort((a, b) => plotCount(b) - plotCount(a));
//     }

//     if (filter === 'Small') {
//       list = [...list].sort((a, b) => plotCount(a) - plotCount(b));
//     }

//     // All / Recent preserve the createdDate-desc order from Firestore.
//     return list;
//   }, [maps, q, filter]);

//   return (
//     <section
//       className="maps-tab"
//       style={{
//         width: '100%',
//         minWidth: 0,
//         paddingBottom: 24,
//       }}
//     >
//       {/* Search and filter toolbar */}
//       <div
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 16,
//           marginBottom: 24,
//         }}
//       >
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             flexWrap: 'wrap',
//             gap: 14,
//           }}
//         >
//           <div style={{ flex: '1 1 260px', minWidth: 0, paddingTop: 4 }}>
//             <SearchBar
//               value={q}
//               onChange={setQ}
//               placeholder="Search maps by name..."
//             />
//           </div>

//           <button
//             type="button"
//             className="link-btn"
//             onClick={load}
//             disabled={loading}
//             style={{
//               minHeight: 44,
//               display: 'inline-flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: 8,
//               padding: '10px 15px',
//               border: '1px solid #e2e8f0',
//               borderRadius: 12,
//               background: '#ffffff',
//               color: '#475569',
//               fontSize: 13,
//               fontWeight: 650,
//               cursor: loading ? 'not-allowed' : 'pointer',
//               opacity: loading ? 0.65 : 1,
//               whiteSpace: 'nowrap',
//             }}
//           >
//             <RefreshCw
//               size={15}
//               style={{
//                 animation: loading ? 'maps-spin 1s linear infinite' : 'none',
//               }}
//             />
//             Refresh
//           </button>
//         </div>

//         {withFilters && (
//           <div
//             className="filter-chips"
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               flexWrap: 'wrap',
//               gap: 9,
//             }}
//           >
//             {FILTERS.map(({ label, icon: FilterIcon }) => {
//               const active = filter === label;

//               return (
//                 <button
//                   type="button"
//                   key={label}
//                   className={`filter-chip ${active ? 'active' : ''}`}
//                   onClick={() => setFilter(label)}
//                   aria-pressed={active}
//                   style={{
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: 7,
//                     minHeight: 38,
//                     padding: '9px 15px',
//                     borderRadius: 11,
//                     border: active
//                       ? '1px solid #4f46e5'
//                       : '1px solid #e2e8f0',
//                     background: active ? '#4f46e5' : '#ffffff',
//                     color: active ? '#ffffff' : '#64748b',
//                     fontSize: 12,
//                     fontWeight: active ? 700 : 600,
//                     cursor: 'pointer',
//                     transition: 'all 160ms ease',
//                   }}
//                 >
//                   <FilterIcon size={14} />
//                   {label}
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Results summary */}
//       <div
//         className="section-head"
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           flexWrap: 'wrap',
//           gap: 12,
//           marginBottom: 18,
//           paddingBottom: 15,
//           borderBottom: '1px solid #edf0f5',
//         }}
//       >
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 11,
//             minWidth: 0,
//           }}
//         >
//           <div
//             style={{
//               display: 'grid',
//               placeItems: 'center',
//               width: 40,
//               height: 40,
//               flexShrink: 0,
//               borderRadius: 12,
//               background: '#eef2ff',
//               color: '#4f46e5',
//             }}
//           >
//             <MapIcon size={20} />
//           </div>

//           <div>
//             <div
//               style={{
//                 color: '#172033',
//                 fontSize: 15,
//                 fontWeight: 750,
//                 lineHeight: 1.4,
//               }}
//             >
//               Available Maps
//             </div>

//             <div
//               style={{
//                 marginTop: 3,
//                 color: '#94a3b8',
//                 fontSize: 12,
//               }}
//             >
//               {visible.length} map{visible.length !== 1 ? 's' : ''}
//               {q.trim() ? ' matching your search' : ' available'}
//             </div>
//           </div>
//         </div>

//         <div
//           style={{
//             display: 'inline-flex',
//             alignItems: 'center',
//             gap: 7,
//             padding: '7px 11px',
//             border: '1px solid #e2e8f0',
//             borderRadius: 10,
//             background: '#f8fafc',
//             color: '#64748b',
//             fontSize: 11,
//             fontWeight: 650,
//           }}
//         >
//           <Search size={13} />
//           {q.trim() ? 'Filtered results' : 'Map collection'}
//         </div>
//       </div>

//       {/* Loading, empty and map states */}
//       {loading ? (
//         <div
//           style={{
//             minHeight: 180,
//             display: 'grid',
//             placeItems: 'center',
//             padding: 30,
//           }}
//         >
//           <Spinner />
//         </div>
//       ) : visible.length === 0 ? (
//         <div
//           style={{
//             padding: '20px 0',
//             border: '1px dashed #dbe2ee',
//             borderRadius: 18,
//             background: '#fafbff',
//           }}
//         >
//           <EmptyState
//             icon={MapIcon}
//             title={q ? 'No maps found' : 'No maps available'}
//             subtitle={
//               q
//                 ? 'Try a different search term'
//                 : 'Maps will appear here once created'
//             }
//           />
//         </div>
//       ) : (
//         <div
//           className="grid"
//           style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 285px), 1fr))',
//             gap: 20,
//             alignItems: 'stretch',
//             minWidth: 0,
//           }}
//         >
//           {visible.map((m, i) => (
//             <MapCard
//               key={m.id}
//               map={m}
//               index={i}
//               onOpen={onOpen}
//             />
//           ))}
//         </div>
//       )}

//       <style>{`
//         @keyframes maps-spin {
//           to { transform: rotate(360deg); }
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .maps-tab * {
//             animation-duration: 0.01ms !important;
//             transition-duration: 0.01ms !important;
//           }
//         }
//       `}</style>
//     </section>
//   );
// }








// Maps tab shared by EmployeeHome and GuestHome.
// Layout reuses the workspace classes from index.css (.eh-toolbar, .eh-section-*, .eh-count-pill,
// .eh-empty-card, .filter-chip, .grid), so this file carries no inline styling.
import { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  Map as MapIcon,
  LayoutGrid,
  Clock3,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from 'lucide-react';

import { loadEnabledMaps } from '../services/mapService';
import { SearchBar, Spinner, EmptyState } from './ui';
import MapCard from './MapCard';

const FILTERS = [
  { label: 'All', icon: LayoutGrid },
  { label: 'Recent', icon: Clock3 },
  { label: 'Large', icon: ArrowDownWideNarrow },
  { label: 'Small', icon: ArrowUpNarrowWide },
];

const plotCount = (m) => (m.plots ?? []).filter((p) => p.type === 'plot').length;

export default function MapsTab({ onOpen, withFilters = false }) {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
      setMaps(await loadEnabledMaps());
    } catch (e) {
      console.error('Error loading maps:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    let list = maps.filter((m) => (m.name ?? '').toLowerCase().includes(q.toLowerCase()));

    if (filter === 'Large') list = [...list].sort((a, b) => plotCount(b) - plotCount(a));
    if (filter === 'Small') list = [...list].sort((a, b) => plotCount(a) - plotCount(b));

    // All / Recent keep the createdDate-desc order from Firestore.
    return list;
  }, [maps, q, filter]);

  return (
    <section className="maps-tab">
      <div className="eh-toolbar">
        <div className="eh-search-wrap">
          <SearchBar value={q} onChange={setQ} placeholder="Search maps by name…" />
        </div>

        <div className="eh-section-meta">
          <div className="eh-section-title">
            <MapIcon size={18} className="eh-section-icon" />
            <span>Available Maps</span>
            <span className="eh-count-pill">{visible.length}</span>
          </div>

          <button
            type="button"
            className={`link-btn maps-refresh${loading ? ' is-loading' : ''}`}
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {withFilters && (
        <div className="filter-chips maps-filters" role="group" aria-label="Sort maps">
          {FILTERS.map(({ label, icon: FilterIcon }) => {
            const active = filter === label;

            return (
              <button
                type="button"
                key={label}
                className={`filter-chip ${active ? 'active' : ''}`}
                onClick={() => setFilter(label)}
                aria-pressed={active}
              >
                <FilterIcon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <div className="eh-empty-card">
          <EmptyState
            icon={MapIcon}
            title={q ? 'No maps found' : 'No maps available'}
            subtitle={q ? 'Try a different search term' : 'Maps will appear here once created'}
          />
        </div>
      ) : (
        <div className="grid">
          {visible.map((m, i) => (
            <MapCard key={m.id} map={m} index={i} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}