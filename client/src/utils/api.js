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



export const getAllProperties = async () => {
  try {
    const response = await api.get("/residency/allresd", {
      timeout: 10 * 1000,
    });

    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    toast.error("Something went wrong");
    throw error;
  }
};

export const getProperty = async (id) => {
  try {
    const response = await api.get(`/residency/${id}`, {
      timeout: 10 * 1000,
    });

    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    toast.error("Something went wrong");
    throw error;
  }
};

export const createUser = async (email, token) => {
  try {
    await api.post(
      `/user/register`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    toast.error("Something went wrong, Please try again");
    throw error;
  }
};



export const removeBooking = async (id, email, token) => {
  try {
    await api.post(
      `/user/removeBooking/${id}`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    toast.error("Something went wrong, Please try again");

    throw error;
  }
};

export const toFav = async (id, email, token) => {
  try {
    await api.post(
      `/user/toFav/${id}`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (e) {
    throw e;
  }
};


export const getAllFav = async (email, token) => {
  if (!token) return
  try {

    const res = await api.post(
      `/user/allFav`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data["favResidenciesID"]

  } catch (e) {
    toast.error("Something went wrong while fetching favs");
    throw e
  }
}


export const getAllBookings = async (email, token) => {

  if (!token) return
  try {
    const res = await api.post(
      `/user/allBookings`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data["bookedVisits"];


  } catch (error) {
    toast.error("Something went wrong while fetching bookings");
    throw error
  }
}


export const createResidency = async (data, token) => {
  console.log(data)
  try {
    const res = await api.post(
      `/residency/create`,
      {
        data
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  } catch (error) {
    throw error
  }
}