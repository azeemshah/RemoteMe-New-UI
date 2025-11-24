import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet-async";
import { APP_NAME } from "../config";

function AccessRestricted() {
  return (
    <div className="d-flex min-vh-100 flex-column">
      <Helmet>
        <title>Access Restricted – {APP_NAME}</title>
      </Helmet>
      <Header />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="content flex-grow-1">
          <div className="container">
            {/* Outer white wrapper */}
            <div className="p-5 mt-3 rounded-4 shadow-sm bg-white">
              {/* Centered red box */}
              <div className="d-flex justify-content-center">
                <div
                  className="inner-card p-5 text-center rounded-4 bg-danger bg-opacity-25 text-grey"
                  style={{ maxWidth: "400px", backgroundColor: "#f8d7da" }}
                >
                  <div
                    className="icon-inner bg-white mb-3"
                    style={{ width: 60, height: 60, borderRadius: "50%" }}
                  >
                    <i className="bi bi-shield-lock-fill fs-2 text-danger opacity-50"></i>
                  </div>
                  <h4 className="fw-bold mb-2">Access Restricted</h4>
                  <p className="text-muted smal">
                    Your account isn’t approved yet. Please contact support if
                    you believe this is an error.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default AccessRestricted;
