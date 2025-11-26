import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../services/authService";
import logo from "../assets/img/ultimate-logo.png";
import loginImg from "../assets/img/login.jpg";
import { Helmet } from "react-helmet-async";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  ORG_ROUTES,
  EMPLOYEE_ROUTES,
} from "../config/routes";
import { APP_NAME } from "../config";

const FullPageSpinner = ({ label = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">{label}</span>
    </div>
  </div>
);

function Login() {
  const { user, setLoading } = useAuth();
  const navigate = useNavigate();

  // 🐛 FIX: All useState hooks are moved to the top level
  // before any conditional returns to adhere to React Rules of Hooks.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [genericError, setGenericError] = useState("");

  const urlSegments = window.location.pathname.split("/");
  const isAdminLogin = urlSegments.includes("back-office-login");

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

  // Early return for redirection
  if (
    user &&
    user.roles &&
    Array.isArray(user.roles) &&
    user.roles.length > 0
  ) {
    return <FullPageSpinner label="Redirecting…" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGenericError("");

    if (!email || !password) {
      setErrors({
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await loginRequest(email, password, isAdminLogin);
      if (res.status === 201) {
        navigate(
          `${PUBLIC_ROUTES.VERIFY_OTP.replace(
            ":sessionId",
            res.data.sessionId
          )}`
        );
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const msg = err.response.data.message;
        if (Array.isArray(msg)) {
          const fieldErrors = {};
          msg.forEach((m) => {
            if (m.toLowerCase().includes("email")) fieldErrors.email = m;
            if (m.toLowerCase().includes("password")) fieldErrors.password = m;
          });
          setErrors(fieldErrors);
        } else {
          setGenericError(
            err.response.data.message || "Invalid email or password"
          );
        }
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
        <title>Login - {APP_NAME}</title>
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
              <Link to="/" className="mb-40 max-w-290-px">
                <img src={logo} alt="" />
              </Link>
              <h4 className="mb-12">Sign In to your Account</h4>
              <p className="mb-32 text-secondary-light text-lg">
                Welcome back! please enter your detail
              </p>
            </div>

            {genericError && (
              <div className="alert alert-danger">{genericError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="mage:email" />
                </span>
                <input
                  type="email"
                  className={`form-control h-56-px bg-neutral-50 radius-12 ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <div className="text-danger text-sm mb-16">{errors.email}</div>
              )}

              <div className="position-relative mb-20">
                <div className="icon-field" style={{ position: "relative" }}>
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="solar:lock-password-outline" />
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    className={`form-control h-56-px bg-neutral-50 radius-12 ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    id="your-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={showPass ? "Hide password" : "Show password"}
                    onClick={() => setShowPass((s) => !s)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      icon={showPass ? "mdi:eye" : "mdi:eye-off"}
                      width="20"
                      height="20"
                    />
                  </button>
                </div>
              </div>
              {errors.password && (
                <div className="text-danger text-sm mb-16">
                  {errors.password}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Login;
