# Order Creation App

A small full-stack app for creating orders against a product catalog with
stock limits and a quantity-based discount.

## Tech stack

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, TypeScript, Vite
- **"Database":** JSON files loaded into memory on startup —
  `backend/src/data/products.json` (product catalog & stock levels) and
  `backend/src/data/orders.json` (order history log) — both written back
  to disk whenever they change

## Project structure

order-app/
├── backend/
│ ├── src/
│ │ ├── data/
│ │ │ ├── products.json # product catalog / "database"
│ │ │ └── orders.json # order history log
│ │ ├── services/orderService.ts # all business logic & validation
│ │ ├── routes/ # products.ts, orders.ts
│ │ └── index.ts # Express app entry point
│ └── ...
└── frontend/
├── src/
│ ├── api/client.ts # fetch wrappers for the backend
│ ├── hooks/useDebounce.ts # debounce hook for search & live validation
│ ├── components/
│ │ ├── ProductList.tsx # product grid, search-aware, per-card live validation
│ │ ├── Cart.tsx # current order summary & submit
│ │ ├── OrderOutcome.tsx # success/error result screen
│ │ └── OrderHistory.tsx # past orders view
│ ├── App.tsx
│ └── ...
└── ...

## Business rules implemented

- A product must exist to be ordered.
- Quantity must be a positive integer.
- An order cannot exceed available stock (accounting for quantities already
  in the cart, not just raw stock).
- Products with zero stock cannot be added.
- A 10% discount is applied automatically when the order subtotal exceeds
  £100.
- Stock is reduced only after an order is successfully created (validation
  runs on the full order first, so a failure never partially reduces stock).
- Errors are returned with a clear, specific message per rule and shown in
  the UI next to the relevant product where applicable.

## Additional features (beyond the base requirements)

- **Product search** — filter the catalog by name.
- **Sorting** — by price (low→high / high→low), name (A–Z), or stock level.
- **Live quantity validation** — debounced inline feedback while typing
  (invalid quantity or exceeding available stock), shown before the user
  even clicks "Add", in addition to the submit-time check.
- **Order history** — every successful order is logged to
  `backend/src/data/orders.json` and viewable in the "Order History" tab,
  most recent first, with a manual refresh control.

## API

| Method | Path            | Description                              |
|--------|-----------------|-------------------------------------------|
| GET    | `/api/products` | Returns the product catalog               |
| GET    | `/api/orders`   | Returns the full order history             |
| POST   | `/api/orders`   | Body: `{ items: [{ productId, quantity }] }`. Returns the created order or a `400` with `{ message, productId? }` on a validation error |

## Installation & local run

Requires Node.js 18+.

**1. Backend**

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:4000`.

**2. Frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` requests to the backend.

Open `http://localhost:5173` in your browser.

**Running backend tests**

```bash
cd backend
npm test
```

## Loom video

[Link to Loom video here]

## AI usage

See [AI_PROMPTS.md](./AI_PROMPTS.md) for the prompts used throughout
development.