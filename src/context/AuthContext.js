"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/hooks/useAuth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async ({ withLoading = false } = {}) => {
    if (withLoading) setLoading(true);
    try {
      const res = await getCurrentUser();
      setUser(res.user);
      return res.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      if (withLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser({ withLoading: true });
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
