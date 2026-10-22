// screens/grid_map_viewer_screen.dart — plot grid with status filters + advanced filters
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMap } from '../services/mapService';
import { plotFromDoc, statusColor, SQM_TO_SQFT } from '../models/plot';
import { SearchBar, Spinner, EmptyState } from '../components/ui';
import PlotViewSheet from '../components/PlotViewSheet';

const numericNo = (s) => { const n = parseInt(String(s).trim(), 10); return Number.isFinite(n) ? n : 999999; };
const uniq = (arr) => ['All', ...[...new Set(arr.map((x) => x.trim()).filter(Boolean))].sort()];

export default function GridMapViewer() {
  const { mapId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [map, setMap] = useState(null);
  const [plots, setPlots] = useState(null);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [facing, setFacing] = useState('All');
  const [showAdv, setShowAdv] = useState(false);
  const [minA, setMinA] = useState('');
  const [maxA, setMaxA] = useState('');
  const [applied, setApplied] = useState({ min: null, max: null });

  useEffect(() => {
    getMap(mapId).then((m) => {
      setMap(m);
      setPlots((m?.plots ?? []).map((p) => plotFromDoc(p)).filter((p) => p.type === 'plot'));
    }).catch(() => setPlots([]));
  }, [mapId]);

  const statusOpts = useMemo(() => uniq((plots ?? []).map((p) => p.status)), [plots]);
  const facingOpts = useMemo(() => uniq((plots ?? []).map((p) => p.facing)), [plots]);

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return (plots ?? []).filter((p) => {
      if (q && !p.plotNo.toLowerCase().includes(q) && !p.ownerName.toLowerCase().includes(q)) return false;
      if (status !== 'All' && p.status.toLowerCase() !== status.toLowerCase()) return false;
      if (facing !== 'All' && !p.facing.toLowerCase().includes(facing.toLowerCase())) return false;
      const ft = p.areaSqFt > 0 ? p.areaSqFt : p.area * SQM_TO_SQFT;
      if (applied.min != null && ft < applied.min) return false;
      if (applied.max != null && ft > applied.max) return false;
      return true;
    }).sort((a, b) => numericNo(a.plotNo) - numericNo(b.plotNo) || a.plotNo.localeCompare(b.plotNo));
  }, [plots, search, status, facing, applied]);

  const hasFilter = search || status !== 'All' || facing !== 'All' || applied.min != null || applied.max != null;
  const clearAll = () => { setSearch(''); setStatus('All'); setFacing('All'); setMinA(''); setMaxA(''); setApplied({ min: null, max: null }); };
  const count = (s) => (plots ?? []).filter((p) => p.status.toLowerCase() === s).length;

  if (plots === null) return <Spinner />;

  const Chips = ({ opts, value, onChange }) => (
    <div className="filter-chips" style={{ paddingTop: 8 }}>
      {opts.map((o) => <button key={o} className={`filter-chip ${value === o ? 'active' : ''}`} onClick={() => onChange(o)}>{o}</button>)}
    </div>
  );

  return (
    <div className="page" style={{ background: '#F4F6FB' }}>
      <div className="hero" style={{ background: 'linear-gradient(135deg,#1E3A8A,#2563EB)', paddingBottom: 16 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="icon-btn light" onClick={() => nav(-1)}><ArrowLeft /></button>
          <div><small>LAYOUT</small><h2 style={{ margin: 0 }}>{map?.name || 'Layout'}</h2></div>
        </div>
      </div>
      <div className="container">
        <div className="stats-tiles">
          {[['Total', plots.length, '#2563EB'], ['Available', count('available'), '#00B96B'], ['Booked', count('booked'), '#F59E0B'], ['Sold', count('sold'), '#EF4444'], ['Reserved', count('reserved'), '#8B5CF6']].map(([l, v, c]) => (
            <div className="stat-tile" key={l}><b style={{ color: c }}>{v}</b><span>{l}</span></div>
          ))}
        </div>

        <div className="filter-panel">
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><SearchBar value={search} onChange={setSearch} placeholder="Search plot no. or owner…" /></div>
            <button className={`btn ${showAdv ? '' : 'ghost'}`} onClick={() => setShowAdv(!showAdv)}><SlidersHorizontal size={16} /></button>
          </div>
          <Chips opts={statusOpts} value={status} onChange={setStatus} />
          {showAdv && (
            <div style={{ marginTop: 12 }}>
              <div className="form-row">
                <div className="field"><label>Min area (sq ft)</label><input type="number" value={minA} onChange={(e) => setMinA(e.target.value)} /></div>
                <div className="field"><label>Max area (sq ft)</label><input type="number" value={maxA} onChange={(e) => setMaxA(e.target.value)} /></div>
              </div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Facing</label>
              <Chips opts={facingOpts} value={facing} onChange={setFacing} />
              <button className="btn" style={{ marginTop: 12 }} onClick={() => { setApplied({ min: parseFloat(minA) || null, max: parseFloat(maxA) || null }); setShowAdv(false); }}>Apply</button>
            </div>
          )}
          {hasFilter && <button className="link-btn" style={{ marginTop: 10 }} onClick={clearAll}>Clear all filters</button>}
        </div>

        {visible.length === 0 ? (
          <EmptyState title="No plots match your filters" subtitle="Try adjusting or clearing the filters" />
        ) : (
          <div className="plot-grid">
            {visible.map((p) => {
              const c = statusColor(p.status);
              return (
                <button key={p.srNo || p.plotNo} className="plot-tile" style={{ borderColor: c, background: `${c}1A`, color: c }} onClick={() => setSelected(p)}>
                  <b>{p.plotNo}</b>
                  <span>{Math.round(p.areaSqFt > 0 ? p.areaSqFt : p.area * SQM_TO_SQFT)} sq ft</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {selected && <PlotViewSheet plot={selected} mapId={mapId} mapName={map?.name ?? ''} user={user} onClose={() => setSelected(null)} />}
    </div>
  );
}
