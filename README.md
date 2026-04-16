# RajaMahendravaram PalavuCentre Frontend - Backend Handoff README

This document explains what is already built in the frontend so backend implementation can start quickly with clear API contracts.

## Project Snapshot

- Stack: React 19 + Vite + React Router + Tailwind CSS
- Type: SPA (single-page app)
- Current backend status: not integrated yet
- Current persistence:
	- Cart: in memory (React context)
	- User profile in checkout flow: localStorage (`user`)
	- Admin auth state: localStorage (`adminAuth`)
	- Gallery and reviews: localStorage (`galleryImages`, `reviews`)

## Run Frontend Locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Routes Already Implemented

Public:
- `/` - Home
- `/menu` - Menu listing and add-to-cart
- `/order` - Redirects to `/menu`
- `/gallery` - Gallery with filters and lightbox
- `/catering` - Catering info page
- `/franchise` - Franchise inquiry form
- `/contact` - Contact form
- `/story` - Brand story page

Admin (frontend-only guard right now):
- `/admin/login` - Password form (hardcoded password)
- `/admin/dashboard` - Manage gallery + review visibility/deletion

## What Works Today (Frontend Behavior)

1. Menu and cart flow
- Menu data comes from a static file (`src/data/menuData.js`).
- Cart add/remove/update works.
- Checkout drawer has steps: cart -> phone -> otp -> address -> success.
- OTP is mocked (accepts any 4 digits, specifically `1234` too).
- On final submit, order is not sent anywhere yet.

2. Contact and franchise forms
- Forms collect user input and currently only log to console.
- Success messages are simulated in UI.

3. Reviews
- Reviews render from localStorage if present, otherwise defaults.
- Admin dashboard can hide/show or delete reviews.

4. Gallery
- Gallery renders from localStorage if present, otherwise defaults.
- Admin dashboard can add/delete image URLs.

5. Admin auth
- Login checks a hardcoded password (`palavuadmin2024`).
- If valid, sets `localStorage.adminAuth = 'true'`.
- No server-side auth/session/JWT yet.

## Frontend Data Shapes (Current)

### Menu item

```json
{
	"id": 13,
	"name": "Natu Kodi Biryani",
	"desc": "Country chicken biryani with aromatic spices",
	"price": 350,
	"img": "https://...",
	"veg": false,
	"bestseller": true
}
```

### Cart item (in context state)

```json
{
	"id": 13,
	"name": "Natu Kodi Biryani",
	"price": 350,
	"img": "https://...",
	"quantity": 2
}
```

### Checkout profile (stored in localStorage key `user`)

```json
{
	"name": "Customer Name",
	"phone": "9876543210",
	"whatsapp": "9876543210",
	"address": "Street, area, landmark",
	"picture": "https://ui-avatars.com/..."
}
```

### Review

```json
{
	"id": 1,
	"name": "Rajesh Kumar",
	"rating": 5,
	"text": "Authentic flavors...",
	"date": "2024-02-15",
	"visible": true
}
```

### Gallery image

```json
{
	"id": 1,
	"url": "https://images.unsplash.com/...",
	"category": "food"
}
```

## Recommended Backend API Contract (First Pass)

These endpoints map directly to what the frontend already does.

1. Menu
- `GET /api/menu`
- Returns categorized menu or flat list.

2. Orders
- `POST /api/orders`
- Payload suggestion:

```json
{
	"customer": {
		"name": "Customer Name",
		"phone": "9876543210",
		"whatsapp": "9876543210",
		"address": "Street, area, landmark"
	},
	"items": [
		{
			"menuItemId": 13,
			"name": "Natu Kodi Biryani",
			"price": 350,
			"quantity": 2
		}
	],
	"pricing": {
		"subTotal": 700,
		"taxPercent": 5,
		"grandTotal": 735
	},
	"source": "web"
}
```

3. OTP/Auth for customer checkout (optional first phase)
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`

4. Contact and franchise forms
- `POST /api/contact`
- `POST /api/franchise`

5. Reviews
- `GET /api/reviews?visible=true`
- `PATCH /api/reviews/:id` (visibility update)
- `DELETE /api/reviews/:id`

6. Gallery
- `GET /api/gallery`
- `POST /api/gallery`
- `DELETE /api/gallery/:id`

7. Admin auth
- `POST /api/admin/login`
- `POST /api/admin/logout`
- Prefer JWT (httpOnly cookie) or session-based auth.

## Integration Notes For Backend Team

- Frontend currently has no environment variable for API base URL. Add `VITE_API_BASE_URL` when backend is ready.
- Replace localStorage-driven admin/content state with API reads/writes.
- Replace mocked checkout OTP and order submit flow with real APIs.
- Add server-side validation for phone/email/input lengths.
- Add CORS for frontend origin.

## Known Gaps (Expected)

- No real authentication
- No database integration
- No real order creation
- No payment integration
- No rate limiting / anti-spam on forms
- No server-side media upload flow (gallery currently URL only)

## Suggested Backend Build Order

1. `POST /api/orders`
2. `POST /api/contact` and `POST /api/franchise`
3. `GET /api/menu`
4. Admin auth (`/api/admin/login`) + protected gallery/review CRUD
5. OTP APIs and hardened checkout auth

## Current Business Constants In UI

- Phone: `9966655997`
- Email: `rajamahendravarampalavu@gmail.com`
- Hours: `12:00 PM - 11:00 PM`
- City shown: `Hyderabad`

If needed, move these into backend config/content APIs so admin can update them without frontend deploys.
