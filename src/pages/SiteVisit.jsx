// screens/site_visit_screen.dart — selfie (camera) + geolocation + form → Firestore
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitVisit } from '../services/siteVisitService';
import { AppBar } from '../components/ui';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

// image_picker(imageQuality: 60) equivalent: downscale + JPEG @ 0.6, returns base64 (no data: prefix)
function compressToBase64(file, maxSide = 1280, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', quality).split(',')[1]);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function SiteVisit() {
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const fileRef = useRef();
  const [f, setF] = useState({ name: '', phone: '', project: '', plot: '', remarks: '' });
  const [errors, setErrors] = useState({});
  const [selfie, setSelfie] = useState(null);
  const [pos, setPos] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const takeSelfie = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setSelfie(await compressToBase64(file)); } catch (err) { toast(`Camera error: ${err.message}`, 'error'); }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) return toast('Geolocation is not supported by this browser.', 'error');
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ latitude: p.coords.latitude, longitude: p.coords.longitude }); setLocLoading(false); },
      (err) => {
        setLocLoading(false);
        toast(err.code === 1 ? 'Location permission denied. Enable it in browser settings.' : `Location error: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.name.trim()) errs.name = 'Required';
    if (!f.phone.trim()) errs.phone = 'Required'; else if (f.phone.trim().length < 10) errs.phone = 'Enter valid phone';
    if (!f.project.trim()) errs.project = 'Required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!selfie) return toast('Please take a selfie with the customer.', 'error');
    if (!pos) return toast('Please capture the site location.', 'error');
    setSubmitting(true);
    try {
      await submitVisit({
        id: '', employeeId: user.uid, employeeName: user.name,
        customerName: f.name.trim(), customerPhone: f.phone.trim(),
        projectInterest: f.project.trim(), plotNumber: f.plot.trim(), remarks: f.remarks.trim(),
        selfieBase64: selfie, latitude: pos.latitude, longitude: pos.longitude,
        locationAddress: `${pos.latitude.toFixed(6)}, ${pos.longitude.toFixed(6)}`,
        visitDate: new Date(),
      });
      setDone(true);
    } catch (err) {
      toast(`Submission failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const Input = ({ k, label, hint, ...rest }) => (
    <div className="field">
      <label>{label}</label>
      <input value={f[k]} onChange={set(k)} placeholder={hint} {...rest} />
      {errors[k] && <span className="err">{errors[k]}</span>}
    </div>
  );

  return (
    <div className="page">
      <AppBar title="New Site Visit" color="#4F46E5" />
      <form className="container" style={{ maxWidth: 640, padding: 16 }} onSubmit={submit} noValidate>
        <div className="form-card">
          <h3>Customer Information</h3>
          {Input({ k: 'name', label: 'Customer Name', hint: 'Enter full name' })}
          {Input({ k: 'phone', label: 'Phone Number', hint: '+91 9876543210', type: 'tel' })}
        </div>
        <div className="form-card">
          <h3>Site Details</h3>
          {Input({ k: 'project', label: 'Project / Layout Name', hint: 'e.g. Green Valley Phase 2' })}
          {Input({ k: 'plot', label: 'Plot Number', hint: 'e.g. Plot A-12' })}
          <div className="field"><label>Remarks / Notes</label>
            <textarea rows={3} value={f.remarks} onChange={set('remarks')} placeholder="Customer feedback, requirements..." /></div>
        </div>
        <div className="form-card">
          <h3>Selfie with Customer</h3>
          <input ref={fileRef} type="file" accept="image/*" capture="user" hidden onChange={takeSelfie} />
          {selfie && <img src={`data:image/jpeg;base64,${selfie}`} alt="selfie" style={{ width: '100%', borderRadius: 12, marginBottom: 12 }} />}
          <button type="button" className="btn ghost full" onClick={() => fileRef.current.click()}>
            {selfie ? <><RefreshCw size={16} /> Retake Selfie</> : <><Camera size={16} /> Take Selfie</>}
          </button>
        </div>
        <div className="form-card">
          <h3>Site Location</h3>
          {pos && <p style={{ margin: '0 0 12px', fontSize: 14 }}><MapPin size={14} /> {pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)}</p>}
          <button type="button" className="btn ghost full" onClick={captureLocation} disabled={locLoading}>
            {locLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <MapPin size={16} />}
            {pos ? 'Recapture Location' : 'Capture Location'}
          </button>
        </div>
        <button className="btn full" style={{ background: '#4F46E5', height: 52 }} disabled={submitting}>
          {submitting ? <span className="spinner sm" /> : 'Submit Visit'}
        </button>
      </form>
      {done && (
        <Modal title="✓ Visit Submitted" actions={<button className="btn" onClick={() => nav('/', { replace: true })}>Done</button>}>
          The site visit has been recorded successfully.
        </Modal>
      )}
    </div>
  );
}
