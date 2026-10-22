// screens/site_visit_list_screen.dart (SiteVisitListTab)
import { useEffect, useState } from 'react';
import { MapPin, Phone, Trash2, ClipboardList } from 'lucide-react';
import { getEmployeeVisits, deleteVisit } from '../services/siteVisitService';
import { SearchBar, Spinner, EmptyState, Chip } from './ui';
import Modal from './Modal';
import { useToast } from './Toast';
import { fmtDateTime } from '../utils/format';

export default function SiteVisitList({ employee }) {
  const toast = useToast();
  const [visits, setVisits] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => getEmployeeVisits(employee.uid, setVisits, (e) => { setError(e.message); setVisits([]); }), [employee.uid]);

  if (visits === null) return <Spinner />;
  const needle = q.toLowerCase();
  const list = visits.filter((v) =>
    !needle || v.customerName.toLowerCase().includes(needle) ||
    v.projectInterest.toLowerCase().includes(needle) || v.plotNumber.toLowerCase().includes(needle));

  const confirmDelete = async () => {
    try { await deleteVisit(toDelete.id); toast('Visit deleted', 'success'); }
    catch (e) { toast(`Error: ${e.message}`, 'error'); }
    setToDelete(null);
  };

  return (
    <>
      <div style={{ paddingTop: 14 }}><SearchBar value={q} onChange={setQ} placeholder="Search visits..." /></div>
      <div className="section-head"><span>Site Visits</span><span className="hint">{list.length} total</span></div>
      {error && <p className="err" style={{ color: '#ef4444' }}>Failed to load visits: {error}</p>}
      {list.length === 0 ? (
        <EmptyState icon={ClipboardList} title={q ? 'No visits found' : 'No site visits yet'} subtitle={q ? 'Try a different search' : 'Tap “New Visit” to record one'} />
      ) : (
        <div className="list">
          {list.map((v) => (
            <div className="card" key={v.id} style={{ cursor: 'default' }}>
              <div className="row">
                <div style={{ display: 'flex', gap: 12 }}>
                  {v.selfieBase64 && (
                    <img src={`data:image/jpeg;base64,${v.selfieBase64}`} alt="selfie" onClick={() => setPhoto(v)}
                      style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', cursor: 'zoom-in' }} />
                  )}
                  <div>
                    <h4>{v.customerName}</h4>
                    <div className="sub">{fmtDateTime(v.visitDate)}</div>
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setToDelete(v)} title="Delete"><Trash2 size={18} color="#ef4444" /></button>
              </div>
              <div className="chips">
                <Chip><Phone size={11} /> {v.customerPhone}</Chip>
                {v.projectInterest && <Chip color="#0f766e" bg="#ccfbf1">{v.projectInterest}</Chip>}
                {v.plotNumber && <Chip color="#b45309" bg="#fef3c7">Plot {v.plotNumber}</Chip>}
                <a href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <Chip color="#be123c" bg="#ffe4e6"><MapPin size={11} /> View location</Chip>
                </a>
              </div>
              {v.remarks && <p className="sub" style={{ marginBottom: 0 }}>{v.remarks}</p>}
            </div>
          ))}
        </div>
      )}
      {toDelete && (
        <Modal title="Delete Visit" onClose={() => setToDelete(null)}
          actions={<><button className="btn text" onClick={() => setToDelete(null)}>Cancel</button><button className="btn danger" onClick={confirmDelete}>Delete</button></>}>
          Delete the visit for <b>{toDelete.customerName}</b>?
        </Modal>
      )}
      {photo && <Modal title={photo.customerName} onClose={() => setPhoto(null)} wide><img src={`data:image/jpeg;base64,${photo.selfieBase64}`} style={{ width: '100%', borderRadius: 12 }} alt="" /></Modal>}
    </>
  );
}
