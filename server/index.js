import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userRoute } from './routes/userRoute.js';
import { residencyRoute } from './routes/residencyRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173',   // Vite dev server
        'http://localhost:3000',
        'https://full-stack-real-estate-youtube.vercel.app',
    ],
    credentials: true,
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/user', userRoute);
app.use('/api/residency', residencyRoute);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', brand: 'HAVEN' }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`\n ✦ HAVEN Server running on port ${PORT}\n`);
});