import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/img/ultimate-logo.png";
import loginImg from "../assets/img/login.jpg";
import { Helmet } from "react-helmet-async";

import {
  ORG_ROUTES,
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  EMPLOYEE_ROUTES,
} from "../config/routes";
import { verifyOtp } from "../services/authService";
import OtpInput from "react-otp-input";
import { APP_NAME } from "../config";

const FullPageSpinner = ({ label = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">{label}</span>
    </div>
  </div>
);

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [genericError, setGenericError] = useState("");

  const { user, login, setLoading } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();

  useEffect(() => {
    if (
      user &&
      user.roles &&
      Array.isArray(user.roles) &&
      user.roles.length > 0
    ) {
      if (user.roles.includes("admin")) {
        navigate(ADMIN_ROUTES.DASHBOARD);
      } else if (
        user.roles.includes("organization") ||
        user.roles.includes("sub-org-admin")
      ) {
        navigate(ORG_ROUTES.DASHBOARD);
      } else if (user.roles.includes("employee")) {
        navigate(EMPLOYEE_ROUTES.DASHBOARD);
      }
    }
  }, [user, navigate]);

  if (user) {
    return <FullPageSpinner label="Redirecting…" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenericError("");

    try {
      setLoading(true);
      const res = await verifyOtp(sessionId, otp);
      if (res.status === 201) {
        login(res.data.user, res.data.token);
        console.log(
          res.data.user.admin_account_status === "declined",
          "Admin status"
        );
        // Redirect based on role
        const roles = res.data.user.roles || [];
        if (roles.includes("admin")) {
          navigate(ADMIN_ROUTES.DASHBOARD);
        } else if (
          roles.includes("organization") ||
          roles.includes("sub-org-admin")
        ) {
          navigate(ORG_ROUTES.DASHBOARD);
        } else if (roles.includes("employee")) {
          navigate(EMPLOYEE_ROUTES.DASHBOARD);
        } else {
          navigate(PUBLIC_ROUTES.HOME);
        }
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setGenericError(err.response.data.message || "Invalid OTP");
      } else if (err.response?.status === 429) {
        setGenericError("Too many login attempts. Please try again later.");
      } else {
        setGenericError("Something went wrong, please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <Helmet>
        <title>Verify OTP - {APP_NAME}</title>
      </Helmet>

      <section className="auth bg-base d-flex flex-wrap">
        <div className="auth-left d-lg-block d-none">
          <div className="d-flex align-items-center flex-column h-100 justify-content-center">
            <img src={loginImg} alt="" className="h-100 w-100 " />
          </div>
        </div>
        <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
          <div className="max-w-464-px mx-auto w-100">
            <div>
              <Link to={PUBLIC_ROUTES.HOME} className="mb-40 max-w-290-px">
                <img src={logo} alt="" />
              </Link>
              <h4 className="mb-12">Verify OTP</h4>
              <p className="mb-32 text-secondary-light text-lg">
                Please enter your 6 digit OTP to verify your account.
              </p>
            </div>

            {genericError && (
              <div className="alert alert-danger">{genericError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span>-</span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="form-control text-center"
                    style={{ color: "#111", background: "transparent" }}
                  />
                )}
                containerStyle="gap-2 justify-content-center mb-4"
              />

              <button
                type="submit"
                className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
              >
                Verify & Login
              </button>

              <div className="text-center mt-3">
                <span>Back to </span>
                <Link to={PUBLIC_ROUTES.HOME} className="text-decoration-none">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </section>
  );
}

export default VerifyOtp;
