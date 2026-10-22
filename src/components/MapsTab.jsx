// Shared "maps" tab used by EmployeeHome and GuestHome (_buildMapsTab)
import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Map as MapIcon } from 'lucide-react';
import { loadEnabledMaps } from '../services/mapService';
import { SearchBar, Spinner, EmptyState } from './ui';
import MapCard from './MapCard';

export default function MapsTab({ onOpen, withFilters = false }) {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All'); // All | Recent | Large | Small

  const load = async () => {
    setLoading(true);
    try { setMaps(await loadEnabledMaps()); } catch (e) { console.error('Error loading maps:', e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    let list = maps.filter((m) => (m.name ?? '').toLowerCase().includes(q.toLowerCase()));
    const plotCount = (m) => (m.plots ?? []).filter((p) => p.type === 'plot').length;
    if (filter === 'Large') list = [...list].sort((a, b) => plotCount(b) - plotCount(a));
    if (filter === 'Small') list = [...list].sort((a, b) => plotCount(a) - plotCount(b));
    return list; // 'Recent' / 'All' keep createdDate-desc order from Firestore
  }, [maps, q, filter]);

  return (
    <>
      <div style={{ paddingTop: 14 }}><SearchBar value={q} onChange={setQ} placeholder="Search maps..." /></div>
      {withFilters && (
        <div className="filter-chips">
          {['All', 'Recent', 'Large', 'Small'].map((f) => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      )}
      <div className="section-head">
        <span>{visible.length} Map{visible.length !== 1 ? 's' : ''} Available</span>
        <button className="link-btn" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      {loading ? <Spinner /> : visible.length === 0 ? (
        <EmptyState icon={MapIcon} title={q ? 'No maps found' : 'No maps available'}
          subtitle={q ? 'Try a different search term' : 'Maps will appear here once created'} />
      ) : (
        <div className="grid">{visible.map((m, i) => <MapCard key={m.id} map={m} index={i} onOpen={onOpen} />)}</div>
      )}
    </>
  );
}
