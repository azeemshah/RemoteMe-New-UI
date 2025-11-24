import { NavLink } from "react-router-dom";
import Logout from "./Logout";
import { API_URL } from "../config/index";
import { useAuth } from "../hooks/useAuth";
import { COMMON_ROUTES, ORG_ROUTES } from "../config/routes";

export default function ProfileCard({ onClose }) {
  const { user } = useAuth();

  const avatarSrc = user?.avatar ? `${API_URL}${user.avatar}` : "/user.png";
  return (
    <div
      className="position-absolute profile-card-popup"
      style={{ top: 4, right: 0, zIndex: 2000 }}
    >
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <img
            src={avatarSrc}
            alt="avatar"
            className="rounded-circle mb-2 shadow-sm bg-light"
            style={{ width: 80, height: 80, objectFit: "cover" }}
            onError={(e) => (e.currentTarget.src = "/user.png")}
            crossOrigin="anonymous"
          />
          <h5 className="card-title mb-0">
            {user?.first_name} {user?.last_name}
          </h5>
          <small className="text-muted">{user?.email}</small>
        </div>

        <ul className="nav flex-column mb-0">
          <li className="nav-item">
            <NavLink
              to={COMMON_ROUTES.UPDATE_PROFILE}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-person-circle me-2 fs-5" />
              Update Profile
            </NavLink>
          </li>

          {user.roles.includes("organization") ||
          user.roles.includes("sub-org-admin") ? (
            <li className="nav-item">
              <NavLink
                to={ORG_ROUTES.PROFILE}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="bi bi-building me-2 fs-5" />
                Organization Profile
              </NavLink>
            </li>
          ) : null}
          <li className="nav-item">
            <NavLink
              to={COMMON_ROUTES.CHANGE_PASSWORD}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link  ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-key me-2 fs-5" />
              Change Password
            </NavLink>
          </li>
          <Logout />
        </ul>
      </div>
    </div>
  );
}
