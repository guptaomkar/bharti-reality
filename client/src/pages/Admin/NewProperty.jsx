import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./NewProperty.css";
import { motion, AnimatePresence } from "framer-motion";
import { createProperty } from "../../utils/api";
import { toast } from "react-toastify";

const STEPS = [
    "Basics",
    "Location",
    "Details",
    "Description",
    "Amenities",
    "Media",
    "Agent",
];

const AMENITIES_LIST = [
    "Concierge", "Pool", "Gym", "Home Cinema", "Wine Cellar", "Spa",
    "Rooftop Terrace", "Private Garden", "Smart Home", "Valet Parking",
    "Private Beach", "Ski-In/Ski-Out", "Hot Tub", "Fire Pit",
    "Golf Course", "Tennis Court", "Boat Dock", "Helipad",
    "Guest House", "Staff Quarters", "Elevator", "Security System",
    "Bike Storage", "Pet Friendly", "EV Charging", "Solar Panels",
    "Furnished", "Outdoor Kitchen", "Sauna", "Climbing Wall",
];

const TYPES = ["penthouse", "villa", "apartment", "loft", "mansion", "townhouse", "cottage", "estate", "chalet"];
const STATUSES = ["for-sale", "for-rent", "sold", "off-market"];
const PRICE_TYPES = ["for-sale", "for-rent", "per-night"];

const initForm = {
    // Step 1
    title: "", type: "apartment", category: "residential", status: "for-sale",
    featured: false, priceAmount: "", priceCurrency: "INR", priceType: "for-sale",
    // Step 2
    address: "", city: "", state: "", country: "", zipCode: "", neighborhood: "",
    // Step 3
    bedrooms: "", bathrooms: "", halfBaths: "", squareFeet: "", lotSize: "",
    floors: "", yearBuilt: "", parking: "", garage: false, pool: false, furnished: false,
    // Step 4
    shortDescription: "", fullDescription: "",
    // Step 5
    amenities: [],
    // Step 6 — file refs managed separately
    virtualTourUrl: "",
    heroMediaType: "photo", // "photo" | "video" | "youtube"
    youtubeUrl: "",
    // Step 7
    agentName: "", agentPhone: "", agentEmail: "", agentLicense: "",
};

const labelCls = "np-label";
const inputCls = "np-input";

const Property = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(initForm);
    const [uploading, setUploading] = useState(false);
    const [uploadPct, setUploadPct] = useState(0);

    // File states
    const [coverImage, setCoverImage] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [floorPlans, setFloorPlans] = useState([]);

    const coverRef = useRef();
    const photosRef = useRef();
    const videosRef = useRef();
    const floorRef = useRef();

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    // ── YouTube URL parser ────────────────────────────────────────────────────
    const extractYouTubeId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?.*v=)([^&]+)/,
            /(?:youtu\.be\/)([^?&]+)/,
            /(?:youtube\.com\/embed\/)([^?&]+)/,
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m) return m[1];
        }
        return null;
    };

    const ytId = form.heroMediaType === "youtube" ? extractYouTubeId(form.youtubeUrl || "") : null;
    const ytError = form.heroMediaType === "youtube" && form.youtubeUrl && !ytId;

    // ── Navigate ──────────────────────────────────────────────────────────────
    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep((s) => Math.max(s - 1, 0));

    // ── Drag-drop handler ─────────────────────────────────────────────────────
    const makeDrop = useCallback((setter, multi = true) => ({
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            if (multi) setter((prev) => [...prev, ...files]);
            else setter(files[0] || null);
        },
    }), []);

    // ── Amenity toggle ────────────────────────────────────────────────────────
    const toggleAmenity = (a) =>
        set("amenities", form.amenities.includes(a)
            ? form.amenities.filter((x) => x !== a)
            : [...form.amenities, a]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setUploading(true);
        setUploadPct(0);

        const fd = new FormData();

        // Scalar fields
        fd.append("title", form.title);
        fd.append("status", form.status);
        fd.append("featured", form.featured ? "true" : "false");
        fd.append("type", form.type);
        fd.append("category", form.category);
        fd.append("virtualTourUrl", form.virtualTourUrl);

        // Nested JSON fields
        fd.append("price", JSON.stringify({
            amount: Number(form.priceAmount) || 0,
            currency: form.priceCurrency,
            priceType: form.priceType,
        }));
        fd.append("location", JSON.stringify({
            address: form.address, city: form.city, state: form.state,
            country: form.country, zipCode: form.zipCode, neighborhood: form.neighborhood,
        }));
        fd.append("details", JSON.stringify({
            bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0,
            halfBaths: Number(form.halfBaths) || 0, squareFeet: Number(form.squareFeet) || 0,
            lotSize: Number(form.lotSize) || 0, floors: Number(form.floors) || 0,
            yearBuilt: Number(form.yearBuilt) || null, parking: Number(form.parking) || 0,
            garage: form.garage, pool: form.pool, furnished: form.furnished,
        }));
        fd.append("description", JSON.stringify({
            short: form.shortDescription, full: form.fullDescription,
        }));
        fd.append("amenities", JSON.stringify(form.amenities));
        fd.append("agent", JSON.stringify({
            name: form.agentName, phone: form.agentPhone,
            email: form.agentEmail, license: form.agentLicense,
        }));

        // Hero media
        fd.append("heroMediaType", form.heroMediaType);
        if (form.heroMediaType === "youtube" && ytId) {
            fd.append("heroMediaUrl", `https://www.youtube.com/embed/${ytId}`);
        } else if (form.heroMediaType === "video" && videos.length > 0) {
            // heroMediaUrl will be set server-side from uploaded video
            fd.append("heroMediaUrl", "");
        } else {
            fd.append("heroMediaUrl", "");
        }

        // Files
        if (coverImage) fd.append("coverImage", coverImage);
        photos.forEach((f) => fd.append("photos", f));
        videos.forEach((f) => fd.append("videos", f));
        floorPlans.forEach((f) => fd.append("floorPlans", f));

        try {
            const result = await createProperty(fd);
            toast.success("Property published successfully!");
            const slug = result.slug || result._id;
            navigate(`/properties/${slug}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // ── Step content ──────────────────────────────────────────────────────────
    const renderStep = () => {
        switch (step) {
            case 0: return (
                <div className="np-step-content">
                    <h2 className="np-step-title">Basics</h2>
                    <label className={labelCls}>Property Title *</label>
                    <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Azure Cliffs Penthouse" />

                    <div className="np-row">
                        <div className="np-col">
                            <label className={labelCls}>Type</label>
                            <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                                {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="np-col">
                            <label className={labelCls}>Category</label>
                            <input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="luxury, residential…" />
                        </div>
                    </div>

                    <div className="np-row">
                        <div className="np-col">
                            <label className={labelCls}>Status</label>
                            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="np-col np-col--center">
                            <label className={labelCls}>Featured</label>
                            <label className="np-toggle">
                                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                                <span className="np-toggle-track"><span className="np-toggle-thumb" /></span>
                                <span className="np-toggle-label">{form.featured ? "Yes" : "No"}</span>
                            </label>
                        </div>
                    </div>

                    <div className="np-row">
                        <div className="np-col">
                            <label className={labelCls}>Price Amount *</label>
                            <input className={inputCls} type="number" value={form.priceAmount} onChange={(e) => set("priceAmount", e.target.value)} placeholder="18500000" />
                        </div>
                        <div className="np-col">
                            <label className={labelCls}>Currency</label>
                            <select className={inputCls} value={form.priceCurrency} onChange={(e) => set("priceCurrency", e.target.value)}>
                                {["INR", "USD", "EUR", "GBP", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="np-col">
                            <label className={labelCls}>Price Type</label>
                            <select className={inputCls} value={form.priceType} onChange={(e) => set("priceType", e.target.value)}>
                                {PRICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            );

            case 1: return (
                <div className="np-step-content">
                    <h2 className="np-step-title">Location</h2>
                    <label className={labelCls}>Street Address</label>
                    <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="157 West 57th Street, Unit PH-A" />
                    <div className="np-row">
                        <div className="np-col"><label className={labelCls}>City</label><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="New York" /></div>
                        <div className="np-col"><label className={labelCls}>State / Province</label><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="NY" /></div>
                    </div>
                    <div className="np-row">
                        <div className="np-col"><label className={labelCls}>Country</label><input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="US" /></div>
                        <div className="np-col"><label className={labelCls}>Zip / Postal Code</label><input className={inputCls} value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} placeholder="10019" /></div>
                    </div>
                    <label className={labelCls}>Neighborhood</label>
                    <input className={inputCls} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Midtown Manhattan" />
                </div>
            );

            case 2: return (
                <div className="np-step-content">
                    <h2 className="np-step-title">Property Details</h2>
                    <div className="np-row">
                        {[["bedrooms", "Bedrooms"], ["bathrooms", "Bathrooms"], ["halfBaths", "Half Baths"]].map(([k, l]) => (
                            <div className="np-col" key={k}>
                                <label className={labelCls}>{l}</label>
                                <input className={inputCls} type="number" min="0" value={form[k]} onChange={(e) => set(k, e.target.value)} />
                            </div>
                        ))}
                    </div>
                    <div className="np-row">
                        {[["squareFeet", "Square Feet"], ["lotSize", "Lot Size (ft²)"], ["floors", "Floors"]].map(([k, l]) => (
                            <div className="np-col" key={k}>
                                <label className={labelCls}>{l}</label>
                                <input className={inputCls} type="number" min="0" value={form[k]} onChange={(e) => set(k, e.target.value)} />
                            </div>
                        ))}
                    </div>
                    <div className="np-row">
                        {[["yearBuilt", "Year Built"], ["parking", "Parking Spaces"]].map(([k, l]) => (
                            <div className="np-col" key={k}>
                                <label className={labelCls}>{l}</label>
                                <input className={inputCls} type="number" min="0" value={form[k]} onChange={(e) => set(k, e.target.value)} />
                            </div>
                        ))}
                    </div>
                    <div className="np-row np-toggles-row">
                        {[["garage", "Garage"], ["pool", "Pool"], ["furnished", "Furnished"]].map(([k, l]) => (
                            <label key={k} className="np-toggle">
                                <input type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} />
                                <span className="np-toggle-track"><span className="np-toggle-thumb" /></span>
                                <span className="np-toggle-label">{l}: {form[k] ? "Yes" : "No"}</span>
                            </label>
                        ))}
                    </div>
                </div>
            );

            case 3: return (
                <div className="np-step-content">
                    <h2 className="np-step-title">Description</h2>
                    <label className={labelCls}>Short Description <span className="np-char-count">{form.shortDescription.length}/300</span></label>
                    <textarea
                        className={`${inputCls} np-textarea`}
                        rows={3}
                        maxLength={300}
                        value={form.shortDescription}
                        onChange={(e) => set("shortDescription", e.target.value)}
                        placeholder="A compelling one or two sentence overview of the property…"
                    />
                    <label className={labelCls}>Full Description</label>
                    <textarea
                        className={`${inputCls} np-textarea np-textarea--large`}
                        rows={10}
                        value={form.fullDescription}
                        onChange={(e) => set("fullDescription", e.target.value)}
                        placeholder="Write 2–4 paragraphs describing the property in detail…"
                    />
                </div>
            );

            case 4: return (
                <div className="np-step-content">
                    <h2 className="np-step-title">Amenities</h2>
                    <p className="np-step-sub">Select all that apply</p>
                    <div className="np-amenities-grid">
                        {AMENITIES_LIST.map((a) => (
                            <label key={a} className={`np-amenity-check ${form.amenities.includes(a) ? "np-amenity-check--active" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={form.amenities.includes(a)}
                                    onChange={() => toggleAmenity(a)}
                                    style={{ display: "none" }}
                                />
                                {a}
                            </label>
                        ))}
                    </div>
                </div>
            );

            case 5: return (
                <div className="np-step-content">
                    <h2 className="np-step-title">Media</h2>

                    {/* Hero Media Type Toggle */}
                    <label className={labelCls}>Hero Showcase</label>
                    <div className="np-hero-toggle">
                        {[["photo", "Photo"], ["video", "Video"], ["youtube", "YouTube"]].map(([val, label]) => (
                            <button
                                key={val}
                                type="button"
                                className={`np-hero-opt ${form.heroMediaType === val ? "np-hero-opt--active" : ""}`}
                                onClick={() => set("heroMediaType", val)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Photo option */}
                    {form.heroMediaType === "photo" && (
                        <>
                            <label className={labelCls}>Cover Image</label>
                            <div className="np-dropzone" {...makeDrop((f) => setCoverImage(f[0] || f), false)} onClick={() => coverRef.current?.click()}>
                                {coverImage
                                    ? <img src={URL.createObjectURL(coverImage)} alt="Cover" className="np-preview-single" />
                                    : <span>Drag & drop or <u>browse</u></span>}
                                <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setCoverImage(e.target.files[0])} />
                            </div>
                        </>
                    )}

                    {/* Video option */}
                    {form.heroMediaType === "video" && (
                        <>
                            <label className={labelCls}>Hero Video (cinematic)</label>
                            <div className="np-dropzone" {...makeDrop((newFiles) => setVideos((p) => [...p, ...newFiles]))} onClick={() => videosRef.current?.click()}>
                                <span>Drag & drop video or <u>browse</u></span>
                                <input ref={videosRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={(e) => setVideos((p) => [...p, ...Array.from(e.target.files)])} />
                            </div>
                            {videos.length > 0 && <div className="np-file-list">{videos.map((f, i) => <div key={i} className="np-file-item">{f.name} <button onClick={() => setVideos(p => p.filter((_, j) => j !== i))}>x</button></div>)}</div>}
                        </>
                    )}

                    {/* YouTube option */}
                    {form.heroMediaType === "youtube" && (
                        <>
                            <label className={labelCls}>YouTube URL</label>
                            <input
                                className={`${inputCls}${ytError ? " np-input--error" : ""}`}
                                value={form.youtubeUrl || ""}
                                onChange={(e) => set("youtubeUrl", e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                            />
                            {ytError && <span className="np-yt-error">Please enter a valid YouTube URL</span>}
                            {ytId && (
                                <div className="np-yt-preview">
                                    <span className="np-label">Live Preview</span>
                                    <iframe
                                        width="100%"
                                        height="280"
                                        src={`https://www.youtube.com/embed/${ytId}`}
                                        title="YouTube Preview"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ border: "1px solid rgba(201,169,110,0.25)", borderRadius: "8px", marginTop: "0.5rem" }}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Gallery Photos */}
                    <label className={labelCls} style={{ marginTop: "1.25rem" }}>Gallery Photos (max 20)</label>
                    <div className="np-dropzone" {...makeDrop((newFiles) => setPhotos((p) => [...p, ...newFiles]))} onClick={() => photosRef.current?.click()}>
                        <span>Drag & drop photos or <u>browse</u></span>
                        <input ref={photosRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => setPhotos((p) => [...p, ...Array.from(e.target.files)])} />
                    </div>
                    {photos.length > 0 && (
                        <div className="np-preview-grid">
                            {photos.map((f, i) => (
                                <div key={i} className="np-preview-item">
                                    <img src={URL.createObjectURL(f)} alt={f.name} />
                                    <button className="np-preview-remove" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}>x</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Floor Plans */}
                    <label className={labelCls}>Floor Plans (max 4)</label>
                    <div className="np-dropzone" {...makeDrop((newFiles) => setFloorPlans((p) => [...p, ...newFiles]))} onClick={() => floorRef.current?.click()}>
                        <span>Drag & drop floor plans or <u>browse</u></span>
                        <input ref={floorRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => setFloorPlans((p) => [...p, ...Array.from(e.target.files)])} />
                    </div>

                    {/* Virtual Tour URL */}
                    <label className={labelCls}>Virtual Tour URL</label>
                    <input className={inputCls} value={form.virtualTourUrl} onChange={(e) => set("virtualTourUrl", e.target.value)} placeholder="https://..." />
                </div>
            );

            case 6: return (
                <div className="np-step-content">
                    <h2 className="np-step-title">Agent Information</h2>
                    <div className="np-row">
                        <div className="np-col"><label className={labelCls}>Full Name</label><input className={inputCls} value={form.agentName} onChange={(e) => set("agentName", e.target.value)} placeholder="Jane Doe" /></div>
                        <div className="np-col"><label className={labelCls}>License Number</label><input className={inputCls} value={form.agentLicense} onChange={(e) => set("agentLicense", e.target.value)} placeholder="NY-RE-00294" /></div>
                    </div>
                    <div className="np-row">
                        <div className="np-col"><label className={labelCls}>Phone</label><input className={inputCls} value={form.agentPhone} onChange={(e) => set("agentPhone", e.target.value)} placeholder="+1 212 555 0192" /></div>
                        <div className="np-col"><label className={labelCls}>Email</label><input className={inputCls} type="email" value={form.agentEmail} onChange={(e) => set("agentEmail", e.target.value)} placeholder="agent@haven.com" /></div>
                    </div>

                    {/* Summary */}
                    <div className="np-summary">
                        <span className="haven-label">Summary</span>
                        <div className="np-summary-grid">
                            <div><span>Title</span><strong>{form.title || "—"}</strong></div>
                            <div><span>Type</span><strong>{form.type}</strong></div>
                            <div><span>Status</span><strong>{form.status}</strong></div>
                            <div><span>Price</span><strong>{form.priceCurrency} {Number(form.priceAmount).toLocaleString()}</strong></div>
                            <div><span>City</span><strong>{form.city || "—"}</strong></div>
                            <div><span>Beds / Baths</span><strong>{form.bedrooms || "—"} / {form.bathrooms || "—"}</strong></div>
                        </div>
                    </div>
                </div>
            );

            default: return null;
        }
    };

    return (
        <div className="np-page">
            <div className="paddings innerWidth np-container">

                {/* Header */}
                <div className="np-page-header">
                    <span className="haven-label">Admin</span>
                    <h1 className="haven-heading np-page-title">New Property</h1>
                </div>

                {/* Progress bar */}
                <div className="np-progress-wrap">
                    <div className="np-progress-bar">
                        <motion.div
                            className="np-progress-fill"
                            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </div>
                    <div className="np-steps-labels">
                        {STEPS.map((s, i) => (
                            <button
                                key={s}
                                className={`np-step-tab ${i === step ? "np-step-tab--active" : ""} ${i < step ? "np-step-tab--done" : ""}`}
                                onClick={() => setStep(i)}
                            >
                                <span className="np-step-num">{i + 1}</span>
                                <span className="np-step-name">{s}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step panel */}
                <div className="np-panel">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="np-nav-row">
                    {step > 0 && (
                        <button className="np-btn np-btn--ghost" onClick={prev}>← Back</button>
                    )}
                    <div style={{ flex: 1 }} />
                    {step < STEPS.length - 1 ? (
                        <button className="button np-btn--primary" onClick={next}>
                            Next — {STEPS[step + 1]} →
                        </button>
                    ) : (
                        <button
                            className="button np-btn--primary np-btn--submit"
                            onClick={handleSubmit}
                            disabled={uploading}
                        >
                            {uploading ? "Publishing…" : "Publish Property"}
                        </button>
                    )}
                </div>

                {/* Upload progress */}
                {uploading && (
                    <div className="np-upload-overlay">
                        <div className="np-upload-modal">
                            <span className="haven-label">Publishing</span>
                            <div className="np-upload-bar">
                                <motion.div
                                    className="np-upload-fill"
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 8, ease: "linear" }}
                                />
                            </div>
                            <p className="np-upload-note secondaryText">Uploading files, please wait…</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Property;
