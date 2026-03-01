import React from "react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import "./Residencies.css";
import { sliderSettings } from "../../utils/common";
import PropertyCard from "../PropertyCard/PropertyCard";
import useHavenProperties from "../../hooks/useHavenProperties";
import { PuffLoader } from "react-spinners";
import { motion } from "framer-motion";

const Residencies = () => {
  const { data, isLoading } = useHavenProperties();

  const featured = data?.filter((p) => p.featured) || [];
  const all = data || [];

  if (isLoading) {
    return (
      <div className="r-wrapper flexCenter" style={{ height: "40vh" }}>
        <PuffLoader height="80" width="80" radius={1} color="var(--gold)" aria-label="loading" />
      </div>
    );
  }

  return (
    <div id="residencies" className="r-wrapper">
      <div className="paddings innerWidth r-container">

        {/* Section header */}
        <div className="r-head">
          <span className="haven-label">Portfolio</span>
          <span className="primaryText" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            Curated <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Residencies</em>
          </span>
        </div>

        {/* ── Featured Hero Grid ─────────────────────────────────────────── */}
        {featured.length > 0 && (
          <div className="r-featured-section">
            <span className="haven-label r-featured-label">Featured</span>
            <div className="r-featured-grid">
              {featured.slice(0, 4).map((card, i) => (
                <div
                  key={card.id}
                  className={`r-featured-item${i === 0 ? " r-featured-item--large" : ""}`}
                >
                  <PropertyCard card={card} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Swiper Carousel ────────────────────────────────────────────── */}
        <div className="r-carousel-section">
          <span className="haven-label">All Properties</span>
          <Swiper {...sliderSettings}>
            <SlideNextButton />
            {all.slice(0, 10).map((card, i) => (
              <SwiperSlide key={card.id || i}>
                <PropertyCard card={card} index={i} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </div>
  );
};

export default Residencies;

const SlideNextButton = () => {
  const swiper = useSwiper();
  return (
    <div className="r-buttons">
      <button className="r-btn" onClick={() => swiper.slidePrev()}>&#8592;</button>
      <button className="r-btn" onClick={() => swiper.slideNext()}>&#8594;</button>
    </div>
  );
};
