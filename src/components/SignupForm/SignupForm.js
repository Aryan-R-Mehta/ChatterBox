"use client";

import { registerAccount } from "@/api/chatBackendClient";
import { useAuth } from "@/context/AuthContext";
import { showAppToast } from "@/components/AppToast/ToastNotification";
import { getApiErrorMessage } from "@/lib/http-error.util";
import { setAccessToken } from "@/lib/auth-storage";
import { validateEmail, validatePassword, validateUsername } from "@/lib/form-validation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordInput from "@/components/ui/PasswordInput";

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
        const usernameError = validateUsername(formData.username);
        if (usernameError) {
            showAppToast("error", usernameError);
            return;
        }
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
        try{
            const res = await registerAccount(formData);
            setAccessToken(res.accessToken);
            showAppToast("success", "Signup successful");
            setFormData({
                username: "",
                email: "",
                password: "",
            });
            setUser(res.user);
            router.push("/");
        } catch (err){
            showAppToast("error", getApiErrorMessage(err, "Signup failed"));
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
                    className="mv-input"
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
                    className="mv-input"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-100">Password</label>
                <PasswordInput
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mv-input"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mv-btn mv-btn-primary w-full py-2 disabled:opacity-50"
            >
                {loading ? "Signing up..." : "Sign up"}
            </button>
        </form>
    );
}
