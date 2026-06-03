// src/services/jwt.service.ts
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: any, expiresIn: string = "7d") => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET);
};