import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller";
import { protectRoute, creatorOnly } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// Image upload — creators only
router.post("/image", protectRoute, creatorOnly, upload.single("image"), uploadImage);

export default router;
