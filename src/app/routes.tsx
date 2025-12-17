import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks";
import { Layout } from "../components/layout";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
// Import placeholder pages - will create them next
import UsersPage from "../pages/UsersPage";
import ProductsPage from "../pages/ProductsPage";
import LoansPage from "../pages/LoansPage";
import VolunteersPage from "../pages/VolunteersPage";
import AuditPage from "../pages/AuditPage";
import ProfilePage from "../pages/ProfilePage";
import { UserRole } from "../lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>טוען...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (
    allowedRoles &&
    user?.role &&
    !allowedRoles.includes(user.role as UserRole)
  ) {
    // Redirect volunteers to their page, others to dashboard
    return (
      <Navigate
        to={user.role === UserRole.VOLUNTEER ? "/volunteers" : "/dashboard"}
        replace
      />
    );
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            // Redirect based on user role after login
            <Navigate
              to={
                user?.role === UserRole.VOLUNTEER ? "/volunteers" : "/dashboard"
              }
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.WORKER]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.WORKER]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.WORKER]}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loans"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.WORKER]}>
            <LoansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteers"
        element={
          <ProtectedRoute>
            <VolunteersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AuditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/volunteers" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
