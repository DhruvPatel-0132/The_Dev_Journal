import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller";
import { protectRoute } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/image", protectRoute, upload.single("image"), uploadImage);

export default router;
