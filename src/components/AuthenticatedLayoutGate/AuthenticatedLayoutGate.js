"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Wraps routes that require a signed-in user; redirects to login with ?next= when unauthenticated.
 */
export default function AuthenticatedLayoutGate({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;
        if (user) return;
        const returnPath = pathname || "/";
        const loginUrl = `/auth/login?next=${encodeURIComponent(returnPath)}`;
        router.replace(loginUrl);
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
