# School Management System (SMS)

A full-stack School Management System built with **Node.js, Express, MongoDB (Mongoose)** on the
backend and **plain HTML, CSS and vanilla JavaScript** on the frontend — no framework or build step
required for the client.

## Tech stack

| Layer          | Technology |
|-----------------|------------|
| Frontend        | HTML5, CSS3, vanilla JavaScript (`fetch` + `localStorage`), Chart.js (CDN, admin charts) |
| Backend         | Node.js, Express.js |
| Database        | MongoDB + Mongoose |
| Auth            | JWT + bcrypt, role-based middleware |
| Deployment      | Single Express server serves both the REST API and the static frontend |

## Project structure

```
sms/
  server/                 Express API
    config/db.js          Mongoose connection
    models/                User, StudentProfile, Class, Attendance, Grade, Invoice, Payment,
                            Announcement, Notification
    middleware/            auth.js (JWT check), roleCheck.js (role / ownership checks)
    controllers/            One controller per resource
    routes/                 One router per resource, mounted under /api/*
    server.js               App entrypoint — serves the API AND the static /public frontend
    seed.js                 Creates a demo Admin + Student account
    .env.example
  public/                 Vanilla HTML/CSS/JS frontend (served by Express as static files)
    index.html             Redirects to /login.html or the right dashboard
    login.html, register.html, forgot-password.html
    admin/                  dashboard, students, classes, attendance, grades, invoices, announcements
    student/                dashboard, profile, attendance, grades, invoices, announcements
    css/styles.css          Shared design system (cards, tables, forms, pills, modals)
    js/api.js               fetch() wrapper that attaches the JWT and handles 401s
    js/auth.js               Session helpers (getCurrentUser, requireAuth, logout, formatters)
    js/shell.js              Renders the navbar + role-based sidebar + notification bell on every page
```

## Getting started

### 1. Install MongoDB access
Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) (or run MongoDB locally) and
grab a connection string.

### 2. Configure environment variables
```bash
cd server
cp .env.example .env
# then edit .env and set MONGO_URI and JWT_SECRET
```

### 3. Install dependencies & seed demo accounts
```bash
npm install
npm run seed
```
This creates:
- **Admin:** `admin@school.test` / `Admin123!`
- **Student:** `student@school.test` / `Student123!` (enrolled in class `JSS1A`)

### 4. Run the app
```bash
npm run dev      # nodemon, restarts on file changes
# or
npm start
```
Open **http://localhost:5000** — Express serves the API under `/api/*` and the HTML/CSS/JS
frontend from `/public` on the same origin, so there's nothing else to start or configure.

## How authentication works

1. `POST /api/auth/register` (public) creates a **student** account + profile. Admin accounts are
   only created by seeding or by an existing admin (there's no public "become admin" endpoint).
2. `POST /api/auth/login` returns a JWT, stored in `localStorage` as `sms_token`.
3. Every subsequent request goes through `js/api.js`, which attaches
   `Authorization: Bearer <token>`.
4. Every protected page calls `requireAuth('admin' | 'student')` at the top, which redirects to
   `/login.html` if there's no session, or to the correct dashboard if the role doesn't match.
5. On the server, `middleware/auth.js` verifies the JWT and loads `req.user`; `middleware/roleCheck.js`
   then enforces `admin`-only routes and "admin or the resource owner" routes (e.g. a student can
   view/edit their own profile, attendance, grades and invoices, but nothing else).
6. **Forgot password:** there's no email step. `forgot-password.html` explains that an admin resets
   the student's password from the Students page (`PUT /api/students/:id/reset-password`), which
   generates a new temporary password to hand back to the student — the "minimum" flow called for
   in the requirements.

## Role permissions (enforced server-side, mirrored in the UI)

| Capability                     | Admin | Student |
|---------------------------------|-------|---------|
| Register / log in                | ✅ (seeded) | ✅ (self-register) |
| Manage students (CRUD)           | ✅ full | View & edit own profile (limited fields) only |
| Manage classes                   | ✅ full | View only (their enrolled class) |
| Mark attendance                  | ✅ per class/date | View own attendance & % only |
| Enter / edit grades              | ✅ full | View own report card only |
| Manage fees & invoices           | ✅ create invoices, record any payment | View own balance/history, simulate payment on own invoice only |
| Post announcements               | ✅ create/edit/delete | View only |
| Notifications                    | Sends implicitly via actions above | Receive + mark read |
| Reports & analytics              | School-wide dashboard | Personal dashboard only |

## Notable implementation details

- **Attendance** is upserted per `(student, classId, date)` so re-marking a day overwrites rather
  than duplicates.
- **Grades** are grouped into a report card per term on the fly, with an auto-computed average and
  letter grade (A–F).
- **Invoices** auto-calculate `status` (`unpaid` / `partial` / `paid`) from `amountPaid` vs
  `totalAmount`; payments are logged separately so there's a full payment history.
- **Notifications** fan out automatically when an invoice is issued or an announcement is posted.
- **Pagination & search** on the admin Students table hits `GET /api/students?page=&limit=&search=&classId=&status=`.

## Deployment

- **Simplest:** deploy the whole `server/` folder (which now also serves `public/`) to Render,
  Railway, or any Node host, pointed at your MongoDB Atlas cluster. One URL for everything.
- **Split deployment:** you can still host `public/` separately (Netlify/Vercel) — just edit the
  `API_BASE` fallback in `public/js/api.js` to point at your deployed API's URL.

## Stretch ideas (not built, called out in the original PRD)

Teacher/Parent roles, real email delivery via Nodemailer, PDF export of report cards/invoices,
Socket.io real-time notifications, dark mode, automated tests.
