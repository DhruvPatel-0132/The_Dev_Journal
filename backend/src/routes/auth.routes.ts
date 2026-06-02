import { Router } from "express";
import {
  login,
  register,
  refresh,
  logout,
  googleAuth,
  completeGoogleAuth
} from "../controllers/auth.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.post("/google/complete", completeGoogleAuth);

// Example protected route
router.get("/me", protectRoute, (req, res) => {
  // @ts-ignore
  res.status(200).json({ success: true, user: req.user });
});

export default router;