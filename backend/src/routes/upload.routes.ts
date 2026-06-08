import { Router } from "express";
import { uploadImage, uploadInlineImage } from "../controllers/upload.controller";
import { protectRoute, creatorOnly } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// Banner image upload — creators only
router.post("/image", protectRoute, creatorOnly, upload.single("image"), uploadImage);

// Inline editor image upload — creators only
router.post("/inline-image", protectRoute, creatorOnly, upload.single("image"), uploadInlineImage);

export default router;
