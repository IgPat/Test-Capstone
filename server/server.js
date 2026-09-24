require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const emailRoutes = require("./routes/emailRoutes");

const app = express();

connectDB();

// Allow default local origins, configured origins, and any localhost/127.0.0.1 port during development
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5500",
  "https://test-capstone-coral.vercel.app",
];
const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

const isLocalhost = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanOrigin) || isLocalhost(cleanOrigin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);

// Auto-rewrite requests missing the /api prefix (e.g. /auth/login -> /api/auth/login)
app.use((req, res, next) => {
  if (
    !req.path.startsWith("/api") &&
    !req.path.startsWith("/uploads") &&
    !req.path.startsWith("/assets") &&
    /^\/(auth|students|classes|attendance|grades|invoices|announcements|notifications|dashboard|uploads|emails)($|\/)/.test(req.path)
  ) {
    req.url = "/api" + req.url;
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/payments", paymentRoutes);
const fs = require("fs");

const clientDistPath = path.join(__dirname, "..", "client", "dist");
const publicPath = path.join(__dirname, "..", "public");
const staticPath = fs.existsSync(clientDistPath) ? clientDistPath : publicPath;

app.use(express.static(staticPath));

// 404 handler for anything under /api that wasn't matched above
app.use("/api", (req, res) =>
  res.status(404).json({ message: "Route not found" }),
);

// Any other GET falls back to SPA index.html
app.get("*", (req, res) => {
  const indexFile = fs.existsSync(path.join(clientDistPath, "index.html"))
    ? path.join(clientDistPath, "index.html")
    : path.join(publicPath, "index.html");
  res.sendFile(indexFile);
});

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SMS API running on port ${PORT}`));
