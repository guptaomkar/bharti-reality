import { useEffect, useRef, useState } from "react";
import "./Hero.css";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import SearchBar from "../SearchBar/SearchBar";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { getHeroCards } from "../../utils/api";

/* ─── Stagger animation variants ─────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay },
});

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch dynamic hero cards from admin
  const { data: apiCards } = useQuery("publicHeroCards", getHeroCards, { 
    refetchOnWindowFocus: false,
    retry: 1
  });
  const videoWrapRef = useRef(null);
  const grainRef = useRef(null);
  const particleRef = useRef(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  /* ── Mouse parallax ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      tiltRef.current = { x: nx * 11, y: ny * 7 };
    };
    window.addEventListener("mousemove", handleMove);
    const tick = () => {
      if (videoWrapRef.current) {
        videoWrapRef.current.style.transform =
          `translate(${tiltRef.current.x}px, ${tiltRef.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Film Grain ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, timer;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const img = ctx.createImageData(W, H);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 22;
      }
      ctx.putImageData(img, 0, 0);
      timer = setTimeout(draw, 80);
    };
    draw();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── Particles ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = particleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, raf;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = (a, b) => a + Math.random() * (b - a);
    const particles = Array.from({ length: 60 }, () => ({
      x: rand(0, 1), y: rand(0, 1),
      vy: rand(0.15, 0.6),
      size: rand(0.8, 2.2),
      alpha: 0, maxAlpha: rand(0.3, 0.75),
      dir: 1,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.y -= p.vy / H * 1.8;
        if (p.y < 0) { p.y = 1.02; p.x = Math.random(); p.vy = rand(0.15, 0.6); }

        if (p.dir === 1 && p.alpha < p.maxAlpha) p.alpha += 0.008;
        else if (p.dir === 1) p.dir = -1;
        if (p.dir === -1 && p.alpha > 0) p.alpha -= 0.004;
        else if (p.dir === -1 && p.alpha <= 0) { p.dir = 1; p.y = 1.02; p.x = Math.random(); }

        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${p.alpha})`;
        ctx.fill();

        const g = ctx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, p.size * 4);
        g.addColorStop(0, `rgba(201,169,110,${p.alpha * 0.25})`);
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section className="hero-section">

      {/* ── Video / Fallback ─────────────────────────────────────────────── */}
      <div className="hero-video-wrap" ref={videoWrapRef}>
        <div className="hero-video-fallback" />
        <video
          className="hero-video"
          src="/travel_video.mp4"
          autoPlay muted loop playsInline
        />
      </div>

      {/* ── Layers ───────────────────────────────────────────────────────── */}
      <div className="hero-vignette" />
      <div className="hero-light-leak" />
      <canvas className="hero-grain" ref={grainRef} />
      <div className="hero-scanlines" />
      <div className="hero-grid" />

      {/* Depth lines */}
      <div className="hero-depth-line hero-depth-line--1" />
      <div className="hero-depth-line hero-depth-line--2" />
      <div className="hero-depth-line hero-depth-line--3" />

      {/* Particles */}
      <canvas className="hero-particles" ref={particleRef} />


      {/* ── Floating Price Cards ─────────────────────────────────────────── */}
      {(() => {
        const hasApiCards = apiCards && apiCards.length > 0;
        
        if (hasApiCards) {
          return apiCards.map((c, i) => (
            <div 
              key={c._id || i}
              className="hero-glass-card" 
              style={{ left: c.position?.left || "10%", bottom: c.position?.bottom || "10%", "--cdur": `${c.animation?.duration || 10}s`, "--cdel": `${c.animation?.delay || 0}s` }}
            >
              <span className="hgc-city">{c.city}</span>
              <span className="hgc-price">{c.price}</span>
              <span className="hgc-type">{c.propertyType && c.propertyType.charAt(0).toUpperCase() + c.propertyType.slice(1)}</span>
            </div>
          ));
        }

        // Fallback to static cards if no API cards exist or API fails
        return (
          <>
            <div className="hero-glass-card" style={{ left: "72%", bottom: "22%", "--cdur": "10s", "--cdel": "0s" }}>
              <span className="hgc-city">South Mumbai, MH</span>
              <span className="hgc-price">₹ 18.5 Cr</span>
              <span className="hgc-type">Sea-View Penthouse</span>
            </div>
            <div className="hero-glass-card" style={{ left: "7%", bottom: "32%", "--cdur": "12s", "--cdel": "2.5s" }}>
              <span className="hgc-city">Pune, MH</span>
              <span className="hgc-price">₹ 4.2 Cr</span>
              <span className="hgc-type">Koregaon Park Villa</span>
            </div>
            <div className="hero-glass-card" style={{ left: "55%", bottom: "9%", "--cdur": "8.5s", "--cdel": "5s" }}>
              <span className="hgc-city">Bandra West, MH</span>
              <span className="hgc-price">₹ 12.8 Cr</span>
              <span className="hgc-type">Seafacing Sky Loft</span>
            </div>
            <div className="hero-glass-card" style={{ left: "78%", bottom: "55%", "--cdur": "11s", "--cdel": "1.5s" }}>
              <span className="hgc-city">Lonavala, MH</span>
              <span className="hgc-price">₹ 6.9 Cr</span>
              <span className="hgc-type">Hilltop Estate</span>
            </div>
            <div className="hero-glass-card" style={{ left: "18%", bottom: "13%", "--cdur": "9.5s", "--cdel": "3.8s" }}>
              <span className="hgc-city">Nagpur, MH</span>
              <span className="hgc-price">₹ 2.1 Cr</span>
              <span className="hgc-type">Luxury Garden Residence</span>
            </div>
          </>
        );
      })()}

      {/* ── Stat Panel (top right) ───────────────────────────────────────── */}
      <motion.div className="hero-stat-panel" {...fadeUp(2.2)}>
        <div className="hero-stat-item">
          <span className="hero-stat-num">
            <CountUp start={2700} end={2847} duration={2.2} separator="," />
          </span>
          <span className="hero-stat-label">Properties</span>
        </div>
        <div className="hero-stat-item">
          <span className="hero-stat-num">
            <CountUp end={62} duration={1.6} />
          </span>
          <span className="hero-stat-label">Cities</span>
        </div>
        <div className="hero-stat-item">
          <span className="hero-stat-num">
            <CountUp end={9} decimals={1} duration={1.8} />
          </span>
          <span className="hero-stat-label">Million INR</span>
        </div>
      </motion.div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="hero-content">
        <motion.div className="hero-eyebrow" {...fadeUp(0.4)}>
          Estate · Architecture · Legacy
        </motion.div>

        <h1 className="hero-headline">
          <motion.span className="hero-headline-line" {...fadeUp(0.7)}>
            Where Silence
          </motion.span>
          <motion.span className="hero-headline-line" {...fadeUp(0.95)}>
            Meets <em>Boundless</em>
          </motion.span>
          <motion.span className="hero-headline-line" {...fadeUp(1.2)}>
            Horizon
          </motion.span>
        </h1>

        <motion.p className="hero-subline" {...fadeUp(1.55)}>
          Curated residences at the intersection of art and altitude — for those who define their own gravity.
        </motion.p>

        {/* Search bar */}
        <motion.div className="hero-search-wrap" {...fadeUp(1.75)}>
          <SearchBar
            filter={searchQuery}
            setFilter={setSearchQuery}
            onSearch={() => {
              const q = searchQuery.trim();
              navigate(q ? `/properties?q=${encodeURIComponent(q)}` : "/properties");
            }}
          />
        </motion.div>

        {/* CTAs */}
        <motion.div className="hero-cta-wrap" {...fadeUp(1.9)}>
          <Link to="/properties" className="button hero-cta-btn">
            Explore Properties
          </Link>
          <a href="#residencies" className="hero-cta-link">
            <span className="hero-cta-link-line" /> View Portfolio
          </a>
        </motion.div>
      </div>

      {/* ── Scroll Indicator ─────────────────────────────────────────────── */}
      <motion.div className="hero-scroll-indicator" {...fadeUp(2.4)}>
        <div className="hero-scroll-line-wrap">
          <div className="hero-scroll-line-inner" />
        </div>
        <span className="hero-scroll-label">Scroll</span>
      </motion.div>

    </section>
  );
};

export default Hero;
