import { Request, Response } from "express";
import cloudinary from "../utils/cloudinary";

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = "data:" + file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "the_dev_journal_articles",
      resource_type: "auto",
      transformation: [
        { width: 1584, height: 396, crop: "fill", gravity: "auto" }
      ]
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to upload image" });
  }
};
