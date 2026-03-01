import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import { uploadFields, handleUploadError } from "../middleware/upload.js";
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
//  PUT /api/properties/:id — partial update
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", uploadFields, handleUploadError, asyncHandler(async (req, res) => {
    const updated = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Property not found" });
    res.json(updated);
}));

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/properties/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", asyncHandler(async (req, res) => {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Property not found" });
    res.json({ message: "Property deleted" });
}));

export { router as propertyRoute };
