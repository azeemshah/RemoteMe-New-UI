import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import HomePageEleven from "./pages/HomePageEleven";
import SignInPage from "./pages/SignInPage"; // <-- Your Sign-in page
import RouteScrollToTop from "./helper/RouteScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/index-11" element={<HomePageEleven />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
