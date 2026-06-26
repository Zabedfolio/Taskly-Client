# Taskly - Premium Freelance Marketplace Platform

Taskly is a state-of-the-art freelance marketplace platform that connects Clients with elite Freelancer talent. Built with React, Next.js (App Router), Node.js, Express, MongoDB, and Better-Auth, Taskly delivers a secure, modern, and beautiful interface with premium glassmorphic styling and micro-animations.

## 🔗 Live Deployments

*   **Client Live Application:** [https://taskly-client-zabedfolio.vercel.app/](https://taskly-client-zabedfolio.vercel.app/)
*   **Server Backend API:** [https://taskly-server-zabedfolio.vercel.app/](https://taskly-server-zabedfolio.vercel.app/)

---

## 👥 Role-Based Architecture & Flows

Taskly implements strict role-based authentication and routes to separate workflows between different user personas.

### 1. Client Role
Clients are project creators who fund tasks and hire talent.
*   **Post Tasks:** Publish new job listings with budgets, estimated timelines, descriptions, and categories.
*   **Bid Management:** View incoming proposals from freelancers. Review their profile ratings, cover notes, and proposed bids.
*   **Secure Escrow Funding:** Accept proposals by checking out via integrated **Stripe Checkout** (simulated sandbox & live modes). Payment confirmation immediately assigns the freelancer to the task and changes the task status to `in-progress`.
*   **Ratings & Reviews:** Leave ratings and feedback reviews for freelancers upon project completion.

### 2. Freelancer Role
Freelancers are service providers who bid on tasks and deliver work.
*   **Gig Board:** Browse open client tasks and submit customized proposals (bidding custom budgets, delivery timelines, and cover letters).
*   **Contract Lifecycle Management:** Track assigned projects in a dedicated Active Projects dashboard.
*   **Work Submission:** Complete tasks by submitting live deliverable links (e.g. GitHub repos, documents). This action changes the task status to `completed` and notifies the client.
*   **Earning Metrics:** View earnings analytics, monthly revenue charts, project success counts, and client reviews.

### 3. Admin Role
Admins are moderators who maintain platform integrity.
*   **Freelancer Verification:** Verify or unverify freelancer profiles (displaying a verified badge on their cards).
*   **Account Moderation:** Block or unblock users violating community guidelines. Blocked users are immediately logged out and barred from accessing any platform routes.
*   **Transaction Auditing:** Audit and monitor all payment transactions processed via Stripe.

---

## 🔍 How to Browse and View Freelancers

Taskly offers a dedicated user-facing portal to showcase verified and active freelance talent.

1.  **Talent Page (`/freelancers`):** Users navigate to the main Freelancers directory to view cards representing active freelancer accounts.
2.  **Search & Filters:** Clients can search freelancers by name or filter them by specific skills (e.g., React, Meta Ads, Copywriting) to find perfect matches.
3.  **Detailed Review Modal:** Clicking on any freelancer card opens a detailed profile overlay. This modal renders:
    *   Professional bio and list of skills.
    *   Verification status (displaying the verified badge check).
    *   Cumulative job performance metrics (completed projects count).
    *   Aggregated client ratings (average stars out of 5) and chronological client review comments.

---

## 🛠️ Errors Faced & Technical Solutions

During development, several complex bugs were encountered and resolved to ensure stability:

### 1. Google OAuth Role Definition & Onboarding Modal Loop
*   **The Problem:** When users logged in/registered via standard email, they chose a role (Client/Freelancer) on the signup screen. However, users registering via **Google Social Sign-In** skipped this form and were redirected into the app without a role. The app opened a blocking onboarding modal to ask for their profile details. This introduced friction and routing loops.
*   **The Fix:** 
    1.  Removed the onboarding modal UI completely to streamline the user experience.
    2.  Implemented Better-Auth database hooks (`user.create.before` and `session.create.before`) on the backend. When a user registers/logs in via Google, the hook automatically links them, sets their default role to `"client"`, and marks `onboardingComplete = true`.

### 2. Freelancer Active/Completed Projects Blank View
*   **The Problem:** The Freelancer's contract page was showing blank lists for both "In Progress" and "Completed" project tabs, even when the database contained accepted tasks.
*   **The Cause:** In the client-side active page component (`/dashboard/freelancer/active/page.jsx`), the fetch helper `getMyProposals` was called with the session authentication token: `getMyProposals(session.session.token)`. However, `getMyProposals` expected the freelancer's **email address** to filter bids. The API filtered tasks against the token string, returning zero items.
*   **The Fix:** Corrected the parameter to pass the resolved email (`session.user.email`) and added safety gates to prevent fetching if the email or session token is missing.

### 3. String Concatenation in Dashboard Financial Totals
*   **The Problem:** The Freelancer Dashboard displayed total earnings like `$0400200700900400200 USD` (a long concatenated string of all project budgets) instead of summing them up.
*   **The Cause:** The budgets (`proposedBudget`) were fetched from the MongoDB database as strings. When performing `.reduce((sum, p) => sum + p.proposedBudget, 0)` or `+=`, JavaScript treated the operation as string concatenation.
*   **The Fix:** Wrapped the budget properties in the `Number()` constructor (e.g. `Number(p.proposedBudget) || 0`) prior to reduction on all freelancer, client, and admin metrics cards.

---

## 📦 Project Directory Structure

```
├── taskly-client/          # Next.js Frontend Web Application
│   ├── src/
│   │   ├── app/            # Next.js App Router (dashboard, payment, success, unauthorized, etc.)
│   │   ├── components/     # UI Components (shared rating modals, verified badges, layouts)
│   │   ├── contexts/       # React Contexts (notification, bookmarks)
│   │   └── lib/            # Better-Auth client config and API request helpers
│   └── package.json
│
└── taskly-server/          # Express.js REST API Server
    ├── index.js            # Main server entry, MongoDB routing & Stripe handlers
    ├── vercel.json         # Vercel serverless deployment config
    └── package.json
```

---

## 🚀 Local Development Setup

### Backend Server Setup
1. Navigate to `/taskly-server`
2. Install dependencies: `npm install`
3. Configure your `.env` variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_URL=http://localhost:3000
   ```
4. Start the server: `npm start` (or `node index.js`)

### Frontend Client Setup
1. Navigate to `/taskly-client`
2. Install dependencies: `npm install`
3. Configure your `.env` variables:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:5000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   MONGODB_URI=your_mongodb_connection_string
   BETTER_AUTH_SECRET=your_better_auth_secret_key
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
4. Start the Next.js dev server: `npm run dev`
5. Open `http://localhost:3000` in your web browser.
