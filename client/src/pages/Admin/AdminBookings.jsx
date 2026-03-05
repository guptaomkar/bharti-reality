import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getAllBookingsAdmin, updateBookingStatus } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { toast } from "react-toastify";
import "./AdminBookings.css";
import dayjs from "dayjs";

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "completed", "rejected"];

// ── CSV Export ────────────────────────────────────────────────────────────────
const exportToCSV = (bookings) => {
    const headers = ["Name", "Email", "Mobile", "Property", "Visit Date", "Time Slot", "Status", "Address", "Notes", "Submitted At"];
    const rows = bookings.map((b) => [
        b.user?.name || "",
        b.user?.email || "",
        b.mobile || "",
        b.property?.title || "",
        dayjs(b.visitDate).format("YYYY-MM-DD"),
        b.timeSlot || "",
        b.status || "",
        b.homeAddress || "",
        b.notes || "",
        dayjs(b.createdAt).format("YYYY-MM-DD HH:mm"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ── Debounce hook ─────────────────────────────────────────────────────────────
const useDebounce = (val, ms = 350) => {
    const [dbVal, setDbVal] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setDbVal(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return dbVal;
};

const STATUS_COLOURS = {
    pending: { bg: "rgba(251,191,36,0.12)", colour: "#fbbf24" },
    confirmed: { bg: "rgba(74,222,128,0.12)", colour: "#4ade80" },
    cancelled: { bg: "rgba(248,113,113,0.12)", colour: "#f87171" },
    completed: { bg: "rgba(201,169,110,0.14)", colour: "#C9A96E" },
    rejected: { bg: "rgba(248,113,113,0.12)", colour: "#f87171" },
};

const AdminBookings = () => {
    const qc = useQueryClient();

    // ── Filters ──────────────────────────────────────────────────────────────
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [propFilter, setPropFilter] = useState("");
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(null);

    const dbSearch = useDebounce(search);
    const dbProp = useDebounce(propFilter);

    const queryKey = ["adminBookings", status, page, dbSearch, dateFrom, dateTo, dbProp];

    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: () => getAllBookingsAdmin(status, page, dbSearch, dateFrom, dateTo, dbProp),
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });

    const { mutate: changeStatus } = useMutation({
        mutationFn: ({ id, newStatus }) => updateBookingStatus(id, newStatus),
        onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries(["adminBookings"]); },
        onError: () => toast.error("Failed to update status"),
    });

    const bookings = data?.bookings || [];
    const totalPages = data?.pages || 1;

    // ── Reset page on filter change ───────────────────────────────────────────
    useEffect(() => { setPage(1); }, [status, dbSearch, dateFrom, dateTo, dbProp]);

    return (
        <div className="ab-page paddings">
            <div className="innerWidth ab-container">

                {/* Header */}
                <div className="ab-header">
                    <div>
                        <span className="haven-label">Admin</span>
                        <h1 className="haven-heading ab-title">Visit Requests</h1>
                    </div>
                    <button className="ab-export-btn" onClick={() => exportToCSV(bookings)} disabled={bookings.length === 0}>
                        Export CSV
                    </button>
                </div>

                {/* ── Filters Bar ─────────────────────────────────────────────────── */}
                <div className="ab-filters">
                    <input
                        className="ab-filter-input"
                        placeholder="Search name, email, mobile…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <input
                        className="ab-filter-input"
                        placeholder="Property name…"
                        value={propFilter}
                        onChange={(e) => setPropFilter(e.target.value)}
                    />
                    <input
                        className="ab-filter-input"
                        type="date"
                        title="From date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                    <input
                        className="ab-filter-input"
                        type="date"
                        title="To date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                    <select
                        className="ab-filter-input ab-filter-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    {(status || search || dateFrom || dateTo || propFilter) && (
                        <button className="ab-clear-btn" onClick={() => { setStatus(""); setSearch(""); setDateFrom(""); setDateTo(""); setPropFilter(""); }}>
                            Clear
                        </button>
                    )}
                </div>

                {/* ── Table ────────────────────────────────────────────────────────── */}
                {isLoading ? (
                    <div className="flexCenter" style={{ padding: "4rem" }}>
                        <PuffLoader color="var(--gold)" />
                    </div>
                ) : error ? (
                    <p className="ab-error">Failed to load bookings.</p>
                ) : bookings.length === 0 ? (
                    <div className="ab-empty">
                        <span>No visit requests found.</span>
                    </div>
                ) : (
                    <div className="ab-table-wrap">
                        <table className="ab-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Mobile</th>
                                    <th>Property</th>
                                    <th>Visit Date</th>
                                    <th>Slot</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <React.Fragment key={b._id}>
                                        <tr className={`ab-row ${expanded === b._id ? "ab-row--expanded" : ""}`}>
                                            <td>
                                                <div className="ab-customer">
                                                    <span className="ab-customer-name">{b.user?.name}</span>
                                                    <span className="ab-customer-email">{b.user?.email}</span>
                                                </div>
                                            </td>
                                            <td className="ab-td-mono">{b.mobile || "—"}</td>
                                            <td className="ab-td-prop">{b.property?.title || "—"}</td>
                                            <td className="ab-td-date">{dayjs(b.visitDate).format("MMM D, YYYY")}</td>
                                            <td>
                                                <span className="ab-slot">{b.timeSlot || "—"}</span>
                                            </td>
                                            <td>
                                                <select
                                                    className="ab-status-select"
                                                    value={b.status}
                                                    style={{ background: STATUS_COLOURS[b.status]?.bg, color: STATUS_COLOURS[b.status]?.colour }}
                                                    onChange={(e) => changeStatus({ id: b._id, newStatus: e.target.value })}
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="ab-td-date">{dayjs(b.createdAt).format("MMM D")}</td>
                                            <td>
                                                <button
                                                    className={`ab-expand-btn ${expanded === b._id ? "ab-expand-btn--open" : ""}`}
                                                    onClick={() => setExpanded((prev) => (prev === b._id ? null : b._id))}
                                                    title="Details"
                                                >
                                                    ▼
                                                </button>
                                            </td>
                                        </tr>

                                        {/* ── Expanded details row ──────────────────────────── */}
                                        {expanded === b._id && (
                                            <tr className="ab-detail-row">
                                                <td colSpan={8}>
                                                    <div className="ab-detail-grid">
                                                        <div>
                                                            <span className="ab-detail-label">Home Address</span>
                                                            <span className="ab-detail-val">{b.homeAddress || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="ab-detail-label">Admin Note</span>
                                                            <span className="ab-detail-val">{b.adminNote || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="ab-detail-label">Notes</span>
                                                            <span className="ab-detail-val">{b.notes || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="ab-detail-label">Property City</span>
                                                            <span className="ab-detail-val">{b.property?.city || "—"}</span>
                                                        </div>
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
                    <div className="ab-pagination">
                        <button className="ab-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                        <span className="ab-page-info">Page {page} of {totalPages}</span>
                        <button className="ab-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminBookings;
