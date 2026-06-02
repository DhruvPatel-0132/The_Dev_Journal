// src/services/jwt.service.ts
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};