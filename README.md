# SkillHive — Skill-Based Freelance Marketplace

SkillHive is a hyperlocal freelance services marketplace that connects clients with verified local professionals — electricians, plumbers, tutors, developers, designers, and more — for bookings, secure payments, and real-time communication.

## ✨ Key Features

### For Clients
- **Smart search** by skill/keyword, category (16+ categories), price range, and minimum rating
- **GPS-based discovery** — "Near Me" geolocation search with adjustable distance radius
- **✨ AI Match Assistant** — describe a need in plain language and get AI-ranked top-3 provider recommendations with match scores
- **2-Hour Express Dispatch** filter for top-rated, rapid-response professionals
- **Booking workflow** — request a service with date, time, duration, and notes; track status; cancel with a reason
- **In-app payments** — Card / UPI / NetBanking checkout flow with escrow-style messaging, auto-generated transaction IDs
- **Digital invoices** — itemized, printable receipts with platform fee breakdown
- **Ratings & reviews** on completed bookings
- **Real-time chat** with typing indicators and read receipts (Socket.io)

### For Providers (Professionals)
- Rich **profile management** — category, skills, bio, hourly rate, service radius, experience, languages, weekly availability schedule
- **Portfolio** uploads with captions
- **Identity & skill verification** — submit ID and certification documents for admin review (unverified → pending → verified)
- **Booking management** — accept, reject (with reason), mark in-progress, or complete jobs
- Automatic rating recalculation and completed-jobs tracking

### For Admins
- **Platform analytics dashboard** — user/provider/client counts, booking status breakdown, total transaction volume, platform revenue (5% commission), pending verification count
- **User management** — search and ban/activate accounts (revokes active sessions)
- **Verification review queue** — approve or reject provider KYC/skill documents with notes
- **Provider tools** — manually onboard a freelancer or seed demo provider accounts

## 🏗️ Tech Stack

**Frontend** (`/client`)
- React 19 + Vite
- React Router 7, Redux Toolkit
- Socket.io client, Axios
- Leaflet / React-Leaflet for maps
- react-hot-toast, date-fns

**Backend** (`/server`)
- Node.js + Express 5
- Supabase (PostgreSQL) via a custom data-access adapter
- Socket.io for real-time messaging
- JWT authentication with access + refresh token rotation
- Multer + Cloudinary for file uploads (portfolio images, verification documents)
- Helmet, CORS, express-rate-limit, express-validator for security/hardening

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (URL + service key)

### Backend
```bash
cd server
npm install
# configure .env: JWT_SECRET, JWT_REFRESH_SECRET, SUPABASE_URL, SUPABASE_KEY, etc.
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 📁 Project Structure
```
client/   React + Vite single-page app (pages, components, API client)
server/   Express API, Socket.io server, Supabase models/adapter, controllers, routes
```

## 🔐 Authentication & Roles
Three roles are supported: `client`, `provider`, and `admin`. Role-based access is enforced via middleware (`protect`, `authorize`) on all sensitive routes.

## 💳 Payments
Payment processing is simulated for demo purposes (no live payment gateway is integrated) — it generates transaction and invoice records to support the full booking-to-invoice flow.
