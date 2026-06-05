import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import articleRoutes from "./routes/article.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();

/* Security */
app.use(helmet());

/* Logging */
app.use(morgan("dev"));

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

/* 404 — only reached when no route above matched */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;