"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  User,
  Mail,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  LogOut,
  Shield,
  AlertCircle,
} from "lucide-react";
import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import BlogNavbar from "@/components/layout/BlogNavbar";
import { authApi, profileApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: "creator" | "visitor";
  authProvider: "local" | "google";
}

// ─── Password strength ───────────────────────────────────────────────────────
function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
const strengthColor = [
  "",
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-emerald-500",
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm ${
        type === "success"
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          : "bg-red-500/10 border-red-500/20 text-red-300"
      }`}
    >
      {type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/40 hover:text-white/70 transition"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Load profile ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const raw = Cookies.get("user");
        if (!raw) {
          router.push("/login");
          return;
        }

        const res = await profileApi.getProfile();
        setProfile(res.profile);
        setEditName(res.profile.name);
      } catch {
        // Fallback to cookie data
        const raw = Cookies.get("user");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setProfile({ ...parsed, authProvider: "local" });
            setEditName(parsed.name);
          } catch {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!editName.trim() || editName.trim() === profile?.name) {
      setIsEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await profileApi.updateProfile({ name: editName.trim() });
      setProfile((prev) =>
        prev ? { ...prev, name: res.profile.name } : prev
      );
      // Update cookie
      const raw = Cookies.get("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.name = res.profile.name;
        Cookies.set("user", JSON.stringify(parsed));
      }
      setIsEditingName(false);
      setToast({ message: "Name updated successfully", type: "success" });
    } catch (e: any) {
      setToast({
        message: e.message || "Failed to update name",
        type: "error",
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setToast({ message: "Please select an image file", type: "error" });
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "Image must be less than 5MB", type: "error" });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setSavingAvatar(true);
    try {
      const res = await profileApi.updateProfile({ avatar: file });
      setProfile((prev) =>
        prev ? { ...prev, avatar: res.profile.avatar } : prev
      );
      // Update cookie
      const raw = Cookies.get("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.avatar = res.profile.avatar;
        Cookies.set("user", JSON.stringify(parsed));
      }
      setAvatarPreview(null);
      setToast({ message: "Avatar updated successfully", type: "success" });
    } catch (e: any) {
      setAvatarPreview(null);
      setToast({
        message: e.message || "Failed to update avatar",
        type: "error",
      });
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    setSavingPassword(true);
    try {
      await profileApi.changePassword({
        currentPassword,
        newPassword,
      });
      setToast({ message: "Password changed successfully", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (e: any) {
      setToast({
        message: e.message || "Failed to change password",
        type: "error",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      /* silent */
    }
    Cookies.remove("token");
    Cookies.remove("user");
    router.push("/");
  };

  // ── Derived ───────────────────────────────────────────────────────────
  const pwStrength = getPasswordStrength(newPassword);
  const canChangePassword = profile?.authProvider === "local";
  const passwordValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    pwStrength >= 3;

  // ── Render ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <BackgroundGlow />
        <GridPattern />
      </div>

      <BlogNavbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 pt-32 pb-20">
        {/* ── Page title ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Profile Settings
          </h1>
          <p className="text-white/40 text-sm">
            Manage your account information and security
          </p>
        </motion.div>

        {/* ── Avatar section ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden mb-6"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

          <div className="p-7 sm:p-8 flex flex-col items-center">
            {/* Avatar with edit overlay */}
            <div className="relative group mb-5">
              <div
                className="relative w-28 h-28 rounded-2xl overflow-hidden ring-2 ring-violet-500/30 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {(avatarPreview || profile.avatar) ? (
                  <Image
                    src={avatarPreview || profile.avatar!}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <User size={44} className="text-white/40" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  {savingAvatar ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                    <Camera size={24} className="text-white" />
                  )}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>

            <p className="text-xs text-white/30 mb-1">
              Click avatar to change • Max 5MB
            </p>

            {/* Role badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                profile.role === "creator"
                  ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                  : "bg-sky-500/15 text-sky-300 border border-sky-500/20"
              }`}
            >
              {profile.role}
            </span>
          </div>
        </motion.div>

        {/* ── Personal info section ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden mb-6"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="px-7 py-5 border-b border-white/[0.06]">
            <h2 className="font-semibold text-white/90 flex items-center gap-2">
              <User size={16} className="text-indigo-400" />
              Personal Information
            </h2>
          </div>

          <div className="p-7 space-y-6">
            {/* Name field */}
            <div>
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">
                Display Name
              </label>
              {isEditingName ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setIsEditingName(false);
                        setEditName(profile.name);
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-50"
                  >
                    {savingName ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setEditName(profile.name);
                    }}
                    className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between group/name">
                  <span className="text-white/90 text-sm font-medium">
                    {profile.name}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-violet-400 hover:text-violet-300 transition opacity-0 group-hover/name:opacity-100 px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Email field (read-only) */}
            <div>
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5">
                <Mail size={15} className="text-white/25 flex-shrink-0" />
                <span className="text-white/50 text-sm">{profile.email}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <Lock size={11} className="text-white/20" />
                  <span className="text-[10px] text-white/20 uppercase tracking-wider">
                    Read only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Password section ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden mb-6"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          <div className="px-7 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-semibold text-white/90 flex items-center gap-2">
              <Shield size={16} className="text-amber-400" />
              Password & Security
            </h2>
            {canChangePassword && (
              <button
                onClick={() => {
                  setShowPasswordSection(!showPasswordSection);
                  if (showPasswordSection) {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }
                }}
                className="text-xs text-violet-400 hover:text-violet-300 transition px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
              >
                {showPasswordSection ? "Cancel" : "Change Password"}
              </button>
            )}
          </div>

          <div className="p-7">
            {!canChangePassword ? (
              <div className="flex items-start gap-3 bg-sky-500/5 border border-sky-500/10 rounded-xl p-4">
                <AlertCircle
                  size={18}
                  className="text-sky-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm text-sky-300 font-medium mb-1">
                    Google Account
                  </p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Your account is linked with Google. Password management is
                    handled through your Google account settings.
                  </p>
                </div>
              </div>
            ) : !showPasswordSection ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Lock size={16} className="text-white/30" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Password is set</p>
                  <p className="text-xs text-white/30">
                    Click &quot;Change Password&quot; to update your credentials
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleChangePassword}
                  className="space-y-5"
                >
                  {/* Current password */}
                  <div>
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                      >
                        {showCurrentPw ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter a new password"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                      >
                        {showNewPw ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {newPassword.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3"
                      >
                        <div className="flex gap-1.5 mb-1.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                pwStrength >= level
                                  ? strengthColor[pwStrength]
                                  : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                        <p
                          className={`text-[11px] ${
                            pwStrength >= 4
                              ? "text-emerald-400"
                              : pwStrength >= 3
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {strengthLabel[pwStrength]}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 transition ${
                          confirmPassword.length > 0 &&
                          confirmPassword !== newPassword
                            ? "border-red-500/40 focus:border-red-500/50 focus:ring-red-500/20"
                            : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                      >
                        {showConfirmPw ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                    {confirmPassword.length > 0 &&
                      confirmPassword !== newPassword && (
                        <p className="text-[11px] text-red-400 mt-1.5">
                          Passwords do not match
                        </p>
                      )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!passwordValid || savingPassword}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all text-sm font-medium shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-indigo-600"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Changing Password…
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        Update Password
                      </>
                    )}
                  </button>
                </motion.form>
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* ── Sign out ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl border border-red-500/15 bg-red-500/[0.04] hover:bg-red-500/[0.08] text-red-400 hover:text-red-300 transition text-sm font-medium disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <LogOut size={15} />
            )}
            Sign Out
          </button>
        </motion.div>
      </div>
    </main>
  );
}
