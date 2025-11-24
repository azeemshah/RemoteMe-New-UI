import { useAuth } from "../hooks/useAuth";
import { NavLink } from "react-router-dom";

const Logout = () => {
  const { logout } = useAuth();

  return (
    <li className="nav-item">
      <NavLink className={() => "nav-link"} onClick={logout}>
        <i className="bi bi-cash me-2 fs-5" />
        Logout
      </NavLink>
    </li>
  );
};

export default Logout;
