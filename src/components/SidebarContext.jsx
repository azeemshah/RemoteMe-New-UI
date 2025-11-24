import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();
export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  // initialize from localStorage so pinned state persists across reloads
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarOpen");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const [sidebarPinned, setSidebarPinned] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarPinned");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const pinSidebar = () => setSidebarPinned(true);
  const unpinSidebar = () => setSidebarPinned(false);
  const togglePin = () => setSidebarPinned((p) => !p);

  // persist pinned state
  useEffect(() => {
    try {
      localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false");
    } catch {
      // ignore
    }
  }, [sidebarOpen]);

  // Overlay for mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 992)
      document.body.classList.add("sidebar-backdrop");
    else document.body.classList.remove("sidebar-backdrop");
  }, [sidebarOpen]);

  // persist pinned state and update body classes
  useEffect(() => {
    try {
      localStorage.setItem("sidebarPinned", sidebarPinned ? "true" : "false");
    } catch {
      // ignore
    }

    if (sidebarPinned) {
      document.body.classList.add("sidebar-pinned");
      // keep expanded when pinned
      setSidebarOpen(true);
      document.body.classList.add("sidebar-expanded");
    } else {
      document.body.classList.remove("sidebar-pinned");
      // when unpinned, collapse on desktop
      if (window.innerWidth >= 992) setSidebarOpen(false);
      document.body.classList.remove("sidebar-expanded");
    }
  }, [sidebarPinned]);

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        closeSidebar,
        sidebarPinned,
        togglePin,
        pinSidebar,
        unpinSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
