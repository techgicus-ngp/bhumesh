// // _MapCard (employee_home.dart) + guest map card
// import { Map as MapIcon, LayoutGrid } from 'lucide-react';
// import { Chip } from './ui';
// import { toDate, fmtMapDate } from '../utils/format';
// // import { GOOGLE_MAPS_DOC_ID } from '../constants';
// import { isGoogleMapDoc } from '../constants';
// export default function MapCard({ map, index = 0, onOpen }) {
//   const plots = map.plots ?? [];
//   const count = (t) => plots.filter((p) => p.type === t).length;
//   const created = toDate(map.createdDate) ?? new Date();
//   // const isGrid = map.id !== GOOGLE_MAPS_DOC_ID;
//   const isGrid = !isGoogleMapDoc(map.id);
//   return (
//     <div className="card" style={{ animationDelay: `${index * 40}ms` }} onClick={() => onOpen(map)}>
//       <div className="row">
//         <div>
//           <h4>{map.name || 'Unnamed Map'}</h4>
//           <div className="sub">Created {fmtMapDate(created)}</div>
//         </div>
//         {isGrid ? <LayoutGrid color="#4F46E5" /> : <MapIcon color="#4F46E5" />}
//       </div>
//       <div className="chips">
//         <Chip>{count('plot')} Plots</Chip>
//         <Chip color="#6b7280" bg="#f3f4f6">{count('road')} Roads</Chip>
//         <Chip color="#15803d" bg="#dcfce7">{count('open_space')} Spaces</Chip>
//       </div>
//       <button className="btn full" style={{ marginTop: 14, background: '#4F46E5' }}>
//         {isGrid ? 'Open Plot Grid' : 'Open Map'}
//       </button>
//     </div>
//   );
// }



// import { Map as MapIcon, LayoutGrid, ArrowUpRight } from 'lucide-react';
// import { Chip } from './ui';
// import { toDate, fmtMapDate } from '../utils/format';
// import { isGoogleMapDoc } from '../constants';

// export default function MapCard({ map, index = 0, onOpen }) {
//   const plots = map.plots ?? [];
//   const count = (type) => plots.filter((plot) => plot.type === type).length;

//   const created = toDate(map.createdDate) ?? new Date();
//   const isGrid = !isGoogleMapDoc(map.id);

//   const plotCount = count('plot');
//   const roadCount = count('road');
//   const spaceCount = count('open_space');

//   return (
//     <article
//       className="card map-card"
//       style={{
//         animationDelay: `${index * 40}ms`,
//         padding: 22,
//         borderRadius: 20,
//         border: '1px solid #e8eaf2',
//         background: 'linear-gradient(145deg, #ffffff 0%, #fafbff 100%)',
//         boxShadow: '0 4px 18px rgba(15, 23, 42, 0.045)',
//         transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
//         cursor: 'pointer',
//         minWidth: 0,
//       }}
//       onClick={() => onOpen(map)}
//     >
//       {/* Card heading */}
//       <div
//         className="row"
//         style={{
//           display: 'flex',
//           alignItems: 'flex-start',
//           justifyContent: 'space-between',
//           gap: 14,
//         }}
//       >
//         <div style={{ minWidth: 0, flex: 1 }}>
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 7,
//               marginBottom: 9,
//               color: '#64748b',
//               fontSize: 11,
//               fontWeight: 700,
//               letterSpacing: '0.09em',
//               textTransform: 'uppercase',
//             }}
//           >
//             {isGrid ? 'Plot layout' : 'Google map'}
//           </div>

//           <h4
//             style={{
//               margin: 0,
//               color: '#172033',
//               fontSize: 17,
//               fontWeight: 750,
//               lineHeight: 1.4,
//               overflowWrap: 'anywhere',
//             }}
//           >
//             {map.name || 'Unnamed Map'}
//           </h4>

//           <div
//             className="sub"
//             style={{
//               marginTop: 7,
//               color: '#8a94a6',
//               fontSize: 12,
//               lineHeight: 1.5,
//             }}
//           >
//             Created {fmtMapDate(created)}
//           </div>
//         </div>

//         <div
//           style={{
//             width: 46,
//             height: 46,
//             flexShrink: 0,
//             display: 'grid',
//             placeItems: 'center',
//             borderRadius: 15,
//             color: '#4f46e5',
//             background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
//             border: '1px solid #e0e7ff',
//           }}
//         >
//           {isGrid ? <LayoutGrid size={22} strokeWidth={1.9} /> : <MapIcon size={22} strokeWidth={1.9} />}
//         </div>
//       </div>

//       {/* Plot summary */}
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
//           gap: 9,
//           marginTop: 22,
//           marginBottom: 18,
//         }}
//       >
//         <div
//           style={{
//             minWidth: 0,
//             padding: '13px 10px',
//             borderRadius: 13,
//             background: '#f5f6ff',
//             border: '1px solid #eaecff',
//           }}
//         >
//           <div style={{ color: '#4f46e5', fontSize: 22, fontWeight: 750, lineHeight: 1.2 }}>
//             {plotCount}
//           </div>
//           <div style={{ marginTop: 5, color: '#70789a', fontSize: 11, fontWeight: 600 }}>
//             Plots
//           </div>
//         </div>

//         <div
//           style={{
//             minWidth: 0,
//             padding: '13px 10px',
//             borderRadius: 13,
//             background: '#f8fafc',
//             border: '1px solid #edf0f5',
//           }}
//         >
//           <div style={{ color: '#475569', fontSize: 22, fontWeight: 750, lineHeight: 1.2 }}>
//             {roadCount}
//           </div>
//           <div style={{ marginTop: 5, color: '#64748b', fontSize: 11, fontWeight: 600 }}>
//             Roads
//           </div>
//         </div>

//         <div
//           style={{
//             minWidth: 0,
//             padding: '13px 10px',
//             borderRadius: 13,
//             background: '#f0fdf4',
//             border: '1px solid #dcfce7',
//           }}
//         >
//           <div style={{ color: '#15803d', fontSize: 22, fontWeight: 750, lineHeight: 1.2 }}>
//             {spaceCount}
//           </div>
//           <div style={{ marginTop: 5, color: '#43835b', fontSize: 11, fontWeight: 600 }}>
//             Open spaces
//           </div>
//         </div>
//       </div>

//       {/* Existing category chips */}
//       <div
//         className="chips"
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           flexWrap: 'wrap',
//           gap: 7,
//         }}
//       >
//         <Chip>{plotCount} Plots</Chip>
//         <Chip color="#6b7280" bg="#f3f4f6">{roadCount} Roads</Chip>
//         <Chip color="#15803d" bg="#dcfce7">{spaceCount} Spaces</Chip>
//       </div>

//       {/* Open action */}
//       <button
//         type="button"
//         className="btn full"
//         style={{
//           width: '100%',
//           minHeight: 46,
//           marginTop: 20,
//           padding: '12px 15px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           gap: 9,
//           borderRadius: 12,
//           background: '#4f46e5',
//           color: '#ffffff',
//           border: '1px solid #4f46e5',
//           fontSize: 13,
//           fontWeight: 700,
//           boxShadow: '0 4px 10px rgba(79, 70, 229, 0.16)',
//           cursor: 'pointer',
//         }}
//       >
//         {isGrid ? 'Open Plot Grid' : 'Open Map'}
//         <ArrowUpRight size={16} />
//       </button>
//     </article>
//   );
// }



// // Map card used by the Maps tab (EmployeeHome and GuestHome).
// // All styling is in index.css (.map-card …); only the staggered animation delay is inline.
// import { Map as MapIcon, LayoutGrid, ArrowUpRight } from 'lucide-react';
// import { toDate, fmtMapDate } from '../utils/format';
// import { isGoogleMapDoc } from '../constants';

// export default function MapCard({ map, index = 0, onOpen }) {
//   const plots = map.plots ?? [];
//   const count = (type) => plots.filter((plot) => plot.type === type).length;

//   const created = toDate(map.createdDate) ?? new Date();
//   const isGrid = !isGoogleMapDoc(map.id);
//   const Icon = isGrid ? LayoutGrid : MapIcon;

//   const stats = [
//     ['plots', count('plot'), 'Plots'],
//     ['roads', count('road'), 'Roads'],
//     ['spaces', count('open_space'), 'Spaces'],
//   ];

//   return (
//     <article
//       className="card map-card"
//       style={{ animationDelay: `${index * 40}ms` }}
//       onClick={() => onOpen(map)}
//     >
//       <div className="map-card__head">
//         <div className="map-card__text">
//           <span className="map-card__eyebrow">{isGrid ? 'Plot layout' : 'Google map'}</span>
//           <h4 className="map-card__title">{map.name || 'Unnamed Map'}</h4>
//           <div className="sub map-card__date">Created {fmtMapDate(created)}</div>
//         </div>

//         <div className="map-card__icon" aria-hidden="true">
//           <Icon size={22} strokeWidth={1.9} />
//         </div>
//       </div>

//       <div className="map-card__stats">
//         {stats.map(([tone, value, label]) => (
//           <div key={tone} className={`map-card__stat map-card__stat--${tone}`}>
//             <strong>{value}</strong>
//             <span>{label}</span>
//           </div>
//         ))}
//       </div>

//       {/* stopPropagation: the card is clickable too, so don't open twice */}
//       <button
//         type="button"
//         className="btn full map-card__action"
//         onClick={(e) => {
//           e.stopPropagation();
//           onOpen(map);
//         }}
//       >
//         {isGrid ? 'Open Plot Grid' : 'Open Map'}
//         <ArrowUpRight size={16} />
//       </button>
//     </article>
//   );
// }


// src/components/MapCard.jsx
// Map card used by the Maps tab (EmployeeHome and GuestHome).
// All styling is in index.css (.map-card …); only the staggered animation delay is inline.
import { useState } from 'react';
import { Map as MapIcon, LayoutGrid, ArrowUpRight, Eye } from 'lucide-react';
import { toDate, fmtMapDate } from '../utils/format';
import { isGoogleMapDoc } from '../constants';
import { getBrochure } from '../brochures';
import BrochurePreview from './BrochurePreview';

export default function MapCard({ map, index = 0, onOpen }) {
  const [showBrochure, setShowBrochure] = useState(false);

  const plots = map.plots ?? [];
  const count = (type) => plots.filter((plot) => plot.type === type).length;

  const created = toDate(map.createdDate) ?? new Date();
  const isGrid = !isGoogleMapDoc(map.id);
  const Icon = isGrid ? LayoutGrid : MapIcon;
  const brochure = getBrochure(map); // null when this map has no brochure

  const stats = [
    ['plots', count('plot'), 'Plots'],
    ['roads', count('road'), 'Roads'],
    ['spaces', count('open_space'), 'Spaces'],
  ];

  return (
    <>
      <article
        className="card map-card"
        style={{ animationDelay: `${index * 40}ms` }}
        onClick={() => onOpen(map)}
      >
        <div className="map-card__head">
          <div className="map-card__text">
            <span className="map-card__eyebrow">{isGrid ? 'Plot layout' : 'Google map'}</span>
            <h4 className="map-card__title">{map.name || 'Unnamed Map'}</h4>
            <div className="sub map-card__date">Created {fmtMapDate(created)}</div>
          </div>

          <div className="map-card__icon" aria-hidden="true">
            <Icon size={22} strokeWidth={1.9} />
          </div>
        </div>

        <div className="map-card__stats">
          {stats.map(([tone, value, label]) => (
            <div key={tone} className={`map-card__stat map-card__stat--${tone}`}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* stopPropagation: the card is clickable too, so don't open twice */}
        <button
          type="button"
          className="btn full map-card__action"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(map);
          }}
        >
          {isGrid ? 'Open Plot Grid' : 'Open Map'}
          <ArrowUpRight size={16} />
        </button>

        {/* Only shown for maps that have a brochure (see src/brochures.js) */}
        {brochure && (
          <button
            type="button"
            className="btn full map-card__brochure"
            onClick={(e) => {
              e.stopPropagation(); // don't also open the map
              setShowBrochure(true);
            }}
          >
            <Eye size={16} /> View Brochure
          </button>
        )}
      </article>

      {showBrochure && brochure && (
        <BrochurePreview
          brochure={brochure}
          title={map.name}
          onClose={() => setShowBrochure(false)}
        />
      )}
    </>
  );
}