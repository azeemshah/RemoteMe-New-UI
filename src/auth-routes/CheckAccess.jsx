import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { EMPLOYEE_ROUTES, ORG_ROUTES } from "../config/routes";

const CheckAccess = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. If still loading auth state, you could render a spinner or null:
  if (loading) {
    return null; // or <Spinner />
  }

  // 2. If not logged in at all, send them to login/home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. If the account_status isn’t “approved”, redirect to your restricted page
  if (
    user.account_status === "pending" ||
    user.admin_account_status === "pending"
  ) {
    return <Navigate to="/access-restricted" replace />;
  }

  if (
    user.account_status === "declined" ||
    user.admin_account_status === "declined"
  ) {
    const page = user.roles.includes("employee")
      ? EMPLOYEE_ROUTES.UPDATE_INFO
      : ORG_ROUTES.UPDATE_INFO;
    return <Navigate to={page} replace />;
  }

  // 4. Otherwise, render the protected children
  return children;
};

export default CheckAccess;
