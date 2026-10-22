// main.dart MyApp + AuthWrapper → router with role-based home
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { isGuest } from "./models/user";
import { Spinner } from "./components/ui";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeHome from "./pages/EmployeeHome";
import GuestHome from "./pages/GuestHome";
import SiteVisit from "./pages/SiteVisit";
import CreateQuotation from "./pages/CreateQuotation";
import QuotationDetail from "./pages/QuotationDetail";
import MapViewer from "./pages/MapViewer";
import { GOOGLE_MAPS_DOC_ID } from "./constants";
import GridMapViewer from "./pages/GridMapViewer";

function Protected({ children, noGuest = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (noGuest && isGuest(user)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, restoring } = useAuth();
  if (restoring) return <Spinner color="#1565C0" />;

  return (
    <Routes>

            {/* Public share link: no login. Same viewer, read-only public mode. */}
      <Route path="/share/:mapId" element={<MapViewer publicView />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/"
        element={
          <Protected>
            {user && (isGuest(user) ? <GuestHome /> : <EmployeeHome />)}
          </Protected>
        }
      />
      <Route
        path="/maps/:mapId"
        element={
          <Protected>
            <MapRoute />
          </Protected>
        }
      />
      <Route
        path="/site-visit/new"
        element={
          <Protected noGuest>
            <SiteVisit />
          </Protected>
        }
      />
      <Route
        path="/quotations/new"
        element={
          <Protected noGuest>
            <CreateQuotation />
          </Protected>
        }
      />
      <Route
        path="/quotations/:id"
        element={
          <Protected noGuest>
            <QuotationDetail />
          </Protected>
        }
      />
      <Route
        path="/quotations/:id/edit"
        element={
          <Protected noGuest>
            <CreateQuotation />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Google-Maps doc → satellite MapViewer; everything else → grid viewer (same routing rule as Flutter)
function MapRoute() {
  const { mapId } = useParams();
  return mapId === GOOGLE_MAPS_DOC_ID ? <MapViewer /> : <GridMapViewer />;
}
