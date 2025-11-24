import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import useChangePassword from "../hooks/useChangePassword";
import { Tooltip } from "react-tooltip";

function ChangePassword() {
  const changePassword = useChangePassword();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordMatchError, setPasswordMatchError] = useState(false);

  useEffect(() => {
    if (changePassword.form.newPassword !== changePassword.form.confirm) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  }, [changePassword.form.newPassword, changePassword.form.confirm]);

  return (
    <div className="d-flex min-vh-100 flex-column">
      <Header />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="content flex-grow-1">
          <section className="container">
            <h5 className="mb-0 fw-semibold mb-4">
              <i className="bi bi-key text-primary"></i> Change Password
            </h5>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                {changePassword.serverError && (
                  <div className="alert alert-danger">
                    {changePassword.serverError}
                  </div>
                )}
                {changePassword.successMessage && (
                  <div className="alert alert-success">
                    {changePassword.successMessage}
                  </div>
                )}

                <form onSubmit={changePassword.handleSubmit} noValidate>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Old Password <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <input
                            type={showOld ? "text" : "password"}
                            name="oldPassword"
                            className={`form-control ${
                              changePassword.errors.oldPassword
                                ? "is-invalid"
                                : ""
                            }`}
                            value={changePassword.form.oldPassword}
                            onChange={changePassword.handleChange}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary eye-toggle-btn"
                            onClick={() => setShowOld((v) => !v)}
                          >
                            <i
                              className={`bi ${
                                showOld ? "bi-eye-slash-fill" : "bi-eye-fill"
                              }`}
                            ></i>
                          </button>
                          <div className="invalid-feedback">
                            {changePassword.errors.oldPassword}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="mb-3">
                        <label className="form-label">
                          New Password{" "}
                          <span className="text-danger ms-1">*</span>
                          <span
                            className="ms-1 text-info"
                            data-tooltip-id="passwordTooltip"
                          >
                            <i className="bi bi-info-circle-fill"></i>
                          </span>
                          <Tooltip
                            id="passwordTooltip"
                            place="bottom"
                            variant="info"
                            content="Password must be between 8 and 16 characters, long and must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
                          />
                        </label>

                        <div className="input-group">
                          <input
                            type={showNew ? "text" : "password"}
                            name="newPassword"
                            className={`form-control ${
                              changePassword.errors.newPassword
                                ? "is-invalid"
                                : ""
                            }`}
                            value={changePassword.form.newPassword}
                            onChange={changePassword.handleChange}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary eye-toggle-btn"
                            onClick={() => setShowNew((v) => !v)}
                          >
                            <i
                              className={`bi ${
                                showNew ? "bi-eye-slash-fill" : "bi-eye-fill"
                              }`}
                            ></i>
                          </button>
                          <div className="invalid-feedback">
                            {Array.isArray(changePassword.errors.newPassword) &&
                              changePassword.errors.newPassword.map((err) => (
                                <div key={err}>{err}</div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Confirm Password{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <input
                            type={showConfirm ? "text" : "password"}
                            name="confirm"
                            className={`form-control ${
                              changePassword.errors.confirm ? "is-invalid" : ""
                            }`}
                            value={changePassword.form.confirm}
                            onChange={changePassword.handleChange}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary eye-toggle-btn"
                            onClick={() => setShowConfirm((v) => !v)}
                          >
                            <i
                              className={`bi ${
                                showConfirm
                                  ? "bi-eye-slash-fill"
                                  : "bi-eye-fill"
                              }`}
                            ></i>
                          </button>
                          <div className="invalid-feedback">
                            {changePassword.errors.confirm}
                          </div>
                        </div>
                        {passwordMatchError && (
                          <div className="form-text text-danger">
                            New Password and Confirm Password do not match!
                          </div>
                        )}
                        {changePassword.isMatch && (
                          <div className="form-text text-success">Matched!</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={changePassword.loading || passwordMatchError}
                    >
                      {changePassword.loading
                        ? "Changing..."
                        : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default ChangePassword;
