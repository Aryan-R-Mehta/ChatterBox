"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getApiBaseUrl } from "@/config/api";
import { fetchAuthenticatedProfile } from "@/api/chatBackendClient";

const AuthContext = createContext(null);
const SESSION_HINT_KEY = "cb_has_session";

async function trySilentRefreshAccessToken() {
    const res = await axios.post(
        `${getApiBaseUrl()}/auth/refresh`,
        {},
        { withCredentials: true }
    );
    const accessToken = res.data?.accessToken;
    if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem(SESSION_HINT_KEY, "1");
    }
    return accessToken ?? null;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async ({ withLoading = false } = {}) => {
        let token = localStorage.getItem("accessToken");
        const hasSessionHint = localStorage.getItem(SESSION_HINT_KEY) === "1";

        if (!token && hasSessionHint) {
            try {
                token = await trySilentRefreshAccessToken();
            } catch {
                token = null;
                localStorage.setItem(SESSION_HINT_KEY, "0");
            }
        }

        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }

        if (withLoading) setLoading(true);

        try {
            const res = await fetchAuthenticatedProfile();
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
