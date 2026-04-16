# Frontend Integration Notes

## Base URL

Add `VITE_API_BASE_URL` to the frontend and point it to the backend origin.

Example:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

For a standalone admin deployment such as `https://admin.palavucentre.com`, point the frontend to the main API origin instead of relying on a relative `/api` path:

```env
VITE_ADMIN_STANDALONE=true
VITE_PUBLIC_SITE_URL=https://palavucentre.com
VITE_API_BASE_URL=https://palavucentre.com/api
```

## Admin Requests

- Use `credentials: "include"` for all admin login/session/mutation requests.
- Login route: `POST /admin/login`
- Session route: `GET /admin/me`
- Logout route: `POST /admin/logout`
- Image upload route: `POST /admin/media/upload`
- Admin image uploads are local now, not Cloudinary-based.
- Large source images are auto-optimized on the backend so stored files stay under `5MB`.
- The admin frontend route is now deployable in two ways:
  - Embedded in the main site: `/admin/login`, `/admin/dashboard`
  - Standalone admin site: `/login`, `/dashboard`
- The backend API paths stay the same in both cases: `/api/admin/*`

## Menu Page

Replace `src/data/menuData.js` reads with `GET /menu`.

Minimal mapping:

- `response.data.groupedItems` matches the current tab model well.
- `response.data.categoryMap` can replace the current `categories` object.
- Each item already includes current frontend-friendly keys: `id`, `name`, `desc`, `price`, `img`, `veg`, `bestseller`.

## Cart and Checkout

Current cart state can stay frontend-side. On final submit:

1. Build payload from cart and customer form.
2. Call `POST /orders`.
3. If `paymentMethod === "cod"`, use returned `order.orderNumber` on success screen.
4. If `paymentMethod === "online"`, open Razorpay with returned `data.razorpay`.
5. After checkout success, send `POST /payments/razorpay/verify`.

Recommended order payload:

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
      "quantity": 2
    }
  ],
  "paymentMethod": "cod",
  "source": "web"
}
```

## OTP Step

- `POST /auth/send-otp` with `{ phone }`
- `POST /auth/verify-otp` with `{ phone, code }`
- In debug mode, backend returns `debugCode` to speed up local integration.
- Use returned `verificationId` as `otpVerificationId` in `POST /orders` if you want checkout to require verified OTP.

## Contact / Franchise / Catering

Replace current simulated form success handlers with:

- `POST /contact`
- `POST /franchise`
- `POST /catering`

The current frontend field names already match closely. Catering supports both:

- `eventDate` or `date`
- `guestCount` or `guests`

## Reviews

- Public page: `GET /reviews?visible=true`
- Admin dashboard: `GET /admin/reviews`
- Hide/show: `PATCH /reviews/:id` or `PATCH /admin/reviews/:id`
- Delete: `DELETE /reviews/:id` or `DELETE /admin/reviews/:id`

The public response shape already matches the current component: `name`, `rating`, `text`, `date`, `visible`.

## Gallery

- Public page: `GET /gallery`
- Admin dashboard: `GET /admin/gallery`
- Create: `POST /gallery` or `POST /admin/gallery`
- Update: `PATCH /gallery/:id` or `PATCH /admin/gallery/:id`
- Delete: `DELETE /gallery/:id` or `DELETE /admin/gallery/:id`

The response shape already includes the current keys: `id`, `url`, `category`.

## Homepage / Contact Details / Social Links

Use `GET /site-settings/public` to replace hardcoded:

- phone
- email
- hours
- city
- map data
- tagline
- CTA labels/links
- social links
- WhatsApp floating button config

## Offers

- Public site: `GET /offers`
- Admin: `GET /admin/offers`

## Admin Dashboard Expansion

The current dashboard only handles gallery/reviews. The backend now supports expansion to:

- dashboard stats
- menu management
- order management
- offers
- inquiries
- site settings
- local image upload for menu, gallery, offers, and site settings
