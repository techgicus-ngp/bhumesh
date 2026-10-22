// screens/quotation_detail_screen.dart + services/quotation_pdf.dart
// PDF: the page itself is the printable document (browser "Save as PDF" via window.print()), which keeps ₹ and Devanagari glyphs
// correct without bundling fonts. See @media print in index.css.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, Share2, Trash2, Pencil, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdmin, isAccountant } from '../models/user';
import { payByDaysDate, payByMonthsDate } from '../models/quotation';
import { getQuotation, deleteQuotation, updateBookingStatus } from '../services/quotationService';
import { AppBar, Spinner } from '../components/ui';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { fmtCurrency, fmtNum, fmtDate } from '../utils/format';

const STATUS_COLOR = { quotation: '#6366F1', booked: '#F59E0B', sold: '#EF4444' };

const KV = ({ k, v, total }) => <div className={`kv ${total ? 'total' : ''}`}><span>{k}</span><b>{v}</b></div>;
const Sec = ({ title, children }) => <div className="q-sec"><h5>{title}</h5>{children}</div>;

export default function QuotationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [tmp, setTmp] = useState({ status: 'quotation', date: '' });
  const canEditBooking = isAdmin(user) || isAccountant(user);

  useEffect(() => { getQuotation(id).then((r) => (r ? setQ(r) : (toast('Quotation not found', 'error'), nav('/')))); }, [id]); // eslint-disable-line
  if (!q) return <Spinner />;

  const stampRegDsc = q.stampDutyAmount + q.registrationAmount + q.dsc;
  const refId = q.id ? q.id.slice(0, 8).toUpperCase() : '';

  const whatsapp = () => {
    const text =
      `*Quotation – ${q.projectName}*\nCustomer: ${q.customerName}\nPlot ${q.plotNumber} · ${fmtNum(q.plotSize)} sq ft @ ${fmtCurrency(q.ratePerSqFt)}\n` +
      `Plot Amount: ${fmtCurrency(q.totalPlotAmount)}\nBooking: ${fmtCurrency(q.bookingAmount)}\nDown Payment: ${fmtCurrency(q.downPayment)}\n` +
      `Balance: ${fmtCurrency(q.loanAmount)}\nAdmin Total: ${fmtCurrency(q.adminTotal)}\n*FINAL TOTAL: ${fmtCurrency(q.finalTotalAmount)}*`;
    const digits = q.mobileNumber.replace(/\D/g, '');
    const phone = digits.length === 10 ? `91${digits}` : digits; // assume India for bare 10-digit numbers
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const doDelete = async () => {
    try { await deleteQuotation(q.id); toast('Quotation deleted', 'success'); nav('/', { replace: true }); }
    catch (e) { toast(`Error: ${e.message}`, 'error'); }
  };

  const openStatus = () => {
    setTmp({ status: q.status, date: q.paymentDate ? q.paymentDate.toISOString().slice(0, 10) : '' });
    setEditStatus(true);
  };
  const saveStatus = async () => {
    const paymentDate = tmp.date ? new Date(tmp.date) : null;
    try {
      await updateBookingStatus(q.id, { status: tmp.status, paymentDate });
      setQ({ ...q, status: tmp.status, paymentDate });
      setEditStatus(false);
      toast('Booking status updated', 'success');
    } catch (e) { toast(`Error: ${e.message}`, 'error'); }
  };

  const sc = STATUS_COLOR[q.status] ?? '#6366F1';

  return (
    <div className="page">
      <AppBar title="Quotation Preview" actions={<>
        <button className="icon-btn light" title="Print / Download PDF" onClick={() => window.print()}><Printer size={20} /></button>
        <button className="icon-btn light" title="Share on WhatsApp" onClick={whatsapp}><Share2 size={20} /></button>
        {isAdmin(user) && <button className="icon-btn light" title="Edit" onClick={() => nav(`/quotations/${q.id}/edit`)}><Pencil size={20} /></button>}
        {isAdmin(user) && <button className="icon-btn light" title="Delete Quotation" onClick={() => setConfirmDel(true)}><Trash2 size={20} /></button>}
      </>} />

      <div className="container" style={{ maxWidth: 900, padding: 16 }}>
        <div className="form-card no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>Booking Status</h3>
            <span className="status-badge" style={{ color: sc, borderColor: sc, background: `${sc}1F`, marginTop: 8 }}>{q.status.toUpperCase()}</span>
            {q.paymentDate && <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Payment date: {fmtDate(q.paymentDate)}</div>}
          </div>
          {canEditBooking && <button className="btn" onClick={openStatus}>Update</button>}
        </div>

        <div className="q-sheet">
          <div className="q-head">
            <img src="/logo.jpg" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, color: '#0D47A1' }}>{q.projectName ? q.projectName.toUpperCase() : 'REAL ESTATE'}</h2>
              <div style={{ color: '#64748b', fontSize: 13 }}>Real Estate Quotation</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="q-badge">QUOTATION</span>
              <div style={{ fontSize: 12, marginTop: 6 }}>{fmtDate(q.quotationDate)}</div>
              {refId && <div style={{ fontSize: 11, color: '#64748b' }}>Ref: {refId}</div>}
            </div>
          </div>

          <div className="q-cols">
            <Sec title="Customer Details"><KV k="Name" v={q.customerName} /><KV k="Mobile" v={q.mobileNumber} /><KV k="Address" v={q.address} /></Sec>
            <Sec title="Project Details">
              <KV k="Project" v={q.projectName} /><KV k="Plot No." v={q.plotNumber} />
              {q.khNo && <KV k="KH. No." v={q.khNo} />}
              <KV k="Plot Size" v={`${fmtNum(q.plotSize, 2)} sq ft`} /><KV k="Rate" v={`${fmtCurrency(q.ratePerSqFt)} / sq ft`} />
              <KV k="Prepared by" v={q.createdByName} />
            </Sec>
          </div>

          <Sec title="Payment Due Dates">
            <KV k={`Pay within ${q.payDaysDuration} days`} v={<><Calendar size={12} /> {fmtDate(payByDaysDate(q))}</>} />
            <KV k={`Pay within ${q.payMonthsDuration} month${q.payMonthsDuration > 1 ? 's' : ''}`} v={<><Calendar size={12} /> {fmtDate(payByMonthsDate(q))}</>} />
          </Sec>

          <div className="q-cols">
            <div>
              <Sec title="1. Plot Amount">
                <KV k={`Total Plot Amount (${fmtNum(q.plotSize, 2)} sq ft × ${fmtCurrency(q.ratePerSqFt)})`} v={fmtCurrency(q.totalPlotAmount)} />
                <KV k="Booking Amount" v={fmtCurrency(q.bookingAmount)} />
                <KV k="Down Payment" v={fmtCurrency(q.downPayment)} />
                <KV k="Balance Amount" v={fmtCurrency(q.loanAmount)} />
              </Sec>
              <Sec title="2. Stamp Duty & Registration">
                <KV k={`Stamp Duty (${q.stampDutyPercent.toFixed(0)}%)`} v={fmtCurrency(q.stampDutyAmount)} />
                <KV k="Registration" v={fmtCurrency(q.registrationAmount)} />
                <KV k="DHC" v={fmtCurrency(q.dsc)} />
                <KV k="Stamp + Reg + DSC Total" v={fmtCurrency(stampRegDsc)} total />
              </Sec>
              <Sec title="3. Administrative Charges">
                <KV k="Legal Fees" v={fmtCurrency(q.legalFees)} />
                <KV k="Maintenance" v={fmtCurrency(q.maintenance)} />
                <KV k="Admin Total" v={fmtCurrency(q.adminTotal)} total />
              </Sec>
            </div>
            <div>
              <Sec title="Payment Summary">
                <KV k="Plot Amount" v={fmtCurrency(q.totalPlotAmount)} />
                <KV k="Stamp + Reg + DSC" v={fmtCurrency(stampRegDsc)} />
                <KV k="Admin Charges" v={fmtCurrency(q.adminTotal)} />
                <KV k="GRAND TOTAL" v={fmtCurrency(q.finalTotalAmount)} total />
              </Sec>
              <Sec title="Balance Breakdown">
                <KV k="Total Plot Amount" v={fmtCurrency(q.totalPlotAmount)} />
                <KV k="− Booking Amount" v={fmtCurrency(q.bookingAmount)} />
                <KV k="− Down Payment" v={fmtCurrency(q.downPayment)} />
                <KV k="= Balance Amount" v={fmtCurrency(q.loanAmount)} total />
              </Sec>
              <div style={{ fontSize: 12, color: '#475569', padding: 10, background: '#f8fafc', borderRadius: 8 }}>
                <b style={{ color: '#1565C0' }}>Terms &amp; Notes</b><br />• Quotation valid for 30 days.<br />• Prices subject to change.<br />• All charges are in INR.
              </div>
            </div>
          </div>

          <div className="grand"><span>FINAL TOTAL AMOUNT</span><span>{fmtCurrency(q.finalTotalAmount)}</span></div>
          <div className="sign-row"><div>Customer Signature</div><div>Authorized Signature</div></div>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn" style={{ flex: 1 }} onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</button>
          <button className="btn green" style={{ flex: 1 }} onClick={whatsapp}><Share2 size={16} /> Share on WhatsApp</button>
        </div>
      </div>

      {confirmDel && (
        <Modal title="Delete Quotation" onClose={() => setConfirmDel(false)}
          actions={<><button className="btn text" onClick={() => setConfirmDel(false)}>Cancel</button><button className="btn danger" onClick={doDelete}>Delete</button></>}>
          Delete this quotation permanently?
        </Modal>
      )}
      {editStatus && (
        <Modal title="Update Booking Status" onClose={() => setEditStatus(false)}
          actions={<><button className="btn text" onClick={() => setEditStatus(false)}>Cancel</button><button className="btn" onClick={saveStatus}>Save</button></>}>
          <div className="field"><label>Status</label>
            <select value={tmp.status} onChange={(e) => setTmp({ ...tmp, status: e.target.value })}>
              {['quotation', 'booked', 'sold'].map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select></div>
          <div className="field"><label>Payment date</label>
            <input type="date" value={tmp.date} onChange={(e) => setTmp({ ...tmp, date: e.target.value })} /></div>
        </Modal>
      )}
    </div>
  );
}
