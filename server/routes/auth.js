import express from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "haven_secret_dev_key_change_in_prod";
const JWT_EXPIRES = "7d";

// ── Middleware: verify token ──────────────────────────────────────────────────
export const requireAuth = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorised — no token" });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.id;
        req.userRole = payload.role;
        next();
    } catch {
        res.status(401).json({ message: "Unauthorised — invalid token" });
    }
});

export const requireAdmin = asyncHandler(async (req, res, next) => {
    if (req.userRole !== "admin")
        return res.status(403).json({ message: "Forbidden — admin only" });
    next();
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
    "/register",
    asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: "Name, email and password are required" });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ message: "An account with this email already exists" });

        const user = new User({ name, email });
        await user.setPassword(password);
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.status(201).json({ token, user: user.toSafeObject() });
    })
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
    "/login",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password are required" });

        // explicitly select passwordHash since it is excluded by default
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user)
            return res.status(401).json({ message: "Invalid email or password" });

        const ok = await user.checkPassword(password);
        if (!ok)
            return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.json({ token, user: user.toSafeObject() });
    })
);

// ── GET /api/auth/me — restore session from stored token ─────────────────────
router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ user: user.toSafeObject() });
    })
);

export { router as authRoute };
