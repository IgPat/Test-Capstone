# Step-by-Step Guide: Building the School Management System

This walks through how the project in this folder was built, in the order
you'd actually build it, so you can reproduce it, extend it, or explain it
in a demo/defense.

## Step 0 — Plan the data model first
Before writing any code, map the PRD's entities to collections:
`User → StudentProfile → Class`, plus `Attendance`, `Grade`, `Invoice`,
`Payment`, `Announcement`, `Notification`. Decide relationships up front:
- A `User` optionally links to one `StudentProfile` (admins don't have one).
- A `StudentProfile` links to one `Class`; a `Class` holds an array of
  `StudentProfile` refs (kept in sync on enroll/unenroll).
- `Attendance` is unique per `(student, classId, date)` — enforced with a
  compound unique index so you can't double-mark a day.

## Step 1 — Scaffold the backend
```bash
mkdir server && cd server
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors morgan
npm install -D nodemon
```
Create the folder layout the PRD asks for: `config/`, `models/`,
`middleware/`, `controllers/`, `routes/`, plus `server.js`.

## Step 2 — Connect to MongoDB
`config/db.js` wraps `mongoose.connect()` with error handling so a bad
connection string fails loudly on boot instead of hanging silently.

## Step 3 — Build the Mongoose models
One file per collection under `models/`. Keep validation in the schema
(`required`, `enum`, `unique`) so bad data is rejected at the database
layer, not just in the UI. The `User` model hashes nothing itself — it
stores `passwordHash` and exposes a `comparePassword()` instance method
that controllers call.

## Step 4 — Authentication middleware
Two small, composable middleware functions in `middleware/`:
- `protect` — verifies the JWT from the `Authorization: Bearer <token>`
  header and attaches `req.user`.
- `requireRole('admin')` — a factory that 403s anyone whose role doesn't
  match.
- `requireAdminOrOwner(getOwnerId)` — lets an admin through unconditionally,
  or a student through only if the resource's owning `StudentProfile`
  matches their own. This single helper implements the "Admin, Owner"
  access column from the PRD's endpoint table without repeating logic in
  every controller.

## Step 5 — Auth routes and controller
`POST /api/auth/register` always creates a **student** account (admins are
seeded or promoted manually — never self-registered, per the permissions
table). `POST /api/auth/login` verifies the password with bcrypt and signs
a JWT containing `{ id, role }`. `GET /api/auth/me` returns the current
user for the frontend to rehydrate session state.

## Step 6 — CRUD modules, one at a time
Build and manually test each module with a REST client before moving to
the next — it's much easier to debug one resource than all of them at
once:
1. **Students** — full CRUD for admin; students can `GET`/`PUT` only
   their own record via `requireAdminOrOwner`. Deactivating soft-deletes
   (`status: inactive`) rather than removing the document, so historical
   grades/attendance/invoices stay intact.
2. **Classes** — CRUD plus `POST /:id/enroll` and `/:id/unenroll`, which
   keep `Class.students` and `StudentProfile.classId` in sync on both
   sides.
3. **Attendance** — `POST /api/attendance` accepts a whole class's marks
   for one date in a single `bulkWrite` (upsert), so marking a register
   is one request, not thirty.
4. **Grades** — `POST /api/grades` records one subject/term score.
   `GET /api/grades/student/:id` is the report-card endpoint: it groups
   scores by term server-side and computes the average and letter grade,
   so the frontend never has to do that math.
5. **Invoices & payments** — `POST /api/invoices` takes a `lineItems[]`
   array and sums it into `totalAmount`. `POST /api/invoices/:id/payments`
   records a (simulated) payment, increments `amountPaid`, and recomputes
   `status` (`unpaid` → `partial` → `paid`). No real payment gateway is
   called, matching the PRD's "Out of Scope" section.
6. **Announcements & notifications** — `POST /api/announcements` writes
   the announcement, then fans out a `Notification` document to every
   affected student (whole school or one class) so the bell icon has
   something to show immediately.
7. **Dashboards** — two read-only aggregation endpoints
   (`/api/dashboard/admin`, `/api/dashboard/student`) that each run a
   handful of counts/sums server-side and return one JSON payload built
   specifically for the chart/stat-card layout.

## Step 7 — Wire it all into `server.js`
Mount every router under `/api/...`, add `cors` scoped to the frontend
origin, `express.json()`, `morgan` for request logging, a 404 handler, and
a final error-handling middleware so unhandled errors return JSON instead
of crashing the process.

## Step 8 — Seed data
`seed.js` creates one admin, one demo class, and one demo student so you
can log in immediately after deployment without manually creating an
account through the UI first. Run with `npm run seed`.

## Step 9 — Scaffold the frontend
```bash
npm create vite@latest client -- --template react
cd client
npm install axios react-router-dom recharts
```

## Step 10 — API client and auth context
`src/services/api.js` is a single Axios instance: a request interceptor
attaches the JWT from `localStorage`, a response interceptor clears the
session and redirects to `/login` on a 401. `src/context/AuthContext.jsx`
wraps `login`, `register`, `logout` and exposes the current `user` to the
whole app via `useAuth()`.

## Step 11 — Route protection
`ProtectedRoute` checks `useAuth()`: no user → redirect to `/login`; wrong
`role` prop → redirect to `/`. Wrap the `/admin` and `/student` route
trees with it so unauthenticated or wrong-role visitors never reach those
screens, matching the "protected routes on the frontend" requirement.

## Step 12 — Build the public landing page
A single `Landing.jsx` with anchor-linked sections in the order requested:
header/nav → hero with CTA buttons → About Us → Vision & Mission → Goals
& Philosophy → Features/Services grid → Testimonials → FAQ (collapsible)
→ Contact → Footer. It links to `/login` and `/register`, which is where
the authenticated app begins.

## Step 13 — Build the authenticated shell
`AppLayout.jsx` renders a shared `Navbar` (brand, notification bell with
unread count, user chip, logout) and a role-aware `Sidebar` (different
links for admin vs student) around a React Router `<Outlet />`.

## Step 14 — Build each screen against its endpoint
Each admin/student page is a thin wrapper around one or two API calls:
list + filter + paginate for Students, a mark-attendance grid for
Attendance, a term-grouped report-card view for Grades, an invoice +
"Record payment" flow for Fees, and a post/delete list for Announcements.
Student-side equivalents are read-only views of the same data, scoped to
`req.user.studentProfile` by the backend — the frontend doesn't need to
filter anything itself, since the API already enforces ownership.

## Step 15 — Style consistently
One `index.css` with CSS custom properties for color, spacing utility
classes (`.card`, `.stat-grid`, `.data-table`, `.pill`), and a couple of
responsive breakpoints. Consistency matters more than the specific
library, per the PRD.

## Step 16 — Test the full flow end to end
1. Seed the database, start both servers.
2. Log in as admin → create a class → create a student → mark attendance
   → record a grade → generate an invoice → record a payment → post an
   announcement.
3. Log out, log in as that student (or the seeded demo student) → confirm
   every screen shows only their own data.
4. Try hitting an admin-only endpoint (e.g. `POST /api/students`) with the
   student's token to confirm the backend returns `403`, not just that the
   frontend hides the button.

## Step 17 — Deploy
1. Push to a public GitHub repo with incremental commits (per submission
   guidelines — avoid one giant commit).
2. Create a MongoDB Atlas cluster, whitelist your backend host's IP.
3. Deploy `server/` to Render or Railway; set `MONGO_URI`, `JWT_SECRET`,
   `CLIENT_ORIGIN` as environment variables; run the seed script once
   against the production database.
4. Deploy `client/` to Vercel or Netlify; set `VITE_API_URL` to the
   deployed backend's `/api` URL.
5. Write the README's setup section, `.env.example` files, and record a
   3–5 minute walkthrough covering both the Admin and Student flows.

## Where to extend next (stretch goals from the PRD)
- Add `teacher` and `parent` roles alongside `admin`/`student`.
- Real email delivery for password resets and notifications (Nodemailer).
- Export report cards/invoices as PDF.
- Real-time notifications with Socket.io instead of polling.
- Add Jest/Supertest tests for the controllers and React Testing Library
  tests for the protected routes.
