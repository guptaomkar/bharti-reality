import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Ensure upload directories exist ─────────────────────────────────────────
const dirs = ["photos", "videos", "floorplans", "thumbnails"].map((d) => {
    const full = path.join(__dirname, "..", "uploads", d);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
    return full;
});

// ─── Storage engine ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isVideo = file.mimetype.startsWith("video/");
        const isThumbnail = file.fieldname === "videoThumbnail";
        const isFloorPlan = file.fieldname === "floorPlans";

        let folder;
        if (isFloorPlan) folder = "floorplans";
        else if (isThumbnail) folder = "thumbnails";
        else if (isVideo) folder = "videos";
        else folder = "photos";

        cb(null, path.join(__dirname, "..", "uploads", folder));
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
    },
});

// ─── MIME filter ──────────────────────────────────────────────────────────────
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];

const fileFilter = (_req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200MB per file
        files: 30,                    // max 30 files per request
    },
});

// ─── Named fields config ──────────────────────────────────────────────────────
export const uploadFields = upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "photos", maxCount: 20 },
    { name: "videos", maxCount: 5 },
    { name: "videoThumbnail", maxCount: 5 },
    { name: "floorPlans", maxCount: 4 },
]);

// ─── Error middleware ─────────────────────────────────────────────────────────
export const handleUploadError = (err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};
