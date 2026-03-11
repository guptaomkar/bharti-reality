import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { getAllPropertiesAdmin, deleteProperty } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "./AdminProperties.css";

const STATUS_OPTIONS = ["for-sale", "for-rent", "sold", "off-market"];

const STATUS_COLOURS = {
    "for-sale": { bg: "rgba(74,222,128,0.12)", colour: "#4ade80" },
    "for-rent": { bg: "rgba(96,165,250,0.12)", colour: "#60a5fa" },
    "sold": { bg: "rgba(201,169,110,0.14)", colour: "#C9A96E" },
    "off-market": { bg: "rgba(248,113,113,0.12)", colour: "#f87171" },
};

// ── Debounce hook ─────────────────────────────────────────────────────────────
const useDebounce = (val, ms = 400) => {
    const [dbVal, setDbVal] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setDbVal(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return dbVal;
};

const AdminProperties = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState(null); // property to delete

    const dbSearch = useDebounce(search);

    const queryKey = ["adminProperties", page, dbSearch, status];

    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: () => getAllPropertiesAdmin(page, dbSearch, status),
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });

    const { mutate: doDelete, isLoading: deleting } = useMutation({
        mutationFn: (id) => deleteProperty(id),
        onSuccess: () => {
            toast.success("Property deleted");
            qc.invalidateQueries(["adminProperties"]);
            setDeleteModal(null);
        },
        onError: () => toast.error("Failed to delete property"),
    });

    const properties = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / 12) || 1;

    useEffect(() => { setPage(1); }, [dbSearch, status]);

    const formatPrice = (p) => {
        if (!p?.amount) return "—";
        return `${p.currency || "USD"} ${Number(p.amount).toLocaleString()}`;
    };

    return (
        <div className="ap-page paddings">
            <div className="innerWidth ap-container">

                {/* Header */}
                <div className="ap-header">
                    <div>
                        <span className="haven-label">Admin</span>
                        <h1 className="haven-heading ap-title">Properties</h1>
                    </div>
                    <button className="ap-add-btn" onClick={() => navigate("/admin/new-property")}>
                        + Add New Property
                    </button>
                </div>

                {/* ── Filters ────────────────────────────────────────────────────── */}
                <div className="ap-filters">
                    <input
                        className="ap-filter-input"
                        placeholder="Search by city…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="ap-filter-input ap-filter-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    {(search || status) && (
                        <button className="ap-clear-btn" onClick={() => { setSearch(""); setStatus(""); }}>
                            Clear
                        </button>
                    )}
                    <span className="ap-total">{total} propert{total === 1 ? "y" : "ies"}</span>
                </div>

                {/* ── Table ──────────────────────────────────────────────────────── */}
                {isLoading ? (
                    <div className="flexCenter" style={{ padding: "4rem" }}>
                        <PuffLoader color="var(--gold)" />
                    </div>
                ) : error ? (
                    <p className="ap-error">Failed to load properties.</p>
                ) : properties.length === 0 ? (
                    <div className="ap-empty">
                        <span>No properties found.</span>
                    </div>
                ) : (
                    <div className="ap-table-wrap">
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Type</th>
                                    <th>City</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((p) => (
                                    <tr key={p._id} className="ap-row">
                                        <td>
                                            <div className="ap-prop-cell">
                                                <img
                                                    className="ap-prop-thumb"
                                                    src={p.media?.coverImage || p.image || "/placeholder.jpg"}
                                                    alt={p.title}
                                                    onError={(e) => { e.target.src = "https://placehold.co/60x60/1a1a1a/C9A96E?text=N/A"; }}
                                                />
                                                <span className="ap-prop-title">{p.title}</span>
                                            </div>
                                        </td>
                                        <td className="ap-td-type">{p.type}</td>
                                        <td className="ap-td-city">{p.location?.city || p.city || "—"}</td>
                                        <td className="ap-td-price">{formatPrice(p.price)}</td>
                                        <td>
                                            <span
                                                className="ap-status-badge"
                                                style={{
                                                    background: STATUS_COLOURS[p.status]?.bg,
                                                    color: STATUS_COLOURS[p.status]?.colour
                                                }}
                                            >
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="ap-td-date">{dayjs(p.createdAt).format("MMM D, YYYY")}</td>
                                        <td>
                                            <div className="ap-actions">
                                                <button
                                                    className="ap-action-btn ap-action-edit"
                                                    onClick={() => navigate(`/admin/edit-property/${p._id}`)}
                                                    title="Edit"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    className="ap-action-btn ap-action-delete"
                                                    onClick={() => setDeleteModal(p)}
                                                    title="Delete"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Pagination ─────────────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="ap-pagination">
                        <button className="ap-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                        <span className="ap-page-info">Page {page} of {totalPages}</span>
                        <button className="ap-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
                    </div>
                )}

                {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
                {deleteModal && (
                    <div className="ap-modal-overlay" onClick={() => !deleting && setDeleteModal(null)}>
                        <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
                            <h3 className="ap-modal-title">Delete Property</h3>
                            <p className="ap-modal-text">
                                Are you sure you want to delete <strong>"{deleteModal.title}"</strong>?
                                This action cannot be undone.
                            </p>
                            <div className="ap-modal-actions">
                                <button className="ap-modal-btn ap-modal-cancel" onClick={() => setDeleteModal(null)} disabled={deleting}>
                                    Cancel
                                </button>
                                <button
                                    className="ap-modal-btn ap-modal-delete"
                                    onClick={() => doDelete(deleteModal._id)}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting…" : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProperties;
