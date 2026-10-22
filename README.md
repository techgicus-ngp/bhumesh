# Bhumesh Realtors — React (Vite) port of the Flutter app

## Run
```bash
npm install
cp .env.example .env     # fill Firebase + Google Maps keys
npm run dev              # http://localhost:5173
npm run build            # production build in dist/
```
Put your logo at `public/logo.jpg` (Flutter's `assets/logo.jpg` wasn't in the upload).

## Flutter → React mapping
| Flutter | React |
|---|---|
| `main.dart` (AuthWrapper, sessionNotifier) | `App.jsx`, `context/AuthContext.jsx` |
| `firebase_options.dart`, `flutter_dotenv` | `firebase.js` + `.env` (`VITE_*` vars) |
| `models/*` | `models/*.js` (plain objects + from/to-map helpers) |
| `services/*` (Streams) | `services/*.js` (`onSnapshot`, returns unsubscribe) |
| `shared_preferences` | `localStorage` |
| `login / register / guest_home / employee_home` | `pages/Login, Register, GuestHome, EmployeeHome` |
| `create_quotation_screen` | `pages/CreateQuotation.jsx` (calc is derived state) |
| `quotation_detail_screen` + `quotation_pdf` | `pages/QuotationDetail.jsx` (print-to-PDF layout) |
| `site_visit_screen / list` | `pages/SiteVisit.jsx`, `components/SiteVisitList.jsx` |
| `map_viewer_screen` (google_maps_flutter) | `pages/MapViewer.jsx` (@react-google-maps/api) |
| `grid_map_viewer_screen`, `plot_view_sheet` | `pages/GridMapViewer.jsx`, `components/PlotViewSheet.jsx` |
| `maps_web_loader*` | handled by `useJsApiLoader` |

## Behaviour differences
- **PDF**: "Print / Save PDF" uses the browser print dialog on the on-screen quotation (print CSS hides the UI). WhatsApp share opens `wa.me` with a text summary; it can't attach the PDF like the native share sheet did.
- **Selfie / GPS**: browser camera capture and Geolocation API (HTTPS or localhost required).
- **Map labels**: DOM overlays with zoom tiers + viewport culling instead of pre-rendered bitmaps; no collision-detection pass.
- **Not ported**: `map_list_screen.dart` (not reachable from the Flutter app's routing) and `splash_screen.dart` (fully commented out).

## Firestore indexes
Same composite-index queries as the Flutter app (`createdByUid`+`quotationDate`, `siteId in`+`quotationDate`, `employeeId`+`visitDate`). Firestore will print a console link to create each missing index.

## Security — please read
Carried over unchanged from the Flutter code: passwords are stored in plain text in the `users` collection and checked client-side, and the default admin/guest credentials are hard-coded in `authService.js`. Anyone who can read your Firestore rules can read every password. Before going live, move to Firebase Authentication + role-based Firestore security rules and remove the hard-coded accounts.
