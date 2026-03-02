import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

// Legacy Prisma/external API
export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://full-stack-real-estate-youtube.vercel.app/api",
});

// ─── New HAVEN Mongoose backend (port 5000) ────────────────────────────────
export const havenApi = axios.create({
  baseURL: import.meta.env.VITE_HAVEN_API_URL || "http://localhost:5000/api",
  timeout: 8000,
});

/** GET /api/properties — with optional filters */
export const getHavenProperties = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== "") params.set(k, v); });
  const res = await havenApi.get(`/properties?${params.toString()}`);
  return res.data;
};

/** GET /api/properties/featured */
export const getFeaturedProperties = async () => {
  const res = await havenApi.get("/properties/featured");
  return res.data;
};

/** GET /api/properties/:idOrSlug */
export const getHavenProperty = async (idOrSlug) => {
  const res = await havenApi.get(`/properties/${idOrSlug}`);
  return res.data;
};

/** POST /api/properties — FormData */
export const createProperty = async (formData) => {
  const res = await havenApi.post("/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** POST /api/bookings — create a booking */
export const bookVisit = async (date, propertyId) => {
  const token = localStorage.getItem("haven_token");
  if (!token) throw new Error("Not authenticated");
  const res = await havenApi.post(
    "/bookings",
    { propertyId, visitDate: date },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

/** GET /api/bookings/my — current user's bookings */
export const getMyBookings = async () => {
  const token = localStorage.getItem("haven_token");
  if (!token) return [];
  const res = await havenApi.get("/bookings/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.bookings;
};

/** DELETE /api/bookings/:id — cancel a booking */
export const cancelBooking = async (bookingId) => {
  const token = localStorage.getItem("haven_token");
  const res = await havenApi.delete(`/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/** GET /api/bookings — ALL bookings (admin) */
export const getAllBookingsAdmin = async (status = "", page = 1) => {
  const token = localStorage.getItem("haven_token");
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", page);
  const res = await havenApi.get(`/bookings?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/** PATCH /api/bookings/:id/status — update status (admin) */
export const updateBookingStatus = async (bookingId, status, adminNote = "") => {
  const token = localStorage.getItem("haven_token");
  const res = await havenApi.patch(
    `/bookings/${bookingId}/status`,
    { status, adminNote },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};



// ─── LEGACY Prisma Endpoints (Removed) ───────────────────────────────────────
// The following endpoints (getAllProperties, getProperty, createUser,
// removeBooking, toFav, getAllFav, getAllBookings, createResidency)
// have been replaced by the Mongoose (HAVEN) API.

/** POST /api/auth/toFav/:id — toggle favorite */
export const toFav = async (id, email, token) => {
  try {
    const res = await havenApi.post(
      `/auth/toFav/${id}`,
      {}, // Empty body
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

/** GET /api/auth/allFav — get user favorites */
export const getAllFav = async (email, token) => {
  if (!token) return [];
  try {
    const res = await havenApi.get(`/auth/allFav`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.favResidenciesID || [];
  } catch (error) {
    toast.error("Something went wrong while fetching favs");
    throw error;
  }
};
