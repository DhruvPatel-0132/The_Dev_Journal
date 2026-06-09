import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import articleRoutes from "./routes/article.routes";
import uploadRoutes from "./routes/upload.routes";
import healthRoutes from "./routes/health.routes";
import profileRoutes from "./routes/profile.routes";
import { morganStream } from "./utils/logger";

const app = express();

/* Security */
app.use(helmet());

// Apply global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

/* Logging */
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", { stream: morganStream }));

/* CORS */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

/* Body Parser */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* Health Check */
app.get("/", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Engineering Blog API Running 🚀",
  });
});

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/profile", profileRoutes);

/* 404 — only reached when no route above matched */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;