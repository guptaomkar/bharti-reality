import { Suspense, useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout/Layout";
import Website from "./pages/Website";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Properties from "./pages/Properties/Properties";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Property from "./pages/Property/Property";
import UserDetailContext from "./context/UserDetailContext";
import Bookings from "./pages/Bookings/Bookings";
import Favourites from "./pages/Favourites/Favourites";
import NewProperty from "./pages/Admin/NewProperty";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminProperties from "./pages/Admin/AdminProperties";
import EditProperty from "./pages/Admin/EditProperty";
import AdminUsers from "./pages/Admin/AdminUsers";
import { useLocation } from "react-router-dom";

/* ─── Scroll Restoration ─────────────────────────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    setTimeout(() => window.scrollTo(0, 0), 100);
  }, [pathname]);
  return null;
}

/* ─── Gold Cursor ──────────────────────────────────────────────────────────── */
function HavenCursor() {
  useEffect(() => {
    const dot = document.getElementById("haven-cursor-dot");
    const ring = document.getElementById("haven-cursor-ring");
    if (!dot || !ring) return;

    const move = (e) => {
      const x = e.clientX, y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div id="haven-cursor-dot" />
      <div id="haven-cursor-ring" />
    </>
  );
}

function App() {
  const queryClient = new QueryClient();
  const [userDetails, setUserDetails] = useState({
    favourites: [],
    bookings: [],
    token: null,
  });

  return (
    <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
      <QueryClientProvider client={queryClient}>
        <HavenCursor />
        <BrowserRouter>
          <Suspense fallback={
            <div style={{
              display: "flex", height: "100vh", alignItems: "center",
              justifyContent: "center", background: "#080808",
              color: "#C9A96E", fontFamily: "Cormorant Garamond, serif",
              fontSize: "1.4rem", letterSpacing: "0.4em"
            }}>
              HAVEN
            </div>
          }>
            <ScrollToTop />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Website />} />
                <Route path="/properties">
                  <Route index element={<Properties />} />
                  <Route path=":propertyId" element={<Property />} />
                </Route>
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/favourites" element={<Favourites />} />
                <Route path="/admin/new-property" element={<NewProperty />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/properties" element={<AdminProperties />} />
                <Route path="/admin/edit-property/:id" element={<EditProperty />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <ToastContainer theme="dark" />
      </QueryClientProvider >
    </UserDetailContext.Provider >
  );
}

export default App;
