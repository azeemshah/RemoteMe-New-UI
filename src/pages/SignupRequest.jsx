import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import useSignupRequest from "../hooks/useSignupRequest";
import logo from "../assets/img/ultimate-logo.png";
import loginImg from "../assets/img/login.jpg";
import "../assets/css/style.css";
import ReCAPTCHA from "react-google-recaptcha";
import { APP_NAME } from "../config";

export default function SignupRequest() {
  const {
    form,
    errors,
    serverError,
    successMessage,
    loading,
    handleChange,
    handleSubmit,
    setForm,
  } = useSignupRequest();

  const renderFieldErrors = (fieldKey) => {
    const msgs =
      errors[fieldKey] ||
      errors[fieldKey.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())] ||
      [];

    if (!Array.isArray(msgs)) return null;

    return msgs.map((msg, idx) => (
      <div key={idx} className="invalid-feedback d-block">
        {msg}
      </div>
    ));
  };

  return (
    <section className="min-vh-100 d-flex align-items-center bg-white">
      <Helmet>
        <title>Sign-Up Request – {APP_NAME}</title>
      </Helmet>

      {/* LEFT IMAGE */}
      <div className="d-none d-lg-block col-lg-6 p-0">
        <img
          src={loginImg}
          alt="Sign Up"
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* RIGHT FORM */}
      <div className="col-12 col-lg-6 d-flex justify-content-center bg-white">
        <div style={{ maxWidth: 540, width: "100%", padding: "48px 36px" }}>
          
          {/* LOGO */}
          <div className="mb-4 text-start">
            <img
              src={logo}
              alt={APP_NAME}
              style={{
                width: 190,
                height: 48,
                objectFit: "contain",
              }}
            />
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Sign-Up Request</h1>
          <p className="text-muted mb-4">
            Please fill out the form to request an account.
          </p>

          {serverError && (
            <div className="alert alert-danger">{serverError}</div>
          )}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* ORG NAME */}
            <div className="mb-3">
              <label className="form-label">
                Organization Name <span className="text-danger">*</span>
              </label>
              <input
                name="organizationName"
                type="text"
                className={`form-control ${
                  errors.organizationName ||
                  errors.organization_name
                    ? "is-invalid"
                    : ""
                }`}
                value={form.organizationName}
                onChange={handleChange}
                disabled={loading}
              />
              {renderFieldErrors("organizationName")}
            </div>

            {/* FIRST NAME */}
            <div className="mb-3">
              <label className="form-label">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                name="firstName"
                type="text"
                className={`form-control ${
                  errors.firstName || errors.first_name ? "is-invalid" : ""
                }`}
                value={form.firstName}
                onChange={handleChange}
                disabled={loading}
              />
              {renderFieldErrors("firstName")}
            </div>

            {/* LAST NAME */}
            <div className="mb-3">
              <label className="form-label">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                name="lastName"
                type="text"
                className={`form-control ${
                  errors.lastName || errors.last_name ? "is-invalid" : ""
                }`}
                value={form.lastName}
                onChange={handleChange}
                disabled={loading}
              />
              {renderFieldErrors("lastName")}
            </div>

            {/* EMAIL */}
            <div className="mb-4">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                name="email"
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
              {renderFieldErrors("email")}
            </div>

            {/* RECAPTCHA */}
            <div className="mb-4">
              <ReCAPTCHA
                sitekey="6LcvIb8rAAAAAM0WWIUqdWB3u6JoLz3SqoMejtZH"
                onChange={(token) =>
                  setForm((form) => ({ ...form, recaptcha_token: token }))
                }
              />
              {renderFieldErrors("recaptcha_token")}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-pill"
              disabled={loading}
              style={{ fontWeight: 600 }}
            >
              Submit Request
            </button>

            {/* BACK TO LOGIN */}
            <div className="text-center mt-4">
              <Link to="/" className="text-primary text-decoration-none">
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
