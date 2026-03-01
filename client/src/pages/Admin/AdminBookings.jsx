import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getAllBookingsAdmin, updateBookingStatus } from "../../utils/api";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";
import dayjs from "dayjs";
import { IoCheckmarkCircle, IoCloseCircle, IoTime, IoDocumentText } from "react-icons/io5";
import "./AdminBookings.css";

const STATUS_ICONS = {
    pending: <IoTime className="ab-status-icon ab-status--pending" />,
    confirmed: <IoCheckmarkCircle className="ab-status-icon ab-status--confirmed" />,
    completed: <IoCheckmarkCircle className="ab-status-icon ab-status--completed" />,
    cancelled: <IoCloseCircle className="ab-status-icon ab-status--cancelled" />
};

const STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled"
};

const AdminBookings = () => {
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery(
        ["adminBookings", filter, page],
        () => getAllBookingsAdmin(filter, page),
        { keepPreviousData: true }
    );

    const statusMutation = useMutation(
        ({ id, status }) => updateBookingStatus(id, status),
        {
            onSuccess: () => {
                toast.success("Booking status updated");
                queryClient.invalidateQueries("adminBookings");
            },
            onError: () => toast.error("Failed to update status")
        }
    );

    if (isError) {
        return (
            <div className="wrapper flexCenter" style={{ height: "60vh" }}>
                <span className="secondaryText">Failed to load bookings</span>
            </div>
        );
    }

    return (
        <div className="wrapper admin-bookings-page">
            <div className="innerWidth paddings ab-container">

                <header className="ab-header">
                    <div>
                        <h1 className="haven-heading">Viewing Schedule</h1>
                        <p className="secondaryText">Manage property viewings and client appointments</p>
                    </div>

                    <div className="ab-filters">
                        {["", "pending", "confirmed", "completed", "cancelled"].map(f => (
                            <button
                                key={f}
                                className={`ab-filter-btn ${filter === f ? "active" : ""}`}
                                onClick={() => { setFilter(f); setPage(1); }}
                            >
                                {f === "" ? "All" : STATUS_LABELS[f]}
                            </button>
                        ))}
                    </div>
                </header>

                {isLoading ? (
                    <div className="flexCenter" style={{ height: "40vh" }}>
                        <PuffLoader color="var(--gold)" />
                    </div>
                ) : (
                    <div className="ab-grid">
                        {data?.bookings?.length === 0 ? (
                            <div className="ab-empty">No bookings found.</div>
                        ) : (
                            data?.bookings?.map(b => (
                                <div key={b._id} className="ab-card">

                                    {/* Property Info */}
                                    <div className="ab-card-header">
                                        <img
                                            src={b.property.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"}
                                            alt={b.property.title}
                                            className="ab-prop-img"
                                        />
                                        <div className="ab-prop-info">
                                            <h3 className="ab-prop-title">{b.property.title}</h3>
                                            <span className="ab-prop-city">{b.property.city}</span>
                                        </div>
                                        <div className={`ab-status-badge badge--${b.status}`}>
                                            {STATUS_ICONS[b.status]}
                                            {STATUS_LABELS[b.status]}
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="ab-card-body">
                                        <div className="ab-detail-row">
                                            <span className="ab-label">Client</span>
                                            <span className="ab-value">{b.user.name}</span>
                                        </div>
                                        <div className="ab-detail-row">
                                            <span className="ab-label">Email</span>
                                            <span className="ab-value">{b.user.email}</span>
                                        </div>
                                        <div className="ab-detail-row">
                                            <span className="ab-label">Date</span>
                                            <span className="ab-value ab-date">
                                                {dayjs(b.visitDate).format("MMMM D, YYYY")}
                                            </span>
                                        </div>
                                        <div className="ab-detail-row">
                                            <span className="ab-label">Booked On</span>
                                            <span className="ab-value text-dim">{dayjs(b.createdAt).format("MMM D, YYYY")}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="ab-card-actions">
                                        <select
                                            className="ab-status-select"
                                            value={b.status}
                                            onChange={(e) => statusMutation.mutate({ id: b._id, status: e.target.value })}
                                            disabled={statusMutation.isLoading}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirm Visit</option>
                                            <option value="completed">Mark Completed</option>
                                            <option value="cancelled">Cancel Visit</option>
                                        </select>

                                        <button
                                            className="ab-icon-btn"
                                            title="Add Note"
                                            onClick={() => toast.info("Notes feature coming soon")}
                                        >
                                            <IoDocumentText size={20} />
                                        </button>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {data?.pages > 1 && (
                    <div className="ab-pagination">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="ab-page-btn"
                        >
                            Prev
                        </button>
                        <span className="ab-page-info">
                            Page {page} of {data.pages}
                        </span>
                        <button
                            disabled={page === data.pages}
                            onClick={() => setPage(p => p + 1)}
                            className="ab-page-btn"
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminBookings;
