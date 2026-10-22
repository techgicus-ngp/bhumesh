// screens/employee_home.dart — 4 tabs: Maps · Quotations · Site Visits · Bookings
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Map as MapIcon,
  FileText,
  ClipboardList,
  BookmarkCheck,
  Plus,
  FileX,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getEmployeeQuotations,
  getQuotationsForSites,
} from "../services/quotationService";
import { getEmployeeVisits } from "../services/siteVisitService";
import { SearchBar, Spinner, EmptyState, StatPill } from "../components/ui";
import MapsTab from "../components/MapsTab";
import QuotationCard from "../components/QuotationCard";
import SiteVisitList from "../components/SiteVisitList";
import { fmtCurrency } from "../utils/format";

const TABS = [
  ["Maps", MapIcon],
  ["Quotations", FileText],
  ["Site Visits", ClipboardList],
  ["Bookings", BookmarkCheck],
];

function useSub(subscribe, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    setData(null);
    return subscribe(setData, (e) => {
      console.error(e);
      setError(e);
      setData([]);
    });
  }, deps); // eslint-disable-line
  return [data, error];
}

export default function EmployeeHome() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");

  const [quotations, qErr] = useSub(
    (cb, err) => getEmployeeQuotations(user.uid, cb, err),
    [user.uid],
  );
  const [visits] = useSub(
    (cb, err) => getEmployeeVisits(user.uid, cb, err),
    [user.uid],
  );
  const [bookings] = useSub(
    (cb, err) => getQuotationsForSites(user.assignedSiteIds, cb, err),
    [user.assignedSiteIds.join(",")],
  );

  const total = useMemo(
    () => (quotations ?? []).reduce((s, q) => s + q.finalTotalAmount, 0),
    [quotations],
  );
  const filteredQ = useMemo(() => {
    const n = search.toLowerCase();
    return (quotations ?? []).filter(
      (q) =>
        !n ||
        q.customerName.toLowerCase().includes(n) ||
        q.plotNumber.toLowerCase().includes(n) ||
        q.projectName.toLowerCase().includes(n),
    );
  }, [quotations, search]);

  return (
    <div className="page">
      <div className="hero">
        <div className="container">
          <div className="row">
            <div>
              <small>{user.role.toUpperCase()}</small>
              <h2>Welcome, {user.name}</h2>
              <p>Bhumesh Realtors</p>
            </div>
            <button
              className="icon-btn light"
              onClick={logout}
              title="Sign out"
            >
              <LogOut />
            </button>
          </div>
          <div className="stat-row">
            <StatPill label="Quotations" value={quotations?.length ?? "–"} />
            <StatPill
              label="Total Value"
              value={quotations ? fmtCurrency(total) : "–"}
            />
            <StatPill label="Site Visits" value={visits?.length ?? "–"} />
          </div>
          <div className="tabs">
            {TABS.map(([label, Icon], i) => (
              <button
                key={label}
                className={`tab ${tab === i ? "active" : ""}`}
                onClick={() => setTab(i)}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ flex: 1 }}>
        {tab === 0 && (
          <MapsTab withFilters onOpen={(m) => nav(`/maps/${m.id}`)} />
        )}

        {tab === 1 && (
          <>
            <div style={{ paddingTop: 14 }}>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by customer, plot or project…"
              />
            </div>
            <div className="section-head">
              <span>Quotations</span>
              <span className="hint">Tap to view details</span>
            </div>
            {qErr ? (
              <p style={{ color: "#ef4444" }}>
                Failed to load quotations: {qErr.message}
              </p>
            ) : quotations === null ? (
              <Spinner />
            ) : filteredQ.length === 0 ? (
              <EmptyState
                icon={FileX}
                title={search ? "No quotations found" : "No quotations yet"}
                subtitle={
                  search
                    ? "Try a different search"
                    : "Open a map, tap a plot and generate one"
                }
              />
            ) : (
              <div className="list">
                {filteredQ.map((q, i) => (
                  <QuotationCard key={q.id} q={q} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 2 && <SiteVisitList employee={user} />}

        {tab === 3 &&
          (user.assignedSiteIds.length === 0 ? (
            <EmptyState
              icon={MapIcon}
              title="No sites assigned yet"
              subtitle="Contact your admin to get assigned to a site."
            />
          ) : (
            <>
              <div className="section-head">
                <span>Customers &amp; Bookings</span>
                <span className="hint">For your assigned sites</span>
              </div>
              {bookings === null ? (
                <Spinner />
              ) : bookings.length === 0 ? (
                <EmptyState icon={FileX} title="No quotations yet" />
              ) : (
                <div className="list">
                  {bookings.map((q, i) => (
                    <QuotationCard key={q.id} q={q} index={i} />
                  ))}
                </div>
              )}
            </>
          ))}
      </div>

      {tab === 2 && (
        <button className="btn fab" onClick={() => nav("/site-visit/new")}>
          <Plus size={18} /> New Visit
        </button>
      )}
    </div>
  );
}
