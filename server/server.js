require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

connectDB();

// The frontend is served from this same Express app, so CORS is mainly a
// convenience for local development (e.g. opening the HTML files with a
// separate static server/live-reloader) or a split deployment.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5000,http://127.0.0.1:5500').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

const fs = require('fs');

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const publicPath = path.join(__dirname, '..', 'public');
const staticPath = fs.existsSync(clientDistPath) ? clientDistPath : publicPath;

app.use(express.static(staticPath));

// 404 handler for anything under /api that wasn't matched above
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Any other GET falls back to SPA index.html
app.get('*', (req, res) => {
  const indexFile = fs.existsSync(path.join(clientDistPath, 'index.html'))
    ? path.join(clientDistPath, 'index.html')
    : path.join(publicPath, 'index.html');
  res.sendFile(indexFile);
});

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SMS API running on port ${PORT}`));
