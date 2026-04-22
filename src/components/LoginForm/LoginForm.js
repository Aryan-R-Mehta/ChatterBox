"use client";

import { signInWithEmail } from "@/api/chatBackendClient";
import { useAuth } from "@/context/AuthContext";
import { showAppToast } from "@/components/AppToast/ToastNotification";
import { getApiErrorMessage } from "@/lib/http-error.util";
import { setAccessToken } from "@/lib/auth-storage";
import { validateEmail, validatePassword } from "@/lib/form-validation";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import PasswordInput from "@/components/ui/PasswordInput";

function LoginFormInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
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
        const emailError = validateEmail(formData.email);
        if (emailError) {
            showAppToast("error", emailError);
            return;
        }
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            showAppToast("error", passwordError);
            return;
        }
        setLoading(true);
        try {
            const res = await signInWithEmail(formData);
            setAccessToken(res.accessToken);
            showAppToast("success", "Login successful");
            setFormData({
                email: "",
                password: "",
            });
            setUser(res.user);
            router.push("/");
        } catch(err){
            showAppToast("error", getApiErrorMessage(err, "Login failed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="mv-input mt-2"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                    Password
                </label>
                <PasswordInput
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mv-input mt-2"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mv-btn mv-btn-primary w-full py-2 disabled:opacity-50"
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