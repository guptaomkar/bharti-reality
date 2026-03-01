import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./AuthModal.css";

const AuthModal = ({ opened, onClose }) => {
    const { login, register } = useAuth();
    const [tab, setTab] = useState("login"); // "login" | "register"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);

    if (!opened) return null;

    const resetForm = () => { setName(""); setEmail(""); setPassword(""); setConfirm(""); };
    const switchTab = (t) => { resetForm(); setTab(t); };

    const handleLogin = async () => {
        if (!email || !password) { toast.error("Please fill in all fields"); return; }
        setBusy(true);
        try {
            const u = await login(email, password);
            toast.success(`Welcome back, ${u.name}!`);
            resetForm();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed");
        } finally {
            setBusy(false);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password) { toast.error("Please fill in all fields"); return; }
        if (password !== confirm) { toast.error("Passwords do not match"); return; }
        if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
        setBusy(true);
        try {
            const u = await register(name, email, password);
            toast.success(`Account created — welcome, ${u.name}!`);
            resetForm();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed");
        } finally {
            setBusy(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter") tab === "login" ? handleLogin() : handleRegister();
    };

    return (
        <motion.div
            className="am-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="am-panel"
                initial={{ y: 40, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button className="am-close" type="button" onClick={onClose}>✕</button>

                {/* Brand */}
                <div className="am-brand">
                    <img src="/logo.png" alt="HAVEN" className="am-logo" />
                    <span className="haven-label">Member Access</span>
                </div>

                {/* Tabs */}
                <div className="am-tabs">
                    {["login", "register"].map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={`am-tab ${tab === t ? "am-tab--active" : ""}`}
                            onClick={() => switchTab(t)}
                        >
                            {t === "login" ? "Sign In" : "Create Account"}
                        </button>
                    ))}
                </div>

                {/* Fields — always rendered, no AnimatePresence swapping */}
                <div className="am-form">
                    {tab === "register" && (
                        <div className="am-field">
                            <label className="am-label">Full Name</label>
                            <input
                                className="am-input"
                                type="text"
                                autoComplete="name"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={handleKey}
                            />
                        </div>
                    )}

                    <div className="am-field">
                        <label className="am-label">Email</label>
                        <input
                            className="am-input"
                            type="email"
                            autoComplete="email"
                            placeholder={tab === "login" ? "admin@haven.com" : "you@example.com"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKey}
                        />
                    </div>

                    <div className="am-field">
                        <label className="am-label">Password</label>
                        <input
                            className="am-input"
                            type="password"
                            autoComplete={tab === "login" ? "current-password" : "new-password"}
                            placeholder={tab === "login" ? "••••••••" : "Min 6 characters"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKey}
                        />
                    </div>

                    {tab === "register" && (
                        <div className="am-field">
                            <label className="am-label">Confirm Password</label>
                            <input
                                className="am-input"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Repeat password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                onKeyDown={handleKey}
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        className="button am-submit"
                        disabled={busy}
                        onClick={tab === "login" ? handleLogin : handleRegister}
                    >
                        {busy
                            ? (tab === "login" ? "Signing in…" : "Creating account…")
                            : (tab === "login" ? "Sign In →" : "Create Account →")}
                    </button>
                </div>

                {/* Test credentials hint */}
                <div className="am-hint">
                    <span className="am-hint-label">Test accounts</span>
                    <div className="am-hint-row">
                        <span>👑 Admin</span>
                        <code>admin@haven.com / Haven@Admin1</code>
                    </div>
                    <div className="am-hint-row">
                        <span>👤 User</span>
                        <code>user@haven.com / Haven@User1</code>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AuthModal;
