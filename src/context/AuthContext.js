"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getApiBaseUrl } from "@/config/api";
import { fetchAuthenticatedProfile } from "@/api/chatBackendClient";
import { isUnauthorizedError } from "@/lib/http-error.util";
import {
    clearAccessToken,
    getAccessToken,
    hasSessionHint,
    setAccessToken,
    setSessionHint,
} from "@/lib/auth-storage";

const AuthContext = createContext(null);

async function trySilentRefreshAccessToken() {
    const res = await axios.post(
        `${getApiBaseUrl()}/auth/refresh`,
        {},
        { withCredentials: true }
    );
    const accessToken = res.data?.accessToken;
    if (accessToken) {
        setAccessToken(accessToken);
    }
    return accessToken ?? null;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async ({ withLoading = false } = {}) => {
        let token = getAccessToken();
        const hasActiveSessionHint = hasSessionHint();

        if (!token && hasActiveSessionHint) {
            try {
                token = await trySilentRefreshAccessToken();
            } catch (error) {
                token = null;
                if (isUnauthorizedError(error)) {
                    setSessionHint(false);
                }
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
            clearAccessToken();
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
