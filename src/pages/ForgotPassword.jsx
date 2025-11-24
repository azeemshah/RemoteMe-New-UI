import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../assets/img/ultimate-logo.png";
import loginImg from "../assets/img/login.jpg";
import useForgotPassword from "../hooks/useForgotPassword";
import { APP_NAME } from "../config";

export default function ForgotPasswordPage() {
  const {
    email,
    setEmail,
    errors,
    error,
    successMessage,
    loading,
    handleSubmit,
  } = useForgotPassword();

  return (
    <section className="min-vh-100 d-flex align-items-center bg-white">
      <Helmet>
        <title>Forgot Password – {APP_NAME}</title>
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
            Forgot Password
          </h1>
          <p className="text-muted mb-4">
            Enter your email and we’ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Success / Error Messages */}
            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Email Field */}
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
                disabled={loading}
              />
              {errors.email && (
                <div className="invalid-feedback d-block">
                  {errors.email.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-pill"
              disabled={loading}
            >
              {loading ? "Sending…" : "Send Reset Link"}
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
