import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import DashboardCard from "../../components/DashboardCard";
import { Helmet } from "react-helmet-async";
import { ADMIN_ROUTES } from "../../config/routes";
import { APP_NAME } from "../../config";
import DashBoardLayerEleven from "../../components/DashBoardLayerEleven";
import Breadcrumb from "../../components/Breadcrumb";

function AdminDashboard() {
  return (
    <div className="d-flex min-vh-100 flex-column">
      <Helmet>
        <title>Dashboard - {APP_NAME} Admin</title>
      </Helmet>
      <Header />
      <div className="d-flex flex-grow-1 flex-column">
        <Sidebar />
        <main
          className="content flex-grow-1"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <Breadcrumb title="Admin" />
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

export default AdminDashboard;
