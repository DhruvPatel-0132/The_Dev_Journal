import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "./jwt.service";
import User from "../models/User";
import Profile from "../models/Profile";
import Token from "../models/Token";
import ForgotPasswordToken from "../models/ForgotPasswordToken";
import { sendPasswordResetEmail } from "./mail.service";
import { AppError } from "../utils/AppError";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (data: any) => {
  const { name, email, password, role } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Create User (credentials only)
  const user = await User.create({ email, password: hashedPassword });

  // Create Profile (display info)
  const profile = await Profile.create({ user: user._id, name, email, role });

  return {
    id: user._id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
  };
};

export const loginUser = async (data: any) => {
  const { email, password, rememberMe } = data;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const profile = await Profile.findOne({ user: user._id });
  if (!profile) {
    throw new AppError("Profile not found", 404);
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

  await Token.findOneAndUpdate(
    { userId: user._id },
    { accessToken, refreshToken, expiresAt },
    { upsert: true, new: true }
  );

  const redirect = profile.role === "creator" ? "/dashboard" : "/blogs";

  return {
    accessToken,
    refreshToken,
    expiresDays,
    user: {
      id: user._id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
    },
    redirect,
  };
};

export const refreshUserToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  let decoded: any;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError("User not found", 401);
  }

  const profile = await Profile.findOne({ user: user._id });
  if (!profile) {
    throw new AppError("Profile not found", 401);
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

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresDays,
  };
};

export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) return;

  await Token.findOneAndDelete({ refreshToken });
};

export const processGoogleAuth = async (credential: string) => {
  if (!credential) {
    throw new AppError("Missing credential", 400);
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new AppError("Invalid token payload", 400);
  }

  const { email, name, picture } = payload;
  if (!email || !name) {
    throw new AppError("Missing email or name from Google", 400);
  }

  const user = await User.findOne({ email });

  if (user) {
    const profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      throw new AppError("Profile not found", 404);
    }

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

    const redirect = profile.role === "creator" ? "/dashboard" : "/blogs";

    return {
      existingUser: true,
      accessToken,
      refreshToken,
      expiresDays: 30,
      user: {
        id: user._id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar,
      },
      redirect,
    };
  }

  return {
    existingUser: false,
    user: { email, name, avatar: picture },
    credential,
  };
};

export const completeGoogleRegistration = async (credential: string, role: string) => {
  if (!credential || !role) {
    throw new AppError("Missing required fields", 400);
  }

  if (role !== "visitor" && role !== "creator") {
    throw new AppError("Invalid role", 400);
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const googlePayload = ticket.getPayload();
  if (!googlePayload || !googlePayload.email || !googlePayload.name) {
    throw new AppError("Invalid Google token", 400);
  }

  const { email, name, picture } = googlePayload;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const randomPassword = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await bcrypt.hash(randomPassword, 12);

  const user = await User.create({ email, password: hashedPassword });

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

  const redirect = profile.role === "creator" ? "/dashboard" : "/blogs";

  return {
    accessToken,
    refreshToken,
    expiresDays: 30,
    user: {
      id: user._id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
    },
    redirect,
  };
};

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Return true silently for security
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await ForgotPasswordToken.findOneAndUpdate(
    { userId: user._id },
    { token, expiresAt },
    { upsert: true, new: true }
  );

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetLink);
};

export const executePasswordReset = async (data: any) => {
  const { token, password } = data;

  const resetToken = await ForgotPasswordToken.findOne({ token });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  const user = await User.findById(resetToken.userId);
  if (!user) {
    throw new AppError("Invalid token", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  await user.save();

  await ForgotPasswordToken.deleteOne({ _id: resetToken._id });
  await Token.deleteMany({ userId: user._id });
};