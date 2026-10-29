// // Small shared widgets (_SearchBar, _EmptyState, _StatPill, AppBar, Spinner …)
// import { Search, X, ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export const Spinner = ({ color = '#4F46E5' }) => (
//   <div className="center"><div className="spinner" style={{ borderTopColor: color }} /></div>
// );

// export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
//   return (
//     <div className="searchbar">
//       <Search size={20} color="#4F46E5" />
//       <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
//       {value && <button className="icon-btn small" onClick={() => onChange('')}><X size={16} /></button>}
//     </div>
//   );
// }

// export const EmptyState = ({ icon: Icon, title, subtitle }) => (
//   <div className="empty">
//     {Icon && <Icon size={56} color="#cbd5e1" />}
//     <div className="empty-title">{title}</div>
//     {subtitle && <div className="empty-sub">{subtitle}</div>}
//   </div>
// );

// export const StatPill = ({ label, value }) => (
//   <div className="stat-pill"><b>{value}</b><span>{label}</span></div>
// );

// export function AppBar({ title, actions, color = '#1565C0' }) {
//   const nav = useNavigate();
//   return (
//     <header className="appbar" style={{ background: color }}>
//       <button className="icon-btn light" onClick={() => nav(-1)} aria-label="Back"><ArrowLeft size={20} /></button>
//       <h1>{title}</h1>
//       <div className="appbar-actions">{actions}</div>
//     </header>
//   );
// }

// export const Chip = ({ children, color = '#4F46E5', bg = '#EEF2FF' }) => (
//   <span className="chip" style={{ color, background: bg }}>{children}</span>
// );




// import { Search, X, ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// export const Spinner = ({ color = '#4F46E5' }) => (
//   <div
//     className="center"
//     role="status"
//     aria-label="Loading"
//     aria-live="polite"
//   >
//     <div
//       className="spinner"
//       style={{ borderTopColor: color }}
//     />
//   </div>
// );

// export function SearchBar({
//   value,
//   onChange,
//   placeholder = 'Search…',
// }) {
//   return (
//     <div className="searchbar">
//       <Search
//         size={20}
//         color="#4F46E5"
//         aria-hidden="true"
//         className="searchbar-icon"
//       />

//       <input
//         type="search"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         aria-label={placeholder}
//       />

//       {value && (
//         <button
//           type="button"
//           className="icon-btn small"
//           onClick={() => onChange('')}
//           aria-label="Clear search"
//           title="Clear search"
//         >
//           <X size={16} />
//         </button>
//       )}
//     </div>
//   );
// }

// export const EmptyState = ({
//   icon: Icon,
//   title,
//   subtitle,
// }) => (
//   <div className="empty" role="status">
//     {Icon && (
//       <div className="empty-icon-wrap" aria-hidden="true">
//         <Icon size={40} strokeWidth={1.6} />
//       </div>
//     )}

//     <div className="empty-title">{title}</div>

//     {subtitle && (
//       <div className="empty-sub">{subtitle}</div>
//     )}
//   </div>
// );

// export const StatPill = ({ label, value }) => (
//   <div className="stat-pill">
//     <b>{value}</b>
//     <span>{label}</span>
//   </div>
// );

// export function AppBar({
//   title,
//   actions,
//   color = '#1565C0',
// }) {
//   const nav = useNavigate();

//   return (
//     <header
//       className="appbar"
//       style={{ background: color }}
//     >
//       <button
//         type="button"
//         className="icon-btn light"
//         onClick={() => nav(-1)}
//         aria-label="Back"
//         title="Go back"
//       >
//         <ArrowLeft size={20} />
//       </button>

//       <h1>{title}</h1>

//       <div className="appbar-actions">
//         {actions}
//       </div>
//     </header>
//   );
// }

// export const Chip = ({
//   children,
//   color = '#4F46E5',
//   bg = '#EEF2FF',
// }) => (
//   <span
//     className="chip"
//     style={{
//       color,
//       background: bg,
//     }}
//   >
//     {children}
//   </span>
// );


// Shared UI widgets. Styling lives in index.css; the only inline style left is a dynamic spinner colour.
import { Search, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Spinner = ({ color = '#4F46E5' }) => (
  <div className="center" role="status" aria-label="Loading" aria-live="polite">
    <div className="spinner" style={{ borderTopColor: color }} />
  </div>
);

export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="searchbar" role="search">
      <Search size={20} color="#4F46E5" aria-hidden="true" className="searchbar-icon" />

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        enterKeyHint="search"
      />

      {value && (
        <button
          type="button"
          className="icon-btn small"
          onClick={() => onChange('')}
          aria-label="Clear search"
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="empty" role="status">
    {Icon && (
      <div className="empty-icon-wrap" aria-hidden="true">
        <Icon size={40} strokeWidth={1.6} />
      </div>
    )}

    <div className="empty-title">{title}</div>

    {subtitle && <div className="empty-sub">{subtitle}</div>}
  </div>
);

export const StatPill = ({ label, value }) => (
  <div className="stat-pill">
    <b>{value}</b>
    <span>{label}</span>
  </div>
);

export function AppBar({ title, actions, color = '#1565C0' }) {
  const nav = useNavigate();

  return (
    <header className="appbar" style={{ background: color }}>
      <button
        type="button"
        className="icon-btn light"
        onClick={() => nav(-1)}
        aria-label="Back"
        title="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      <h1>{title}</h1>

      <div className="appbar-actions">{actions}</div>
    </header>
  );
}

// `color` / `bg` stay as props because callers pass status-dependent colours.
export const Chip = ({ children, color = '#4F46E5', bg = '#EEF2FF' }) => (
  <span className="chip" style={{ color, background: bg }}>
    {children}
  </span>
);