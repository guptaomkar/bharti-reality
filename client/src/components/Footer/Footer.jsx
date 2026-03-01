import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const STATS = [
  { value: "5+", label: "Years of Excellence" },
  { value: "320+", label: "Properties Sold" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "₹2B+", label: "Total Transactions" },
];

const SERVICES = [
  "Luxury Residential",
  "Commercial Spaces",
  "Property Investment",
  "Interior Consultation",
  "Legal & Documentation",
  "NRI Services",
];

const Footer = () => {
  return (
    <footer className="f-wrapper">
      <div className="f-top-line" />

      {/* ── STATS STRIP ── */}
      <div className="f-stats-strip">
        <div className="paddings innerWidth f-stats-inner">
          {STATS.map((s, i) => (
            <div className="f-stat" key={i}>
              <span className="f-stat-value">{s.value}</span>
              <span className="f-stat-label">{s.label}</span>
              {i < STATS.length - 1 && <div className="f-stat-divider" />}
            </div>
          ))}
        </div>
      </div>

      <div className="f-mid-line" />

      {/* ── MAIN FOOTER GRID ── */}
      <div className="paddings innerWidth f-container">

        {/* Col 1 — Brand */}
        <div className="f-col f-col--brand">
          <img src="/logo.png" alt="Bharti Realty" className="f-logo-img" />
          <p className="f-tagline">
            Where architecture meets eternity.<br />
            Curated residences for those who<br />define their own gravity.
          </p>
          <div className="f-social-row">
            <a href="#" className="f-social" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="#" className="f-social" aria-label="LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="3" /><path d="M7 10v7M7 7v.01M12 17v-4a2 2 0 014 0v4M12 10v7" /></svg>
            </a>
            <a href="#" className="f-social" aria-label="WhatsApp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>
            </a>
            <a href="#" className="f-social" aria-label="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="4" /><polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" /></svg>
            </a>
          </div>
        </div>

        {/* Col 2 — Quick Links */}
        <div className="f-col">
          <h4 className="f-col-title">Navigate</h4>
          <nav className="f-links">
            <Link to="/properties" className="f-link">All Properties</Link>
            <a href="#residencies" className="f-link">Featured Listings</a>
            <a href="#value" className="f-link">Our Services</a>
            <a href="#contact-us" className="f-link">About Us</a>
            <a href="#contact-us" className="f-link">Contact</a>
            <Link to="/admin/add-property" className="f-link">List a Property</Link>
          </nav>
        </div>

        {/* Col 3 — Services */}
        <div className="f-col">
          <h4 className="f-col-title">Services</h4>
          <ul className="f-links">
            {SERVICES.map((s, i) => (
              <li key={i} className="f-link f-link--service">
                <span className="f-link-dot" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Contact */}
        <div className="f-col">
          <h4 className="f-col-title">Find Us</h4>
          <div className="f-contact-list">
            <div className="f-contact-item">
              <svg className="f-contact-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>Ekta Nagar, Kandivali West,<br />Mumbai, Maharashtra 400067</span>
            </div>
            <div className="f-contact-item">
              <svg className="f-contact-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
              <a href="tel:+919876543210" className="f-contact-link">+91 9702973178</a>
            </div>
            <div className="f-contact-item">
              <svg className="f-contact-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              <a href="mailto:info@bhartirealty.com" className="f-contact-link">bhartimandal48@gmail.com</a>
            </div>
            <div className="f-contact-item">
              <svg className="f-contact-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>
              <span>Mon – Sat &nbsp;·&nbsp; 10:00 – 19:00</span>
            </div>
          </div>

          {/* RERA Badge */}
          {/* <div className="f-rera">
            <span className="f-rera-badge">RERA</span>
            <span className="f-rera-text">Registered Agent<br />MahaRERA No. P51800012345</span>
          </div> */}
        </div>

      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="f-bottom">
        <div className="paddings innerWidth f-bottom-inner">
          <span className="f-copyright">
            © {new Date().getFullYear()} Bharti Realty. All rights reserved.
          </span>
          <div className="f-bottom-links">
            <a href="#" className="f-bottom-link">Privacy Policy</a>
            <span className="f-bottom-sep">·</span>
            <a href="#" className="f-bottom-link">Terms of Use</a>
            <span className="f-bottom-sep">·</span>
            <a href="#" className="f-bottom-link">Disclaimer</a>
          </div>
          <span className="f-crafted">Crafted with precision in Mumbai</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;