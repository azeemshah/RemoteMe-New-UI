import { Icon } from "@iconify/react";
import { NavLink } from "react-router-dom";
import logo from "../assets/img/ultimate-logo.png";
import "../App.css";

export default function SidebarOrg({ onLinkClick }) {
  return (
    <div className="sidebar-org d-flex flex-column h-100">
      {/* Logo */}
      <div className="sidebar-logo text-center py-3 flex-shrink-0">
        <img src={logo} alt="logo" className="sidebar-logo-img img-fluid" />
      </div>

      <div className="sidebar-org-scroll flex-grow-1 overflow-hidden">
        <ul className="nav flex-column sidebar-menu">
          <li className="nav-item">
            <NavLink
              to="/organization"
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
