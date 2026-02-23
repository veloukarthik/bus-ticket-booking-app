# Sale Memo - LetsGo Bus Ticket Booking App

Date: 2026-02-23  
Prepared by: Seller

## 1. Executive Summary
- Asset: Full-stack bus ticket booking web application (`Next.js + Prisma + PostgreSQL + Stripe + GitHub OAuth`).
- Sale type: Asset sale / codebase transfer (with optional brand/domain/infra transfer).
- License model: Proprietary commercial (`LICENSE`, `package.json` marked `UNLICENSED`).
- Current stage: Production-ready foundation with booking, search, seat selection, payments, admin modules, and auth.

## 2. What Is Included
- Source code repository.
- Database schema + migrations (`prisma/`).
- API and frontend application (`app/`, `lib/`, `public/`).
- Test suite (`vitest`, 25 passing tests as of memo date).
- Documentation (`README.md`, env setup notes).
- Optional transfer items (if applicable):
  - Domain
  - Vercel project
  - Stripe account/app settings handover
  - OAuth app configuration

## 3. Product Features
- User auth:
  - Email/password auth (JWT)
  - GitHub OAuth sign-in (NextAuth)
- Search and booking:
  - Source/destination/date search with validation
  - Past-date blocking in search
  - Seat map selection with booking conflict checks
  - Passenger suggestion autofill from prior user bookings
- Payments:
  - Stripe checkout/session flow
- User experience:
  - Premium theme styling and responsive UI improvements
- Admin:
  - Trip and vehicle management endpoints/pages

## 4. Technology Stack
- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend/API: Next.js route handlers
- Database: PostgreSQL with Prisma ORM
- Auth: JWT + NextAuth (GitHub provider)
- Payments: Stripe
- Testing: Vitest + Testing Library

## 5. Codebase Status Snapshot
- Automated tests: Passing (`npm test`).
- Core flows available:
  - Auth
  - Search
  - Seat booking
  - Payment initiation
- License posture: Proprietary/commercial (no open-source redistribution rights unless agreed in writing).

## 6. Security & Compliance Notes (Buyer Diligence)
- Seller should rotate all environment secrets before transfer.
- Buyer should provision fresh:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NEXTAUTH_SECRET`
  - `GITHUB_CLIENT_SECRET`
  - `STRIPE_SECRET_KEY`
- Add/verify legal docs before scaling:
  - Privacy Policy
  - Terms of Service
  - Refund/Cancellation policy

## 7. Commercial Terms Template
- Proposed deal structure:
  - `___%` upfront at signing
  - `___%` on successful transfer/acceptance
- Handover support:
  - `___` days post-sale support included
- Delivery format:
  - Git repo transfer
  - Deployment/infrastructure handover call
  - Buyer setup walkthrough

## 8. Valuation Framework
- If low/no verified revenue (template/startup asset):
  - Typical range: **USD 3,000 - 12,000**
- If verified revenue exists:
  - Baseline formula: **Annual Net Profit x 2.0 to 2.5**

### Fill-in Financial Block
- Last 3 months revenue: `$_____`
- Last 3 months infra/tools cost: `$_____`
- Last 3 months net profit: `$_____`
- Annualized net profit: `$_____`
- Suggested asking price (2.0x-2.5x): `$_____ - $_____`

## 9. Transfer Checklist
- Repository transfer completed
- Environment variables rotated and shared securely
- Database backup delivered
- Production deployment ownership transferred
- Domain/DNS transferred (if included)
- Payment gateway ownership/admin transferred
- OAuth credentials switched to buyer-controlled app
- Smoke test completed after transfer

## 10. Key Disclosures
- Sale is for software and related assets explicitly listed in agreement.
- No guarantee of future revenue unless contractually stated.
- Buyer is responsible for final legal/compliance and operational hardening after transfer.

## 11. Contact
- Seller name: `_____`
- Email: `_____`
- Phone/WhatsApp: `_____`

