import { useState } from "react";
import logo from "../../assets/img/ultimate-logo.png";
import loginImg from "../../assets/img/login.jpg";
import { Helmet } from "react-helmet-async";
import { APP_NAME } from "../../config";
function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Email: ${email}, Password: ${password}`);
  };

  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, var(--primary-color), var(--primary-light))",
      }}
    >
      <Helmet>
        <title>Login - {APP_NAME}</title>
      </Helmet>
      <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center py-5">
        <div className="row g-0 shadow-lg w-75 w-md-100 card-stack">
          {/* Left Side Image */}
          <div className="col-md-6 bg-white p-3 p-md-5 rounded-start-2">
            <img
              src={loginImg}
              alt={APP_NAME}
              className="img-fluid h-100"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Right Side Form */}
          <div className="col-md-6 bg-white p-3 p-md-5 border-left-custom rounded-end-2">
            <div className="mb-4 mt-3">
              <img src={logo} alt={APP_NAME} className="img-fluid logo" />
            </div>

            <h2 className="mb-3">Sign In</h2>
            <p className="text-muted mb-4">
              Welcome back to {APP_NAME}. Sign in to continue from where you
              left off.
            </p>

            <form className="custom-form-width" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="password" className="form-label mb-0">
                    Password
                  </label>
                  <a href="#" className="text-decoration-none small">
                    Reset Password
                  </a>
                </div>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember"
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Remember me
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-50 mx-auto d-block"
              >
                Sign In
              </button>
            </form>
            <div className="d-flex align-items-center my-4 custom-font-weight custom-form-width">
              <hr className="flex-grow-1 border-secondary opacity-25 m-0" />
              <span className="px-2 text-muted">OR sign with</span>
              <hr className="flex-grow-1 border-secondary opacity-25 m-0" />
            </div>

            <div className="text-center custom-form-width">
              <a href="#" className="social-btn">
                <i className="bi bi-google"></i>
              </a>
              <a href="#" className="social-btn">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-btn">
                <i className="bi bi-github"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-white mt-3">
          Don't have an account?{" "}
          <a href="#" className="text-white fw-bold text-decoration-none">
            Sign Up
          </a>
        </div>
      </div>
    </section>
  );
}

export default Index;
