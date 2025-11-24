import { useSidebar } from "./SidebarContext";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import SidebarAdmin from "./SidebarAdmin";
import SidebarEmployee from "./SidebarEmployee";
import SidebarOrg from "./SidebarOrg";
import { BsX } from "react-icons/bs";

export default function Sidebar() {
  const { sidebarOpen, closeSidebar, sidebarPinned, pinSidebar } = useSidebar();
  const { user } = useAuth();

  useEffect(() => {
    // keep body class in sync when sidebar is programmatically opened (desktop pin)
    const applyExpanded = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 992 && sidebarOpen)
        document.body.classList.add("sidebar-expanded");
      else document.body.classList.remove("sidebar-expanded");
    };

    applyExpanded();
    const onResize = () => applyExpanded();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [sidebarOpen]);

  const handleLinkClick = () => {
    try {
      // On desktop, pin the sidebar when a link is clicked so it stays open
      if (window.innerWidth >= 992) pinSidebar();
      else closeSidebar(); // on mobile keep the previous behavior (close)
    } catch {
      // fallback to closing if window isn't available
      closeSidebar();
    }
  };

  const renderSidebar = () => {
    if (user?.roles.includes("admin"))
      return <SidebarAdmin onLinkClick={handleLinkClick} />;

    if (user?.roles.includes("employee"))
      return <SidebarEmployee onLinkClick={handleLinkClick} />;

    if (
      user?.roles.includes("organization") ||
      user?.roles.includes("sub-org-admin")
    )
      return <SidebarOrg onLinkClick={handleLinkClick} />;

    return null;
  };

  return (
    <nav
      className={`app-sidebar ${sidebarOpen ? "sidebar-open" : ""} ${
        sidebarPinned ? "sidebar-pinned" : ""
      }`}
      onMouseEnter={() => {
        if (window.innerWidth >= 992 && !sidebarPinned)
          document.body.classList.add("sidebar-expanded");
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 992 && !sidebarPinned)
          document.body.classList.remove("sidebar-expanded");
      }}
    >
      {/* Close button mobile only */}
      <button className="sidebar-close-btn d-lg-none" onClick={closeSidebar}>
        <BsX size={28} />
      </button>

      {renderSidebar()}
    </nav>
  );
}
