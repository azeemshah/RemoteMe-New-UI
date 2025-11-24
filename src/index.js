import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// --- START: Authentication and Context Imports from Project A's main.jsx ---
// NOTE: You must ensure 'Authcontext.js', 'SidebarContext.js', 'NotificationsContext.js'
// and the 'notistack' library are present in Project B.
import { AuthProvider } from "./contexts/Authcontext";
import { SidebarProvider } from "./components/SidebarContext";
import { SnackbarProvider } from "notistack";
import { NotificationsProvider } from "./contexts/NotificationsContext";
// --- END: Authentication and Context Imports ---

// Existing Style Imports
import "react-quill/dist/quill.snow.css";
import "jsvectormap/dist/css/jsvectormap.css";
import "react-toastify/dist/ReactToastify.css";
import "react-modal-video/css/modal-video.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// jQuery + plugins
import $ from "jquery";
window.$ = window.jQuery = $;

// App
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* --- START: Wrapping the App with Context Providers from Project A --- */}
    <AuthProvider>
      <HelmetProvider>
        <SidebarProvider>
          <NotificationsProvider>
            <SnackbarProvider
              autoHideDuration={5000}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <App />
            </SnackbarProvider>
          </NotificationsProvider>
        </SidebarProvider>
      </HelmetProvider>
    </AuthProvider>
    {/* --- END: Wrapping the App with Context Providers --- */}
  </React.StrictMode>
);

reportWebVitals();
