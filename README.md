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

## Plot-status push notifications
Flow: any tool changes `maps/*` plot status → Cloud Function (`functions/index.js`) → FCM → every device in `fcmTokens` with `role` of employee or admin.
Employee devices register on login (`src/services/pushService.js`) and are removed on logout.

One-time setup
1. Firebase console → Project settings → Cloud Messaging → Web Push certificates → Generate key pair → put it in `.env` and Vercel as `VITE_FIREBASE_VAPID_KEY`.
2. Upgrade the Firebase project to Blaze (Cloud Functions requirement; free quota is ample for this usage).
3. `npm i -g firebase-tools && firebase login && firebase use <projectId>`
4. `cd functions && npm install && cd ..`
5. `firebase deploy --only functions` (it asks for `SITE_URL`, e.g. https://your-app.vercel.app)
6. Firestore rules must let the web app write `fcmTokens/{token}` (same openness as `users`).
7. Redeploy the web app on Vercel.
iPhone/iPad: web push only works after "Add to Home Screen" (iOS 16.4+).

### No-server mode (default)
`src/services/plotStatusWatcher.js` listens to Firestore `maps` while the app is open (tab may be in background) and shows a toast
(tab visible) or a system notification (tab hidden/minimized). It works on localhost with no deployment.
It cannot notify when the browser/app is fully closed — deploy the Cloud Function for that, then set
`VITE_DISABLE_LOCAL_WATCHER=true` so users don't get duplicate notifications.
