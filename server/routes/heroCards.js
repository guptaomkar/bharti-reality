import express from "express";
import asyncHandler from "express-async-handler";
import { HeroCard } from "../models/HeroCard.js";

const router = express.Router();

// GET all active hero cards
router.get("/", asyncHandler(async (req, res) => {
    const cards = await HeroCard.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(cards);
}));

export { router as heroCardsRoute };
