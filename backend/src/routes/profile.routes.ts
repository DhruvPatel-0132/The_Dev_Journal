import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/profile.controller";
import { protectRoute } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// All profile routes require authentication
router.get("/", protectRoute, getProfile);
router.put("/", protectRoute, upload.single("avatar"), updateProfile);
router.put("/change-password", protectRoute, changePassword);

export default router;
