import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

const isSafeRedirectPath = (path) => {
  if (!path || typeof path !== "string") return false;
  // Must start with exactly one '/' and not contain a second '/' immediately (prevents '//')
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  // Reject backslashes, control characters, or HTML-like bracket syntax
  if (/[\\{}()<>\[\]]/.test(path)) return false;
  return true;
};

export const GuestOnlyRoute = ({ children, fallbackPath }) => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  if (profile) {
    if (returnTo && isSafeRedirectPath(returnTo)) {
      return <Navigate to={returnTo} replace />;
    }
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    const isCreatorOrAdmin = profile.role === "CREATOR" || profile.role === "ADMIN";
    return <Navigate to={isCreatorOrAdmin ? "/admin/courses" : "/dashboard/courses"} replace />;
  }

  return children;
};

export const AuthenticatedRoute = ({ children, redirectPath = "/login" }) => {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export const RoleRoute = ({ children, allowedRoles, redirectPath }) => {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
    return <Navigate to={profile.role === "STUDENT" ? "/dashboard/courses" : "/admin/courses"} replace />;
  }

  return children;
};
