import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { havenApi } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("haven_token") || null);
    const [loading, setLoading] = useState(true);

    // ── Restore session on mount ────────────────────────────────────────────────
    useEffect(() => {
        const restore = async () => {
            const stored = localStorage.getItem("haven_token");
            if (!stored) { setLoading(false); return; }
            try {
                const { data } = await havenApi.get("/auth/me", {
                    headers: { Authorization: `Bearer ${stored}` },
                });
                setUser(data.user);
                setToken(stored);
            } catch {
                // token expired / invalid
                localStorage.removeItem("haven_token");
                localStorage.removeItem("haven_user");
                setToken(null);
            } finally {
                setLoading(false);
            }
        };
        restore();
    }, []);

    // ── Login ───────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const { data } = await havenApi.post("/auth/login", { email, password });
        localStorage.setItem("haven_token", data.token);
        localStorage.setItem("haven_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    // ── Register ────────────────────────────────────────────────────────────────
    const register = useCallback(async (name, email, password) => {
        const { data } = await havenApi.post("/auth/register", { name, email, password });
        localStorage.setItem("haven_token", data.token);
        localStorage.setItem("haven_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    // ── Logout ──────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem("haven_token");
        localStorage.removeItem("haven_user");
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};

export default AuthContext;
