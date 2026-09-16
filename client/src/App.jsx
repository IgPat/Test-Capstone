import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Landing from "./pages/Landing";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminGrades from "./pages/admin/AdminGrades";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
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
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
            <Route path="/student/dashboard" element={<StudentDashboard />} />
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
