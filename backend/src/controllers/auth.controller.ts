import { Request, Response } from "express";
import { z } from "zod";
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from "../validators/auth.validator";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/AppError";

// ─────────────────────────────────────────────
// HELPER: Error Handler
// ─────────────────────────────────────────────
const handleError = (res: Response, error: any, defaultMessage: string) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: "Validation failed", issues: error.issues });
    return;
  }
  if (error instanceof AppError) {
    // Attach unverified flag so frontend can show resend option
    const extra = error.statusCode === 403 && error.message.includes("verify your email")
      ? { unverified: true }
      : {};
    res.status(error.statusCode).json({ success: false, message: error.message, ...extra });
    return;
  }
  console.error(`[Auth Controller Error] ${defaultMessage}:`, error);
  res.status(500).json({ success: false, message: defaultMessage });
};

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: "We've sent a 6-digit verification code to your email. Please check your inbox.",
      email: result.email,
    });
  } catch (error) {
    handleError(res, error, "Registration failed");
  }
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "strict",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      maxAge: result.expiresDays * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      token: result.accessToken,
      user: result.user,
      redirect: result.redirect,
    });
  } catch (error) {
    handleError(res, error, "Login failed");
  }
};

// ─────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.refreshUserToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "strict",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      maxAge: result.expiresDays * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Token refreshed successfully", token: result.accessToken });
  } catch (error) {
    handleError(res, error, "Refresh failed");
  }
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logoutUser(refreshToken);

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    handleError(res, error, "Logout failed");
  }
};

// ─────────────────────────────────────────────
// GOOGLE AUTH
// ─────────────────────────────────────────────
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    const result = await authService.processGoogleAuth(credential);

    if (result.existingUser) {
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        sameSite: "strict",
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        maxAge: result.expiresDays! * 24 * 60 * 60 * 1000,
        sameSite: "strict",
      });
    }

    res.status(200).json({
      success: true,
      token: result.accessToken,
      ...result,
    });
  } catch (error) {
    handleError(res, error, "Google Authentication failed");
  }
};

// ─────────────────────────────────────────────
// COMPLETE GOOGLE AUTH
// ─────────────────────────────────────────────
export const completeGoogleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, role } = req.body;
    const result = await authService.completeGoogleRegistration(credential, role);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "strict",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      maxAge: result.expiresDays * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      token: result.accessToken,
      user: result.user,
      redirect: result.redirect,
    });
  } catch (error) {
    handleError(res, error, "Account completion failed");
  }
};

// ─────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ success: false, message: "Email and OTP are required" });
      return;
    }
    const result = await authService.verifyOTP(email, otp);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "strict",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      maxAge: result.expiresDays * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      token: result.accessToken,
      user: result.user,
      redirect: result.redirect,
    });
  } catch (error) {
    handleError(res, error, "OTP verification failed");
  }
};

// ─────────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────────
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }
    await authService.resendOTP(email);
    res.status(200).json({ success: true, message: "If that email exists and is unverified, a new OTP has been sent." });
  } catch (error) {
    handleError(res, error, "Resend OTP failed");
  }
};

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await authService.requestPasswordReset(email);

    res.status(200).json({ success: true, message: "If that email is in our database, we will send a password reset link to it." });
  } catch (error) {
    handleError(res, error, "Failed to process forgot password request");
  }
};

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    await authService.executePasswordReset(validatedData);

    res.status(200).json({ success: true, message: "Password has been successfully reset" });
  } catch (error) {
    handleError(res, error, "Failed to reset password");
  }
};