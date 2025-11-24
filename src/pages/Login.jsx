import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../services/authService";
import logo from "../assets/img/ultimate-logo.png";
import loginImg from "../assets/img/login.jpg";
import { Helmet } from "react-helmet-async";
import "../assets/css/style.css";
import { PUBLIC_ROUTES } from "../config/routes";
import { APP_NAME } from "../config";
import { Icon } from "@iconify/react";

const FullPageSpinner = ({ label = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">{label}</span>
    </div>
  </div>
);

function LoginPage() {
  const { user, setLoading } = useAuth();
  const navigate = useNavigate();

  const urlSegments = window.location.pathname.split("/");
  const isAdminLogin = urlSegments.includes("back-office-login");

  // Redirect if already logged in
  useEffect(() => {
    if (
      user &&
      user.roles &&
      Array.isArray(user.roles) &&
      user.roles.length > 0
    ) {
      navigate(
        `/${
          user.roles[0].includes("organization") ||
          user.roles[0].includes("sub-org-admin")
            ? "organization"
            : user.roles[0]
        }`
      );
    }
  }, [user, navigate]);

  // ✅ HOOKS MUST ALWAYS RUN BEFORE CONDITIONAL RETURNS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [genericError, setGenericError] = useState("");

  // ❗ NOW we can conditionally return
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
    <section className="min-vh-100 d-flex align-items-center bg-white">
      <Helmet>
        <title>Login - {APP_NAME}</title>
      </Helmet>

      {/* LEFT IMAGE */}
      <div className="d-none d-lg-block col-lg-6 p-0">
        <img
          src={loginImg}
          alt={APP_NAME}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="col-12 col-lg-6 d-flex justify-content-center">
        <div style={{ maxWidth: 560, width: "100%", padding: "60px 40px" }}>
          {/* LOGO */}
          <div className="mb-4 text-start">
            <img
              src={logo}
              alt="Logo"
              style={{
                width: 210,
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700 }} className="mb-2">
            Sign In to your Account
          </h1>
          <p className="text-muted mb-4">
            Welcome back! Please enter your details
          </p>

          <form onSubmit={handleSubmit}>
            {genericError && (
              <div className="alert alert-danger">{genericError}</div>
            )}

            {/* EMAIL */}
            <div className="mb-3 position-relative input-with-icon">
              <span className="input-icon">
                <Icon icon="feather:mail" />
              </span>
              <input
                type="email"
                className={`form-control rounded-12 py-3 ps-5 ${
                  errors.email ? "is-invalid" : ""
                }`}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* PASSWORD */}
            <div className="mb-3 position-relative input-with-icon">
              <span className="input-icon">
                <Icon icon="mdi:lock-outline" />
              </span>
              <input
                type={showPass ? "text" : "password"}
                className={`form-control rounded-12 py-3 ps-5 ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2"
              >
                <Icon icon={showPass ? "bi:eye-slash" : "bi:eye"} />
              </button>
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="d-flex justify-content-between mb-3">
              <label className="d-flex align-items-center">
                <input type="checkbox" className="me-2" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-primary">
                Forgot Password?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-pill"
            >
              Sign In
            </button>

            {/* SIGN UP LINK */}
            <div className="text-center mt-4">
              <p>
                Don’t have an account?{" "}
                <Link to="/signup-request" className="text-primary">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
