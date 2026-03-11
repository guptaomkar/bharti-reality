import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Property from "../models/Property.js";
import { requireAuth, requireAdmin } from "./auth.js";

const router = express.Router();

// All routes in this file require admin access
router.use(requireAuth, requireAdmin);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/admin/users — paginated list of all users
// ─────────────────────────────────────────────────────────────────────────────
router.get(
    "/users",
    asyncHandler(async (req, res) => {
        const { search, page = 1, limit = 20 } = req.query;
        const query = {};

        if (search) {
            const re = { $regex: search, $options: "i" };
            query.$or = [{ name: re }, { email: re }];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select("name email role favResidenciesID bookedVisits createdAt")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .lean();

        // Add wishlist count to each user
        const data = users.map((u) => ({
            ...u,
            wishlistCount: u.favResidenciesID?.length || 0,
        }));

        res.json({
            users: data,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    })
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/admin/users/:id/wishlist — user's wishlist resolved to properties
// ─────────────────────────────────────────────────────────────────────────────
router.get(
    "/users/:id/wishlist",
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id)
            .select("name email favResidenciesID")
            .lean();

        if (!user) return res.status(404).json({ message: "User not found" });

        const favIds = user.favResidenciesID || [];

        if (favIds.length === 0) {
            return res.json({ user: { name: user.name, email: user.email }, properties: [] });
        }

        // favResidenciesID can contain slugs or ObjectIds — try both
        const properties = await Property.find({
            $or: [
                { slug: { $in: favIds } },
                { _id: { $in: favIds.filter((id) => /^[0-9a-f]{24}$/.test(id)) } },
            ],
        })
            .select("title slug status type price location media image city country")
            .lean();

        res.json({
            user: { name: user.name, email: user.email },
            properties,
        });
    })
);

export { router as adminRoute };
