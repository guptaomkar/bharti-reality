import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useAuth } from "../../context/AuthContext";
import { getMyBookings, cancelBooking } from "../../utils/api";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";
import dayjs from "dayjs";
import { IoCheckmarkCircle, IoCloseCircle, IoTime } from "react-icons/io5";
import { Link } from "react-router-dom";
import "./Bookings.css";

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

const Bookings = () => {
  const [filter, setFilter] = useState("");
  const queryClient = useQueryClient();
  const { user, token, loading: authLoading } = useAuth();

  const { data: bookings, isLoading, isError } = useQuery(
    "myBookingsDetails",
    () => getMyBookings(),
    { refetchOnWindowFocus: false }
  );

  const cancelMutation = useMutation(
    (id) => cancelBooking(id),
    {
      onSuccess: () => {
        toast.success("Booking cancelled successfully", { position: "bottom-right" });
        queryClient.invalidateQueries("myBookingsDetails");
        queryClient.invalidateQueries("allBookings"); // refresh user detail context
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to cancel booking");
      }
    }
  );

  if (isError) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <span className="secondaryText">Error while fetching your bookings</span>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <PuffLoader color="var(--gold)" />
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="wrapper admin-bookings-page flexCenter">
        <div style={{ textAlign: "center", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <IoTime style={{ fontSize: "3.5rem", opacity: 0.4 }} />
          <h2 className="haven-heading" style={{ margin: 0 }}>Your Viewings</h2>
          <p className="secondaryText" style={{ maxWidth: "340px" }}>Sign in to view and manage your property visits.</p>
          <Link to="/" className="button" style={{ marginTop: "0.5rem" }}>Sign In</Link>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings?.filter(b => filter ? b.status === filter : true) || [];

  return (
    <div className="wrapper admin-bookings-page">
      <div className="innerWidth paddings ab-container">

        <header className="ab-header">
          <div>
            <h1 className="haven-heading">My Viewing Schedule</h1>
            <p className="secondaryText">Track and manage your property visits</p>
          </div>

          <div className="ab-filters">
            {["", "pending", "confirmed", "completed", "cancelled"].map(f => (
              <button
                key={f}
                className={`ab-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
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
            {filteredBookings.length === 0 ? (
              <div className="ab-empty">
                <p>No visits found.</p>
                <Link to="/properties" className="button" style={{ marginTop: "1rem", display: "inline-block" }}>
                  Explore Properties
                </Link>
              </div>
            ) : (
              filteredBookings.map(b => (
                <div key={b._id} className="ab-card">

                  {/* Property Info */}
                  <div className="ab-card-header">
                    <img
                      src={b.property.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"}
                      alt={b.property.title}
                      className="ab-prop-img"
                    />
                    <div className="ab-prop-info">
                      <Link to={`/properties/${b.property.slug || b.property.id}`} style={{ textDecoration: "none" }}>
                        <h3 className="ab-prop-title" style={{ transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = 'var(--gold)'} onMouseOut={e => e.target.style.color = 'white'}>
                          {b.property.title}
                        </h3>
                      </Link>
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
                      <span className="ab-label">Visit Date</span>
                      <span className="ab-value ab-date">
                        {dayjs(b.visitDate).format("MMMM D, YYYY")}
                      </span>
                    </div>
                    <div className="ab-detail-row">
                      <span className="ab-label">Booked On</span>
                      <span className="ab-value text-dim">{dayjs(b.createdAt).format("MMM D, YYYY")}</span>
                    </div>

                    {b.adminNote && (
                      <div className="ab-detail-row" style={{ marginTop: "0.5rem", padding: "0.5rem", background: "rgba(201, 169, 110, 0.05)", borderLeft: "2px solid var(--gold)" }}>
                        <span className="text-dim" style={{ fontStyle: "italic", fontSize: "0.85rem" }}>{b.adminNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {b.status === "pending" && (
                    <div className="ab-card-actions" style={{ justifyContent: "center" }}>
                      <button
                        className="button"
                        style={{ background: "rgba(244, 67, 54, 0.1)", color: "#f44336", border: "1px solid rgba(244,67,54,0.3)" }}
                        onClick={() => {
                          if (window.confirm("Are you sure you want to cancel this visit?")) {
                            cancelMutation.mutate(b._id);
                          }
                        }}
                        disabled={cancelMutation.isLoading}
                      >
                        {cancelMutation.isLoading ? "Cancelling..." : "Cancel Visit"}
                      </button>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Bookings;
