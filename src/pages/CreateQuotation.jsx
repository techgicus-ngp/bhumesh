// screens/create_quotation_screen.dart — same calculation rules, expressed as derived state
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../models/user';
import { createQuotation, updateQuotation, getQuotation } from '../services/quotationService';
import { findPlot } from '../services/mapService';
import { AppBar, Spinner } from '../components/ui';
import { useToast } from '../components/Toast';
import { fmtCurrency, fmtDate } from '../utils/format';

const DOWN_PCT = { '10%': 0.1, '20%': 0.2, '25%': 0.25, '75%': 0.75 };
const num = (v, fb = 0) => { const n = parseFloat(v); return Number.isFinite(n) ? n : fb; };
// Registration: 1% up to ₹30,00,000, flat ₹30,000 above
const autoRegistration = (total) => (total <= 3000000 ? total * 0.01 : 30000);
const r0 = (n) => String(Math.round(n));

export default function CreateQuotation() {
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const { id } = useParams();                 // /quotations/:id/edit
  const { state } = useLocation();            // { plot, mapId, mapName } when coming from a plot sheet
  const [loading, setLoading] = useState(!!id);
  const [existing, setExisting] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── plot search ──
  const [plotQuery, setPlotQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [plot, setPlot] = useState(null);
  const [mapId, setMapId] = useState(null);

  // ── form values (strings, like the TextEditingControllers) ──
  const [f, setF] = useState({
    customerName: '', mobileNumber: '', address: '', projectName: '', plotNumber: '', khNo: '',
    plotSize: '', ratePerSqFt: '', bookingAmount: '51000', downPayment: '', stampDutyPercent: '6',
    dsc: '0', legalFees: '5600', maintenance: '2000',
  });
  const [downOption, setDownOption] = useState('20%');
  const [downManual, setDownManual] = useState(false);
  const [payDays, setPayDays] = useState(30);
  const [payMonths, setPayMonths] = useState(1);
  const [quotationDate] = useState(new Date());
  // Manual overrides of the auto-calculated, editable fields
  const [ov, setOv] = useState({});
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const applyPlot = (p, mid, mapName) => {
    setPlot(p); setMapId(mid); setNotFound(false);
    setF((s) => ({ ...s, plotNumber: p.plotNo, plotSize: r0(p.areaSqFt), projectName: mapName }));
  };

  useEffect(() => { if (state?.plot) applyPlot(state.plot, state.mapId, state.mapName); }, []); // eslint-disable-line

  useEffect(() => {
    if (!id) return;
    (async () => {
      const q = await getQuotation(id);
      if (!q) { toast('Quotation not found', 'error'); return nav('/'); }
      setExisting(q);
      setMapId(q.siteId || null);
      setF({
        customerName: q.customerName, mobileNumber: q.mobileNumber, address: q.address, projectName: q.projectName,
        plotNumber: q.plotNumber, khNo: q.khNo, plotSize: String(q.plotSize), ratePerSqFt: String(q.ratePerSqFt),
        bookingAmount: String(q.bookingAmount), downPayment: String(q.downPayment),
        stampDutyPercent: String(q.stampDutyPercent), dsc: String(q.dsc), legalFees: String(q.legalFees), maintenance: String(q.maintenance),
      });
      if (q.downPayment > 0 && q.totalPlotAmount > 0) {
        const pct = Math.round(((q.downPayment + q.bookingAmount) / q.totalPlotAmount) * 100);
        setDownOption(pct <= 10 ? '10%' : pct <= 20 ? '20%' : pct <= 25 ? '25%' : '75%');
        setDownManual(true);
      }
      setPayDays(q.payDaysDuration); setPayMonths(q.payMonthsDuration);
      setLoading(false);
    })();
  }, [id]); // eslint-disable-line

  const searchPlot = async () => {
    if (!plotQuery.trim()) return;
    setSearching(true); setNotFound(false); setPlot(null); setMapId(null);
    setF((s) => ({ ...s, plotNumber: '', plotSize: '', projectName: '' }));
    try {
      const hit = await findPlot(plotQuery);
      if (hit) applyPlot(hit.plot, hit.mapId, hit.mapName); else setNotFound(true);
    } catch (e) { toast(`Error searching plot: ${e.message}`, 'error'); }
    setSearching(false);
  };
  const clearPlot = () => {
    setPlot(null); setMapId(null); setPlotQuery(''); setNotFound(false); setDownManual(false);
    setF((s) => ({ ...s, plotNumber: '', plotSize: '', projectName: '', downPayment: '' }));
  };

  // ── derived values (replaces _recalculate / _recalculateFinalOnly) ──
  const calc = useMemo(() => {
    const size = num(f.plotSize), rate = num(f.ratePerSqFt), booking = num(f.bookingAmount);
    const autoTotal = size * rate;
    const total = ov.total !== undefined ? num(ov.total) : autoTotal;
    const down = !downManual && total > 0 ? Math.max(0, total * DOWN_PCT[downOption] - booking) : num(f.downPayment);
    const loanAuto = Math.max(0, total - booking - down);
    const sdAuto = (total * num(f.stampDutyPercent, 6)) / 100;
    const regAuto = autoRegistration(total);
    const sd = ov.sd !== undefined ? num(ov.sd) : sdAuto;
    const reg = ov.reg !== undefined ? num(ov.reg) : regAuto;
    const loan = ov.loan !== undefined ? num(ov.loan) : loanAuto;
    const adminAuto = sd + reg + num(f.dsc) + num(f.legalFees) + num(f.maintenance);
    const admin = ov.admin !== undefined ? num(ov.admin) : adminAuto;
    return { total, down, loan, sd, reg, admin, final: total + admin };
  }, [f, downOption, downManual, ov]);

  const save = async (e) => {
    e.preventDefault();
    const errs = {};
    ['customerName', 'mobileNumber', 'address', 'ratePerSqFt'].forEach((k) => { if (!String(f[k]).trim()) errs[k] = 'Required'; });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!plot && !existing) return toast('Please search and select a plot first', 'error');
    setSaving(true);
    try {
      const q = {
        id: existing?.id,
        customerName: f.customerName.trim(), mobileNumber: f.mobileNumber.trim(), address: f.address.trim(),
        projectName: f.projectName.trim(), plotNumber: f.plotNumber.trim(), khNo: f.khNo.trim(),
        plotSize: num(f.plotSize), ratePerSqFt: num(f.ratePerSqFt),
        totalPlotAmount: calc.total, bookingAmount: num(f.bookingAmount), downPayment: calc.down, loanAmount: calc.loan,
        stampDutyPercent: num(f.stampDutyPercent, 6), stampDutyAmount: calc.sd,
        registrationPercent: 0, registrationAmount: calc.reg,
        dsc: num(f.dsc), legalFees: num(f.legalFees), maintenance: num(f.maintenance),
        adminTotal: calc.admin, corpusFund: 0, finalTotalAmount: calc.final,
        quotationDate: existing?.quotationDate ?? quotationDate,
        payDaysDuration: payDays, payMonthsDuration: payMonths,
        createdByUid: existing?.createdByUid ?? user.uid, createdByName: existing?.createdByName ?? user.name,
        siteId: mapId ?? existing?.siteId ?? '', status: existing?.status ?? 'quotation',
        paymentDate: existing?.paymentDate ?? null,
      };
      let savedId = existing?.id;
      if (savedId) await updateQuotation(savedId, q); else savedId = await createQuotation(q);
      nav(`/quotations/${savedId}`, { replace: true });
    } catch (err) {
      toast(`Error saving: ${err.message}`, 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const T = ({ k, label, readOnly, type = 'text', ...r }) => (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={f[k]} onChange={set(k)} readOnly={readOnly} {...r} />
      {errors[k] && <span className="err">{errors[k]}</span>}
    </div>
  );
  const Calc = ({ k, label, value }) => (
    <div className="field">
      <label>{label}</label>
      <input type="number" value={ov[k] !== undefined ? ov[k] : r0(value)} onChange={(e) => setOv({ ...ov, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="page" style={{ background: '#F0F4FF' }}>
      <AppBar title={existing ? 'Edit Quotation' : 'New Quotation'}
        actions={<button className="btn" style={{ background: 'rgba(255,255,255,.2)', padding: '8px 14px' }} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>} />
      <form className="container" style={{ maxWidth: 720, padding: 16 }} onSubmit={save} noValidate>
        {!existing && (
          <div className="form-card">
            <h3>Find Plot</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #D0DFFF' }} placeholder="Search Plot by Plot No or Sr No"
                value={plotQuery} onChange={(e) => setPlotQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchPlot())} />
              <button type="button" className="btn" onClick={searchPlot} disabled={searching}>{searching ? <span className="spinner sm" /> : <Search size={16} />}</button>
              {plot && <button type="button" className="btn ghost" onClick={clearPlot}><X size={16} /></button>}
            </div>
            {notFound && <p className="err" style={{ color: '#ef4444', marginBottom: 0 }}>Plot not found in any map.</p>}
            {plot && <p style={{ color: '#15803d', marginBottom: 0 }}>✓ Plot {plot.plotNo} · {f.projectName} · {r0(plot.areaSqFt)} sq ft</p>}
          </div>
        )}

        <div className="form-card"><h3>Customer Details</h3>
          {T({ k: 'customerName', label: 'Customer Name' })}
          {T({ k: 'mobileNumber', label: 'Mobile Number', type: 'tel' })}
          <div className="field"><label>Address</label><textarea rows={2} value={f.address} onChange={set('address')} />{errors.address && <span className="err">{errors.address}</span>}</div>
        </div>

        <div className="form-card"><h3>Project Details</h3>
          {T({ k: 'projectName', label: 'Project Name' })}
          <div className="form-row">{T({ k: 'plotNumber', label: 'Plot Number', readOnly: true })}{T({ k: 'khNo', label: 'KH. No.' })}</div>
        </div>

        <div className="form-card"><h3>Plot Amount</h3>
          <div className="form-row">
            {T({ k: 'plotSize', label: 'Plot Size (sq ft)', type: 'number', readOnly: !!plot })}
            {T({ k: 'ratePerSqFt', label: 'Rate / sq ft', type: 'number' })}
          </div>
          {Calc({ k: "total", label: "Total Plot Amount", value: calc.total })}
          <div className="form-row">
            {T({ k: 'bookingAmount', label: 'Booking Amount', type: 'number' })}
            <div className="field"><label>Down Payment %</label>
              <select value={downOption} onChange={(e) => { setDownOption(e.target.value); setDownManual(false); }}>
                {Object.keys(DOWN_PCT).map((o) => <option key={o}>{o}</option>)}
              </select></div>
          </div>
          <div className="field"><label>Down Payment</label>
            <input type="number" value={downManual ? f.downPayment : r0(calc.down)}
              onChange={(e) => { setDownManual(true); setF({ ...f, downPayment: e.target.value }); }} /></div>
          {Calc({ k: "loan", label: "Balance Amount", value: calc.loan })}
        </div>

        <div className="form-card"><h3>Payment Due Dates</h3>
          <div className="form-row">
            <div className="field"><label>Down Payment Date</label>
              <select value={payDays} onChange={(e) => setPayDays(+e.target.value)}><option value={15}>15 Days</option><option value={30}>30 Days</option></select></div>
            <div className="field"><label>Balance Amount Pay Date</label>
              <select value={payMonths} onChange={(e) => setPayMonths(+e.target.value)}>{[1, 2, 3].map((m) => <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>)}</select></div>
          </div>
          <small style={{ color: '#64748b' }}>Quotation date: {fmtDate(quotationDate)}</small>
        </div>

        <div className="form-card"><h3>Stamp Duty &amp; Registration</h3>
          <div className="form-row">{T({ k: 'stampDutyPercent', label: 'Stamp Duty %', type: 'number' })}{Calc({ k: "sd", label: "Stamp Duty Amount", value: calc.sd })}</div>
          <div className="form-row">{Calc({ k: "reg", label: "Registration (auto)", value: calc.reg })}{T({ k: 'dsc', label: 'DHC / DSC', type: 'number' })}</div>
        </div>

        <div className="form-card"><h3>Administrative Charges</h3>
          <div className="form-row">{T({ k: 'legalFees', label: 'Legal Fees', type: 'number' })}{T({ k: 'maintenance', label: 'Maintenance', type: 'number' })}</div>
          {Calc({ k: "admin", label: "Admin Total", value: calc.admin })}
        </div>

        <div className="grand"><span>FINAL TOTAL AMOUNT</span><span>{fmtCurrency(calc.final)}</span></div>
        <div className="form-row" style={{ margin: '12px 0 24px', textAlign: 'center', fontSize: 12, color: '#475569' }}>
          <span style={{ flex: 1 }}>Plot Amount<br /><b>{fmtCurrency(calc.total)}</b></span>
          <span style={{ flex: 1 }}>Admin<br /><b>{fmtCurrency(calc.admin)}</b></span>
          <span style={{ flex: 1 }}>Total<br /><b>{fmtCurrency(calc.final)}</b></span>
        </div>
        <button className="btn full" style={{ height: 52 }} disabled={saving}>{saving ? <span className="spinner sm" /> : (existing ? 'Update Quotation' : 'Save & Preview')}</button>
      </form>
    </div>
  );
}
