import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import { uploadFields, handleUploadError } from "../middleware/upload.js";
import { requireAuth, requireAdmin } from "./auth.js";
import { STATIC_PROPERTIES } from "../data/propertiesSeed.js";

const router = express.Router();

// ─── Helper: build file URL from uploaded files ────────────────────────────────
const fileUrl = (req, file) =>
    `${req.protocol}://${req.get("host")}/uploads/${file.fieldname.includes("video") ? "videos" : "photos"
    }/${file.filename}`;

// ─── Helper: parse JSON string fields from FormData ───────────────────────────
const parseJsonField = (val) => {
    if (typeof val !== "string") return val;
    try { return JSON.parse(val); } catch { return val; }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/properties — filterable, paginated
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", asyncHandler(async (req, res) => {
    const {
        status, type, city, category,
        minPrice, maxPrice, bedrooms, featured,
        page = 1, limit = 12, sort = "-createdAt",
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (featured === "true") query.featured = true;
    if (minPrice || maxPrice) {
        query["price.amount"] = {};
        if (minPrice) query["price.amount"].$gte = Number(minPrice);
        if (maxPrice) query["price.amount"].$lte = Number(maxPrice);
    }
    if (bedrooms) query["details.bedrooms"] = { $gte: Number(bedrooms) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);
    const data = await Property.find(query).sort(sort).skip(skip).limit(Number(limit));

    res.json({ total, page: Number(page), limit: Number(limit), data });
}));

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/properties/featured
// ─────────────────────────────────────────────────────────────────────────────
router.get("/featured", asyncHandler(async (req, res) => {
    const data = await Property.find({ featured: true, status: "for-sale" })
        .sort("-createdAt")
        .limit(6);
    res.json(data);
}));

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/properties/seed/run — dev only
// ─────────────────────────────────────────────────────────────────────────────
router.post("/seed/run", asyncHandler(async (req, res) => {
    await Property.deleteMany({});
    const inserted = await Property.insertMany(STATIC_PROPERTIES);
    res.json({ message: `Seeded ${inserted.length} properties.` });
}));

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/properties/:id — by ObjectId OR slug; increment views
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

    const filter = isObjectId ? { _id: id } : { slug: id };
    const property = await Property.findOneAndUpdate(
        filter,
        { $inc: { "meta.views": 1 } },
        { new: true }
    );

    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
}));

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/properties — multipart/form-data
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", uploadFields, handleUploadError, asyncHandler(async (req, res) => {
    const body = req.body;

    // Parse JSON string fields
    const price = parseJsonField(body.price);
    const location = parseJsonField(body.location);
    const details = parseJsonField(body.details);
    const description = parseJsonField(body.description);
    const amenities = parseJsonField(body.amenities);
    const agent = parseJsonField(body.agent);

    const files = req.files || {};

    const media = {
        coverImage: files.coverImage?.[0]
            ? `${req.protocol}://${req.get("host")}/uploads/photos/${files.coverImage[0].filename}`
            : body.coverImageUrl || "",
        photos: (files.photos || []).map(f =>
            `${req.protocol}://${req.get("host")}/uploads/photos/${f.filename}`
        ),
        videos: (files.videos || []).map(f =>
            `${req.protocol}://${req.get("host")}/uploads/videos/${f.filename}`
        ),
        floorPlans: (files.floorPlans || []).map(f =>
            `${req.protocol}://${req.get("host")}/uploads/floorplans/${f.filename}`
        ),
        virtualTourUrl: body.virtualTourUrl || "",
        heroMediaType: body.heroMediaType || "photo",
        heroMediaUrl: (() => {
            if (body.heroMediaUrl) return body.heroMediaUrl;
            // For video type, use the first uploaded video as the hero
            if (body.heroMediaType === "video" && files.videos?.[0]) {
                return `${req.protocol}://${req.get("host")}/uploads/videos/${files.videos[0].filename}`;
            }
            return "";
        })(),
    };

    const property = new Property({
        title: body.title,
        status: body.status || "for-sale",
        featured: body.featured === "true",
        type: body.type || "apartment",
        category: body.category || "residential",
        price,
        location,
        details,
        description,
        amenities: Array.isArray(amenities) ? amenities : [],
        media,
        agent,
    });

    const saved = await property.save();
    res.status(201).json(saved);
}));

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/properties/:id — full update with file handling (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", requireAuth, requireAdmin, uploadFields, handleUploadError, asyncHandler(async (req, res) => {
    const body = req.body;
    const files = req.files || {};

    const updateData = {};

    // Scalar fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured === "true";
    if (body.type !== undefined) updateData.type = body.type;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.virtualTourUrl !== undefined) updateData.virtualTourUrl = body.virtualTourUrl;

    // Nested JSON fields
    if (body.price) updateData.price = parseJsonField(body.price);
    if (body.location) updateData.location = parseJsonField(body.location);
    if (body.details) updateData.details = parseJsonField(body.details);
    if (body.description) updateData.description = parseJsonField(body.description);
    if (body.amenities) updateData.amenities = parseJsonField(body.amenities);
    if (body.agent) updateData.agent = parseJsonField(body.agent);

    // Media handling
    const existingProp = await Property.findById(req.params.id);
    if (!existingProp) return res.status(404).json({ message: "Property not found" });

    const media = existingProp.media?.toObject?.() || existingProp.media || {};

    if (files.coverImage?.[0]) {
        media.coverImage = `${req.protocol}://${req.get("host")}/uploads/photos/${files.coverImage[0].filename}`;
    } else if (body.coverImageUrl) {
        media.coverImage = body.coverImageUrl;
    }

    if (files.photos?.length) {
        media.photos = [
            ...(media.photos || []),
            ...files.photos.map(f => `${req.protocol}://${req.get("host")}/uploads/photos/${f.filename}`),
        ];
    }

    if (files.videos?.length) {
        media.videos = [
            ...(media.videos || []),
            ...files.videos.map(f => `${req.protocol}://${req.get("host")}/uploads/videos/${f.filename}`),
        ];
    }

    if (files.floorPlans?.length) {
        media.floorPlans = [
            ...(media.floorPlans || []),
            ...files.floorPlans.map(f => `${req.protocol}://${req.get("host")}/uploads/floorplans/${f.filename}`),
        ];
    }

    if (body.heroMediaType !== undefined) media.heroMediaType = body.heroMediaType;
    if (body.heroMediaUrl !== undefined) media.heroMediaUrl = body.heroMediaUrl;

    updateData.media = media;

    const updated = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    res.json(updated);
}));

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/properties/:id (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Property not found" });
    res.json({ message: "Property deleted" });
}));

export { router as propertyRoute };
