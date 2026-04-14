"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/hooks/useAuth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async ({ withLoading = false } = {}) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }

        if (withLoading) setLoading(true);

        try {
            const res = await getCurrentUser();
            setUser(res.user);
            return res.user;
        } catch {
            setUser(null);
            localStorage.removeItem("accessToken");
            return null;
        } finally {
            if (withLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await refreshUser({ withLoading: true });
        };

        init();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
