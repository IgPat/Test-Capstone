import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRole }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const defaultRedirect =
      user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
    return <Navigate to={defaultRedirect} replace />;
  }

  return <Outlet />;
}
