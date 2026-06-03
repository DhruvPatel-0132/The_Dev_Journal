import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../services/jwt.service";

import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validator";
import { z } from "zod";
import User from "../models/User";
import Profile from "../models/Profile";
import Token from "../models/Token";
import ForgotPasswordToken from "../models/ForgotPasswordToken";
import { sendPasswordResetEmail } from "../services/mail.service";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role } = validatedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ success: false, message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User (credentials only)
    const user = await User.create({ email, password: hashedPassword });

    // Create Profile (display info)
    const profile = await Profile.create({ user: user._id, name, email, role });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", issues: error.issues });
      return;
    }
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password, rememberMe } = validatedData;

    // Auth check against User model
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    // Fetch profile for name, role, avatar
    const profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    const tokenPayload = {
      id: user._id,
      role: profile.role,
      rememberMe: !!rememberMe,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenDuration = rememberMe ? "30d" : "7d";
    const refreshToken = generateRefreshToken(tokenPayload, refreshTokenDuration);

    const expiresDays = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    // Store tokens in Token collection
    await Token.findOneAndUpdate(
      { userId: user._id },
      { accessToken, refreshToken, expiresAt },
      { upsert: true, new: true }
    );

    // Store tokens in User document
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresDays * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    const redirect = profile.role === "creator" ? "/dashboard" : "/blogs";

    res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar,
      },
      redirect,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", issues: error.issues });
      return;
    }
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ─────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────
export const refresh = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ success: false, message: "No refresh token provided" });
      return;
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    // Fetch profile for role
    const profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      res.status(401).json({ success: false, message: "Profile not found" });
      return;
    }

    const tokenPayload = {
      id: user._id,
      role: profile.role,
      rememberMe: decoded.rememberMe || false,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const refreshTokenDuration = decoded.rememberMe ? "30d" : "7d";
    const newRefreshToken = generateRefreshToken(tokenPayload, refreshTokenDuration);

    const expiresDays = decoded.rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    await Token.findOneAndUpdate(
      { userId: user._id },
      { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt },
      { upsert: true, new: true }
    );

    user.accessToken = newAccessToken;
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      sameSite: "strict",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresDays * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Token refreshed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Refresh failed" });
  }
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    // Delete the Token document entirely
    const tokenDoc = await Token.findOneAndDelete({ refreshToken });
    if (tokenDoc) {
      // Unset tokens from User document
      await User.findByIdAndUpdate(tokenDoc.userId, {
        $unset: { accessToken: "", refreshToken: "" },
      });
    }
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ─────────────────────────────────────────────
// GOOGLE AUTH (existing user login)
// ─────────────────────────────────────────────
export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ success: false, message: "Missing credential" });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ success: false, message: "Invalid token payload" });
      return;
    }

    const { email, name, picture } = payload;
    if (!email || !name) {
      res.status(400).json({ success: false, message: "Missing email or name from Google" });
      return;
    }

    const user = await User.findOne({ email });

    if (user) {
      // Existing user — fetch their profile
      const profile = await Profile.findOne({ user: user._id });
      if (!profile) {
        res.status(404).json({ success: false, message: "Profile not found" });
        return;
      }

      // Update avatar if missing
      if (!profile.avatar && picture) {
        profile.avatar = picture;
        await profile.save();
      }

      const tokenPayload = {
        id: user._id,
        role: profile.role,
        rememberMe: true,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload, "30d");

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await Token.findOneAndUpdate(
        { userId: user._id },
        { accessToken, refreshToken, expiresAt },
        { upsert: true, new: true }
      );

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        sameSite: "strict",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "strict",
      });

      const redirect = profile.role === "creator" ? "/dashboard" : "/blogs";

      res.status(200).json({
        success: true,
        existingUser: true,
        token: accessToken,
        user: {
          id: user._id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatar: profile.avatar,
        },
        redirect,
      });
      return;
    }

    // New user — send back data for role selection
    res.status(200).json({
      success: true,
      existingUser: false,
      user: { email, name, avatar: picture },
      credential,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Google Authentication failed" });
  }
};

// ─────────────────────────────────────────────
// COMPLETE GOOGLE AUTH (new user, role selected)
// ─────────────────────────────────────────────
export const completeGoogleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { credential, role } = req.body;
    if (!credential || !role) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    if (role !== "visitor" && role !== "creator") {
      res.status(400).json({ success: false, message: "Invalid role" });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const googlePayload = ticket.getPayload();
    if (!googlePayload || !googlePayload.email || !googlePayload.name) {
      res.status(400).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const { email, name, picture } = googlePayload;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    // Create User (credentials)
    const user = await User.create({ email, password: hashedPassword });

    // Create Profile (display info)
    const profile = await Profile.create({
      user: user._id,
      name,
      email,
      role,
      avatar: picture,
    });

    const tokenPayload = {
      id: user._id,
      role: profile.role,
      rememberMe: true,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload, "30d");

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await Token.findOneAndUpdate(
      { userId: user._id },
      { accessToken, refreshToken, expiresAt },
      { upsert: true, new: true }
    );

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    const redirect = profile.role === "creator" ? "/dashboard" : "/blogs";

    res.status(201).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar,
      },
      redirect,
    });
  } catch (error) {
    console.error("Complete Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Account completion failed" });
  }
};

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ success: true, message: "If that email is in our database, we will send a password reset link to it." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await ForgotPasswordToken.findOneAndUpdate(
      { userId: user._id },
      { token, expiresAt },
      { upsert: true, new: true }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({ success: true, message: "If that email is in our database, we will send a password reset link to it." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation failed", issues: error.issues });
      return;
    }
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Failed to process forgot password request" });
  }
};

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const resetToken = await ForgotPasswordToken.findOne({ token });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      res.status(400).json({ success: false, message: "Invalid or expired password reset token" });
      return;
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      res.status(400).json({ success: false, message: "Invalid token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    await ForgotPasswordToken.deleteOne({ _id: resetToken._id });

    // Log user out of all devices
    await Token.deleteMany({ userId: user._id });
    await User.findByIdAndUpdate(user._id, {
      $unset: { accessToken: "", refreshToken: "" },
    });

    res.status(200).json({ success: true, message: "Password has been successfully reset" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation failed", issues: error.issues });
      return;
    }
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};