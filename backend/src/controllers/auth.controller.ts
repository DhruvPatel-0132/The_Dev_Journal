import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../services/jwt.service";

import { registerSchema, loginSchema } from "../validators/auth.validator";
import { z } from "zod";
import User from "../models/User";
import Token from "../models/Token";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role } = validatedData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        issues: error.issues,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password, rememberMe } = validatedData;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const tokenPayload = {
      id: user._id,
      role: user.role,
      rememberMe: !!rememberMe,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenDuration = rememberMe ? "30d" : "7d";
    const refreshToken = generateRefreshToken(tokenPayload, refreshTokenDuration);

    const expiresDays = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000); // 7 or 30 days
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
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresDays * 24 * 60 * 60 * 1000, // 7 or 30 days
      sameSite: "strict",
    });

    const redirect =
      user.role === "creator"
        ? "/dashboard"
        : "/blogs";

    res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      redirect,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        issues: error.issues,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

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

    const tokenPayload = {
      id: user._id,
      role: user.role,
      rememberMe: decoded.rememberMe || false,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const refreshTokenDuration = decoded.rememberMe ? "30d" : "7d";
    const newRefreshToken = generateRefreshToken(tokenPayload, refreshTokenDuration);

    const expiresDays = decoded.rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000); // 7 or 30 days
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
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "strict",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresDays * 24 * 60 * 60 * 1000, // 7 or 30 days
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Token refreshed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Refresh failed" });
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await Token.findOneAndDelete({ refreshToken });
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
      // User exists, login
      const tokenPayload = {
        id: user._id,
        role: user.role,
        rememberMe: true,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload, "30d");

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await Token.findOneAndUpdate(
        { userId: user._id },
        { accessToken, refreshToken, expiresAt },
        { upsert: true, new: true }
      );

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      // Update avatar if provided and user doesn't have one
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: "strict",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "strict",
      });

      const redirect = user.role === "creator" ? "/dashboard" : "/blogs";

      res.status(200).json({
        success: true,
        existingUser: true,
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        redirect,
      });
      return;
    }

    // New user, send back data
    res.status(200).json({
      success: true,
      existingUser: false,
      user: {
        email,
        name,
        avatar: picture,
      },
      credential, // Return it so frontend can pass it to /complete
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Google Authentication failed" });
  }
};

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
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      res.status(400).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const { email, name, picture } = payload;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      avatar: picture,
    });

    const tokenPayload = {
      id: user._id,
      role: user.role,
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

    const redirect = user.role === "creator" ? "/dashboard" : "/blogs";

    res.status(201).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      redirect,
    });
  } catch (error) {
    console.error("Complete Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Account completion failed" });
  }
};