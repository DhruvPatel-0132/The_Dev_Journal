import { Router } from "express";
import {
  login,
  register,
  refresh,
  logout,
  googleAuth,
  completeGoogleAuth,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
} from "../controllers/auth.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.post("/google/complete", completeGoogleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// Example protected route
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;