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
        const { propertyId, visitDate, mobile, homeAddress, timeSlot, notes } = req.body;
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
            mobile: mobile || "",
            homeAddress: homeAddress || "",
            timeSlot: timeSlot || "Morning",
            notes: notes || "",
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
        const { status, page = 1, limit = 20, search, dateFrom, dateTo, property } = req.query;
        const query = {};

        if (status) query.status = status;
        if (property) query["property.title"] = { $regex: property, $options: "i" };

        // Date range filter
        if (dateFrom || dateTo) {
            query.visitDate = {};
            if (dateFrom) query.visitDate.$gte = new Date(dateFrom);
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                query.visitDate.$lte = toDate;
            }
        }

        // Search by name, email, or mobile
        if (search) {
            const re = { $regex: search, $options: "i" };
            query.$or = [
                { "user.name": re },
                { "user.email": re },
                { mobile: re },
            ];
        }

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
        const allowed = ["pending", "confirmed", "cancelled", "completed", "rejected"];
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
