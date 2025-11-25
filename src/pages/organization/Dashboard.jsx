import React from "react";
import SidebarOrg from "../../components/SidebarOrg";
import DashBoardLayer from "../../components/DashBoardLayer";
import Breadcrumb from "../../components/Breadcrumb";

const Dashboard = () => {
  return (
    <>
      {/* MasterLayout */}
      <SidebarOrg>
        {/* Breadcrumb */}
        <Breadcrumb title="Sidebar - Organization" />
        <DashBoardLayer />
      </SidebarOrg>
    </>
  );
};

export default Dashboard;
