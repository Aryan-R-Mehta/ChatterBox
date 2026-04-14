"use client";

import { login } from "@/hooks/useAuth";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginFormInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errorMsg, setErrorMsg] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(formData);
            localStorage.setItem("accessToken", res.accessToken);
            setSuccessMsg(res.message || "Login successful ✅");
            setFormData({
                email: "",
                password: "",
            });
            setErrorMsg("");
            setSuccessMsg("");
            setUser(res.user);
            router.push("/");
        } catch(err){
            setErrorMsg(err.message || "Login failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
                <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20">
                    {errorMsg}
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                    Email address
                </label>
                <input
                    name="email"
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg bg-white/5 px-3 py-2 text-white border border-white/10 focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                    Password
                </label>
                <input
                    name="password"
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg bg-white/5 px-3 py-2 text-white border border-white/10 focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}

export default function LoginForm() {
    return (
        <Suspense fallback={<div className="text-center text-sm text-gray-400">Loading…</div>}>
            <LoginFormInner />
        </Suspense>
    );
}