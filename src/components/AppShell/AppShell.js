"use client";

import Navbar from "@/components/Navbar/Navbar";
import { usePathname } from "next/navigation";

export default function AppShell({ children }) {
    const pathname = usePathname();
    const isAuthRoute = pathname?.startsWith("/auth");

    return (
        <>
            {!isAuthRoute && <Navbar />}
            <main className={`flex min-h-0 flex-1 flex-col ${isAuthRoute ? "" : "pt-18"}`}>
                {children}
            </main>
        </>
    );
}
