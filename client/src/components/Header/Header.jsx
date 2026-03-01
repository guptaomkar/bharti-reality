import React, { useState } from "react";
import "./Header.css";
import { BiMenuAltRight } from "react-icons/bi";
import { getMenuStyles } from "../../utils/common";
import useHeaderColor from "../../hooks/useHeaderColor";
import OutsideClickHandler from "react-outside-click-handler";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import AuthModal from "../AuthModal/AuthModal";

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const headerColor = useHeaderColor();

  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const scrolled = headerColor && headerColor !== "none" && headerColor !== false;

  return (
    <>
      <section className={`h-wrapper${scrolled ? " h-wrapper--scrolled" : ""}`}>
        <div className="innerWidth paddings h-container">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link to="/" className="h-logo" aria-label="Bharti Realty — Home">
            <img src="/logo.png" alt="Bharti Realty" className="h-logo-img" />
          </Link>

          {/* Desktop Menu */}
          <OutsideClickHandler onOutsideClick={() => setMenuOpened(false)}>
            <nav className="h-menu" style={getMenuStyles(menuOpened)}>

              <NavLink to="/properties" className="h-nav-link">Properties</NavLink>

              {/* Authenticated Links */}
              {isAuthenticated && (
                <NavLink to={isAdmin ? "/admin/bookings" : "/bookings"} className="h-nav-link">
                  Bookings
                </NavLink>
              )}

              {/* Admin-only Panel */}
              {isAdmin && (
                <NavLink to="/admin/new-property" className="h-nav-link">
                  Add Property
                </NavLink>
              )}

              {!isAuthenticated ? (
                <button className="h-login-btn" onClick={() => setAuthOpen(true)}>
                  Login
                </button>
              ) : (
                <ProfileMenu user={user} logout={logout} />
              )}
            </nav>
          </OutsideClickHandler>

          {/* Mobile hamburger */}
          <div className="h-menu-icon" onClick={() => setMenuOpened((p) => !p)}>
            <BiMenuAltRight size={26} color="var(--gold)" />
          </div>
        </div>
      </section>

      {/* Auth Modal — rendered outside header so it's always on top */}
      <AuthModal opened={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
