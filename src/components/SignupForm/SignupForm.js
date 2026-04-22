"use client";

import { registerAccount } from "@/api/chatBackendClient";
import { useAuth } from "@/context/AuthContext";
import { showAppToast } from "@/components/AppToast/ToastNotification";
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try{
            const res = await registerAccount(formData);
            localStorage.setItem("accessToken", res.accessToken);
            localStorage.setItem("cb_has_session", "1");
            showAppToast("success", "Signup successful");
            setFormData({
                username: "",
                email: "",
                password: "",
            });
            setUser(res.user);
            router.push("/");
        } catch (err){
            showAppToast("error", "Signup failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
