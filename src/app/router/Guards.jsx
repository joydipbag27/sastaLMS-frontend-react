import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

const isSafeRedirectPath = (path) => {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/") || path.startsWith("//")) return false;
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
    if (profile.role === "CREATOR") return <Navigate to="/creator/users" replace />;
    return <Navigate to="/dashboard/courses" replace />;
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
    if (profile.role === "STUDENT") return <Navigate to="/dashboard/courses" replace />;
    if (profile.role === "CREATOR") return <Navigate to="/creator/users" replace />;
  }

  return children;
};
