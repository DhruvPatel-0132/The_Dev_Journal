import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "./jwt.service";
import User from "../models/User";
import Profile from "../models/Profile";
import Token from "../models/Token";
import ForgotPasswordToken from "../models/ForgotPasswordToken";
import EmailVerificationOTP from "../models/EmailVerificationOTP";
import { sendPasswordResetEmail, sendVerificationOTPEmail } from "./mail.service";
import { AppError } from "../utils/AppError";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────
// HELPER: Generate 6-digit OTP
// ─────────────────────────────────────────────
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const registerUser = async (data: any) => {
  const { name, email, password, role } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Create User — unverified by default
  const user = await User.create({
    email,
    password: hashedPassword,
    isEmailVerified: false,
    authProvider: "local",
  });

  // Create Profile
  const profile = await Profile.create({ user: user._id, name, email, role });

  // Generate & store OTP (expires in 10 minutes)
  const otp = generateOTP();
  const hashedOTP = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailVerificationOTP.findOneAndUpdate(
    { userId: user._id },
    { userId: user._id, email, otp: hashedOTP, expiresAt },
    { upsert: true, new: true }
  );

  // Send OTP email
  await sendVerificationOTPEmail(email, otp);

  return { email };
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
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

  // Block login for unverified local users
  if (!user.isEmailVerified && user.authProvider === "local") {
    throw new AppError("Please verify your email before logging in.", 403);
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

  const redirect = profile.role === "creator" ? "/dashboard" : "/blog";

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

// ─────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────
export const verifyOTP = async (email: string, otp: string) => {
  const record = await EmailVerificationOTP.findOne({ email });
  if (!record) {
    throw new AppError("No OTP found for this email. Please request a new one.", 400);
  }

  if (record.expiresAt < new Date()) {
    await EmailVerificationOTP.deleteOne({ _id: record._id });
    throw new AppError("OTP has expired. Please request a new one.", 400);
  }

  const isMatch = await bcrypt.compare(otp, record.otp);
  if (!isMatch) {
    throw new AppError("Invalid OTP. Please try again.", 400);
  }

  // Mark user as verified
  const user = await User.findByIdAndUpdate(
    record.userId,
    { isEmailVerified: true },
    { new: true }
  );
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Clean up OTP record
  await EmailVerificationOTP.deleteOne({ _id: record._id });

  // Get profile for role-based redirect
  const profile = await Profile.findOne({ user: user._id });
  if (!profile) {
    throw new AppError("Profile not found.", 404);
  }

  // Issue tokens — user is now logged in
  const tokenPayload = {
    id: user._id,
    role: profile.role,
    rememberMe: false,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload, "7d");

  const expiresDays = 7;
  const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

  await Token.findOneAndUpdate(
    { userId: user._id },
    { accessToken, refreshToken, expiresAt },
    { upsert: true, new: true }
  );

  const redirect = profile.role === "creator" ? "/dashboard" : "/blog";

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

// ─────────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────────
export const resendOTP = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Fail silently for security
    return;
  }

  if (user.isEmailVerified) {
    throw new AppError("This email is already verified.", 400);
  }

  const otp = generateOTP();
  const hashedOTP = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailVerificationOTP.findOneAndUpdate(
    { userId: user._id },
    { userId: user._id, email, otp: hashedOTP, expiresAt },
    { upsert: true, new: true }
  );

  await sendVerificationOTPEmail(email, otp);
};

// ─────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) return;
  await Token.findOneAndDelete({ refreshToken });
};

// ─────────────────────────────────────────────
// GOOGLE AUTH
// ─────────────────────────────────────────────
export const processGoogleAuth = async (credential: string) => {
  if (!credential) {
    throw new AppError("Missing credential", 400);
  }

  // Fetch user profile from Google using the access token
  let email, name, picture;
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${credential}` }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }
    const payload = await response.json();
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
  } catch (err) {
    throw new AppError("Invalid Google token", 400);
  }

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

    // Ensure Google users are always verified
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.authProvider = "google";
      await user.save();
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

    const redirect = profile.role === "creator" ? "/dashboard" : "/blog";

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

// ─────────────────────────────────────────────
// COMPLETE GOOGLE AUTH
// ─────────────────────────────────────────────
export const completeGoogleRegistration = async (credential: string, role: string) => {
  if (!credential || !role) {
    throw new AppError("Missing required fields", 400);
  }

  if (role !== "visitor" && role !== "creator") {
    throw new AppError("Invalid role", 400);
  }

  let email, name, picture;
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${credential}` }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }
    const googlePayload = await response.json();
    email = googlePayload.email;
    name = googlePayload.name;
    picture = googlePayload.picture;
  } catch (err) {
    throw new AppError("Invalid Google token", 400);
  }

  if (!email || !name) {
    throw new AppError("Invalid Google token", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const randomPassword = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await bcrypt.hash(randomPassword, 12);

  // Google users are pre-verified
  const user = await User.create({
    email,
    password: hashedPassword,
    isEmailVerified: true,
    authProvider: "google",
  });

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

  const redirect = profile.role === "creator" ? "/dashboard" : "/blog";

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

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────
export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Return silently for security
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

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────
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