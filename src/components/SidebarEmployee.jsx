import { Icon } from "@iconify/react";
import { NavLink } from "react-router-dom";

import logo from "../assets/img/ultimate-logo.png";
import "../App.css";

export default function SidebarEmployee({ onLinkClick }) {
  return (
    <div className="sidebar-employee d-flex flex-column h-100">
      {/* Logo */}
      <div className="sidebar-logo text-center py-3 flex-shrink-0">
        <img src={logo} alt="logo" className="img-fluid sidebar-logo-img" />
      </div>

      {/* Scrollable area */}
      <div className="sidebar-employee-scroll flex-grow-1 overflow-hidden">
        <ul className="nav flex-column sidebar-menu">
          <li className="nav-item">
            <NavLink
              to="/employee"
              end
              onClick={onLinkClick}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon icon="mdi:view-dashboard-outline" width="25" height="25" />
              <span className="link-text">Dashboards</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}
