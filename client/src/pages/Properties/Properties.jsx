import React, { useState, useCallback, useEffect } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./Properties.css";
import useHavenProperties from "../../hooks/useHavenProperties";
import { PuffLoader } from "react-spinners";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";

const TYPES = ["penthouse", "villa", "apartment", "loft", "mansion", "townhouse", "chalet", "estate"];
const STATUSES = ["for-sale", "for-rent"];
const CITIES = ["New York", "Los Angeles", "San Francisco", "Miami", "Aspen", "Washington"];

const Properties = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [textFilter, setTextFilter] = useState(searchParams.get("q") || "");

  // Sync URL ?q= into text filter on mount / URL change
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setTextFilter(q);
  }, [searchParams]);

  const { data, isLoading, usingFallback } = useHavenProperties(filters);

  const handleFilter = useCallback((key, val) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (!val) delete next[key]; else next[key] = val;
      return next;
    });
  }, []);

  const clearFilters = () => { setFilters({}); setTextFilter(""); };

  // Apply text search on top of API filters
  const displayed = (data || []).filter((p) => {
    if (!textFilter) return true;
    const q = textFilter.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.country?.toLowerCase().includes(q) ||
      p.neighborhood?.toLowerCase().includes(q)
    );
  });

  const featured = displayed.filter((p) => p.featured);
  const rest = displayed.filter((p) => !p.featured);

  return (
    <div className="wrapper props-page">
      <div className="paddings innerWidth props-container">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="props-header">
          <span className="haven-label">Our Listings</span>
          <h1 className="haven-heading props-title">
            All Properties
          </h1>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────────────── */}
        <div className="props-filter-bar">
          <SearchBar filter={textFilter} setFilter={setTextFilter} />

          <div className="props-filter-selects">
            {/* Status */}
            <select
              className="props-filter-select"
              value={filters.status || ""}
              onChange={(e) => handleFilter("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === "for-sale" ? "For Sale" : "For Rent"}</option>
              ))}
            </select>

            {/* Type */}
            <select
              className="props-filter-select"
              value={filters.type || ""}
              onChange={(e) => handleFilter("type", e.target.value)}
            >
              <option value="">All Types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>

            {/* City */}
            <select
              className="props-filter-select"
              value={filters.city || ""}
              onChange={(e) => handleFilter("city", e.target.value)}
            >
              <option value="">All Cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Min Price */}
            <input
              className="props-filter-input"
              type="number"
              placeholder="Min Price (₹)"
              value={filters.minPrice || ""}
              onChange={(e) => handleFilter("minPrice", e.target.value)}
            />
            <input
              className="props-filter-input"
              type="number"
              placeholder="Max Price (₹)"
              value={filters.maxPrice || ""}
              onChange={(e) => handleFilter("maxPrice", e.target.value)}
            />

            {/* Clear */}
            {(Object.keys(filters).length > 0 || textFilter) && (
              <button className="props-clear-btn" onClick={clearFilters}>
                Clear ×
              </button>
            )}
          </div>

          {usingFallback && (
            <p className="props-fallback-note">
              Showing offline data — backend may be unavailable.
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flexCenter" style={{ height: "40vh" }}>
            <PuffLoader height="80" width="80" radius={1} color="var(--gold)" />
          </div>
        )}

        {/* Featured section */}
        {!isLoading && featured.length > 0 && (
          <section className="props-featured-section">
            <span className="haven-label">Featured</span>
            <div className="props-featured-grid">
              {featured.map((card, i) => (
                <PropertyCard key={card.id} card={card} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* All properties grid */}
        {!isLoading && (
          <section className="props-section">
            {rest.length > 0 || featured.length === 0 ? (
              <AnimatePresence>
                <div className="props-grid">
                  {(rest.length > 0 ? rest : displayed).map((card, i) => (
                    <PropertyCard key={card.id || i} card={card} index={i} />
                  ))}
                </div>
              </AnimatePresence>
            ) : null}

            {displayed.length === 0 && !isLoading && (
              <div className="flexCenter" style={{ height: "30vh" }}>
                <span className="secondaryText">No properties match your filters.</span>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
};

export default Properties;
