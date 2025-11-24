import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Helmet } from "react-helmet-async";
import OtpInput from "react-otp-input";
import { Icon } from "@iconify/react";
import logo from "../assets/img/ultimate-logo.png";
import loginImg from "../assets/img/login.jpg";
import { APP_NAME } from "../config";
import { ORG_ROUTES, PUBLIC_ROUTES } from "../config/routes";
import { verifyOtp } from "../services/authService";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const { user, login, setLoading } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [genericError, setGenericError] = useState("");

  useEffect(() => {
    if (user && user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      if (user.roles.includes("organization") || user.roles.includes("sub-org-admin")) {
        navigate(ORG_ROUTES.DASHBOARD);
      } else {
        navigate(`/${user.roles[0]}`);
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenericError("");
    try {
      setLoading(true);
      const res = await verifyOtp(sessionId, otp);
      if (res.status === 201) {
        login(res.data.user, res.data.token);
        if (res.data.user.account_status === "declined" || res.data.user.admin_account_status === "declined") {
          navigate(ORG_ROUTES.UPDATE_INFO);
        } else {
          if (res.data.user.roles.includes("organization") || res.data.user.roles.includes("sub-org-admin")) {
            navigate(ORG_ROUTES.DASHBOARD);
          } else {
            navigate(`/${res.data.user.roles[0]}`);
          }
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
    <section className="min-vh-100 d-flex align-items-center bg-white">
      <Helmet>
        <title>Verify OTP – {APP_NAME}</title>
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
            Verify OTP
          </h1>
          <p className="text-muted mb-4">
            Please enter your 6-digit OTP to verify your account.
          </p>

          <form onSubmit={handleSubmit}>
            {genericError && <div className="alert alert-danger">{genericError}</div>}

            <div className="mb-4 d-flex justify-content-center">
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span className="mx-1">-</span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="form-control rounded-12 text-center"
                    style={{ width: "3rem", height: "3rem", fontSize: "1.25rem" }}
                  />
                )}
                containerStyle="gap-2 justify-content-center"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-pill mb-3"
            >
              Verify & Login
            </button>

            <div className="text-center">
              <span>Back to </span>
              <Link to={PUBLIC_ROUTES.HOME} className="text-primary">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
