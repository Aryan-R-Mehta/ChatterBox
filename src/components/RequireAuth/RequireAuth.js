"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (user) return;
    const next = pathname || "/";
    const login = `/auth/login?next=${encodeURIComponent(next)}`;
    router.replace(login);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="loader" />
      </div>
    );
  }

  return children;
}
