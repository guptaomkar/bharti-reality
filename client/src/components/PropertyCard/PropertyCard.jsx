import React from "react";
import "./PropertyCard.css";
import { useNavigate } from "react-router-dom";
import { IoBedOutline, IoWaterOutline } from "react-icons/io5";
import { BsGridFill } from "react-icons/bs";
import { FaParking } from "react-icons/fa";
import { motion } from "framer-motion";
import Heart from "../Heart/Heart";

// Status badge colours
const STATUS_LABELS = {
  "for-sale": "For Sale",
  "for-rent": "For Rent",
  "sold": "Sold",
  "off-market": "Off Market",
};

const TYPE_LABELS = {
  penthouse: "Penthouse",
  villa: "Villa",
  apartment: "Apartment",
  loft: "Loft",
  mansion: "Mansion",
  townhouse: "Townhouse",
  cottage: "Cottage",
  estate: "Estate",
  chalet: "Chalet",
};

const formatPrice = (card) => {
  const val = card.priceObj?.amount || card.price || 0;
  const currency = card.priceObj?.currency || "INR";
  const priceType = card.priceObj?.priceType || card.status;

  const sym = { INR: "₹", EUR: "€", AED: "AED", GBP: "£", USD: "$" }[currency] || "₹";
  const suffix = priceType === "for-rent" ? "/mo" : "";

  if (val >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M${suffix}`;
  if (val >= 1_000) return `${sym}${(val / 1_000).toFixed(0)}K${suffix}`;
  return `${sym}${val.toLocaleString()}${suffix}`;
};

const PropertyCard = ({ card, index = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const dest = card.slug || card.id || card._id;
    navigate(`/properties/${dest}`);
  };

  return (
    <motion.div
      className="r-card"
      onClick={handleClick}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.08,
      }}
    >
      {/* Image area */}
      <div className="r-card-img-wrap">
        <img
          src={card.listingImage || card.image || card.media?.coverImage}
          alt={card.title}
          className="r-card-img"
          loading="lazy"
        />
        <div className="r-card-img-overlay" />

        {/* Heart favourite */}
        <div className="r-card-heart" onClick={(e) => e.stopPropagation()}>
          <Heart id={card._id || card.id || card.slug} />
        </div>

        {/* Badges */}
        <div className="r-card-badges">
          {card.type && (
            <span className="r-card-type-badge">
              {TYPE_LABELS[card.type] || card.type}
            </span>
          )}
          {card.status && (
            <span className={`r-card-status-badge r-card-status-badge--${card.status}`}>
              {STATUS_LABELS[card.status] || card.status}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="r-card-body">
        {/* Price */}
        <span className="r-card-price">{formatPrice(card)}</span>

        {/* Title */}
        <span className="r-card-title">{card.title}</span>

        {/* Location */}
        {(card.neighborhood || card.city) && (
          <span className="r-card-location">
            {card.neighborhood ? `${card.neighborhood}, ` : ""}{card.city}
          </span>
        )}

        {/* Stats */}
        <div className="r-card-stats">
          {card.facilities?.bedrooms > 0 && (
            <span className="r-card-stat">
              <IoBedOutline className="r-card-stat-icon" />
              {card.facilities.bedrooms}
            </span>
          )}
          {card.facilities?.bathrooms > 0 && (
            <span className="r-card-stat">
              <IoWaterOutline className="r-card-stat-icon" />
              {card.facilities.bathrooms}
            </span>
          )}
          {card.facilities?.squareFeet > 0 && (
            <span className="r-card-stat">
              <BsGridFill className="r-card-stat-icon" />
              {card.facilities.squareFeet?.toLocaleString()} ft²
            </span>
          )}
          {card.facilities?.parking > 0 && (
            <span className="r-card-stat">
              <FaParking className="r-card-stat-icon" />
              {card.facilities.parking}P
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
