// _MapCard (employee_home.dart) + guest map card
import { Map as MapIcon, LayoutGrid } from 'lucide-react';
import { Chip } from './ui';
import { toDate, fmtMapDate } from '../utils/format';
// import { GOOGLE_MAPS_DOC_ID } from '../constants';
import { isGoogleMapDoc } from '../constants';
export default function MapCard({ map, index = 0, onOpen }) {
  const plots = map.plots ?? [];
  const count = (t) => plots.filter((p) => p.type === t).length;
  const created = toDate(map.createdDate) ?? new Date();
  // const isGrid = map.id !== GOOGLE_MAPS_DOC_ID;
  const isGrid = !isGoogleMapDoc(map.id);
  return (
    <div className="card" style={{ animationDelay: `${index * 40}ms` }} onClick={() => onOpen(map)}>
      <div className="row">
        <div>
          <h4>{map.name || 'Unnamed Map'}</h4>
          <div className="sub">Created {fmtMapDate(created)}</div>
        </div>
        {isGrid ? <LayoutGrid color="#4F46E5" /> : <MapIcon color="#4F46E5" />}
      </div>
      <div className="chips">
        <Chip>{count('plot')} Plots</Chip>
        <Chip color="#6b7280" bg="#f3f4f6">{count('road')} Roads</Chip>
        <Chip color="#15803d" bg="#dcfce7">{count('open_space')} Spaces</Chip>
      </div>
      <button className="btn full" style={{ marginTop: 14, background: '#4F46E5' }}>
        {isGrid ? 'Open Plot Grid' : 'Open Map'}
      </button>
    </div>
  );
}
