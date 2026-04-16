# API Examples

## `GET /api/menu`

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Starters",
        "slug": "starters",
        "items": [
          {
            "id": 1,
            "name": "Punugulu",
            "desc": "Crispy rice fritters with ginger & green chili",
            "price": 120,
            "img": "https://images.unsplash.com/...",
            "veg": true,
            "bestseller": true,
            "available": true
          }
        ]
      }
    ],
    "categoryMap": {
      "all": "All",
      "starters": "Starters"
    },
    "groupedItems": {
      "all": [],
      "starters": []
    },
    "items": []
  }
}
```

## `POST /api/orders` COD

Request:

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

Response:

```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "order": {
      "id": 1,
      "orderNumber": "PLC-20260327-ABC123",
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
          "quantity": 2,
          "total": 700
        }
      ],
      "pricing": {
        "subTotal": 700,
        "taxPercent": 5,
        "taxAmount": 35,
        "grandTotal": 735,
        "currency": "INR"
      },
      "paymentMethod": "cod",
      "paymentStatus": "unpaid",
      "orderStatus": "pending"
    }
  }
}
```

## `POST /api/orders` Online

Response includes Razorpay payload:

```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "order": {
      "id": 2,
      "orderNumber": "PLC-20260327-XYZ789",
      "paymentMethod": "online",
      "paymentStatus": "pending",
      "orderStatus": "pending"
    },
    "payment": {
      "id": 4,
      "provider": "razorpay",
      "status": "pending",
      "amount": 735,
      "amountPaise": 73500,
      "currency": "INR"
    },
    "razorpay": {
      "keyId": "rzp_test_xxx",
      "orderId": "order_xxx",
      "amount": 735,
      "amountPaise": 73500,
      "currency": "INR",
      "receipt": "PLC-20260327-XYZ789"
    }
  }
}
```

## `POST /api/payments/razorpay/verify`

Request:

```json
{
  "orderId": 2,
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx",
  "payload": {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }
}
```

Response:

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "id": 2,
    "orderNumber": "PLC-20260327-XYZ789",
    "paymentStatus": "paid",
    "orderStatus": "pending"
  }
}
```

## `POST /api/admin/login`

Request:

```json
{
  "email": "<admin-email-from-db>",
  "password": "<admin-password>"
}
```

Response:

```json
{
  "success": true,
  "message": "Admin login successful",
    "data": {
      "admin": {
        "id": 1,
        "email": "<admin-email-from-db>",
        "name": "<admin-name-from-db>"
      }
    }
  }
```

The auth cookie is set as `httpOnly`, so admin requests must use `credentials: "include"` in the frontend.

## `POST /api/admin/media/upload`

Request:

- `multipart/form-data`
- field `file`: image file
- field `folder`: one of `menu`, `gallery`, `offers`, `settings`, `general`

Behavior:

- Images larger than `5MB` are automatically optimized and stored under the `5MB` limit.
- Source uploads are accepted up to `20MB` by default.

Response:

```json
{
  "success": true,
  "message": "Image uploaded",
  "data": {
    "url": "http://localhost:4000/uploads/menu/1774636765000-demo.webp",
    "publicId": "menu/1774636765000-demo.webp",
    "folder": "menu",
    "filename": "1774636765000-demo.webp",
    "mimeType": "image/webp",
    "size": 4146782,
    "originalSize": 14339421,
    "optimized": true
  }
}
```

## `POST /api/auth/send-otp`

Request:

```json
{
  "phone": "9876543210"
}
```

Response in dev or debug mode:

```json
{
  "success": true,
  "message": "OTP generated successfully",
  "data": {
    "verificationId": 7,
    "phone": "9876543210",
    "expiresAt": "2026-03-27T12:55:00.000Z",
    "debugCode": "4831"
  }
}
```

## `GET /api/site-settings/public`

```json
{
  "success": true,
  "data": {
    "restaurantName": "RajaMahendravaram PalavuCentre",
    "tagline": "Authentic Godavari flavors crafted with tradition",
    "heroMedia": [
      {
        "type": "image",
        "url": "https://images.unsplash.com/..."
      }
    ],
    "cta": {
      "primary": {
        "label": "Order Now",
        "href": "/menu"
      },
      "secondary": {
        "label": "Book Catering",
        "href": "/catering"
      }
    },
    "contact": {
      "phone": "9966655997",
      "email": "rajamahendravarampalavu@gmail.com",
      "hours": "Monday - Sunday, 12:00 PM - 11:00 PM",
      "whatsappNumber": "919966655997"
    },
    "socialLinks": [
      {
        "platform": "instagram",
        "label": "Instagram",
        "url": "https://instagram.com/palavucentre"
      }
    ]
  }
}
```
