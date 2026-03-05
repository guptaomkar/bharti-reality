import React, { useContext, useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getHavenProperty } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import "./Property.css";
import { motion, useScroll, useTransform } from "framer-motion";

// Icons
import { IoBedOutline, IoWaterOutline, IoArrowBackOutline } from "react-icons/io5";
import { BsGridFill } from "react-icons/bs";
import { FaParking, FaPhone, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { MdLocationPin, MdCalendarToday } from "react-icons/md";
import { AiOutlineExpand } from "react-icons/ai";

import CinematicHero from "../../components/CinematicHero/CinematicHero";
import BookingModal from "../../components/BookingModal/BookingModal";
import Heart from "../../components/Heart/Heart";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth } from "../../context/AuthContext";
import UserDetailContext from "../../context/UserDetailContext";
import { STATIC_PROPERTIES } from "../../data/properties";

const STATUS_LABEL = { "for-sale": "For Sale", "for-rent": "For Rent", "sold": "Sold", "off-market": "Off Market" };
const formatPrice = (p) => {
  if (!p) return "Price on request";
  const val = typeof p === "object" ? p.amount : p;
  const sym = { INR: "₹", USD: "$", EUR: "€", AED: "AED", GBP: "£" }[p.currency || "INR"] || "₹";
  const suffix = (p.priceType || p.status) === "for-rent" ? "/mo" : "";
  if (val >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M${suffix}`;
  if (val >= 1_000) return `${sym}${(val / 1_000).toFixed(0)}K${suffix}`;
  return `${sym}${Number(val).toLocaleString()}${suffix}`;
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ photos, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length, onClose]);

  return (
    <motion.div
      className="lb-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="lb-content"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lb-close" onClick={onClose}>✕</button>
        <button className="lb-arrow lb-arrow--left" onClick={() => setIdx((i) => (i - 1 + photos.length) % photos.length)}>‹</button>
        <motion.img
          key={idx}
          src={photos[idx]}
          alt={`Photo ${idx + 1}`}
          className="lb-img"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        />
        <button className="lb-arrow lb-arrow--right" onClick={() => setIdx((i) => (i + 1) % photos.length)}>›</button>
        <div className="lb-counter">{idx + 1} / {photos.length}</div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Property = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // Parallax
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Lightbox
  const [lbOpen, setLbOpen] = useState(false);
  const [lbStart, setLbStart] = useState(0);
  const openLightbox = (i) => { setLbStart(i); setLbOpen(true); };

  // Booking
  const [modalOpened, setModalOpened] = useState(false);
  const { validateLogin } = useAuthCheck();
  const { user, token } = useAuth();
  const { userDetails: { bookings } } = useContext(UserDetailContext);

  // Fetch from new API, fall back to static
  const { data: apiData, isLoading, isError } = useQuery(
    ["havenProperty", propertyId],
    () => getHavenProperty(propertyId),
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  // Resolve data — try new API, then static fallback by slug/id
  const raw = apiData || (isError ? STATIC_PROPERTIES.find(
    (p) => p.slug === propertyId || p.id === propertyId
  ) : null);

  const data = raw ? {
    ...raw,
    coverImage: raw.media?.coverImage || raw.image || "",
    photos: raw.media?.photos || [],
    title: raw.title || "",
    priceFormatted: formatPrice(raw.price),
    statusLabel: STATUS_LABEL[raw.status] || raw.status || "",
    type: raw.type || "",
    beds: raw.details?.bedrooms || raw.facilities?.bedrooms || 0,
    baths: raw.details?.bathrooms || raw.facilities?.bathrooms || 0,
    sqft: raw.details?.squareFeet || 0,
    parking: raw.details?.parking || raw.facilities?.parking || raw.facilities?.parkings || 0,
    yearBuilt: raw.details?.yearBuilt || null,
    furnished: raw.details?.furnished || false,
    pool: raw.details?.pool || false,
    garage: raw.details?.garage || false,
    neighborhood: raw.location?.neighborhood || "",
    city: raw.location?.city || raw.city || "",
    country: raw.location?.country || raw.country || "",
    address: raw.location?.address || raw.address || "",
    shortDesc: raw.description?.short || raw.description || "",
    fullDesc: raw.description?.full || raw.description || "",
    amenities: raw.amenities || [],
    agent: raw.agent || {},
    videos: raw.media?.videos || [],
    // Cinematic hero
    heroMediaType: raw.media?.heroMediaType || "photo",
    heroMediaUrl: raw.media?.heroMediaUrl || "",
    virtualTourUrl: raw.media?.virtualTourUrl || "",
  } : null;

  const [descExpanded, setDescExpanded] = useState(false);

  if (isLoading && !data) {
    return (
      <div className="wrapper flexCenter" style={{ height: "100vh" }}>
        <PuffLoader color="var(--gold)" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <span className="secondaryText">Property not found.</span>
      </div>
    );
  }

  const allPhotos = [data.coverImage, ...data.photos.filter(p => p !== data.coverImage)].filter(Boolean);

  return (
    <div className="prop-page">

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lbOpen && (
        <Lightbox
          photos={allPhotos}
          startIndex={lbStart}
          onClose={() => setLbOpen(false)}
        />
      )}

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      {(data.heroMediaType === "video" || data.heroMediaType === "youtube") && data.heroMediaUrl ? (
        <CinematicHero
          heroMediaType={data.heroMediaType}
          heroMediaUrl={data.heroMediaUrl}
          title={data.title}
          priceFormatted={data.priceFormatted}
          type={data.type}
          statusLabel={data.statusLabel}
          neighborhood={data.neighborhood}
          city={data.city}
          onBookVisit={() => validateLogin() && setModalOpened(true)}
          activeBooking={bookings?.find((b) => b.id === propertyId && b.status !== "cancelled")}
        />
      ) : (
        <section className="prop-hero" ref={heroRef}>
          <motion.div className="prop-hero-bg" style={{ y: yBg }}>
            <img
              src={data.coverImage}
              alt={data.title}
              className="prop-hero-img"
            />
          </motion.div>
          <div className="prop-hero-vignette" />

          {/* Overlay content */}
          <motion.div className="prop-hero-content" style={{ opacity }}>
            {/* Back nav */}
            <Link to="/properties" className="prop-back">
              <IoArrowBackOutline /> All Properties
            </Link>

            <div className="prop-hero-bottom">
              <div className="prop-hero-badges">
                {data.type && <span className="prop-badge prop-badge--type">{data.type}</span>}
                {data.statusLabel && <span className="prop-badge prop-badge--status">{data.statusLabel}</span>}
              </div>
              <h1 className="prop-hero-title">{data.title}</h1>
              <div className="prop-hero-meta">
                <span className="prop-hero-price">{data.priceFormatted}</span>
                {data.neighborhood && (
                  <span className="prop-hero-location">
                    <MdLocationPin /> {data.neighborhood}, {data.city}
                  </span>
                )}
              </div>
            </div>

            {/* Gallery trigger */}
            <button className="prop-gallery-trigger" onClick={() => openLightbox(0)}>
              <AiOutlineExpand /> View {allPhotos.length} Photos
            </button>
          </motion.div>
        </section>
      )}

      {/* ── Photo Gallery ─────────────────────────────────────────────────── */}
      {allPhotos.length > 1 && (
        <section className="prop-gallery">
          {allPhotos.slice(0, 5).map((src, i) => (
            <div
              key={i}
              className={`prop-gallery-item${i === 0 ? " prop-gallery-item--main" : ""}`}
              onClick={() => openLightbox(i)}
            >
              <img src={src} alt={`View ${i + 1}`} loading="lazy" />
              {i === 4 && allPhotos.length > 5 && (
                <div className="prop-gallery-more">+{allPhotos.length - 5} more</div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="prop-body paddings innerWidth">

        {/* ── Left / Main column ────────────────────────────────────────── */}
        <div className="prop-main">

          {/* Quick stats bar */}
          <div className="prop-stats-bar">
            {data.beds > 0 && (
              <div className="prop-stat">
                <IoBedOutline className="prop-stat-icon" />
                <span className="prop-stat-val">{data.beds}</span>
                <span className="prop-stat-lbl">Bedrooms</span>
              </div>
            )}
            {data.baths > 0 && (
              <div className="prop-stat">
                <IoWaterOutline className="prop-stat-icon" />
                <span className="prop-stat-val">{data.baths}</span>
                <span className="prop-stat-lbl">Bathrooms</span>
              </div>
            )}
            {data.sqft > 0 && (
              <div className="prop-stat">
                <BsGridFill className="prop-stat-icon" />
                <span className="prop-stat-val">{data.sqft.toLocaleString()}</span>
                <span className="prop-stat-lbl">Square Feet</span>
              </div>
            )}
            {data.parking > 0 && (
              <div className="prop-stat">
                <FaParking className="prop-stat-icon" />
                <span className="prop-stat-val">{data.parking}</span>
                <span className="prop-stat-lbl">Parking</span>
              </div>
            )}
            {data.yearBuilt && (
              <div className="prop-stat">
                <MdCalendarToday className="prop-stat-icon" />
                <span className="prop-stat-val">{data.yearBuilt}</span>
                <span className="prop-stat-lbl">Year Built</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prop-description">
            <h2 className="haven-heading prop-section-title">About this Property</h2>
            <p className="prop-desc-short">{data.shortDesc}</p>
            {data.fullDesc && data.fullDesc !== data.shortDesc && (
              <>
                <div className={`prop-desc-full ${descExpanded ? "prop-desc-full--open" : ""}`}>
                  {data.fullDesc.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <button
                  className="prop-read-more"
                  onClick={() => setDescExpanded((v) => !v)}
                >
                  {descExpanded ? "Read less ↑" : "Read more ↓"}
                </button>
              </>
            )}
          </div>

          {/* Details grid */}
          <div className="prop-details-section">
            <h2 className="haven-heading prop-section-title">Property Details</h2>
            <div className="prop-details-grid">
              {[
                { label: "Type", value: data.type },
                { label: "Status", value: data.statusLabel },
                { label: "Bedrooms", value: data.beds || "—" },
                { label: "Bathrooms", value: data.baths || "—" },
                { label: "Area", value: data.sqft ? `${data.sqft.toLocaleString()} ft²` : "—" },
                { label: "Parking", value: data.parking > 0 ? data.parking : "—" },
                { label: "Year Built", value: data.yearBuilt || "—" },
                { label: "Furnished", value: data.furnished ? "Yes" : "No" },
                { label: "Pool", value: data.pool ? "Yes" : "No" },
                { label: "Garage", value: data.garage ? "Yes" : "No" },
                { label: "Country", value: data.country },
              ].map(({ label, value }) => (
                <div key={label} className="prop-detail-item">
                  <span className="prop-detail-label">{label}</span>
                  <span className="prop-detail-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {data.amenities.length > 0 && (
            <div className="prop-amenities-section">
              <h2 className="haven-heading prop-section-title">Amenities</h2>
              <div className="prop-amenities-grid">
                {data.amenities.map((a) => (
                  <div key={a} className="prop-amenity">
                    <FaCheckCircle className="prop-amenity-icon" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {data.videos.length > 0 && (
            <div className="prop-videos-section">
              <h2 className="haven-heading prop-section-title">Video Tour</h2>
              <div className="prop-videos-wrap">
                {data.videos.map((src, i) => (
                  <video key={i} src={src} controls className="prop-video" />
                ))}
              </div>
            </div>
          )}

          {/* Virtual Tour */}
          {data.virtualTourUrl && (
            <div className="prop-vt-section">
              <h2 className="haven-heading prop-section-title">Virtual Tour</h2>
              <div className="prop-vt-wrap">
                <iframe
                  src={
                    data.virtualTourUrl.includes("youtube.com") || data.virtualTourUrl.includes("youtu.be")
                      ? `https://www.youtube.com/embed/${data.virtualTourUrl.match(/[?&]v=([^&]+)/)?.[1] ||
                      data.virtualTourUrl.match(/youtu\.be\/([^?&]+)/)?.[1] ||
                      data.virtualTourUrl.match(/embed\/([^?&]+)/)?.[1] ||
                      ""
                      }`
                      : data.virtualTourUrl
                  }
                  title="Virtual Tour"
                  allowFullScreen
                  className="prop-vt-iframe"
                />
              </div>
            </div>
          )}


          {/* Location */}
          <div className="prop-location-section">
            <h2 className="haven-heading prop-section-title">Location</h2>
            <div className="prop-location-info">
              <MdLocationPin className="prop-location-icon" />
              <span className="secondaryText">{data.address}, {data.city}, {data.country}</span>
            </div>
          </div>
        </div>

        {/* ── Right / Agent Sidebar ──────────────────────────────────────── */}
        <div className="prop-sidebar">
          <div className="prop-agent-card">
            <div className="prop-agent-header">
              {data.agent.photo ? (
                <img src={data.agent.photo} alt={data.agent.name} className="prop-agent-photo" />
              ) : (
                <div className="prop-agent-photo-placeholder">
                  {data.agent.name?.[0] || "A"}
                </div>
              )}
              <div className="prop-agent-info">
                <span className="prop-agent-name">{data.agent.name || "HAVEN Agent"}</span>
                {data.agent.license && (
                  <span className="prop-agent-license">Lic. {data.agent.license}</span>
                )}
              </div>
            </div>

            {/* Favourite Heart */}
            <div className="prop-heart-row">
              <Heart id={raw?._id || raw?.id || propertyId} />
              <span className="prop-heart-label">Save to Favourites</span>
            </div>

            <div className="prop-agent-contacts">
              {data.agent.phone && (
                <a href={`tel:${data.agent.phone}`} className="prop-agent-contact">
                  <FaPhone className="prop-agent-contact-icon" />
                  {data.agent.phone}
                </a>
              )}
              {data.agent.email && (
                <a href={`mailto:${data.agent.email}`} className="prop-agent-contact">
                  <FaEnvelope className="prop-agent-contact-icon" />
                  {data.agent.email}
                </a>
              )}
            </div>

            {/* Booking Status & Actions */}
            {(() => {
              const activeBooking = bookings?.find((b) => b.id === propertyId && b.status !== "cancelled");

              if (!activeBooking) {
                return (
                  <button
                    className="button prop-schedule-btn"
                    onClick={() => validateLogin() && setModalOpened(true)}
                  >
                    Schedule a Viewing
                  </button>
                );
              }

              return (
                <div className={`prop-booking-status status-${activeBooking.status}`}>
                  <div className="prop-booking-status-header">
                    {activeBooking.status === "pending" && "🟡 Request Pending"}
                    {activeBooking.status === "confirmed" && "🟢 Visit Confirmed"}
                    {activeBooking.status === "completed" && "✓ Visit Completed"}
                  </div>
                  <p className="prop-booking-status-date">
                    Scheduled for {activeBooking.date}
                  </p>
                  {activeBooking.status === "pending" && (
                    <p className="prop-booking-status-sub">
                      An agent will confirm your visit shortly.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Price sticky */}
          <div className="prop-price-panel">
            <span className="haven-label">Asking Price</span>
            <span className="prop-price-large">{data.priceFormatted}</span>
          </div>
        </div>

      </div>

      <BookingModal
        opened={modalOpened}
        setOpened={setModalOpened}
        propertyId={propertyId}
        email={user?.email}
      />
    </div>
  );
};

export default Property;
