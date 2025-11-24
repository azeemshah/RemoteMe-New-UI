import { Helmet } from "react-helmet-async";

// Components
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import DashBoardLayerEleven from "../../components/DashBoardLayerEleven";
import Breadcrumb from "../../components/Breadcrumb";

// Hooks and Config

import { APP_NAME } from "../../config/index";

function Dashboard() {
  return (
    <div className="d-flex min-vh-100 flex-column">
      <Helmet>
        <title>Dashboard - {APP_NAME} Employee</title>
      </Helmet>
      <Header />
      <div className="d-flex flex-grow-1 flex-column">
        <Sidebar />
        <main
          className="content flex-grow-1"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <Breadcrumb title="Employee" />

          <section className="admin-dashboard-container py-3">
            <div className="container-fluid px-4">
              <DashBoardLayerEleven />
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;
