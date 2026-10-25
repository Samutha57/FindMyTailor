# FindMyTailor 🧵✂️

**FindMyTailor** is a modern, full-stack custom tailoring web application connecting customers with skilled local tailors. Customers can discover nearby tailoring studios, explore transparent stitching rates, place custom orders with precise sizing instructions, and follow every stage of the stitching process through a visual 9-stage tracking timeline.

---

## 🚀 Technology Stack

- **Database**: PostgreSQL with Prisma ORM
- **Backend API**: Node.js, Express.js, TypeScript, bcryptjs, jsonwebtoken, Zod
- **Frontend Application**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **State Management & Data Fetching**: Redux Toolkit & RTK Query
- **Form Handling & Validation**: React Hook Form with Zod resolvers

---

## 📂 Project Structure

```text
FindMyTailor/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma                  # PostgreSQL schema with User, TailorProfile, Service, Order, OrderStatusHistory
│   │   ├── seed.ts                        # Development seed script with sample customers, tailors & orders
│   │   └── migrations/
│   │       └── 20261025000000_init/
│   │           └── migration.sql          # Initial PostgreSQL migration SQL
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                      # Prisma client singleton
│   │   │   └── jwt.ts                     # JWT sign and verify helpers
│   │   ├── middleware/
│   │   │   ├── auth.ts                    # JWT verification and role-based authorization
│   │   │   └── validation.ts              # Request validation with Zod
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts         # User registration, login, and profile fetching
│   │   │   ├── tailor.controller.ts       # Public tailor discovery and tailor profile management
│   │   │   ├── service.controller.ts      # Stitching services management
│   │   │   └── order.controller.ts        # Order placement, tailor order management, status updates
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── tailor.service.ts
│   │   │   ├── service.service.ts
│   │   │   └── order.service.ts           # Order workflow transition logic & audit trail
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── tailor.routes.ts
│   │   │   ├── service.routes.ts
│   │   │   └── order.routes.ts
│   │   └── index.ts                       # Express server entry point with health check and CORS
│   ├── .env.example                       # Backend environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                 # Root layout with Inter font, AuthProvider, Navbar & Footer
│   │   │   ├── page.tsx                   # Public landing page with search and 9-stage workflow preview
│   │   │   ├── login/page.tsx             # Login page with quick demo account autofill
│   │   │   ├── register/page.tsx          # Dual-role registration (Customer / Tailor)
│   │   │   ├── tailors/page.tsx           # Tailor discovery with search and category filters
│   │   │   ├── tailors/[id]/page.tsx      # Tailor studio profile with services menu & booking buttons
│   │   │   ├── customer/
│   │   │   │   ├── dashboard/page.tsx     # Customer dashboard with stats and recent orders
│   │   │   │   ├── orders/page.tsx        # Customer orders list with status tab filters
│   │   │   │   ├── orders/new/page.tsx    # Book stitching service with real-time price calculation
│   │   │   │   └── orders/[id]/page.tsx   # Order tracking details with live 9-stage stepper
│   │   │   └── tailor/
│   │   │       ├── dashboard/page.tsx     # Tailor dashboard with incoming orders attention alerts
│   │   │       ├── orders/page.tsx        # Tailor order management with Accept / Reject actions
│   │   │       ├── orders/[id]/page.tsx   # Tailor stage workbench for status transitions
│   │   │       ├── services/page.tsx      # CRUD for tailor stitching services with quick presets
│   │   │       └── profile/page.tsx       # Tailor workshop profile editor with live customer preview
│   │   ├── components/
│   │   │   ├── Navbar.tsx                 # Role-aware responsive navigation bar
│   │   │   ├── Footer.tsx                 # Application footer
│   │   │   ├── StatusBadge.tsx            # Styled color-coded status badges with icons
│   │   │   ├── StatusTimeline.tsx         # Live progress stepper and chronological audit log
│   │   │   └── AuthProvider.tsx           # Redux provider and client-side auth hydration
│   │   ├── features/
│   │   │   ├── auth/authSlice.ts          # Auth slice with persistent token state
│   │   │   └── api/apiSlice.ts            # RTK Query API slice with complete endpoints and cache tags
│   │   └── lib/
│   │       ├── store.ts                   # Redux Toolkit store configuration
│   │       └── utils.ts                   # Helper functions (currency formatting, date formatting, cn)
│   ├── .env.example                       # Frontend environment template
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## 🔄 Order Lifecycle & Workflow

The stitching order follows this status progression:

$$\text{ORDER\_PLACED} \longrightarrow \text{ACCEPTED} \longrightarrow \text{MEASUREMENT} \longrightarrow \text{CUTTING} \longrightarrow \text{STITCHING} \longrightarrow \text{FINISHING} \longrightarrow \text{QUALITY\_CHECK} \longrightarrow \text{READY\_FOR\_PICKUP} \longrightarrow \text{COMPLETED}$$

- **Incoming Order**: At `ORDER_PLACED`, the tailor can **Accept** (moves to `ACCEPTED`) or **Reject** (moves to `REJECTED`).
- **Production Pipeline**: Tailors advance the order sequentially through production stages (`MEASUREMENT` $\to$ `CUTTING` $\to$ `STITCHING` $\to$ `FINISHING` $\to$ `QUALITY_CHECK` $\to$ `READY_FOR_PICKUP` $\to$ `COMPLETED`).
- **Audit Logging**: Every status transition automatically logs an entry in `OrderStatusHistory` containing the timestamp, new status, custom comments/notes, and the responsible user.
- **Security & Authorization**: Tailors can only view and update orders assigned to their studio. Backward transitions and modifications to completed/rejected orders are strictly rejected.

---

## 🛠️ Setup and Installation

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **PostgreSQL**: PostgreSQL database instance (local or hosted, e.g., Neon / Supabase / Railway)

---

### 2. Backend Setup

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/findmytailor?schema=public"
   JWT_SECRET="super_secret_find_my_tailor_jwt_token_key"
   JWT_EXPIRES_IN="7d"
   CLIENT_URL="http://localhost:3000"
   ```

3. Initialize the database and run migrations:
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Push schema to database (or run migrate)
   npm run prisma:push

   # (Optional) Seed the database with sample customers, tailors, and orders
   npm run prisma:seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

---

### 3. Frontend Setup

1. Open a second terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-seeded Demo Accounts

For immediate testing, use the seed script (`npm run prisma:seed` in `backend/`) which provides the following accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `Password123!` | Priya Sharma (has active orders) |
| **Customer** | `arun@example.com` | `Password123!` | Arun Patel |
| **Tailor** | `royal.tailors@example.com` | `Password123!` | Royal Heritage Bespoke Tailors (Master Rajesh) |
| **Tailor** | `silkstitch@example.com` | `Password123!` | Silk & Needle Boutique (Meera Nambiar) |
| **Tailor** | `urbanfit@example.com` | `Password123!` | UrbanFit Modern Tailors (Suresh Verma) |

> 💡 **Tip**: The login page includes convenient **One-Click Demo Buttons** to autofill credentials for testing both Customer and Tailor workflows.

---

## 🧪 Testing the Application

1. **Tailor Discovery**:
   - Visit `/tailors` to explore all registered tailors, search by shop/service name, and filter by categories (Shirt, Pant, Blouse, Suit, Alteration).
2. **Customer Flow**:
   - Sign in as `customer@example.com`.
   - Go to **Book Stitching** (`/customer/orders/new`).
   - Select a tailor and stitching service, enter quantity, delivery target date, and instructions.
   - Submit the order to view the confirmation and live **9-stage visual progress timeline**.
3. **Tailor Flow**:
   - Sign in as `royal.tailors@example.com`.
   - On the **Tailor Dashboard** (`/tailor/dashboard`), review incoming orders.
   - Navigate to **Manage Orders** (`/tailor/orders`) and click **Accept Order**.
   - Open the order's **Stage Workbench** (`/tailor/orders/[id]`) and advance through `MEASUREMENT` $\to$ `CUTTING` $\to$ `STITCHING` with notes.
   - Go to **Stitching Services** (`/tailor/services`) to add, update, or delete services.
   - Go to **Shop Profile** (`/tailor/profile`) to update address, working hours, and view the public live preview.
