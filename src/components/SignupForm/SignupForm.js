"use client";

import { signup } from "@/hooks/useAuth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupForm() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("")
    const [successMsg, setSuccessMsg] = useState("")

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try{
            const res = await signup(formData);
            setSuccessMsg(res.message || "Signup successful ✅");
            setFormData({
                username: "",
                email: "",
                password: "",
            });
            setErrorMsg("");
            setSuccessMsg("");
            setUser(res.user);
            router.push("/");
        } catch (err){
            setErrorMsg(err.message || "Signup failed ❌");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
                <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20">
                    {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="text-green-400 text-xs bg-green-400/10 p-2 rounded border border-green-400/20">
                    {successMsg}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-100">Username</label>
                <input
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white border border-white/10 outline-none focus:border-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-100">Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white border border-white/10 outline-none focus:border-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-100">Password</label>
                <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white border border-white/10 outline-none focus:border-indigo-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 rounded-md text-white font-bold transition-all disabled:opacity-50"
            >
                {loading ? "Signing up..." : "Sign up"}
            </button>
        </form>
    );
}
