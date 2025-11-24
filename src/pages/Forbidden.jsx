import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { APP_NAME } from "../config";

function Forbidden() {
  return (
    <div className="d-flex min-vh-100 flex-column">
      <Helmet>
        <title> Forbidden Access Restricted – {APP_NAME}</title>
      </Helmet>
      <Header />
      <div className="d-flex flex-grow-1 flex-column">
        <Sidebar />
        <main className="content flex-grow-1">
          <div className="container">
            <div className="card shadow-sm text-center p-4 forbidden-card">
              <div className="mb-3">
                <i className="bi bi-shield-lock text-danger display-4"></i>
              </div>
              <h4 className="mb-2">Access Forbidden</h4>
              <p className="text-muted mb-4">
                You do not have sufficient privileges to use this resource.
                Please Contact with your administrator.
              </p>

              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-center">
                <Link to="/" className="btn btn-primary">
                  <i className="bi bi-house-door me-2"></i> Go Home
                </Link>
                {/* <Link to="/" className="btn btn-outline-secondary">
                  <i className="bi bi-box-arrow-in-right me-2"></i> Login Again
                </Link> */}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Forbidden;
