import React from "react";
import SidebarEmployee from "../../components/SidebarEmployee";
import DashBoardLayer from "../../components/DashBoardLayer";
import Breadcrumb from "../../components/Breadcrumb";

const Dashboard = () => {
  return (
    <>
      {/* MasterLayout */}
      <SidebarEmployee>
        {/* Breadcrumb */}
        <Breadcrumb title="Sidebar - Employee" />
        <DashBoardLayer />
      </SidebarEmployee>
    </>
  );
};

export default Dashboard;
