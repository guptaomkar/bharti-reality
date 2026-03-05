import React, { useContext, useState } from "react";
import "./BookingModal.css";
import { useMutation } from "react-query";
import UserDetailContext from "../../context/UserDetailContext.js";
import { bookVisit } from "../../utils/api.js";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

const initForm = {
  fullName: "",
  mobile: "",
  email: "",
  homeAddress: "",
  visitDate: "",
  timeSlot: "Morning",
  notes: "",
};

const BookingModal = ({ opened, setOpened, email, propertyId }) => {
  const [form, setForm] = useState({ ...initForm, email: email || "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { setUserDetails } = useContext(UserDetailContext);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!/^[+\d][\d\s\-().]{6,19}$/.test(form.mobile.trim())) e.mobile = "Enter a valid mobile number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.visitDate) e.visitDate = "Visit date is required";
    else {
      const selected = new Date(form.visitDate);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (selected < today) e.visitDate = "Date must be today or in the future";
    }
    return e;
  };

  // ── Mutation ─────────────────────────────────────────────────────────────────
  const { mutate, isLoading } = useMutation({
    mutationFn: () =>
      bookVisit({
        propertyId,
        visitDate: form.visitDate,
        mobile: form.mobile,
        homeAddress: form.homeAddress,
        timeSlot: form.timeSlot,
        notes: form.notes,
        // override user name from form for the snapshot
        fullName: form.fullName,
      }),
    onSuccess: () => {
      setUserDetails((prev) => ({
        ...prev,
        bookings: [
          ...prev.bookings,
          {
            id: propertyId,
            date: dayjs(form.visitDate).format("DD/MM/YYYY"),
            status: "pending",
          },
        ],
      }));
      setSuccess(true);
    },
    onError: ({ response }) =>
      toast.error(response?.data?.message || "Booking failed. Please try again."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    mutate();
  };

  const handleClose = () => {
    setOpened(false);
    setTimeout(() => { setForm({ ...initForm, email: email || "" }); setErrors({}); setSuccess(false); }, 400);
  };

  if (!opened) return null;

  // Today date string for min date
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bm-backdrop" onClick={handleClose}>
      <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="bm-close" onClick={handleClose}>✕</button>

        {success ? (
          /* ── Success screen ─────────────────────────────────────────── */
          <div className="bm-success">
            <div className="bm-success-icon">✓</div>
            <h2 className="bm-success-title">Visit Requested!</h2>
            <p className="bm-success-sub">
              Your visit has been submitted for{" "}
              <strong>{dayjs(form.visitDate).format("MMMM D, YYYY")}</strong> ({form.timeSlot}).
              <br />An agent will confirm shortly.
            </p>
            <button className="bm-btn bm-btn--primary" onClick={handleClose}>
              Done
            </button>
          </div>
        ) : (
          /* ── Booking form ───────────────────────────────────────────── */
          <form className="bm-form" onSubmit={handleSubmit} noValidate>
            <div className="bm-header">
              <span className="bm-label">Schedule a Visit</span>
              <h2 className="bm-title">Book a Viewing</h2>
            </div>

            <div className="bm-fields">
              {/* Row 1: Name + Mobile */}
              <div className="bm-row">
                <div className="bm-field">
                  <label className="bm-field-label">Full Name *</label>
                  <input
                    className={`bm-input${errors.fullName ? " bm-input--err" : ""}`}
                    type="text"
                    placeholder="Jane Doe"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                  {errors.fullName && <span className="bm-err">{errors.fullName}</span>}
                </div>
                <div className="bm-field">
                  <label className="bm-field-label">Mobile Number *</label>
                  <input
                    className={`bm-input${errors.mobile ? " bm-input--err" : ""}`}
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={form.mobile}
                    onChange={(e) => set("mobile", e.target.value)}
                  />
                  {errors.mobile && <span className="bm-err">{errors.mobile}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="bm-field">
                <label className="bm-field-label">Email Address *</label>
                <input
                  className={`bm-input${errors.email ? " bm-input--err" : ""}`}
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                {errors.email && <span className="bm-err">{errors.email}</span>}
              </div>

              {/* Home Address */}
              <div className="bm-field">
                <label className="bm-field-label">Home Address <span className="bm-optional">(optional)</span></label>
                <textarea
                  className="bm-input bm-textarea"
                  rows={2}
                  placeholder="123 Main St, City, State"
                  value={form.homeAddress}
                  onChange={(e) => set("homeAddress", e.target.value)}
                />
              </div>

              {/* Row 2: Date + Time Slot */}
              <div className="bm-row">
                <div className="bm-field">
                  <label className="bm-field-label">Preferred Visit Date *</label>
                  <input
                    className={`bm-input${errors.visitDate ? " bm-input--err" : ""}`}
                    type="date"
                    min={todayStr}
                    value={form.visitDate}
                    onChange={(e) => set("visitDate", e.target.value)}
                  />
                  {errors.visitDate && <span className="bm-err">{errors.visitDate}</span>}
                </div>
                <div className="bm-field">
                  <label className="bm-field-label">Preferred Time Slot</label>
                  <select
                    className="bm-input bm-select"
                    value={form.timeSlot}
                    onChange={(e) => set("timeSlot", e.target.value)}
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="bm-field">
                <label className="bm-field-label">Message / Notes <span className="bm-optional">(optional)</span></label>
                <textarea
                  className="bm-input bm-textarea"
                  rows={3}
                  placeholder="Any special requests or questions…"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="bm-btn bm-btn--primary bm-btn--full"
              disabled={isLoading}
            >
              {isLoading ? "Submitting…" : "Request Visit →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
