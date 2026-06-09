import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  
  const healthData = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    database: dbStatus,
    memory: process.memoryUsage(),
  };

  if (dbStatus !== "connected") {
    res.status(503).json({ success: false, ...healthData });
    return;
  }

  res.status(200).json({ success: true, ...healthData });
});

export default router;
