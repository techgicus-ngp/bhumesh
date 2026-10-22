// _AnimatedQuotationCard
import { useNavigate } from 'react-router-dom';
import { Chip } from './ui';
import { fmtCurrency, fmtNum, fmtDateShort } from '../utils/format';

const STATUS = { quotation: ['#6366F1', '#EEF2FF'], booked: ['#F59E0B', '#FEF3C7'], sold: ['#EF4444', '#FEE2E2'] };

export default function QuotationCard({ q, index = 0 }) {
  const nav = useNavigate();
  const [c, bg] = STATUS[q.status] ?? STATUS.quotation;
  return (
    <div className="card" style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }} onClick={() => nav(`/quotations/${q.id}`)}>
      <div className="row">
        <div>
          <h4>{q.customerName}</h4>
          <div className="sub">{q.projectName} · Plot {q.plotNumber}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="amount">{fmtCurrency(q.finalTotalAmount)}</div>
          <div className="sub" style={{ fontSize: 12 }}>{fmtDateShort(q.quotationDate)}</div>
        </div>
      </div>
      <div className="chips">
        <Chip>{fmtNum(q.plotSize)} sq ft</Chip>
        <Chip color="#0f766e" bg="#ccfbf1">{fmtCurrency(q.ratePerSqFt)}/sq ft</Chip>
        <Chip color={c} bg={bg}>{q.status.toUpperCase()}</Chip>
      </div>
    </div>
  );
}
