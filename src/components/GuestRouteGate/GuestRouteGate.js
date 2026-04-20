"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Wraps auth pages (login/signup): signed-in users are sent to the home chat shell.
 */
export default function GuestRouteGate({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (user) router.replace("/");
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="loader" />
            </div>
        );
    }

    if (user) return null;

    return children;
}
