import { ChevronDown, Eye, EyeOff, LockKeyhole, LogOut, Mail, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../../auth/hooks/useAuth";
import ConfirmDialog from "../../../shared/components/common/ConfirmDialog";
import { getDisplayName, getInitials } from "../../../shared/utils/userUtils";

function Profile() {
    const { user, authLoading, logout, updateProfile, updateEmail, updatePassword } = useAuth();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [securityOpen, setSecurityOpen] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const savedDisplayName = user?.user_metadata?.username?.trim() || "";
    const currentDisplayName = getDisplayName(user);
    const currentEmail = user?.email || "";
    const initials = getInitials(currentDisplayName);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayName(savedDisplayName);
        setEmail(currentEmail);
    }, [savedDisplayName, currentEmail]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        const name = displayName.trim();
        const newEmail = email.trim();

        if (!name) return toast.error("Display name is required.");
        if (!newEmail) return toast.error("Email address is required.");

        const nameChanged = name !== savedDisplayName;
        const emailChanged = newEmail !== currentEmail;

        if (!nameChanged && !emailChanged) return toast.info("No changes to save.");

        setSavingProfile(true);

        try {
            if (nameChanged) await updateProfile(name);

            if (emailChanged) {
                const data = await updateEmail(newEmail);
                toast.success(data.message || "Check your new email to confirm the change.");
            } else {
                toast.success("Profile updated successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword) return toast.error("Enter a new password.");
        if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
        if (!confirmPassword) return toast.error("Confirm your new password.");
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");

        setSavingPassword(true);

        try {
            await updatePassword(newPassword);
            setNewPassword("");
            setConfirmPassword("");
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setSecurityOpen(false);
            toast.success("Password updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update password.");
        } finally {
            setSavingPassword(false);
        }
    };

    const handleConfirmLogout = async () => {
        setShowLogoutDialog(false);
        try { await logout(); } finally { window.location.replace("/"); }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-5 pb-8">
            <div>
                <h1 className="text-xl font-semibold text-slate-800 dark:text-white sm:text-2xl">Profile</h1>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">Manage your account information and security.</p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-5 bg-gradient-to-r from-green-50/80 to-white px-5 py-6 dark:from-green-950/20 dark:to-slate-900 sm:px-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-semibold tracking-wide text-green-700 ring-4 ring-white shadow-sm dark:bg-green-950 dark:text-green-300 dark:ring-slate-800">
                        {initials}
                    </div>

                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-slate-800 dark:text-slate-100">{currentDisplayName}</h2>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{currentEmail}</p>
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-green-600 dark:text-green-400">Takda account</p>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <form onSubmit={handleProfileSubmit}>
                    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Account Information</h3>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Update how your account information appears in Takda.</p>
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                        <div className="space-y-1.5">
                            <label htmlFor="displayName" className="text-xs font-medium text-slate-600 dark:text-slate-300">Display name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" maxLength={50} placeholder="Enter your display name" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-green-600 dark:focus:ring-green-950" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-medium text-slate-600 dark:text-slate-300">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-green-600 dark:focus:ring-green-950" />
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Changing your email may require confirmation from your new email address.</p>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
                            <button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                                <Save size={16} /> {savingProfile ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button type="button" onClick={() => setSecurityOpen((open) => !open)} aria-expanded={securityOpen} className="flex w-full items-center gap-3 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-6">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><LockKeyhole size={17} /></div>

                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Security</h3>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Change the password used to access your account.</p>
                    </div>

                    <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-200 ${securityOpen ? "rotate-180" : ""}`} />
                </button>

                {securityOpen && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-5 border-t border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                        <div className="space-y-1.5">
                            <label htmlFor="newPassword" className="text-xs font-medium text-slate-600 dark:text-slate-300">New password</label>
                            <div className="relative">
                                <input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="Enter new password" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-green-600 dark:focus:ring-green-950" />
                                <button type="button" onClick={() => setShowNewPassword((show) => !show)} aria-label={showNewPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirmPassword" className="text-xs font-medium text-slate-600 dark:text-slate-300">Confirm new password</label>
                            <div className="relative">
                                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Confirm new password" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-green-600 dark:focus:ring-green-950" />
                                <button type="button" onClick={() => setShowConfirmPassword((show) => !show)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Use at least 6 characters.</p>
                            <button type="submit" disabled={savingPassword} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700">
                                <LockKeyhole size={16} /> {savingPassword ? "Updating..." : "Change password"}
                            </button>
                        </div>
                    </form>
                )}
            </section>

            <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm dark:border-red-900/40 dark:bg-slate-900 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Log out</h3>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">End your current Takda session on this device.</p>
                    </div>

                    <button type="button" onClick={() => setShowLogoutDialog(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30">
                        <LogOut size={16} /> Log out
                    </button>
                </div>
            </section>

            <ConfirmDialog isOpen={showLogoutDialog} title="Log out?" message="Are you sure you want to log out of your account?" confirmText="Log out" onConfirm={handleConfirmLogout} onCancel={() => setShowLogoutDialog(false)} />
        </div>
    );
}

export default Profile;