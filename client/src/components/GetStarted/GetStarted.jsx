import React from "react";
import "./GetStarted.css";

const GetStarted = () => {
  return (
    <div id="get-started" className="g-wrapper">
      <div className="paddings innerWidth g-container">
        <div className="g-inner">
          <span className="haven-label g-eyebrow">Begin Your Journey</span>
          <h2 className="haven-heading g-heading">
            Get Started with <br />
            <img src="/logo.png" alt="Bharti Realty" className="g-logo-img" />
          </h2>
          <p className="secondaryText g-sub">
            Subscribe and receive priority access to extraordinary residences —<br />
            curated for those who define their own altitude.
          </p>
          <button className="button g-btn">
            <a href="mailto:contact@haven.com" style={{ color: "inherit", textDecoration: "none" }}>
              Enquire Now
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
