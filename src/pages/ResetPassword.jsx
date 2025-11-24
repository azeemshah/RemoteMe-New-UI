import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Icon } from "@iconify/react";
import { Tooltip } from "react-tooltip";
import { Link } from "react-router-dom";
import logo from "../assets/img/ultimate-logo.png";
import loginImg from "../assets/img/login.jpg";
import useResetPassword from "../hooks/useResetPassword";
import { APP_NAME } from "../config";

export default function ResetPasswordPage() {
  const resetPassword = useResetPassword();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  useEffect(() => {
    if (resetPassword.password && resetPassword.confirm) {
      setPasswordMatchError(resetPassword.password !== resetPassword.confirm);
    } else {
      setPasswordMatchError(false);
    }
  }, [resetPassword.password, resetPassword.confirm]);

  return (
    <section className="min-vh-100 d-flex align-items-center bg-white">
      <Helmet>
        <title>Reset Password – {APP_NAME}</title>
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
              alt={APP_NAME}
              style={{ width: 210, height: "auto", objectFit: "contain" }}
            />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700 }} className="mb-2">
            Reset Password
          </h1>
          <p className="text-muted mb-4">
            Enter a new password below and confirm to update your account.
          </p>

          {resetPassword.successMessage && (
            <div className="alert alert-success">{resetPassword.successMessage}</div>
          )}
          {resetPassword.serverError && (
            <div className="alert alert-danger">{resetPassword.serverError}</div>
          )}

          <form onSubmit={resetPassword.handleSubmit}>
            {/* New Password */}
            <div className="mb-3 position-relative input-with-icon">
              <span className="input-icon">
                <Icon icon="mdi:lock-outline" />
              </span>
              <input
                type={showNew ? "text" : "password"}
                className={`form-control rounded-12 py-3 ps-5 ${
                  resetPassword.errors.newPassword ? "is-invalid" : ""
                }`}
                placeholder="New Password"
                value={resetPassword.password}
                onChange={(e) => resetPassword.setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2"
                onClick={() => setShowNew(!showNew)}
              >
                <Icon icon={showNew ? "bi:eye-slash" : "bi:eye"} />
              </button>
              {resetPassword.errors.newPassword && (
                <div className="invalid-feedback d-block">
                  {Array.isArray(resetPassword.errors.newPassword)
                    ? resetPassword.errors.newPassword.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))
                    : resetPassword.errors.newPassword}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-3 position-relative input-with-icon">
              <span className="input-icon">
                <Icon icon="mdi:lock-outline" />
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                className={`form-control rounded-12 py-3 ps-5 ${
                  resetPassword.errors.confirm ? "is-invalid" : ""
                }`}
                placeholder="Confirm Password"
                value={resetPassword.confirm}
                onChange={(e) => resetPassword.setConfirm(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <Icon icon={showConfirm ? "bi:eye-slash" : "bi:eye"} />
              </button>
              {resetPassword.errors.confirm && (
                <div className="invalid-feedback d-block">{resetPassword.errors.confirm}</div>
              )}
            </div>

            {/* Password Match */}
            {passwordMatchError && (
              <div className="form-text text-danger mb-3">
                New Password and Confirm Password do not match!
              </div>
            )}
            {!passwordMatchError &&
              resetPassword.password &&
              resetPassword.confirm && (
                <div className="form-text text-success mb-3">Passwords Matched!</div>
              )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-pill"
              disabled={resetPassword.loading || passwordMatchError}
            >
              {resetPassword.loading ? "Resetting…" : "Reset Password"}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-4">
              <Link to="/" className="text-primary">
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
