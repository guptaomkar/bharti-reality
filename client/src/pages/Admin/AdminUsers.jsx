import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { getAllUsersAdmin, getUserWishlist } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "./AdminUsers.css";

// ── Debounce hook ─────────────────────────────────────────────────────────────
const useDebounce = (val, ms = 400) => {
    const [dbVal, setDbVal] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setDbVal(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return dbVal;
};

const ROLE_COLOURS = {
    admin: { bg: "rgba(201,169,110,0.14)", colour: "#C9A96E" },
    user: { bg: "rgba(96,165,250,0.12)", colour: "#60a5fa" },
};

const AdminUsers = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(null); // userId for wishlist
    const [wishlistData, setWishlistData] = useState({});
    const [wishlistLoading, setWishlistLoading] = useState(null);

    const dbSearch = useDebounce(search);

    const queryKey = ["adminUsers", page, dbSearch];

    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: () => getAllUsersAdmin(page, dbSearch),
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });

    const users = data?.users || [];
    const totalPages = data?.pages || 1;

    useEffect(() => { setPage(1); }, [dbSearch]);

    // ── Load wishlist for a user ──────────────────────────────────────────────
    const toggleWishlist = async (userId) => {
        if (expanded === userId) {
            setExpanded(null);
            return;
        }
        setExpanded(userId);

        // Only fetch if not already cached
        if (!wishlistData[userId]) {
            setWishlistLoading(userId);
            try {
                const result = await getUserWishlist(userId);
                setWishlistData((prev) => ({ ...prev, [userId]: result.properties || [] }));
            } catch {
                toast.error("Failed to load wishlist");
            } finally {
                setWishlistLoading(null);
            }
        }
    };

    return (
        <div className="au-page paddings">
            <div className="innerWidth au-container">

                {/* Header */}
                <div className="au-header">
                    <div>
                        <span className="haven-label">Admin</span>
                        <h1 className="haven-heading au-title">Users</h1>
                    </div>
                </div>

                {/* ── Filters ────────────────────────────────────────────────────── */}
                <div className="au-filters">
                    <input
                        className="au-filter-input"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="au-clear-btn" onClick={() => setSearch("")}>
                            Clear
                        </button>
                    )}
                    <span className="au-total">{data?.total || 0} user{(data?.total || 0) === 1 ? "" : "s"}</span>
                </div>

                {/* ── Table ──────────────────────────────────────────────────────── */}
                {isLoading ? (
                    <div className="flexCenter" style={{ padding: "4rem" }}>
                        <PuffLoader color="var(--gold)" />
                    </div>
                ) : error ? (
                    <p className="au-error">Failed to load users.</p>
                ) : users.length === 0 ? (
                    <div className="au-empty">
                        <span>No users found.</span>
                    </div>
                ) : (
                    <div className="au-table-wrap">
                        <table className="au-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Registered</th>
                                    <th>Wishlist</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <React.Fragment key={u._id}>
                                        <tr className={`au-row ${expanded === u._id ? "au-row--expanded" : ""}`}>
                                            <td>
                                                <div className="au-user-cell">
                                                    <div className="au-avatar">
                                                        {u.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
                                                    </div>
                                                    <span className="au-user-name">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="au-td-email">{u.email}</td>
                                            <td>
                                                <span
                                                    className="au-role-badge"
                                                    style={{
                                                        background: ROLE_COLOURS[u.role]?.bg,
                                                        color: ROLE_COLOURS[u.role]?.colour
                                                    }}
                                                >
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="au-td-date">{dayjs(u.createdAt).format("MMM D, YYYY")}</td>
                                            <td className="au-td-wishlist">
                                                <span className="au-wishlist-count">{u.wishlistCount || 0}</span>
                                            </td>
                                            <td>
                                                {(u.wishlistCount || 0) > 0 && (
                                                    <button
                                                        className={`au-expand-btn ${expanded === u._id ? "au-expand-btn--open" : ""}`}
                                                        onClick={() => toggleWishlist(u._id)}
                                                        title="View Wishlist"
                                                    >
                                                        {expanded === u._id ? "▲ Hide" : "♡ View Wishlist"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>

                                        {/* ── Expanded wishlist row ─────────────────────────── */}
                                        {expanded === u._id && (
                                            <tr className="au-wishlist-row">
                                                <td colSpan={6}>
                                                    <div className="au-wishlist-panel">
                                                        <span className="au-wishlist-label">
                                                            Wishlist — {u.name}
                                                        </span>
                                                        {wishlistLoading === u._id ? (
                                                            <div className="flexCenter" style={{ padding: "1.5rem" }}>
                                                                <PuffLoader color="var(--gold)" size={28} />
                                                            </div>
                                                        ) : (wishlistData[u._id] || []).length === 0 ? (
                                                            <p className="au-wishlist-empty">No properties in wishlist.</p>
                                                        ) : (
                                                            <div className="au-wishlist-grid">
                                                                {wishlistData[u._id].map((p) => (
                                                                    <div key={p._id} className="au-wishlist-card">
                                                                        <Link to={`/properties/${p._id}`} style={{ display: 'contents' }}>
                                                                            <img
                                                                            className="au-wishlist-thumb"
                                                                            src={p.media?.coverImage || p.image || "https://placehold.co/80x60/1a1a1a/C9A96E?text=N/A"}
                                                                            alt={p.title}
                                                                            onError={(e) => { e.target.src = "https://placehold.co/80x60/1a1a1a/C9A96E?text=N/A"; }}
                                                                        />
                                                                        <div className="au-wishlist-info">
                                                                            <span className="au-wishlist-title">{p.title}</span>
                                                                            <span className="au-wishlist-location">
                                                                                {p.location?.city || p.city || "—"}, {p.location?.country || p.country || "—"}
                                                                            </span>
                                                                            {p.price?.amount && (
                                                                                <span className="au-wishlist-price">
                                                                                    {p.price.currency || "USD"} {Number(p.price.amount).toLocaleString()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span
                                                                            className="au-wishlist-status"
                                                                            style={{
                                                                                color: p.status === "for-sale" ? "#4ade80" : p.status === "sold" ? "#C9A96E" : "#60a5fa"
                                                                            }}
                                                                        >
                                                                            {p.status}
                                                                        </span>
                                                                        </Link>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Pagination ─────────────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="au-pagination">
                        <button className="au-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                        <span className="au-page-info">Page {page} of {totalPages}</span>
                        <button className="au-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminUsers;
