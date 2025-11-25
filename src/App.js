import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import {
  ADMIN_ROUTES,
  COMMON_ROUTES,
  EMPLOYEE_ROUTES,
  ORG_ROUTES,
  PUBLIC_ROUTES,
} from "./config/routes";
import AuthRoute from "./auth-routes";
import CheckAccess from "./auth-routes/CheckAccess";

import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import AdminDashboard from "./pages/admin/Dashboard";
import OrgDashboard from "./pages/organization/Dashboard";
import EmployeeDashboard from "./pages/employee/Dashboard";
import RouteScrollToTop from "./helper/RouteScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        <Route path={PUBLIC_ROUTES.HOME} element={<Login />} />
        <Route path={PUBLIC_ROUTES.ADMIN_LOGIN} element={<Login />} />
        <Route path={PUBLIC_ROUTES.VERIFY_OTP} element={<VerifyOtp />} />

        {/* Admin Pages */}
        <Route
          path={ADMIN_ROUTES.DASHBOARD}
          element={
            <AuthRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </AuthRoute>
          }
        />

        {/* Employee Pages */}
        <Route
          path={EMPLOYEE_ROUTES.DASHBOARD}
          element={
            <AuthRoute allowedRoles={["employee"]}>
              <CheckAccess>
                <EmployeeDashboard />
              </CheckAccess>
            </AuthRoute>
          }
        />

        {/* Organization Pages */}
        <Route
          path={ORG_ROUTES.DASHBOARD}
          element={
            <AuthRoute allowedRoles={["organization", "sub-org-admin"]}>
              <OrgDashboard />
            </AuthRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
