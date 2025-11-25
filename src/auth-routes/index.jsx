import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AuthRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userRoles = user?.roles || [];

  // Check if user has at least one required role
  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    // Redirect to their appropriate dashboard based on roles
    if (userRoles.includes("admin")) return <Navigate to="/admin" replace />;
    if (userRoles.includes("employee"))
      return <Navigate to="/employee" replace />;
    if (
      userRoles.includes("organization") ||
      userRoles.includes("sub-org-admin")
    )
      return <Navigate to="/organization" replace />;

    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthRoute;
