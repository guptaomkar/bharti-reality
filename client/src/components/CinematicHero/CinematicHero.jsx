import React, { useEffect, useRef } from "react";
import "./CinematicHero.css";
import { Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdLocationPin } from "react-icons/md";

/**
 * CinematicHero — full-viewport cinematic hero.
 * Supports:
 *  - Uploaded video URL  (heroMediaType === "video")
 *  - YouTube embed URL   (heroMediaType === "youtube")
 */

/** Extract a clean video ID from any YouTube URL format */
const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/embed\/)([^?&/]+)/,
        /(?:youtube\.com\/watch\?.*v=)([^&]+)/,
        /(?:youtu\.be\/)([^?&]+)/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
};

const CinematicHero = ({
    heroMediaUrl,
    heroMediaType,
    title,
    priceFormatted,
    type,
    statusLabel,
    neighborhood,
    city,
    onBookVisit,
    activeBooking,
}) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    // ── Intersection Observer for uploaded video ─────────────────────────────
    useEffect(() => {
        if (heroMediaType !== "video" || !videoRef.current) return;
        const video = videoRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) video.play().catch(() => { });
                else video.pause();
            },
            { threshold: 0.2 }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [heroMediaType]);

    const isYouTube = heroMediaType === "youtube";
    const ytId = isYouTube ? getYouTubeId(heroMediaUrl) : null;

    // Build a safe YouTube embed src with autoplay + mute + loop
    const ytSrc = ytId
        ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&showinfo=0`
        : null;

    return (
        <section className="cin-hero" ref={containerRef}>
            {/* ── Media layer ───────────────────────────────────────────── */}
            {isYouTube ? (
                ytSrc ? (
                    <iframe
                        className="cin-hero-iframe"
                        src={ytSrc}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title={title}
                        frameBorder="0"
                    />
                ) : (
                    // Fallback: show a dark placeholder if ID extraction fails
                    <div className="cin-hero-yt-fallback">
                        <span>Video unavailable</span>
                    </div>
                )
            ) : (
                <video
                    ref={videoRef}
                    className="cin-hero-video"
                    src={heroMediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            )}

            {/* ── Gradient overlays ─────────────────────────────────────── */}
            <div className="cin-hero-gradient" />
            <div className="cin-hero-gradient-bottom" />

            {/* ── Content overlay ───────────────────────────────────────── */}
            <div className="cin-hero-content">
                <Link to="/properties" className="cin-back">
                    <IoArrowBackOutline /> All Properties
                </Link>

                <div className="cin-hero-info">
                    <div className="cin-badges">
                        {type && <span className="cin-badge cin-badge--type">{type}</span>}
                        {statusLabel && <span className="cin-badge cin-badge--status">{statusLabel}</span>}
                    </div>

                    <h1 className="cin-title">{title}</h1>

                    <div className="cin-meta">
                        <span className="cin-price">{priceFormatted}</span>
                        {(neighborhood || city) && (
                            <span className="cin-location">
                                <MdLocationPin />
                                {neighborhood ? `${neighborhood}, ` : ""}{city}
                            </span>
                        )}
                    </div>

                    {!activeBooking ? (
                        <button className="cin-book-btn button" onClick={onBookVisit}>
                            Book a Visit
                        </button>
                    ) : (
                        <div className={`cin-booking-status status--${activeBooking.status}`}>
                            {activeBooking.status === "pending" && "Booking Requested"}
                            {activeBooking.status === "confirmed" && "Visit Confirmed"}
                            {activeBooking.status === "completed" && "Visit Completed"}
                            {activeBooking.status === "rejected" && "Visit Rejected"}
                            {activeBooking.status === "cancelled" && "Visit Cancelled"}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CinematicHero;
