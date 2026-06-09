import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User";
import Profile from "../models/Profile";
import cloudinary from "../utils/cloudinary";
import { handleError as genericHandleError } from "../utils/error.util";

// ─────────────────────────────────────────────
// HELPER: Error Handler
// ─────────────────────────────────────────────
const handleError = (res: Response, error: any, defaultMessage: string) => {
  genericHandleError(res, error, defaultMessage, "Profile Controller");
};

// ─────────────────────────────────────────────
// Validators
// ─────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters").optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

// ─────────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────────
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    const user = await User.findById(userId).select("authProvider");

    res.status(200).json({
      success: true,
      profile: {
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        role: profile.role,
        authProvider: user?.authProvider || "local",
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to get profile");
  }
};

// ─────────────────────────────────────────────
// UPDATE PROFILE (name + avatar)
// ─────────────────────────────────────────────
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name } = updateProfileSchema.parse(req.body);
    const file = (req as any).file;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    // Update name if provided
    if (name) {
      profile.name = name;
    }

    // Upload avatar if file provided
    if (file) {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = "data:" + file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "the_dev_journal_avatars",
        resource_type: "auto",
        transformation: [
          { width: 256, height: 256, crop: "fill", gravity: "face" },
        ],
      });

      profile.avatar = result.secure_url;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        role: profile.role,
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to update profile");
  }
};

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Google-only users cannot change password
    if (user.authProvider === "google") {
      res.status(400).json({
        success: false,
        message: "Password change is not available for Google-authenticated accounts",
      });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Current password is incorrect" });
      return;
    }

    // Don't allow same password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      res.status(400).json({ success: false, message: "New password must be different from current password" });
      return;
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    handleError(res, error, "Failed to change password");
  }
};
