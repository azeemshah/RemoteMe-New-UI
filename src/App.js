import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ADMIN_ROUTES,
  COMMON_ROUTES,
  EMPLOYEE_ROUTES,
  ORG_ROUTES,
  PUBLIC_ROUTES,
} from "./config/routes";
// Employee Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import UpdateProfile from "./pages/UpdateProfile";
import SignupRequest from "./pages/SignupRequest";
import Dashboard from "./pages/employee/Dashboard";
import OrgDashboard from "./pages/organization/Dashboard";




import AdminDashboard from "./pages/admin/Dashboard";
import AuthRoute from "./auth-routes";
import CheckAccess from "./auth-routes/CheckAccess";
import AccessRestricted from "./pages/AccessRestricted";
import Forbidden from "./pages/Forbidden";
import VerifyOtp from "./pages/VerifyOtp";
// import EditOrgInvitation from "./pages/admin/EditOrgInvitation";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path={PUBLIC_ROUTES.HOME} element={<Login />} />
          <Route path={PUBLIC_ROUTES.ADMIN_LOGIN} element={<Login />} />
          <Route path={PUBLIC_ROUTES.VERIFY_OTP} element={<VerifyOtp />} />
          <Route
            path={PUBLIC_ROUTES.FORGOT_PASSWORD}
            element={<ForgotPassword />}
          />
          
          <Route
            path={PUBLIC_ROUTES.RESET_PASSWORD}
            element={<ResetPassword />}
          />
       
       
          <Route
            path={PUBLIC_ROUTES.SIGNUP_REQUEST}
            element={<SignupRequest />}
          />
          <Route
            path={COMMON_ROUTES.ACCESS_RESTRICTED}
            element={
              <AuthRoute
                allowedRoles={[
                  "admin",
                  "organization",
                  "sub-org-admin",
                  "employee",
                ]}
              >
                <AccessRestricted />
              </AuthRoute>
            }
          />
          <Route
            path={COMMON_ROUTES.FORBIDDEN}
            element={
              <AuthRoute
                allowedRoles={[
                  "admin",
                  "organization",
                  "sub-org-admin",
                  "employee",
                ]}
              >
                <Forbidden />
              </AuthRoute>
            }
          />

          <Route
            path={COMMON_ROUTES.CHANGE_PASSWORD}
            element={
              <AuthRoute
                allowedRoles={[
                  "admin",
                  "organization",
                  "sub-org-admin",
                  "employee",
                ]}
              >
                <ChangePassword />
              </AuthRoute>
            }
          />
          <Route
            path={COMMON_ROUTES.UPDATE_PROFILE}
            element={
              <AuthRoute
                allowedRoles={[
                  "admin",
                  "organization",
                  "sub-org-admin",
                  "employee",
                ]}
              >
                <UpdateProfile />
              </AuthRoute>
            }
          />
          {/* Admin Pages */}
          <Route
            path={ADMIN_ROUTES.DASHBOARD}
            element={
              <AuthRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </AuthRoute>
            }
          />
         
          <Route
            path={EMPLOYEE_ROUTES.DASHBOARD}
            element={
              <AuthRoute allowedRoles={["employee"]}>
                <CheckAccess>
                  <Dashboard />
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
         
          {/* <Route path={ORG_ROUTES.WELCOME} element={<OrgWelcome />} /> */}
     
          <Route
            path={ORG_ROUTES.PAYDETAILS}
            element={
              <AuthRoute allowedRoles={["organization", "sub-org-admin"]}>
                <CheckAccess>
                
                </CheckAccess>
              </AuthRoute>
            }
          />


         
        </Routes>
      </div>
    </Router>
  );
}

export default App;
