"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { UserPen } from "lucide-react";

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
            await logout();
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
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            {user.username}
                        </button>

                        {openDropdown && (
                            <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-700">
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
                                            className="flex gap-3 px-4 py-2 mt-1 hover:bg-slate-800 hover:text-white transition"
                                            onClick={() => setOpenDropdown(false)}
                                        >
                                            <UserPen size={18} />
                                            Edit Profile
                                        </Link>
                                    </li>
                                    <li className="border-t border-slate-700 mt-1 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setOpenLogoutModal(!openLogoutModal)}
                                            className="w-full mb-1 flex gap-3 cursor-pointer text-left block px-4 py-2 text-red-500 hover:bg-red-500/10 transition"
                                        >
                                            <LogOutIcon size={18} />
                                            Sign out
                                        </button>

                                        {openLogoutModal && (
                                            <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50">

                                                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-80 shadow-xl">
                                                    <h2 className="text-white text-lg font-semibold mb-4">
                                                        Confirm Logout
                                                    </h2>

                                                    <p className="text-slate-400 mb-6">
                                                        Are you sure you want to sign out?
                                                    </p>

                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setOpenLogoutModal(false)}
                                                            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded text-white"
                                                        >
                                                            Cancel
                                                        </button>

                                                        <button
                                                            onClick={handleSignOut}
                                                            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 rounded text-white"
                                                        >
                                                            Logout
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
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