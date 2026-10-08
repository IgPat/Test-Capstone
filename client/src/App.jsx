import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Landing2 from "./pages/landing/Landing2";
import AboutUs from './pages/landing/AboutUs';
import ContactUs from './pages/landing/ContactUs';
import PrivacyPolicy from './pages/landing/PrivacyPolicy';

// Auth Pages
import Login1 from "./pages/auth/Login1";
import Register1 from "./pages/auth/Register1";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Admin Pages
import AdminDash from "./pages/admin/AdminDash";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminGrades from "./pages/admin/AdminGrades";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";

// Student Pages
import StudentDash from "./pages/student/StudentDash";
import StudentProfile from "./pages/student/StudentProfile";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentGrades from "./pages/student/StudentGrades";
import StudentInvoices from "./pages/student/StudentInvoices";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing2 />} />
        <Route path="/landing2" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login1 />} />
        <Route path="/register" element={<Register1 />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDash />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/classes" element={<AdminClasses />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/grades" element={<AdminGrades />} />
            <Route path="/admin/invoices" element={<AdminInvoices />} />
            <Route
              path="/admin/announcements"
              element={<AdminAnnouncements />}
            />
          </Route>
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route element={<AppLayout />}>
            <Route path="/student/dashboard" element={<StudentDash />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/grades" element={<StudentGrades />} />
            <Route path="/student/invoices" element={<StudentInvoices />} />
            <Route
              path="/student/announcements"
              element={<StudentAnnouncements />}
            />
          </Route>
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
