"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOutAndInvalidateSession } from "@/api/chatBackendClient";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { UserPen } from "lucide-react";
import ModalShell from "@/components/ui/ModalShell";

export default function Navbar() {
    const { user, loading, setUser } = useAuth();
    const router = useRouter();
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openLogoutModal, setOpenLogoutModal] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) return <div />;

    const handleSignOut = async () => {
        setOpenDropdown(false);
        try {
            await signOutAndInvalidateSession();
        } catch {
            /* still clear client state */
        }
        setUser(null);
        router.replace("/auth/login");
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-[var(--mv-nav)]/95 backdrop-blur-sm border-b border-[var(--mv-hairline)]">
            <div className="mx-auto flex items-center justify-between p-5">
                <Link
                    href="/"
                    className="text-xl font-bold text-white tracking-tight hover:opacity-80 transition"
                >
                    ChatterBox
                </Link>

                {user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setOpenDropdown(!openDropdown)}
                            className="flex items-center gap-2 rounded-full border border-[var(--mv-hairline)] bg-[var(--mv-elevated)] px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-[#21314d] focus:outline-none focus:ring-2 focus:ring-[var(--mv-accent-blue)]"
                        >
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            {user.username}
                        </button>

                        {openDropdown && (
                            <div className="mv-modal-surface absolute right-0 mt-3 w-56 overflow-hidden">
                                <div className="border-b border-[var(--mv-hairline)] px-4 py-3">
                                    <p className="text-sm font-semibold text-white">
                                        {user.username}
                                    </p>
                                    <p className="text-sm text-slate-400 truncate">
                                        {user.email}
                                    </p>
                                </div>

                                <ul className="text-sm text-slate-300">
                                    <li>
                                        <Link
                                            href="/profile"
                                            className="mt-1 flex gap-3 px-4 py-2 transition hover:bg-[#1c2d4a] hover:text-white"
                                            onClick={() => setOpenDropdown(false)}
                                        >
                                            <UserPen size={18} />
                                            Edit Profile
                                        </Link>
                                    </li>
                                    <li className="mt-1 border-t border-[var(--mv-hairline)] pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setOpenLogoutModal(!openLogoutModal)}
                                            className="mb-1 block w-full cursor-pointer px-4 py-2 text-left text-[var(--mv-danger)] transition hover:bg-red-500/10"
                                        >
                                            <span className="flex items-center gap-3">
                                                <LogOutIcon size={18} />
                                                Sign out
                                            </span>
                                        </button>

                                        {openLogoutModal && (
                                            <ModalShell
                                                onClose={() => setOpenLogoutModal(false)}
                                                panelClassName="mv-modal-surface w-80 p-6"
                                                overlayClassName="h-screen bg-black/50"
                                            >
                                                    <h2 className="text-white text-lg font-semibold mb-4">
                                                        Confirm Logout
                                                    </h2>

                                                    <p className="text-slate-400 mb-6">
                                                        Are you sure you want to sign out?
                                                    </p>

                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setOpenLogoutModal(false)}
                                                            className="mv-btn mv-btn-secondary px-4 py-2 text-sm"
                                                        >
                                                            Cancel
                                                        </button>

                                                        <button
                                                            onClick={handleSignOut}
                                                            className="mv-btn mv-btn-danger px-4 py-2 text-sm"
                                                        >
                                                            Logout
                                                        </button>
                                                    </div>
                                            </ModalShell>
                                        )}
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-sm">
                        <Link
                            href="/auth/login"
                            className="text-slate-200 hover:text-white transition"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 transition"
                        >
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}