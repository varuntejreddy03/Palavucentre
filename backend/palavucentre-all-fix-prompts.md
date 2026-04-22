# PalavuCentre — Fix Prompts (All 6)
> Paste each into Cursor / Codex in order. Verify before moving to the next.

---

## PROMPT 1 — Cookie-Only Sessions

```
Refactor PalavuCentre auth to cookie-only sessions. Remove JWT from the frontend entirely.

Backend (backend/src):
- account.controller.js — keep setting the httpOnly auth cookie, but strip the token field from all JSON responses (login, signup, Google auth). Return only the user object.
- Any protected-route middleware that checks Authorization header before cookie — flip it: cookie is authoritative, ignore Authorization for user routes.

Frontend (frontend/src):
- AccountContext.jsx — delete all localStorage calls for the auth token. Auth state shape becomes { user: null | {...}, loading: boolean } only, derived from a /me or session-check call on mount.
- api.js — remove the Bearer token interceptor. Keep credentials: 'include' (or withCredentials: true) on the axios instance. If it's missing, add it.
- Logout — call the backend logout endpoint (clears cookie server-side), then set user: null. No localStorage to clear.

If the above approach causes issues (e.g. the /me endpoint doesn't exist yet, or the cookie isn't being sent on cross-origin dev setup), pivot to this instead:
- Add GET /api/auth/me that reads req.cookies.authToken, verifies it, and returns the user object.
- On the frontend, call this inside a useEffect on AccountContext mount to rehydrate the session.

Verify: login → no token in localStorage, cookie present in DevTools → refresh → still logged in → logout → cookie gone.
```

---

## PROMPT 2 — Guest-First Checkout

```
Make checkout and order tracking accessible without login. The backend already supports guest orders.

Frontend (frontend/src):
- App.jsx — remove the PrivateRoute / RequireAuth wrapper from both /order and /track-order. Both routes render their page components directly, no auth check.
- CheckoutPage (or OrderPage) — if user is logged in, pre-fill name/email/phone/addresses as before. If user is null (guest), show the same form with those fields as required inputs. Do NOT redirect to login. Add one soft inline prompt above the submit button: "Have an account? Sign in for saved addresses" with a Sign In link that opens the auth modal without navigating away.
- Order confirmation screen — if the user is a guest, show a dismissable card: "Save your order history — create a free account" with email pre-filled. Wire the button to open signup with that email. If already logged in, skip this card entirely.
- TrackOrderPage.jsx — remove any auth check at the top of the component. The guest tracking form should work as-is.

If removing the route guard breaks something (e.g. the order POST rejects because it expects a userId), pivot to this instead:
- Check orders.routes.js — confirm the userId field is optional on the order creation endpoint. If it is required, make it optional: change the validator to accept userId as optional and default it to null in the service layer.
- Then retry removing the frontend guard.

Update e2e test (order-protected-route.spec.js): expect /order to be reachable without login and the checkout form to be visible.

Verify: open /order in an incognito window → form loads → submit a guest order → confirmation screen shows → /track-order loads without login.
```

---

## PROMPT 3 — CSRF Protection

```
Add CSRF protection to all cookie-authenticated state-changing endpoints.

Backend (backend/src):
- Install csrf-csrf. Create backend/src/middleware/csrf.middleware.js:
  Initialize doubleCsrf with cookieOptions: { sameSite: 'strict', secure: process.env.NODE_ENV === 'production' }, getSecret: () => process.env.CSRF_SECRET, getTokenFromRequest: req => req.headers['x-csrf-token'].
  Export generateToken and doubleCsrfProtection.
- Add GET /api/csrf-token (public, no auth): calls generateToken(req, res) and returns { csrfToken }.
- Apply doubleCsrfProtection to all POST/PUT/PATCH/DELETE routes EXCEPT the Google OAuth callback and any Razorpay webhook (those use their own signature verification).
- For the Google OAuth callback route, add a small origin-check middleware: reject with 403 if req.headers.origin is not accounts.google.com or your own frontend domain.
- Add CSRF_SECRET to env vars. In render.yaml, change COOKIE_SAME_SITE from none to lax.

Frontend (frontend/src):
- On app mount (App.jsx or main.jsx), call GET /api/csrf-token once and store the result in a module-level variable (not localStorage, not React state).
- In api.js, add a request interceptor: inject x-csrf-token: <stored token> on every non-GET request.
- If a request returns 403 due to token rotation, refetch the token and retry once.

If csrf-csrf causes issues with your Express version or cookie setup, pivot to the simpler synchronizer token pattern instead:
- Use the csurf package (or a manual implementation): on login success, generate a random CSRF token, store it in a separate non-httpOnly cookie (readable by JS), and require it as x-csrf-token on all state-changing requests.

Verify: POST /api/orders without x-csrf-token header → 403. POST with correct token → succeeds. Check render.yaml has COOKIE_SAME_SITE=lax.
```

---

## PROMPT 4 — Admin Auth Hardening

```
Harden admin login: require email, strict rate limiting, isolated cookie.

Backend (backend/src):
- admin-auth.validator.js — make email required (non-empty, valid email format). Return 400 if missing.
- admin-auth.service.js — remove the fallback that selects the first active admin when no identifier is supplied. Admin lookup must always be by a specific email. If email is missing or not found, throw immediately.
- rate-limit.middleware.js — add a new adminAuthLimiter: windowMs 15 minutes, max 10 attempts per IP, skipSuccessfulRequests: true, message: 'Too many admin login attempts. Try again in 15 minutes.'
- auth.routes.js — replace the existing limiter on the admin login route with adminAuthLimiter.
- Admin auth cookie — ensure it uses a different cookie name than the user auth cookie (e.g. adminAuthToken vs authToken). Update any admin session middleware that reads it. This prevents user sessions and admin sessions from interfering.

Optional lockout (add if the above goes smoothly):
- Add lockedUntil DateTime? to the Admin model in schema.prisma. Run prisma migrate dev --name add_admin_locked_until.
- After 5 failed attempts for a specific email, set lockedUntil = now + 15 minutes. Check it at the start of the login service and return 423 with retry-after if locked. Reset on success.

Frontend (frontend/src/pages/admin/AdminLogin.jsx):
- Remove any copy suggesting email is optional (~line 121). Add required to the email input. Show inline validation error if empty on submit.

If the validator change causes issues (e.g. admin creation scripts rely on email being optional), pivot to: keep the validator lenient but add a hard check at the top of the service: if (!identifier?.email) throw new Error('Email is required').

Verify: POST admin login with no email → 400. POST with wrong email 10 times → 429 after 10 attempts. Admin cookie is named differently from user cookie.
```

---

## PROMPT 5 — Google Auth: Unified + Sub-Based Linking

```
Show Google auth on both sign-in and sign-up. Link accounts by stable Google sub, not email.

Backend (backend/src):
- schema.prisma — add googleSub String? @unique to the User model. Run prisma migrate dev --name add_google_sub_to_user.
- user-auth.service.js — update the Google auth handler. After verifying the ID token, extract sub and email from the payload. Lookup order:
  1. Find user where googleSub = sub → sign in.
  2. Not found → find user where email = payload.email AND googleSub IS NULL → existing email/password user linking Google for the first time → set googleSub = sub → sign in.
  3. Not found → create new user with googleSub, email, name, emailVerified: true, password: null → sign in.
  Remove the old email-only lookup. This is the only path now.

Frontend (frontend/src/pages/AuthPage.jsx):
- Remove the condition (~line 277) that hides the Google button in signup mode. Render it in both modes.
- Label: login mode → "Continue with Google", signup mode → "Sign up with Google". Same endpoint.
- Move the Google Identity Services script injection from the login-page-open handler (~line 350) to a single useEffect in App.jsx that runs once on mount. Call google.accounts.id.initialize() there with auto_select: false.
- Call google.accounts.id.renderButton() when the auth modal opens or the auth page mounts — not on script load.
- In logout handler (AccountContext.jsx) — call google.accounts.id.disableAutoSelect() alongside the backend logout call.

Track entry point (for post-auth redirect):
- Before triggering Google sign-in, set a module-level variable: googleAuthSource = 'checkout' | 'navbar' | 'signup' | 'profile'.
- After successful auth, read it to decide where to send the user, then clear it.

If the schema migration fails or googleSub unique constraint causes issues (e.g. existing users with duplicate Google signups), pivot to:
- Add googleSub as non-unique first, migrate, deduplicate rows manually, then add the unique constraint in a second migration.

Verify: sign up via Google (new email) → user created with googleSub set, password null → sign in same Google account → no duplicate user created → sign out → google.accounts.id.disableAutoSelect() called.
```

---

## PROMPT 6 — Admin / Public App Separation + Dashboard Fixes

```
Separate admin and public into distinct build entries with no cross-imports. Fix dashboard over-fetching.

Step 1 — Shared utilities (frontend/src/shared/):
- Create frontend/src/shared/. Move into it: the axios/fetch base client config (base URL, withCredentials only — no auth interceptors), shared TypeScript types or Zod schemas, pure utility functions (formatCurrency, formatDate, etc.).
- This folder must not import from either the admin or public app. Leaf node only.

Step 2 — Admin entry point:
- Create frontend/src/admin/main.jsx — mounts <AdminApp /> into a div id="admin-root".
- Create frontend/src/admin/AdminApp.jsx — admin routing, admin context providers, admin layout. Zero imports from frontend/src/pages/, frontend/src/context/AccountContext.jsx, or frontend/src/api/api.js.
- Create frontend/src/admin/api/adminApi.js — separate axios instance using shared base config with its own admin cookie interceptor (reads adminAuthToken, not authToken).

Step 3 — Public app cleanup:
- App.jsx — remove all admin page imports (~line 18) and admin routes. Public app has zero knowledge of admin.

Step 4 — Vite multi-entry (vite.config.js):
- Add a second build input: { main: 'index.html', admin: 'admin.html' }.
- Create admin.html in the project root: minimal HTML loading frontend/src/admin/main.jsx. Meta tags: noindex, nofollow. No public SEO/canonical tags.

Step 5 — Delete admin-routing.js URL heuristics:
- Remove or gut frontend/src/admin-routing.js. Admin mode is now determined by which HTML file was loaded, not by hostname or localhost port sniffing.

Step 6 — Fix AdminDashboard over-fetching (AdminDashboard.jsx ~lines 238, 289):
- Replace the monolithic bootstrap fetch with independent, lazy fetches per section: each section has its own loading state and fetches when its tab/panel becomes visible (use Intersection Observer or tab-switch trigger).
- Replace all ?limit=100 with ?page=1&limit=20. Add "Load more" buttons or cursor-based pagination per section.
- Add a skeleton loader for the initial dashboard paint.

Step 7 — Fix withPublicFallback() masking outages (api.js ~line 168):
- Menu: on backend failure, show a visible degraded banner ("Menu temporarily unavailable") instead of stale data.
- Offers + site settings: treat failure as empty state (no active offers, default settings) — never show potentially expired promotions as a fallback.
- Gallery + reviews: stale fallback is acceptable, keep it.

If the Vite multi-entry config causes issues (e.g. shared chunk conflicts between admin and public), pivot to:
- Keep a single Vite entry but use a hard URL-based redirect in the server config: requests to /admin/* serve admin.html, all others serve index.html. Then lazy-import admin routes only when the /admin path is active.

Verify: npm run build → two HTML files in dist/. Open index.html → no admin code imported. Open admin.html → no public AccountContext or user api.js imported. Admin dashboard → sections load independently, no single 100-item fetch on boot.
```

---

## Order & Risk Summary

| # | What it fixes | Do this first because |
|---|---|---|
| 1 | Cookie-only sessions | Every other prompt assumes the session model is settled |
| 2 | Guest checkout | Unblocks the main UX friction; safe once sessions are clean |
| 3 | CSRF + SameSite=Lax | Depends on cookie model being finalized |
| 4 | Admin auth hardening | Isolated, low blast radius, high security value |
| 5 | Google auth unification | Needs clean session model from step 1 + schema migration |
| 6 | Admin/public split | Biggest refactor; safe to do after all security work is done |

## Env Vars to Add Before Starting

```
CSRF_SECRET=<random 32-char string>
COOKIE_SAME_SITE=lax        # change from none in Prompt 3
```

## Schema Migrations

```bash
# Prompt 5
npx prisma migrate dev --name add_google_sub_to_user

# Prompt 4 (optional lockout)
npx prisma migrate dev --name add_admin_locked_until
```
