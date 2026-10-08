# 🎓 School Management System (SMS)

A full-stack, enterprise-grade **School Management System** built with **React 19**, **Vite**, **Node.js**, **Express**, **MongoDB**, and **Paystack**. Features a public marketing portal, role-based dashboards for **Admins** and **Students**, automated financial invoicing, Paystack online payment integration, digital report cards, attendance tracking, and real-time notification fanout.

---

## 🚀 Tech Stack Overview

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router v7 | High-performance Single Page Application (SPA) |
| **UI & Styling** | Custom CSS3, Lucide React Icons | Responsive glassmorphic design system |
| **Data Visualization**| Chart.js, `react-chartjs-2` | Interactive administrative & student analytical charts |
| **Backend API** | Node.js, Express.js (CommonJS) | RESTful API architecture with modular controllers & routes |
| **Database** | MongoDB & Mongoose ORM | Document database with schema validation & indexes |
| **Authentication** | JWT (JSON Web Tokens) & `bcryptjs` | Secure role-based authentication (`admin`, `student`) |
| **Payments** | Paystack (`@paystack/inline-js`) | Online fee payments, transaction logging & verification |
| **Email & Files** | Nodemailer, Multer | Automated email notifications & profile image uploads |

---

## ✨ Key Features

### 🌐 Public Landing Portal
- **Modern Landing Page**: Hero section, service offerings, feature grids, testimonials, and interactive FAQs.
- **Informational Pages**: Dedicated **About Us**, **Contact Us**, and **Privacy Policy** pages.

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Student Self-Registration**: Automated profile setup upon student signup.
- **Admin Privilege System**: Admin accounts managed via secure seeding or admin delegation.
- **Protected Routing**: Frontend wrapper (`ProtectedRoute.jsx`) and backend middleware (`protect`, `requireRole`, `requireAdminOrOwner`) enforcing authorization.

### 👨‍🎓 Student & Class Management
- **Admin Student Management**: Full CRUD operations with search, class filtering, status toggling, and pagination (`GET /api/students`).
- **Class Administration**: Manage classes, track subjects, and handle student enrollments/unenrollments with synchronized bidirectional references.
- **Student Profile Self-Service**: Students can update personal bio, contact info, and upload avatar photos.

### 📋 Attendance Register System
- **Bulk Attendance Entry**: Admin/teacher can mark attendance for an entire class in a single batch request (`bulkWrite` upsert per student, class, and date).
- **Student Attendance Metrics**: Automated calculation of attendance percentages and historical logs on student dashboards.

### 📊 Gradebook & Digital Report Cards
- **Grade Entry**: Administrative input of subject scores per term.
- **Auto-Calculated Report Cards**: Server-side aggregation of subject scores, term averages, and letter grades (A–F).

### 💳 Financial Management & Paystack Payment Gateway
- **Invoice Generation**: Itemized invoice creation for tuition, fees, and activities with auto-calculated total amounts.
- **Paystack Integration**: Direct online payment via Paystack inline modal in the student portal.
- **Payment Tracking**: Multi-status tracking (`unpaid`, `partial`, `paid`) with transaction history logging (`Payment` model).

### 📢 Announcements & In-App Notifications
- **Targeted Announcements**: Broadcast school-wide or class-specific announcements.
- **Automatic Notification Fanout**: System automatically pushes notifications to affected students upon invoice issuance or announcement publication.
- **Notification Center**: Interactive bell widget with unread counters and mark-as-read controls.

### 📈 Analytics & Dashboards
- **Admin Dashboard**: Visual stat cards and charts showing enrollment metrics, financial collections, and attendance trends.
- **Student Dashboard**: Quick access summary of GPA, pending fee balances, recent attendance, and latest announcements.

---

## 📁 Project Structure

```
sms/
├── client/                      # React 19 + Vite Frontend SPA
│   ├── public/                  # Static public assets
│   ├── src/
│   │   ├── assets/              # Logos & media files
│   │   ├── components/          # Shared components & UI layouts
│   │   │   ├── layout/          # AppLayout, Navbar, Sidebar, ProtectedRoute
│   │   │   └── Payment.jsx      # Paystack inline payment trigger
│   │   ├── context/             # AuthContext (global authentication state)
│   │   ├── pages/
│   │   │   ├── admin/           # Admin pages (Dash, Students, Classes, Attendance, Grades, Invoices, Announcements)
│   │   │   ├── auth/            # Auth pages (Login, Register, ForgotPassword)
│   │   │   ├── landing/         # Public pages (Landing2, AboutUs, ContactUs, PrivacyPolicy)
│   │   │   └── student/         # Student pages (Dash, Profile, Attendance, Grades, Invoices, Announcements)
│   │   ├── services/            # Axios API instance with JWT interceptors
│   │   ├── App.jsx              # Main router & page routes configuration
│   │   └── main.jsx             # React entrypoint
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite configuration
│
└── server/                      # Node.js + Express REST API Backend
    ├── config/                  # Database configuration (`db.js`)
    ├── controllers/             # Business logic controllers per resource
    ├── middleware/              # Auth (`auth.js`) & Role Check (`roleCheck.js`)
    ├── models/                  # Mongoose Schemas (User, StudentProfile, Class, Attendance, Grade, Invoice, Payment, Announcement, Notification)
    ├── routes/                  # Express API route declarations
    ├── services/                # External integration services (`paystackService.js`)
    ├── uploads/                 # Uploaded static media storage (avatars)
    ├── seed.js                  # Database seeding script for demo accounts
    ├── server.js                # Express app entrypoint & static file server
    └── package.json             # Backend dependencies & scripts
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: Local MongoDB instance or free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)

---

### 2. Backend Setup (`/server`)

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory (or copy `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sms_db?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_ORIGIN=http://localhost:5173
   PAYSTACK_SECRET_KEY=sk_test_xxxxxx
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Seed Initial Database Accounts**:
   ```bash
   npm run seed
   ```
   *Creates initial Admin & Student accounts listed below.*

5. **Start Development Backend Server**:
   ```bash
   npm run dev
   ```
   *The server runs on **http://localhost:5000**.*

---

### 3. Frontend Setup (`/client`)

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** *(Optional)*:
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start Development Frontend Server**:
   ```bash
   npm run dev
   ```
   *The client app runs on **http://localhost:5173**.*

---

## 🔑 Demo Login Credentials

After running `npm run seed`, log in using the pre-seeded accounts:

| Role | Email | Password | Assigned Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.test` | `Admin123!` | Full administrative access |
| **Student** | `student@school.test` | `Student123!` | Enrolled in Class `JSS1A` |

---

## 📡 API Endpoint Reference

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register a new student account & profile |
| `/api/auth/login` | `POST` | Public | Authenticate user & receive JWT |
| `/api/auth/me` | `GET` | Protected | Fetch current logged-in user details |
| `/api/students` | `GET`, `POST` | Admin | List all students (paginated/filtered) or create student |
| `/api/students/:id` | `GET`, `PUT`, `DELETE`| Admin/Owner | View, update, or soft-delete student profile |
| `/api/classes` | `GET`, `POST` | Protected | View classes or create new class (Admin) |
| `/api/classes/:id/enroll` | `POST` | Admin | Enroll student into class |
| `/api/attendance` | `GET`, `POST` | Protected | Fetch attendance history or bulk-mark register (Admin) |
| `/api/grades` | `GET`, `POST` | Protected | Grade entry (Admin) or view student report card |
| `/api/invoices` | `GET`, `POST` | Protected | Generate invoice (Admin) or fetch student invoices |
| `/api/payments` | `POST` | Protected | Process invoice payment & record transaction |
| `/api/announcements` | `GET`, `POST` | Protected | Post announcement (Admin) or view announcements |
| `/api/notifications` | `GET`, `PUT` | Protected | Fetch student notifications or mark as read |
| `/api/dashboard/admin` | `GET` | Admin | Administrative school-wide statistics & analytics |
| `/api/dashboard/student` | `GET` | Student | Personal academic dashboard overview |

---

## 🔒 Security Architecture

1. **Password Hashing**: Passwords stored securely using `bcryptjs` salt hashing.
2. **Stateless JWT Authorization**: Tokens stored in browser `localStorage` and sent via `Authorization: Bearer <token>` headers.
3. **Role Enforcement**:
   - `requireRole('admin')`: Restricts API endpoints exclusively to administrative users.
   - `requireAdminOrOwner`: Grants access to admins or to students accessing only their personal records (attendance, grades, invoices, profile).

---

## 📦 Production Deployment

### Unified Single-Server Deployment
1. Build the production React frontend bundle from the `client` directory:
   ```bash
   cd client
   npm run build
   ```
2. The output bundle will be placed in `client/dist`.
3. The Express backend in `server/server.js` is pre-configured to statically serve `client/dist` and fallback to `index.html` for any client routes.
4. Deploy the `server/` directory to platforms like **Render**, **Railway**, or **Heroku**. Set production environment variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`).

---

## 📄 License

This project is open-source and available under the **MIT License**.
