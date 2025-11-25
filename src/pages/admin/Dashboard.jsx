import React from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Breadcrumb from "../../components/Breadcrumb";
import DashBoardLayer from "../../components/DashBoardLayer";

const Dashboard = () => {
  return (
    <>
      {/* MasterLayout */}
      <SidebarAdmin>
        {/* Breadcrumb */}
        <Breadcrumb title="Sidebar - Admin" />
        <DashBoardLayer />
      </SidebarAdmin>
    </>
  );
};

export default Dashboard;
