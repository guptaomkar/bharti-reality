import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { propertyRoute } from "./routes/properties.js";
import { authRoute } from "./routes/auth.js";
import { bookingRoute } from "./routes/bookings.js";


// ─── Legacy routes (Prisma-based, kept for backward compat) ──────────────────
// Removed as part of migration to Mongoose backend

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.HAVEN_PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://full-stack-real-estate-youtube.vercel.app",
  ],
  credentials: true,
}));


// ─── Static file serving for uploads ─────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/haven_realestate";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("  ✦ MongoDB connected — haven_realestate");
  } catch (err) {
    console.error("  ✖ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("  ⚠ MongoDB disconnected. Attempting to reconnect…");
});
mongoose.connection.on("reconnected", () => {
  console.log("  ✦ MongoDB reconnected.");
});

connectDB().then(initDB);

// ─── DB Initialisation — auto-create database + seed if empty ────────────────
async function initDB() {
  try {
    const db = mongoose.connection.db;

    // ── Properties ────────────────────────────────────────────────────────────
    const propCols = await db.listCollections({ name: "properties" }).toArray();
    if (!propCols.length) {
      console.log("  ◌ 'properties' collection not found — creating and seeding…");
      await seedProperties();
    } else {
      const { default: Property } = await import("./models/Property.js");
      const count = await Property.countDocuments();
      if (count === 0) {
        console.log("  ◌ 'properties' collection is empty — seeding initial data…");
        await seedProperties();
      } else {
        console.log(`  ✦ Database ready — ${count} propert${count === 1 ? "y" : "ies"} found`);
      }
    }

    // ── Default accounts ──────────────────────────────────────────────────────
    const { default: User } = await import("./models/User.js");
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("  ◌ No users found — creating default admin & user accounts…");
      await seedUsers(User);
    } else {
      console.log(`  ✦ Users ready — ${userCount} account${userCount === 1 ? "" : "s"} found`);
    }

  } catch (err) {
    console.error("  ✖ DB initialisation error:", err.message);
  }
}

async function seedProperties() {
  const { default: Property } = await import("./models/Property.js");
  const { STATIC_PROPERTIES } = await import("./data/propertiesSeed.js");
  const inserted = await Property.create(STATIC_PROPERTIES);
  console.log(`  ✦ Seeded ${inserted.length} properties ✓`);
}

async function seedUsers(User) {
  const defaults = [
    { name: "Haven Admin", email: "admin@haven.com", password: "Haven@Admin1", role: "admin" },
    { name: "Test User", email: "user@haven.com", password: "Haven@User1", role: "user" },
  ];
  for (const d of defaults) {
    const u = new User({ name: d.name, email: d.email, role: d.role });
    await u.setPassword(d.password);
    await u.save();
    console.log(`  ✦ Created ${d.role}: ${d.email}`);
  }
}




app.use("/api/auth", authRoute);
app.use("/api/properties", propertyRoute);
app.use("/api/bookings", bookingRoute);


// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  const mongoState = mongoose.connection.readyState;

  const stateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.json({
    status: "ok",
    brand: "HAVEN",
    server: "Mongoose",
    mongo: stateMap[mongoState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`\n  ✦ HAVEN Server (Mongoose) running on port ${PORT}\n`);
});
