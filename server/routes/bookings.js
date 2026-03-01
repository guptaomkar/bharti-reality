import express from "express";
import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import { requireAuth, requireAdmin } from "./auth.js";

const router = express.Router();

// ── POST /api/bookings — create a booking (authenticated users) ────────────────
router.post(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
        const { propertyId, visitDate } = req.body;
        if (!propertyId || !visitDate)
            return res.status(400).json({ message: "propertyId and visitDate are required" });

        const date = new Date(visitDate);
        if (isNaN(date) || date < new Date())
            return res.status(400).json({ message: "Please provide a valid future date" });

        // Get property info for the snapshot
        const property = await Property.findOne({
            $or: [{ slug: propertyId }, { _id: propertyId.match(/^[0-9a-f]{24}$/) ? propertyId : null }],
        }).lean();

        if (!property)
            return res.status(404).json({ message: "Property not found" });

        // Prevent duplicate booking for same property + user
        const existing = await Booking.findOne({
            "user.id": req.userId,
            "property.id": propertyId,
            status: { $nin: ["cancelled"] },
        });
        if (existing)
            return res.status(409).json({ message: "You already have an active booking for this property" });

        // Get user info from DB
        const { default: User } = await import("../models/User.js");
        const user = await User.findById(req.userId);

        const booking = await Booking.create({
            property: {
                id: property.slug || property._id.toString(),
                title: property.title,
                image: property.media?.coverImage || property.image,
                city: property.location?.city || property.city,
            },
            user: {
                id: req.userId,
                name: user.name,
                email: user.email,
            },
            visitDate: date,
        });

        res.status(201).json({ message: "Booking confirmed!", booking });
    })
);

// ── GET /api/bookings/my — get current user's bookings ────────────────────────
router.get(
    "/my",
    requireAuth,
    asyncHandler(async (req, res) => {
        const bookings = await Booking.find({ "user.id": req.userId }).sort({ visitDate: 1 }).lean();
        res.json({ bookings });
    })
);

// ── DELETE /api/bookings/:id — cancel a booking (owner or admin) ──────────────
router.delete(
    "/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Only owner or admin can cancel
        if (booking.user.id.toString() !== req.userId && req.userRole !== "admin")
            return res.status(403).json({ message: "Not authorised" });

        booking.status = "cancelled";
        await booking.save();
        res.json({ message: "Booking cancelled" });
    })
);

// ── GET /api/bookings — ALL bookings (admin only) ─────────────────────────────
router.get(
    "/",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;

        const total = await Booking.countDocuments(query);
        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
    })
);

// ── PATCH /api/bookings/:id/status — update status (admin only) ───────────────
router.patch(
    "/:id/status",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        const { status, adminNote } = req.body;
        const allowed = ["pending", "confirmed", "cancelled", "completed"];
        if (!allowed.includes(status))
            return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = status;
        if (adminNote !== undefined) booking.adminNote = adminNote;
        await booking.save();

        res.json({ message: "Booking updated", booking });
    })
);

export { router as bookingRoute };
