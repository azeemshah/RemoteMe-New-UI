import { Icon } from "@iconify/react";
import { NavLink } from "react-router-dom";
import { ADMIN_ROUTES } from "../config/routes";
import logo from "../assets/img/ultimate-logo.png";
import "../App.css";

export default function SidebarAdmin({ onLinkClick }) {
  return (
    <div className="sidebar-admin d-flex flex-column h-100">
      <div className="sidebar-logo text-center py-3 flex-shrink-0">
        <img src={logo} alt="logo" className="img-fluid sidebar-logo-img" />
      </div>

      <div className="sidebar-admin-scroll flex-grow-1 overflow-hidden">
        <ul className="nav flex-column sidebar-menu">
          <li className="nav-item">
            <NavLink
              to={ADMIN_ROUTES.DASHBOARD}
              end
              onClick={onLinkClick}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon icon="mdi:view-dashboard-outline" width="25" height="25" />
              <span className="link-text">Dashboard</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}
