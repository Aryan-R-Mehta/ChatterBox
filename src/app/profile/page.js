"use client";

import { useAuth } from "@/context/AuthContext";
import { deleteAccount, resetPassword, updateAuthenticatedProfile } from "@/api/chatBackendClient";
import { useEffect, useState } from "react";
import { showAppToast } from "@/components/AppToast/ToastNotification";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const { user, setUser, loading } = useAuth();
    const [profileForm, setProfileForm] = useState({
        username: "",
        email: "",
        bio: "",
        showStatus: false,
    });
    const [isDirty, setIsDirty] = useState(false);
    const [openResetPasswordModal, setOpenResetPasswordModal] = useState(false)
    const [openDeleteAccountModal, setOpenDeleteAccountModal] = useState(false)

    const [resetPasswordForm, setResetPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    })

    useEffect(() => {
        if (!user) return;

        setProfileForm({
            id: user.id,
            username: user.username || "",
            email: user.email || "",
            bio: user.bio || "",
            showStatus: user.showStatus || false,
        });
    }, [user]);

    // Detect changes
    useEffect(() => {
        if (!user) return;

        const hasChanges =
            profileForm.username !== (user.username || "") ||
            profileForm.bio !== (user.bio || "") ||
            profileForm.showStatus !== (user.showStatus || false);

        setIsDirty(hasChanges);
    }, [profileForm, user]);

    const handleChange = (field, value) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await updateAuthenticatedProfile(profileForm);
            setUser(res.user);
            setIsDirty(false);
        } catch (err) { }
    };

    const handleDiscard = () => {
        setProfileForm({
            username: user?.username || "",
            email: user?.email || "",
            bio: user?.bio || "",
            showStatus: user?.showStatus || true,
        });
        setIsDirty(false);
    };

    const handleResetPassword = async () => {
        if (resetPasswordForm.newPassword !== resetPasswordForm.confirmNewPassword)
        {
            showAppToast("error", "new password and confirm new password are diffrent.");
            return
        }
        try{
            await resetPassword({
                currentPassword: resetPasswordForm.currentPassword.trim(),
                newPassword: resetPasswordForm.newPassword.trim(),
            })
            showAppToast("success", "Password change successfully.");
        }
        catch {
            showAppToast("error", "Password change failed due to technichal error")
        }
        finally {
            setOpenResetPasswordModal(!openResetPasswordModal)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            showAppToast("success", "Account Deleted Successfully.")
            router.push("/auth/login");
        }
        catch {
            showAppToast("error", "Account Deletion failed due to technical error.")
        }
        finally {
            setOpenDeleteAccountModal(!openDeleteAccountModal)
        }
    }

    const inputClass =
        "w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30";

    const textareaClass = `${inputClass} min-h-[120px] resize-none`;

    if (loading) return <div className="loader"></div>;

    return (
        <div className="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                        My profile
                    </h1>
                </header>

                {/* Card */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-xl backdrop-blur-md">
                    <div className="px-6 py-6 sm:px-8 sm:py-8 border-b border-zinc-800">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                    U
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={profileForm.username}
                                        onChange={(e) =>
                                            handleChange("username", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        className={`${inputClass} opacity-60 cursor-not-allowed`}
                                        value={profileForm.email}
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">
                                    Bio
                                </label>
                                <textarea
                                    className={textareaClass}
                                    value={profileForm.bio}
                                    onChange={(e) => handleChange("bio", e.target.value)}
                                />
                            </div>

                            {/* Toggle */}
                            <div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-medium text-white">
                                        Show online status
                                    </p>

                                    <label className="relative inline-flex h-7 w-12 cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={profileForm.showStatus}
                                            onChange={(e) =>
                                                handleChange("showStatus", e.target.checked)
                                            }
                                        />
                                        <span className="absolute inset-0 rounded-full bg-zinc-700 transition peer-checked:bg-indigo-500" />
                                        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Reset Password */}
                    <div className="px-6 py-6 sm:px-8 border-b border-zinc-800">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Reset your password
                                </p>
                                <p className="text-xs text-zinc-400">
                                    We will send you an email with instructions
                                </p>
                            </div>

                            <button
                                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm text-white hover:bg-indigo-500"
                                onClick={() => setOpenResetPasswordModal(!openResetPasswordModal)}
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="px-6 py-6 sm:px-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Delete your account
                                </p>
                                <p className="text-xs text-zinc-400">
                                    This action cannot be undone
                                </p>
                            </div>

                            <button
                                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm text-white hover:bg-red-500"
                                onClick={() => setOpenDeleteAccountModal(!openDeleteAccountModal)}
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>

                </section>
            </div>

            {openResetPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl animate-in fade-in zoom-in-95">

                        {/* Header */}
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-white">
                                Reset Password
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Enter your current password and choose a new one
                            </p>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={resetPasswordForm.currentPassword}
                                onChange={(e) =>
                                    setResetPasswordForm((prev) => ({
                                        ...prev,
                                        currentPassword: e.target.value,
                                    }))
                                }
                                className={inputClass}
                            />

                            <input
                                type="password"
                                placeholder="New Password"
                                className={inputClass}
                                value={resetPasswordForm.newPassword}
                                onChange={(e) =>
                                    setResetPasswordForm((prev) => ({
                                        ...prev,
                                        newPassword: e.target.value,
                                    }))
                                }
                            />

                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                className={inputClass}
                                value={resetPasswordForm.confirmNewPassword}
                                onChange={(e) =>
                                    setResetPasswordForm((prev) => ({
                                        ...prev,
                                        confirmNewPassword: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setOpenResetPasswordModal(false)}
                                className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white"
                            >
                                Cancel
                            </button>

                            <button
                                className="px-5 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                                onClick={handleResetPassword}
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {openDeleteAccountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl animate-in fade-in zoom-in-95">

                        {/* Header */}
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-white">
                                Delete Account ???
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Are you sure you want to delete your account permanently.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setOpenDeleteAccountModal(false)}
                                className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white"
                            >
                                Cancel
                            </button>

                            <button
                                className="px-5 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white shadow"
                                onClick={handleDeleteAccount}
                            >
                                Delete account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky save bar when the form is dirty */}
            <div
                className={`fixed bottom-0 left-0 w-full transition-all duration-300 ${isDirty
                    ? "translate-y-0 opacity-100"
                    : "translate-y-full opacity-0 pointer-events-none"
                    }`}
            >
                <div className="mx-auto max-w-5xl px-4 pb-4">
                    <div className="flex justify-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900/90 backdrop-blur px-4 py-3 shadow-lg">
                        <button
                            type="button"
                            onClick={handleDiscard}
                            className="rounded-lg px-5 py-2.5 text-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Discard
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="rounded-lg px-5 py-2.5 text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
